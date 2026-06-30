-- Add ERP compliance and renewal tracking fields for formed companies.

alter table public.companies
  add column if not exists renewal_due_date date,
  add column if not exists annual_report_due_date date,
  add column if not exists tax_filing_due_date date,
  add column if not exists registered_agent_renewal_date date,
  add column if not exists compliance_status text not null default 'not_started'
    check (compliance_status in ('not_started', 'up_to_date', 'due_soon', 'overdue', 'completed')),
  add column if not exists compliance_notes text;
