import { useQuery } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import type { Order, User, Company, Document } from '../types/db'

export function useAllOrders() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const result = await pb.collection('orders').getList(1, 500, {
        sort: '-created',
      })
      return result.items.map(mapOrder)
    },
  })
  return { orders: data ?? [], isLoading, error }
}

export function useAllUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const result = await pb.collection('users').getList(1, 500, {
        sort: '-created',
      })
      return result.items.map(mapUser)
    },
  })
  return { users: data ?? [], isLoading, error }
}

export function useAllCompanies() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'companies'],
    queryFn: async () => {
      const result = await pb.collection('companies').getList(1, 500, {
        sort: '-created',
      })
      return result.items.map(mapCompany)
    },
  })
  return { companies: data ?? [], isLoading, error }
}

export function useAllDocuments() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'documents'],
    queryFn: async () => {
      const result = await pb.collection('documents').getList(1, 500, {
        sort: '-created',
      })
      return result.items.map(mapDocument)
    },
  })
  return { documents: data ?? [], isLoading, error }
}

export function useAllPayments() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: async () => {
      const result = await pb.collection('payments').getList(1, 500, {
        sort: '-created',
      })
      return result.items.map(mapPayment)
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
