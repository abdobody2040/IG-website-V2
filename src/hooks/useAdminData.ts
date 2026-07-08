import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import type { Order, User, Company, Document } from '../types/db'

interface QueryOptions {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  role?: string;
  compliance?: string;
  docType?: string;
}

export function useAllOrders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'all-orders'],
    queryFn: async () => {
      const result = await pb.collection('orders').getFullList({
        sort: '-created',
      })
      return result.map(mapOrder)
    },
  })
  return { orders: data ?? [], isLoading, error }
}

export function useAllUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'all-users'],
    queryFn: async () => {
      const result = await pb.collection('users').getFullList({
        sort: '-created',
      })
      return result.map(mapUser)
    },
  })
  return { users: data ?? [], isLoading, error }
}

export function useOrders({ page = 1, perPage = 20, search = '', status = 'all' }: QueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', page, perPage, search, status],
    queryFn: async () => {
      const filters = [];
      if (status !== 'all') filters.push(`status = "${status}"`);
      if (search) {
        filters.push(`(company_name ~ "${search}" || order_number ~ "${search}")`);
      }
      
      const result = await pb.collection('orders').getList(page, perPage, {
        sort: '-created',
        filter: filters.join(' && '),
      })
      
      return {
        items: result.items.map(mapOrder),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      // 1. Update in PocketBase
      const record = await pb.collection('orders').update(orderId, { status })
      
      // 2. Fire webhook to Make/Zapier
      const webhookUrl = import.meta.env.VITE_ORDER_WEBHOOK_URL
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'order.status.updated',
              orderId,
              status,
              orderNumber: record.order_number,
              companyName: record.company_name,
              timestamp: new Date().toISOString()
            })
          })
        } catch (err) {
          console.error('Failed to trigger order webhook', err)
          // We don't throw here to ensure the UI updates if PB succeeded
        }
      }
      
      return record
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    }
  })
}

export function useUsers({ page = 1, perPage = 20, search = '', role = 'all' }: QueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'users', page, perPage, search, role],
    queryFn: async () => {
      const filters = [];
      if (role !== 'all') filters.push(`role = "${role}"`);
      if (search) {
        filters.push(`(email ~ "${search}" || display_name ~ "${search}")`);
      }

      const result = await pb.collection('users').getList(page, perPage, {
        sort: '-created',
        filter: filters.join(' && '),
      })
      
      return {
        items: result.items.map(mapUser),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
  })
}

export function useCompanies({ page = 1, perPage = 20, search = '', status = 'all', compliance = 'all' }: QueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'companies', page, perPage, search, status, compliance],
    queryFn: async () => {
      const filters: string[] = []
      if (search) filters.push(`company_name ~ "${search}"`)
      if (status !== 'all') filters.push(`status = "${status}"`)

      if (compliance !== 'all') {
        const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19)
        const thirtyDaysOutStr = new Date(Date.now() + 30 * 86400000).toISOString().replace('T', ' ').slice(0, 19)

        if (compliance === 'overdue') {
          filters.push(`(
            (renewal_due_date != "" && renewal_due_date < "${nowStr}") ||
            (annual_report_due_date != "" && annual_report_due_date < "${nowStr}") ||
            (tax_filing_due_date != "" && tax_filing_due_date < "${nowStr}") ||
            (registered_agent_renewal_date != "" && registered_agent_renewal_date < "${nowStr}")
          )`)
        } else if (compliance === 'due_soon') {
          const noneOverdue = `(
            (renewal_due_date = "" || renewal_due_date >= "${nowStr}") &&
            (annual_report_due_date = "" || annual_report_due_date >= "${nowStr}") &&
            (tax_filing_due_date = "" || tax_filing_due_date >= "${nowStr}") &&
            (registered_agent_renewal_date = "" || registered_agent_renewal_date >= "${nowStr}")
          )`
          const atLeastOneDueSoon = `(
            (renewal_due_date != "" && renewal_due_date >= "${nowStr}" && renewal_due_date <= "${thirtyDaysOutStr}") ||
            (annual_report_due_date != "" && annual_report_due_date >= "${nowStr}" && annual_report_due_date <= "${thirtyDaysOutStr}") ||
            (tax_filing_due_date != "" && tax_filing_due_date >= "${nowStr}" && tax_filing_due_date <= "${thirtyDaysOutStr}") ||
            (registered_agent_renewal_date != "" && registered_agent_renewal_date >= "${nowStr}" && registered_agent_renewal_date <= "${thirtyDaysOutStr}")
          )`
          filters.push(`(${noneOverdue} && ${atLeastOneDueSoon})`)
        } else if (compliance === 'compliant') {
          const hasAtLeastOneDate = `(
            renewal_due_date != "" ||
            annual_report_due_date != "" ||
            tax_filing_due_date != "" ||
            registered_agent_renewal_date != ""
          )`
          const allDatesCompliant = `(
            (renewal_due_date = "" || renewal_due_date > "${thirtyDaysOutStr}") &&
            (annual_report_due_date = "" || annual_report_due_date > "${thirtyDaysOutStr}") &&
            (tax_filing_due_date = "" || tax_filing_due_date > "${thirtyDaysOutStr}") &&
            (registered_agent_renewal_date = "" || registered_agent_renewal_date > "${thirtyDaysOutStr}")
          )`
          filters.push(`(${hasAtLeastOneDate} && ${allDatesCompliant})`)
        } else if (compliance === 'no_dates') {
          filters.push(`(
            renewal_due_date = "" &&
            annual_report_due_date = "" &&
            tax_filing_due_date = "" &&
            registered_agent_renewal_date = ""
          )`)
        }
      }

      const result = await pb.collection('companies').getList(page, perPage, {
        sort: '-created',
        filter: filters.join(' && '),
      })
      return {
        items: result.items.map(mapCompany),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
  })
}

/** @deprecated — use useCompanies() for paginated access. Kept for CSV export only. */
export function useAllCompanies() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'all-companies'],
    queryFn: async () => {
      const result = await pb.collection('companies').getFullList({ sort: '-created' })
      return result.map(mapCompany)
    },
  })
  return { companies: data ?? [], isLoading, error }
}

export function useDocuments({ page = 1, perPage = 20, search = '', docType = 'all', status = 'all' }: QueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'documents', page, perPage, search, docType, status],
    queryFn: async () => {
      const filters: string[] = []
      if (search) filters.push(`name ~ "${search}"`)
      if (docType !== 'all') filters.push(`doc_type = "${docType}"`)
      if (status !== 'all') filters.push(`status = "${status}"`)

      const result = await pb.collection('documents').getList(page, perPage, {
        sort: '-created',
        filter: filters.join(' && '),
      })
      return {
        items: result.items.map(mapDocument),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
  })
}

/** @deprecated — use useDocuments() for paginated access. Kept for CSV export only. */
export function useAllDocuments() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'all-documents'],
    queryFn: async () => {
      const result = await pb.collection('documents').getFullList({ sort: '-created' })
      return result.map(mapDocument)
    },
  })
  return { documents: data ?? [], isLoading, error }
}

export function usePayments({ page = 1, perPage = 20, search = '' }: QueryOptions = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', page, perPage, search],
    queryFn: async () => {
      const filters: string[] = []
      if (search) filters.push(`(customer_name ~ "${search}" || customer_email ~ "${search}" || company_name ~ "${search}")`);

      const result = await pb.collection('payments').getList(page, perPage, {
        sort: '-created',
        filter: filters.join(' && '),
      })
      return {
        items: result.items.map(mapPayment),
        totalPages: result.totalPages,
        totalItems: result.totalItems,
      }
    },
  })
}

/** @deprecated — use usePayments() for paginated access. Kept for CSV export/analytics only. */
export function useAllPayments() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'all-payments'],
    queryFn: async () => {
      const result = await pb.collection('payments').getFullList({ sort: '-created' })
      return result.map(mapPayment)
    },
  })
  return { payments: data ?? [], isLoading, error }
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row['id'] as string,
    userId: row['user'] as string,
    orderNumber: row['order_number'] as string,
    packageName: row['package_name'] as string,
    companyName: row['company_name'] as string,
    companyState: row['company_state'] as string,
    companyType: row['company_type'] as string,
    status: row['status'] as string,
    amount: row['amount'] as number,
    currency: row['currency'] as string,
    notes: row['notes'] as string,
    customerName: (row['customer_name'] as string) ?? null,
    customerEmail: (row['customer_email'] as string) ?? null,
    customerPhone: (row['customer_phone'] as string) ?? null,
    customerCountry: (row['customer_country'] as string) ?? null,
    customerAddress: (row['customer_address'] as string) ?? null,
    businessActivity: (row['business_activity'] as string) ?? null,
    stripeSessionId: (row['stripe_session_id'] as string) ?? null,
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
  }
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: row['id'] as string,
    email: row['email'] as string,
    emailVerified: (row['verified'] as boolean) ?? false,
    displayName: row['display_name'] as string,
    avatarUrl: row['avatar_url'] as string,
    phone: row['phone'] as string,
    phoneVerified: false, // PocketBase doesn't have phone verification by default
    role: (row['role'] as string) ?? 'client',
    country: (row['country'] as string) ?? '',
    address: (row['address'] as string) ?? '',
    metadata: (row['metadata'] as string) ?? '{}',
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
    lastSignIn: (row['last_sign_in'] as string) ?? '',
  }
}

function mapCompany(row: Record<string, unknown>): Company {
  return {
    id: row['id'] as string,
    userId: row['user'] as string,
    orderId: row['order'] as string,
    companyName: row['company_name'] as string,
    companyType: row['company_type'] as string,
    state: row['state'] as string,
    einNumber: row['ein_number'] as string,
    formationDate: row['formation_date'] as string,
    registeredAgent: row['registered_agent'] as string,
    renewalDueDate: (row['renewal_due_date'] as string) ?? null,
    annualReportDueDate: (row['annual_report_due_date'] as string) ?? null,
    taxFilingDueDate: (row['tax_filing_due_date'] as string) ?? null,
    registeredAgentRenewalDate: (row['registered_agent_renewal_date'] as string) ?? null,
    complianceStatus: (row['compliance_status'] as string) ?? 'not_started',
    complianceNotes: (row['compliance_notes'] as string) ?? null,
    status: row['status'] as string,
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
  }
}

function mapPayment(row: Record<string, unknown>) {
  return {
    id: row['id'] as string,
    userId: row['user'] as string,
    orderId: row['order'] as string,
    service: row['service'] as string,
    invoiceId: row['invoice_id'] as string,
    amount: row['amount'] as number,
    currency: row['currency'] as string,
    status: row['status'] as string,
    stripePaymentId: (row['stripe_payment_id'] as string) ?? '',
    notes: (row['notes'] as string) ?? '',
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
    stripeSessionId: (row['stripe_session_id'] as string) ?? '',
    stripePaymentIntentId: (row['stripe_payment_intent_id'] as string) ?? '',
    stripeChargeId: (row['stripe_charge_id'] as string) ?? '',
    stripeCustomerId: (row['stripe_customer_id'] as string) ?? '',
    stripeInvoiceId: (row['stripe_invoice_id'] as string) ?? '',
    stripePriceId: (row['stripe_price_id'] as string) ?? '',
    stripeProductId: (row['stripe_product_id'] as string) ?? '',
    customerName: (row['customer_name'] as string) ?? '',
    customerEmail: (row['customer_email'] as string) ?? '',
    companyName: (row['company_name'] as string) ?? '',
    customerCountry: (row['customer_country'] as string) ?? '',
    invoiceUrl: (row['invoice_url'] as string) ?? '',
    receiptUrl: (row['receipt_url'] as string) ?? '',
  }
}

function mapDocument(row: Record<string, unknown>): Document {
  return {
    id: row['id'] as string,
    userId: row['user'] as string,
    orderId: row['order'] as string,
    companyId: row['company'] as string,
    name: row['name'] as string,
    docType: row['doc_type'] as string,
    fileUrl: (row['file_url'] as string) ?? '',
    fileName: (row['file_name'] as string) ?? '',
    status: row['status'] as string,
    notes: (row['notes'] as string) ?? '',
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
  }
}
