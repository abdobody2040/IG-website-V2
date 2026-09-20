import React from 'react'
import { cn } from '../../lib/utils'

export type StatusType =
  | 'pending'
  | 'processing'
  | 'active'
  | 'completed'
  | 'approved'
  | 'cancelled'
  | 'rejected'
  | 'overdue'
  | 'due_soon'
  | 'compliant'
  | 'verified'
  | 'unverified'
  | string

interface StatusBadgeProps {
  status: StatusType
  label?: string
  className?: string
}

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  active: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  completed: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  approved: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  compliant: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  verified: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  pending: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  processing: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  due_soon: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  cancelled: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  rejected: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  overdue: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  unverified: {
    bg: 'bg-gray-500/10 dark:bg-gray-500/20',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const normalized = (status || '').toLowerCase()
  const config = statusStyles[normalized] || {
    bg: 'bg-gray-500/10 dark:bg-gray-500/20',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
  }

  const displayLabel = label || normalized.replace('_', ' ')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize tracking-wide',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {displayLabel}
    </span>
  )
}
