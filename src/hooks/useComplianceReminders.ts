import { useMemo } from 'react'
import type { Company } from '../types/db'

export interface ComplianceAlert {
  companyId: string
  companyName: string
  label: string
  date: string
  daysUntil: number
  urgency: 'overdue' | 'due_soon' | 'upcoming'
}

export function useComplianceReminders(companies: Company[]): ComplianceAlert[] {
  return useMemo(() => {
    const now = new Date()
    const results: ComplianceAlert[] = []

    for (const company of companies) {
      const entries: { label: string; date: string | null }[] = [
        { label: 'Company renewal', date: company.renewalDueDate },
        { label: 'Annual report', date: company.annualReportDueDate },
        { label: 'Tax filing', date: company.taxFilingDueDate },
        { label: 'Registered agent renewal', date: company.registeredAgentRenewalDate },
      ]

      for (const entry of entries) {
        if (!entry.date) continue
        const dueDate = new Date(entry.date)
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        let urgency: ComplianceAlert['urgency']
        if (daysUntil < 0) urgency = 'overdue'
        else if (daysUntil <= 30) urgency = 'due_soon'
        else urgency = 'upcoming'

        results.push({
          companyId: company.id,
          companyName: company.companyName,
          label: entry.label,
          date: entry.date,
          daysUntil,
          urgency,
        })
      }
    }

    return results.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [companies])
}
