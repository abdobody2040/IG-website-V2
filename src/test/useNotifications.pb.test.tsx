/**
 * Tests for src/hooks/useNotifications.ts
 *
 * The hook uses PocketBase directly (pb.collection('notifications')).
 * We mock '../lib/pocketbase' so no real network calls are made.
 */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// ─── Mock PocketBase ──────────────────────────────────────────────────────────
const subscribeCallback: { fn: ((e: { action: string; record: Record<string, unknown> }) => void) | null } = { fn: null }

const mockNotificationsCollection = {
  getList: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  subscribe: vi.fn((_: string, cb: (e: { action: string; record: Record<string, unknown> }) => void) => {
    subscribeCallback.fn = cb
    return Promise.resolve()
  }),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
}

const mockPb = {
  collection: vi.fn((name: string) => {
    if (name === 'notifications') return mockNotificationsCollection
    return {}
  }),
  authStore: { token: 'fake-token' },
}

vi.mock('../lib/pocketbase', () => ({ pb: mockPb }))

// ─── Import AFTER mock ────────────────────────────────────────────────────────
const { useNotifications } = await import('../hooks/useNotifications')

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeNotificationRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'n1',
    user: 'u1',
    type: 'order_status',
    title: 'Order updated',
    message: 'Processing now',
    data: { orderId: 'o1' },
    link: '/client/orders',
    read: false,
    created: '2024-01-02T10:00:00Z',
    ...overrides,
  }
}

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    subscribeCallback.fn = null
    // Default: getList resolves with empty list
    ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [] })
  })

  // ── Null / undefined userId ─────────────────────────────────────────────────
  describe('when userId is falsy', () => {
    it('returns empty notifications when userId is null', () => {
      const { result } = renderHook(() => useNotifications(null), { wrapper: createWrapper() })
      expect(result.current.notifications).toEqual([])
      expect(result.current.unreadCount).toBe(0)
      expect(result.current.isLoading).toBe(false)
    })

    it('returns empty notifications when userId is undefined', () => {
      const { result } = renderHook(() => useNotifications(undefined), { wrapper: createWrapper() })
      expect(result.current.notifications).toEqual([])
      expect(result.current.unreadCount).toBe(0)
    })

    it('does NOT call pb.collection when userId is null', () => {
      renderHook(() => useNotifications(null), { wrapper: createWrapper() })
      expect(mockNotificationsCollection.getList).not.toHaveBeenCalled()
    })
  })

  // ── Data fetching ───────────────────────────────────────────────────────────
  describe('data fetching', () => {
    it('fetches notifications from PocketBase on mount', async () => {
      const records = [
        makeNotificationRecord({ id: 'n1', read: false }),
        makeNotificationRecord({ id: 'n2', read: true, title: 'Document ready', type: 'document_ready' }),
      ]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: records })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })

      await waitFor(() => expect(result.current.notifications).toHaveLength(2))
      expect(result.current.notifications[0]!.id).toBe('n1')
      expect(result.current.notifications[1]!.id).toBe('n2')
      expect(mockNotificationsCollection.getList).toHaveBeenCalledWith(1, 50, {
        filter: 'user = "u1"',
        sort: '-created',
      })
    })

    it('maps PocketBase record fields correctly', async () => {
      const raw = makeNotificationRecord({
        id: 'n99',
        user: 'u1',
        type: 'document_ready',
        title: 'Test title',
        message: 'Test message',
        data: { key: 'value' },
        link: '/test-link',
        read: true,
        created: '2024-06-01T12:00:00Z',
      })
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [raw] })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.notifications).toHaveLength(1))

      const n = result.current.notifications[0]!
      expect(n.id).toBe('n99')
      expect(n.userId).toBe('u1')
      expect(n.type).toBe('document_ready')
      expect(n.title).toBe('Test title')
      expect(n.message).toBe('Test message')
      expect(n.data).toEqual({ key: 'value' })
      expect(n.link).toBe('/test-link')
      expect(n.read).toBe(true)
      expect(n.createdAt).toBe('2024-06-01T12:00:00Z')
    })

    it('computes unreadCount correctly', async () => {
      const records = [
        makeNotificationRecord({ id: 'n1', read: false }),
        makeNotificationRecord({ id: 'n2', read: false }),
        makeNotificationRecord({ id: 'n3', read: true }),
      ]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: records })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.unreadCount).toBe(2))
    })

    it('returns only first 10 notifications in recentNotifications', async () => {
      const records = Array.from({ length: 15 }, (_, i) =>
        makeNotificationRecord({ id: `n${i}`, title: `Notification ${i}` })
      )
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: records })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.notifications).toHaveLength(15))
      expect(result.current.recentNotifications).toHaveLength(10)
    })
  })

  // ── Real-time subscription ──────────────────────────────────────────────────
  describe('real-time subscription', () => {
    it('subscribes to notifications collection with wildcard', async () => {
      renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockNotificationsCollection.subscribe).toHaveBeenCalledWith('*', expect.any(Function)))
    })

    it('invalidates query cache when a new notification arrives for the current user', async () => {
      ;(mockNotificationsCollection.getList as Mock)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [makeNotificationRecord()] })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockNotificationsCollection.subscribe).toHaveBeenCalled())

      // Simulate real-time event
      act(() => {
        subscribeCallback.fn?.({ action: 'create', record: { user: 'u1' } })
      })

      await waitFor(() => expect(mockNotificationsCollection.getList).toHaveBeenCalledTimes(2))
      await waitFor(() => expect(result.current.notifications).toHaveLength(1))
    })

    it('does NOT invalidate cache for a different user\'s notification', async () => {
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [] })

      renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockNotificationsCollection.subscribe).toHaveBeenCalled())

      act(() => {
        subscribeCallback.fn?.({ action: 'create', record: { user: 'OTHER_USER' } })
      })

      // Should still only be called once (initial fetch)
      await new Promise((r) => setTimeout(r, 50))
      expect(mockNotificationsCollection.getList).toHaveBeenCalledTimes(1)
    })

    it('unsubscribes on unmount', async () => {
      const { unmount } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(mockNotificationsCollection.subscribe).toHaveBeenCalled())
      unmount()
      await waitFor(() => expect(mockNotificationsCollection.unsubscribe).toHaveBeenCalledWith('*'))
    })
  })

  // ── markAsRead ──────────────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('calls pb.collection("notifications").update with read: true', async () => {
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [] })
      ;(mockNotificationsCollection.update as Mock).mockResolvedValue({})

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => { result.current.markAsRead('n1') })

      await waitFor(() =>
        expect(mockNotificationsCollection.update).toHaveBeenCalledWith('n1', { read: true })
      )
    })
  })

  // ── markAllAsRead ───────────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('does nothing when there are no unread notifications', async () => {
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({
        items: [makeNotificationRecord({ read: true })],
      })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.unreadCount).toBe(0))

      act(() => { result.current.markAllAsRead() })
      await new Promise((r) => setTimeout(r, 50))

      expect(mockNotificationsCollection.update).not.toHaveBeenCalled()
    })

    it('updates all unread notifications', async () => {
      const unread = [
        makeNotificationRecord({ id: 'n1', read: false }),
        makeNotificationRecord({ id: 'n2', read: false }),
      ]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: unread })
      ;(mockNotificationsCollection.update as Mock).mockResolvedValue({})

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.unreadCount).toBe(2))

      act(() => { result.current.markAllAsRead() })

      await waitFor(() => expect(mockNotificationsCollection.update).toHaveBeenCalledTimes(2))
      expect(mockNotificationsCollection.update).toHaveBeenCalledWith('n1', { read: true })
      expect(mockNotificationsCollection.update).toHaveBeenCalledWith('n2', { read: true })
    })
  })

  // ── createNotification ──────────────────────────────────────────────────────
  describe('createNotification', () => {
    it('creates a notification via pb.collection with correct fields', async () => {
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [] })
      ;(mockNotificationsCollection.create as Mock).mockResolvedValue({ id: 'new-n' })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.createNotification({
          type: 'order_status',
          title: 'Status updated',
          message: 'Your order is processing',
          data: { orderId: 'o123' },
          link: '/client/orders/o123',
        })
      })

      expect(mockNotificationsCollection.create).toHaveBeenCalledWith({
        user: 'u1',
        type: 'order_status',
        title: 'Status updated',
        message: 'Your order is processing',
        data: { orderId: 'o123' },
        link: '/client/orders/o123',
        read: false,
      })
    })

    it('uses null defaults for optional fields', async () => {
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [] })
      ;(mockNotificationsCollection.create as Mock).mockResolvedValue({ id: 'new-n' })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.createNotification({ type: 'info', title: 'Hello' })
      })

      expect(mockNotificationsCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({ message: null, data: {}, link: null })
      )
    })

    it('does NOT create a notification when userId is null', async () => {
      const { result } = renderHook(() => useNotifications(null), { wrapper: createWrapper() })

      await act(async () => {
        await result.current.createNotification({ type: 'info', title: 'Test' })
      })

      expect(mockNotificationsCollection.create).not.toHaveBeenCalled()
    })
  })
})
