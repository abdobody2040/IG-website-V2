import { useEffect } from 'react'
import { pb } from '../lib/pocketbase'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

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

  useEffect(() => {
    if (!userId) return

    // PocketBase real-time subscription for order updates
    pb.collection('orders').subscribe('*', async (e) => {
      if (e.action === 'update' && e.record['user'] === userId) {
        const newStatus = e.record['status'] as string
        const label = STATUS_LABELS[newStatus] ?? newStatus.replace(/_/g, ' ')
        toast.success(`Order status updated to ${label}`)

        // Create in-app notification
        try {
          await pb.collection('notifications').create({
            user: userId,
            type: 'order_status',
            title: `Order status updated to ${label}`,
            message: `Order #${e.record['order_number'] ?? ''} — ${label}`,
            data: { order_id: e.record['id'], new_status: newStatus },
            link: '/client/orders',
            read: false,
          })
        } catch { /* non-critical */ }

        qc.invalidateQueries({ queryKey: ['orders', userId] })
      }
    }).catch(console.error)

    return () => {
      pb.collection('orders').unsubscribe('*').catch(() => {})
    }
  }, [userId, qc])
}
