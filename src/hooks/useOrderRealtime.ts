
import { useEffect, useRef } from 'react'
import { pb } from '../lib/pocketbase'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

const POLL_INTERVAL = 20_000 // 20 seconds

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  in_review: 'Under Review',
  processing: 'Processing',
  documents_filed: 'Documents Filed',
  ein_processing: 'EIN Processing',
  completed: 'Completed',
  cancelled: 'Cancelled',
  in_progress: 'In Progress',
}

export function useOrderRealtime(userId: string | undefined | null) {
  const qc = useQueryClient()
  const prevStatusMap = useRef<Record<string, string>>({})

  useEffect(() => {
    if (!userId) return

    const poll = async () => {
      try {
        const result = await pb.collection('orders').getList(1, 50, {
          filter: `user = "${userId}"`,
          sort: '-created',
        })

        for (const order of result.items) {
          const id     = order['id'] as string
          const status = order['status'] as string
          const prev   = prevStatusMap.current[id]

          if (prev !== undefined && prev !== status) {
            const label = STATUS_LABELS[status] ?? status.replace(/_/g, ' ')
            toast.success(`Order status updated to ${label}`)

            // Create in-app notification (best-effort)
            try {
              await pb.collection('notifications').create({
                user: userId,
                type: 'order_status',
                title: `Order status updated to ${label}`,
                message: `Order #${order['order_number'] ?? ''} — ${label}`,
                data: JSON.stringify({ order_id: id, new_status: status }),
                link: '/client/orders',
                read: false,
              })
            } catch { /* non-critical */ }

            qc.invalidateQueries({ queryKey: ['orders', userId] })
          }
          prevStatusMap.current[id] = status
        }
      } catch { /* ignore network errors */ }
    }

    const id = setInterval(poll, POLL_INTERVAL)
    poll() // immediate first run
    return () => clearInterval(id)
  }, [userId, qc])
}
