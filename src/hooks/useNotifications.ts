import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'
import type { RecordModel } from 'pocketbase'

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

function mapNotification(raw: RecordModel): AppNotification {
  return {
    id: raw['id'] as string,
    userId: raw['user'] as string,
    type: raw['type'] as string,
    title: raw['title'] as string,
    message: raw['message'] as string | null,
    data: (raw['data'] as Record<string, unknown>) ?? {},
    link: raw['link'] as string | null,
    read: raw['read'] as boolean,
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
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 10)

  // Real-time subscription via PocketBase SSE
  useEffect(() => {
    if (!userId) return

    pb.collection('notifications').subscribe('*', (e) => {
      if (e.action === 'create' && e.record['user'] === userId) {
        qc.invalidateQueries({ queryKey: ['notifications', userId] })
      }
    }).catch(console.error)

    return () => {
      pb.collection('notifications').unsubscribe('*').catch(() => {})
    }
  }, [userId, qc])

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
      const unread = notifications.filter((n) => !n.read)
      await Promise.all(
        unread.map((n) => pb.collection('notifications').update(n.id, { read: true }))
      )
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
          data: params.data ?? {},
          link: params.link ?? null,
          read: false,
        })
      } catch (err) {
        console.error('Failed to create notification:', err)
        toast.error('Failed to create notification')
      }
    },
    [userId]
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
    isLoading,
    markAsRead,
    markAllAsRead,
    createNotification,
  }
}
