import { useQuery } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import type { Company } from '../types/db'

import { useWorkspace } from './useWorkspace'

export function useCompanies(userId: string | undefined | null) {
  const { activeWorkspace } = useWorkspace()
  const workspaceId = activeWorkspace?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', workspaceId, userId],
    queryFn: async () => {
      const filterStr = `user = "${userId}"`

      const result = await pb.collection('companies').getList(1, 200, {
        filter: filterStr,
        sort: '-created',
      })
      return result.items.map(mapCompany)
    },
    enabled: !!userId,
  })

  return {
    companies: data ?? [],
    isLoading,
    error,
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
