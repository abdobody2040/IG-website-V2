import { getStatusBadge } from './statusUtils'

interface Props {
  status: string
  className?: string
}

export default function StatusBadge({ status, className = '' }: Props) {
  const { bg, text, label } = getStatusBadge(status)
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text} ${className}`}
    >
      {label}
    </span>
  )
}
