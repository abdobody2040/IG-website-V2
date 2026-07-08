import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to declare mock functions before vi.mock executes
const {
  mockCheckoutSessionsCreate,
  mockCheckoutSessionsRetrieve,
  mockPaymentIntentsRetrieve,
  mockInvoicesRetrieve,
  mockConstructEventAsync
} = vi.hoisted(() => ({
  mockCheckoutSessionsCreate: vi.fn(),
  mockCheckoutSessionsRetrieve: vi.fn(),
  mockPaymentIntentsRetrieve: vi.fn(),
  mockInvoicesRetrieve: vi.fn(),
  mockConstructEventAsync: vi.fn(),
}))

vi.mock('stripe', () => {
  // Use standard function instead of arrow function so it is constructable with 'new'
  const mockStripeClass = vi.fn().mockImplementation(function (this: any) {
    return {
      checkout: {
        sessions: {
          create: mockCheckoutSessionsCreate,
          retrieve: mockCheckoutSessionsRetrieve,
        },
      },
      paymentIntents: {
        retrieve: mockPaymentIntentsRetrieve,
      },
      invoices: {
        retrieve: mockInvoicesRetrieve,
      },
      webhooks: {
        constructEventAsync: mockConstructEventAsync,
      },
    }
  })
  return {
    default: mockStripeClass,
    Stripe: mockStripeClass,
  }
})

// Now we can safely import our functions
import createCheckout from '../../functions/create-checkout/index'
import stripeWebhook from '../../functions/stripe-webhook/index'
import verifyPayment from '../../functions/verify-payment/index'

describe('Stripe Payments & Workers Integration', () => {
  let mockEnv: any
  let mockHeaders: Headers
  let mockOrderRecords: any[]
  let mockPaymentRecords: any[]

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockOrderRecords = []
    mockPaymentRecords = []

    mockEnv = {
      STRIPE_SECRET_KEY: 'sk_test_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_secret',
      PB_URL: 'http://localhost:8090',
      PB_ADMIN_EMAIL: process.env.PB_ADMIN_EMAIL || `test_email_${Math.random()}@test.local`,
      PB_ADMIN_PASSWORD: process.env.PB_ADMIN_PASSWORD || `test_password_${Math.random()}`,
      ALLOWED_ORIGIN: 'http://localhost:5173',
      RESEND_API_KEY: 're_key',
    }

    mockHeaders = new Headers({
      'Content-Type': 'application/json',
      'origin': 'http://localhost:5173',
      'Authorization': 'Bearer user-token',
    })

    // Mock global fetch for PocketBase API calls
    global.fetch = vi.fn().mockImplementation((url: string, init?: any) => {
      // Auth refresh request (verifyAuth)
      if (url.includes('/api/collections/users/auth-refresh')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ record: { id: 'user-123' } }),
        })
      }
      
      // Admin auth request (getAdminToken)
      if (url.includes('/api/collections/_superusers/auth-with-password') || url.includes('/api/admins/auth-with-password')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ token: 'admin-token-123' }),
        })
      }

      // Pricing config lookup
      if (url.includes('/api/collections/pricing_config/records')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            items: [{ id: 'plan-1', stripe_price_id: 'price_us_basic', price: 149 }],
          }),
        })
      }

      // Services lookup
      if (url.includes('/api/collections/services/records/statefee_delaw1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'statefee_delaw1', stripe_price_id: 'price_de_fee', price: 100 }),
        })
      }

      if (url.includes('/api/collections/services/records/websitedesign49')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'websitedesign49', stripe_price_id: 'price_web_design', price: 99, title_en: 'Website Design' }),
        })
      }

      // Check if order exists (Idempotency)
      if (url.includes('/api/collections/orders/records')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockOrderRecords }),
        })
      }

      // Check if payment exists
      if (url.includes('/api/collections/payments/records')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ items: mockPaymentRecords }),
        })
      }

      // Default fallback for any other POST/PATCH calls
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'record-id-123', order_number: 'IG-TEST1' }),
        text: () => Promise.resolve('Success'),
      })
    }) as any
  })

  // ── 1. Create Checkout Session Tests ──
  describe('create-checkout Cloudflare Worker', () => {
    it('creates a Stripe Checkout session successfully', async () => {
      mockCheckoutSessionsCreate.mockResolvedValue({ id: 'sess_123', url: 'https://checkout.stripe.com/sess_123' })

      const reqBody = {
        mode: 'formation',
        planId: 'us-basic',
        companyName: 'Acme LLC',
        companyState: 'Delaware',
        companyType: 'LLC',
        businessActivity: 'Software development',
        customerEmail: 'customer@example.com',
        customerName: 'Customer Name',
        selectedAddOns: ['websitedesign49'],
        successUrl: 'http://localhost:5173/order/success',
        cancelUrl: 'http://localhost:5173/order',
        userId: 'user-123',
      }

      const req = new Request('http://localhost/checkout', {
        method: 'POST',
        headers: mockHeaders,
        body: JSON.stringify(reqBody),
      })

      const res = await createCheckout.fetch(req, mockEnv)
      const data = await res.json() as any

      expect(res.status).toBe(200)
      expect(data.sessionId).toBe('sess_123')
      expect(data.url).toBe('https://checkout.stripe.com/sess_123')

      // Verify server-side pricing lookup details
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(expect.objectContaining({
        mode: 'payment',
        line_items: [
          { price: 'price_us_basic', quantity: 1 },
          { price: 'price_de_fee', quantity: 1 },
          { price: 'price_web_design', quantity: 1 }
        ],
        customer_email: 'customer@example.com',
        metadata: expect.objectContaining({
          companyName: 'Acme LLC',
          companyState: 'Delaware',
          planId: 'us-basic',
          userId: 'user-123',
        })
      }))
    })

    it('returns 403 on userId mismatch (security check)', async () => {
      const reqBody = {
        mode: 'formation',
        planId: 'us-basic',
        companyName: 'Acme LLC',
        companyState: 'Delaware',
        companyType: 'LLC',
        businessActivity: 'Software',
        customerEmail: 'customer@example.com',
        userId: 'wrong-user-id', // mismatch
        successUrl: 'http://localhost:5173/order/success',
        cancelUrl: 'http://localhost:5173/order',
      }

      const req = new Request('http://localhost/checkout', {
        method: 'POST',
        headers: mockHeaders,
        body: JSON.stringify(reqBody),
      })

      const res = await createCheckout.fetch(req, mockEnv)
      const data = await res.json() as any

      expect(res.status).toBe(403)
      expect(data.error).toBe('User ID mismatch')
    })
  })

  // ── 2. Webhook Event Handling Tests ──
  describe('stripe-webhook Cloudflare Worker', () => {
    it('creates order and payment records on checkout.session.completed', async () => {
      const mockSession = {
        id: 'sess_123',
        payment_intent: 'pi_intent123',
        customer: 'cust_abc',
        invoice: 'in_inv123',
        amount_total: 24900,
        currency: 'usd',
        payment_status: 'paid',
        metadata: {
          mode: 'formation',
          plan: 'US LLC Basic',
          companyName: 'Apex Digital LLC',
          companyState: 'Wyoming',
          companyType: 'LLC',
          customerName: 'Apex Owner',
          customerEmail: 'owner@apex.com',
          userId: 'user-123',
        },
      }

      mockConstructEventAsync.mockResolvedValue({
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: mockSession },
      })

      const reqHeaders = new Headers({
        'stripe-signature': 't=123,v1=abc',
      })
      const req = new Request('http://localhost/webhook', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({}),
      })

      const res = await stripeWebhook.fetch(req, mockEnv)
      const data = await res.json() as any

      expect(res.status).toBe(200)
      expect(data.received).toBe(true)

      // Verify that database calls were made for order and payment insertion
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/collections/orders/records'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Apex Digital LLC'),
        })
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/collections/payments/records'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('pi_intent123'),
        })
      )
    })

    it('ignores duplicate checkout events safely (idempotency)', async () => {
      // Mock existing order in DB
      mockOrderRecords = [{ id: 'order-123', stripe_session_id: 'sess_123' }]

      const mockSession = {
        id: 'sess_123',
        metadata: { mode: 'formation' },
      }

      mockConstructEventAsync.mockResolvedValue({
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: mockSession },
      })

      const req = new Request('http://localhost/webhook', {
        method: 'POST',
        headers: new Headers({ 'stripe-signature': 't=123,v1=abc' }),
        body: JSON.stringify({}),
      })

      const res = await stripeWebhook.fetch(req, mockEnv)
      const data = await res.json() as any

      expect(res.status).toBe(200)
      expect(data.duplicate).toBe(true)
    })
  })

  // ── 3. Verify Payment Verification Tests ──
  describe('verify-payment Cloudflare Worker', () => {
    it('verifies paid Stripe Checkout Session and returns receipt', async () => {
      mockCheckoutSessionsRetrieve.mockResolvedValue({
        id: 'sess_123',
        payment_status: 'paid',
        invoice: 'in_inv123',
        payment_intent: 'pi_intent123',
        customer: 'cust_abc',
        metadata: {
          userId: 'user-123',
          companyName: 'Acme Digital',
          plan: 'US Basic Plan',
        },
      })

      mockInvoicesRetrieve.mockResolvedValue({
        hosted_invoice_url: 'https://invoice.stripe.com/inv_url',
      })

      mockPaymentIntentsRetrieve.mockResolvedValue({
        latest_charge: { receipt_url: 'https://receipt.stripe.com/rec_url' },
      })

      // Mock DB check: order exists already
      mockOrderRecords = [{ id: 'order-123', order_number: 'IG-ABC1', package_name: 'US Basic Plan', company_name: 'Acme Digital' }]

      const req = new Request('http://localhost/verify', {
        method: 'POST',
        headers: mockHeaders,
        body: JSON.stringify({ sessionId: 'sess_123' }),
      })

      const res = await verifyPayment.fetch(req, mockEnv)
      const data = await res.json() as any

      expect(res.status).toBe(200)
      expect(data.verified).toBe(true)
      expect(data.orderNumber).toBe('IG-ABC1')
      expect(data.invoiceUrl).toBe('https://invoice.stripe.com/inv_url')
      expect(data.receiptUrl).toBe('https://receipt.stripe.com/rec_url')
    })
  })
})
