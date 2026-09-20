
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'

export interface AppNotification {
  id: string
  userId: string
  type: string
  title: string
  message: string | null
  data: Record<string, unknown>
  link: string | null
  read: boolean
  createdAt: string
}

function mapNotification(raw: Record<string, unknown>): AppNotification {
  return {
    id: raw['id'] as string,
    userId: raw['user'] as string,
    type: raw['type'] as string,
    title: raw['title'] as string,
    message: raw['message'] as string | null,
    data: (() => {
      const d = raw['data']
      if (!d) return {}
      if (typeof d === 'string') { try { return JSON.parse(d) } catch { return {} } }
      if (typeof d === 'object') return d as Record<string, unknown>
      return {}
    })(),
    link: raw['link'] as string | null,
    read: Boolean(raw['read']),
    createdAt: raw['created'] as string,
  }
}

export function useNotifications(userId: string | undefined | null) {
  const qc = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return []
      const result = await pb.collection('notifications').getList(1, 50, {
        filter: `user = "${userId}"`,
        sort: '-created',
      })
      return result.items.map(mapNotification)
    },
    enabled: !!userId,
    refetchInterval: 30_000, // poll every 30 seconds
  })

  const unreadCount       = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 10)

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('notifications').update(id, { read: true })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      try {
        await pb.send('/notifications/mark-read', {
          method: 'POST',
          body: JSON.stringify({ ids: 'all' }),
        })
      } catch {
        // Fallback: batch update unread items
        const unreadItems = notifications.filter(n => !n.read)
        await Promise.all(
          unreadItems.map(n => pb.collection('notifications').update(n.id, { read: true }))
        )
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', userId] })
    },
  })

  const createNotification = useCallback(
    async (params: {
      type: string
      title: string
      message?: string
      data?: Record<string, unknown>
      link?: string
    }) => {
      if (!userId) return
      try {
        await pb.collection('notifications').create({
          user: userId,
          type: params.type,
          title: params.title,
          message: params.message ?? null,
          data: params.data ? JSON.stringify(params.data) : null,
          link: params.link ?? null,
          read: false,
        })
        qc.invalidateQueries({ queryKey: ['notifications', userId] })
      } catch (err) {
        console.error('Failed to create notification:', err)
        toast.error('Failed to create notification')
      }
    },
    [userId, qc]
  )

  const markAsRead = useCallback(
    (id: string) => { markAsReadMutation.mutate(id) },
    [markAsReadMutation]
  )

  const markAllAsRead = useCallback(() => {
    if (unreadCount === 0) return
    markAllAsReadMutation.mutate()
  }, [unreadCount, markAllAsReadMutation])

  return {
    notifications,
    recentNotifications,
    unreadCount,
    hasUnread: unreadCount > 0,
    isLoading,
    markAsRead,
    markAllAsRead,
    createNotification,
  }
}
