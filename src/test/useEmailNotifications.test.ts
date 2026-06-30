/**
 * Tests for src/hooks/useEmailNotifications.ts
 *
 * VITE_EMAIL_ENDPOINT is injected via vitest.config.ts → test.env so the
 * module-level EMAIL_ENDPOINT constant is populated at import time.
 *
 * All 4 exported email functions are covered:
 *  - sendOrderConfirmationEmail
 *  - sendStatusUpdateEmail
 *  - sendDocumentReadyEmail
 *  - sendContactNotificationEmail
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

// ─── Mock PocketBase ──────────────────────────────────────────────────────────
vi.mock('../lib/pocketbase', () => ({
  pb: { authStore: { token: 'test-token' } },
}))

// ─── Mock fetch globally ──────────────────────────────────────────────────────
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// ─── Import AFTER mocks ───────────────────────────────────────────────────────
const {
  sendOrderConfirmationEmail,
  sendStatusUpdateEmail,
  sendDocumentReadyEmail,
  sendContactNotificationEmail,
} = await import('../hooks/useEmailNotifications')

const EMAIL_ENDPOINT = 'https://api.example.com/send-email'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mockOkResponse() {
  ;(mockFetch as Mock).mockResolvedValue({ ok: true, status: 200 } as Response)
}

function mockErrorResponse(status = 500) {
  ;(mockFetch as Mock).mockResolvedValue({ ok: false, status } as Response)
}

function capturePayload(callIndex = 0): { to: string; subject: string; html: string; text: string } {
  const calls = (mockFetch as Mock).mock.calls
  if (!calls[callIndex]) {
    throw new Error(`No fetch call at index ${callIndex}. Total: ${calls.length}`)
  }
  return JSON.parse(calls[callIndex]![1]!.body as string)
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useEmailNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOkResponse() // default: all requests succeed
  })

  // ── sendOrderConfirmationEmail ────────────────────────────────────────────
  describe('sendOrderConfirmationEmail', () => {
    const orderParams = {
      toEmail: 'client@test.com',
      toName: 'John Doe',
      orderNumber: 'ORD-001',
      companyName: 'Acme LLC',
      packageName: 'Pro',
      amount: 299.99,
      currency: 'USD',
    }

    it('calls fetch twice — client email + admin email', async () => {
      await sendOrderConfirmationEmail(orderParams)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('sends client email to the provided toEmail', async () => {
      await sendOrderConfirmationEmail(orderParams)
      const recipients = (mockFetch as Mock).mock.calls.map(
        (c) => (JSON.parse(c[1]!.body as string) as { to: string }).to
      )
      expect(recipients).toContain('client@test.com')
    })

    it('sends admin email to info@instantgrow.net', async () => {
      await sendOrderConfirmationEmail(orderParams)
      const recipients = (mockFetch as Mock).mock.calls.map(
        (c) => (JSON.parse(c[1]!.body as string) as { to: string }).to
      )
      expect(recipients).toContain('info@instantgrow.net')
    })

    it('client subject contains order number', async () => {
      await sendOrderConfirmationEmail(orderParams)
      const clientCall = (mockFetch as Mock).mock.calls.find(
        (c) => (JSON.parse(c[1]!.body as string) as { to: string }).to === 'client@test.com'
      )!
      const { subject } = JSON.parse(clientCall[1]!.body as string) as { subject: string }
      expect(subject).toContain('ORD-001')
    })

    it('client email HTML contains company name and formatted amount', async () => {
      await sendOrderConfirmationEmail(orderParams)
      const clientCall = (mockFetch as Mock).mock.calls.find(
        (c) => (JSON.parse(c[1]!.body as string) as { to: string }).to === 'client@test.com'
      )!
      const { html } = JSON.parse(clientCall[1]!.body as string) as { html: string }
      expect(html).toContain('Acme LLC')
      expect(html).toContain('299.99')
    })

    it('escapes <script> tags in toName', async () => {
      await sendOrderConfirmationEmail({
        ...orderParams,
        toName: '<script>alert("xss")</script>',
      })
      const clientCall = (mockFetch as Mock).mock.calls.find(
        (c) => (JSON.parse(c[1]!.body as string) as { to: string }).to === 'client@test.com'
      )!
      const { html } = JSON.parse(clientCall[1]!.body as string) as { html: string }
      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
    })

    it('sends Authorization header with PocketBase token', async () => {
      await sendOrderConfirmationEmail(orderParams)
      const headers = (mockFetch as Mock).mock.calls[0]![1]!.headers as Record<string, string>
      expect(headers['Authorization']).toBe('Bearer test-token')
    })

    it('sends request to VITE_EMAIL_ENDPOINT', async () => {
      await sendOrderConfirmationEmail(orderParams)
      expect((mockFetch as Mock).mock.calls[0]![0]).toBe(EMAIL_ENDPOINT)
    })

    it('does NOT throw when fetch returns an error status', async () => {
      mockErrorResponse(500)
      await expect(sendOrderConfirmationEmail(orderParams)).resolves.not.toThrow()
    })

    it('does NOT throw when fetch rejects (network error)', async () => {
      ;(mockFetch as Mock).mockRejectedValue(new Error('Network down'))
      await expect(sendOrderConfirmationEmail(orderParams)).resolves.not.toThrow()
    })

    it('admin email HTML includes client name and email address', async () => {
      await sendOrderConfirmationEmail(orderParams)
      const adminCall = (mockFetch as Mock).mock.calls.find(
        (c) => (JSON.parse(c[1]!.body as string) as { to: string }).to === 'info@instantgrow.net'
      )!
      const { html } = JSON.parse(adminCall[1]!.body as string) as { html: string }
      expect(html).toContain('John Doe')
      expect(html).toContain('client@test.com')
    })
  })

  // ── sendStatusUpdateEmail ─────────────────────────────────────────────────
  describe('sendStatusUpdateEmail', () => {
    const baseParams = {
      toEmail: 'client@test.com',
      toName: 'Jane Smith',
      orderNumber: 'ORD-002',
      companyName: 'Beta Corp LLC',
      newStatus: 'processing',
    }

    it('sends exactly ONE email (client only, no admin copy)', async () => {
      await sendStatusUpdateEmail(baseParams)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('sends to the client email address', async () => {
      await sendStatusUpdateEmail(baseParams)
      expect(capturePayload().to).toBe('client@test.com')
    })

    it('subject includes human-readable label for "documents_filed"', async () => {
      await sendStatusUpdateEmail({ ...baseParams, newStatus: 'documents_filed' })
      expect(capturePayload().subject).toContain('Documents Filed')
    })

    it('subject includes human-readable label for "in_review"', async () => {
      await sendStatusUpdateEmail({ ...baseParams, newStatus: 'in_review' })
      expect(capturePayload().subject).toContain('Under Review')
    })

    it('subject includes human-readable label for "ein_processing"', async () => {
      await sendStatusUpdateEmail({ ...baseParams, newStatus: 'ein_processing' })
      expect(capturePayload().subject).toContain('EIN Processing')
    })

    it('includes optional note in HTML when message is provided', async () => {
      await sendStatusUpdateEmail({ ...baseParams, message: 'Your docs have been submitted.' })
      expect(capturePayload().html).toContain('Your docs have been submitted.')
    })

    it('shows completion-specific content for "completed" status', async () => {
      await sendStatusUpdateEmail({ ...baseParams, newStatus: 'completed' })
      expect(capturePayload().html).toContain('Complete')
    })

    it('escapes HTML in toName', async () => {
      await sendStatusUpdateEmail({ ...baseParams, toName: '<img src=x onerror=alert(1)>' })
      expect(capturePayload().html).not.toContain('<img')
      expect(capturePayload().html).toContain('&lt;img')
    })

    it('handles unknown status codes gracefully (uses raw string)', async () => {
      await sendStatusUpdateEmail({ ...baseParams, newStatus: 'custom_xyz' })
      expect(capturePayload().subject).toContain('custom_xyz')
    })

    it('does NOT throw on HTTP error', async () => {
      mockErrorResponse(503)
      await expect(sendStatusUpdateEmail(baseParams)).resolves.not.toThrow()
    })

    it('plain text body contains order number and status label', async () => {
      await sendStatusUpdateEmail(baseParams)
      const { text } = capturePayload()
      expect(text).toContain('ORD-002')
      expect(text).toContain('Processing')
    })

    it('dashboard link appears in HTML', async () => {
      await sendStatusUpdateEmail(baseParams)
      expect(capturePayload().html).toContain('instantgrow.net/client/dashboard')
    })
  })

  // ── sendDocumentReadyEmail ────────────────────────────────────────────────
  describe('sendDocumentReadyEmail', () => {
    const docParams = {
      toEmail: 'client@test.com',
      toName: 'Alice Johnson',
      companyName: 'Alice Ventures LLC',
      documentName: 'Certificate of Formation',
    }

    it('sends exactly ONE email', async () => {
      await sendDocumentReadyEmail(docParams)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('sends to the correct recipient', async () => {
      await sendDocumentReadyEmail(docParams)
      expect(capturePayload().to).toBe('client@test.com')
    })

    it('subject contains document name and company name', async () => {
      await sendDocumentReadyEmail(docParams)
      const { subject } = capturePayload()
      expect(subject).toContain('Certificate of Formation')
      expect(subject).toContain('Alice Ventures LLC')
    })

    it('HTML contains the document name', async () => {
      await sendDocumentReadyEmail(docParams)
      expect(capturePayload().html).toContain('Certificate of Formation')
    })

    it('uses default documents URL when dashboardUrl is not provided', async () => {
      await sendDocumentReadyEmail(docParams)
      const { html, text } = capturePayload()
      expect(html + text).toContain('instantgrow.net/client/documents')
    })

    it('uses custom dashboardUrl when provided', async () => {
      await sendDocumentReadyEmail({ ...docParams, dashboardUrl: 'https://app.example.com/docs' })
      const { html, text } = capturePayload()
      expect(html + text).toContain('https://app.example.com/docs')
    })

    it('escapes HTML in documentName', async () => {
      await sendDocumentReadyEmail({ ...docParams, documentName: '<b>Hacked</b>' })
      expect(capturePayload().html).not.toContain('<b>Hacked</b>')
      expect(capturePayload().html).toContain('&lt;b&gt;Hacked&lt;/b&gt;')
    })

    it('escapes HTML in companyName', async () => {
      await sendDocumentReadyEmail({ ...docParams, companyName: '<script>evil()</script>' })
      expect(capturePayload().html).not.toContain('<script>')
    })
  })

  // ── sendContactNotificationEmail ──────────────────────────────────────────
  describe('sendContactNotificationEmail', () => {
    const contactParams = {
      fromName: 'Bob Wilson',
      fromEmail: 'bob@example.com',
      subject: 'Need help with LLC',
      message: 'I have some questions about forming an LLC in Delaware.',
    }

    it('sends exactly ONE email (admin-only notification)', async () => {
      await sendContactNotificationEmail(contactParams)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('sends to admin address info@instantgrow.net', async () => {
      await sendContactNotificationEmail(contactParams)
      expect(capturePayload().to).toBe('info@instantgrow.net')
    })

    it('subject includes the contact form subject', async () => {
      await sendContactNotificationEmail(contactParams)
      expect(capturePayload().subject).toContain('Need help with LLC')
    })

    it('subject includes sender name', async () => {
      await sendContactNotificationEmail(contactParams)
      expect(capturePayload().subject).toContain('Bob Wilson')
    })

    it('HTML includes sender name, email, and message', async () => {
      await sendContactNotificationEmail(contactParams)
      const { html } = capturePayload()
      expect(html).toContain('Bob Wilson')
      expect(html).toContain('bob@example.com')
      expect(html).toContain('questions about forming an LLC')
    })

    it('includes phone number in HTML when provided', async () => {
      await sendContactNotificationEmail({ ...contactParams, phone: '+1 555-0123' })
      expect(capturePayload().html).toContain('+1 555-0123')
    })

    it('omits phone section when phone is not provided', async () => {
      await sendContactNotificationEmail(contactParams)
      // The HTML should not contain any phone-related content
      expect(capturePayload().html).not.toMatch(/\+\d/)
    })

    it('escapes <script> tags in message to prevent XSS', async () => {
      await sendContactNotificationEmail({
        ...contactParams,
        message: '<script>document.cookie</script>',
      })
      expect(capturePayload().html).not.toContain('<script>')
      expect(capturePayload().html).toContain('&lt;script&gt;')
    })

    it('escapes HTML in fromName', async () => {
      await sendContactNotificationEmail({ ...contactParams, fromName: '<b>Evil</b>' })
      expect(capturePayload().html).not.toContain('<b>Evil</b>')
    })

    it('does NOT throw on fetch network failure', async () => {
      ;(mockFetch as Mock).mockRejectedValue(new Error('Network down'))
      await expect(sendContactNotificationEmail(contactParams)).resolves.not.toThrow()
    })

    it('does NOT throw on HTTP error status', async () => {
      mockErrorResponse(500)
      await expect(sendContactNotificationEmail(contactParams)).resolves.not.toThrow()
    })
  })

  // ── HTTP request structure ────────────────────────────────────────────────
  describe('HTTP request structure', () => {
    const simpleContact = { fromName: 'T', fromEmail: 't@t.com', subject: 'Hi', message: 'Hello' }

    it('uses POST method', async () => {
      await sendContactNotificationEmail(simpleContact)
      expect((mockFetch as Mock).mock.calls[0]![1]!.method).toBe('POST')
    })

    it('sets Content-Type: application/json', async () => {
      await sendContactNotificationEmail(simpleContact)
      const headers = (mockFetch as Mock).mock.calls[0]![1]!.headers as Record<string, string>
      expect(headers['Content-Type']).toBe('application/json')
    })

    it('body contains to, subject, html, and text fields', async () => {
      await sendContactNotificationEmail(simpleContact)
      const body = capturePayload()
      expect(body).toHaveProperty('to')
      expect(body).toHaveProperty('subject')
      expect(body).toHaveProperty('html')
      expect(body).toHaveProperty('text')
    })

    it('sends request to VITE_EMAIL_ENDPOINT', async () => {
      await sendStatusUpdateEmail({
        toEmail: 'x@x.com', toName: 'X', orderNumber: 'O1',
        companyName: 'X Corp', newStatus: 'pending',
      })
      expect((mockFetch as Mock).mock.calls[0]![0]).toBe(EMAIL_ENDPOINT)
    })

    it('includes Authorization header from PocketBase token', async () => {
      await sendStatusUpdateEmail({
        toEmail: 'x@x.com', toName: 'X', orderNumber: 'O1',
        companyName: 'X Corp', newStatus: 'pending',
      })
      const headers = (mockFetch as Mock).mock.calls[0]![1]!.headers as Record<string, string>
      expect(headers['Authorization']).toBe('Bearer test-token')
    })
  })
})
