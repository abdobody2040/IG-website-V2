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
const mockNotificationsCollection = {
  getList: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  subscribe: vi.fn().mockResolvedValue(() => {}),
  unsubscribe: vi.fn().mockResolvedValue(undefined),
}

const mockPb = {
  collection: vi.fn((name: string) => {
    if (name === 'notifications') return mockNotificationsCollection
    return {}
  }),
  send: vi.fn().mockResolvedValue({}),
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
    data: '{"orderId":"o1"}',
    link: '/client/orders',
    read: false,
    created: '2024-01-02T10:00:00Z',
    ...overrides,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Querying ────────────────────────────────────────────────────────────────
  describe('notifications query', () => {
    it('returns mapped notifications when userId is provided', async () => {
      const raw = makeNotificationRecord()
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [raw] })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(mockNotificationsCollection.getList).toHaveBeenCalledWith(1, 50, {
        filter: 'user = "u1"',
        sort: '-created',
      })
      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0]).toEqual({
        id: 'n1',
        userId: 'u1',
        type: 'order_status',
        title: 'Order updated',
        message: 'Processing now',
        data: { orderId: 'o1' },
        link: '/client/orders',
        read: false,
        createdAt: '2024-01-02T10:00:00Z',
      })
    })

    it('returns empty array when userId is null/undefined', async () => {
      const { result } = renderHook(() => useNotifications(null), { wrapper: createWrapper() })
      expect(result.current.notifications).toEqual([])
      expect(mockNotificationsCollection.getList).not.toHaveBeenCalled()
    })
  })

  // ── Derived State ───────────────────────────────────────────────────────────
  describe('derived counts', () => {
    it('calculates unreadCount correctly', async () => {
      const items = [
        makeNotificationRecord({ id: 'n1', read: false }),
        makeNotificationRecord({ id: 'n2', read: true }),
        makeNotificationRecord({ id: 'n3', read: false }),
      ]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.unreadCount).toBe(2))
    })

    it('returns hasUnread = true when unreadCount > 0', async () => {
      const items = [makeNotificationRecord({ read: false })]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.hasUnread).toBe(true))
    })

    it('returns hasUnread = false when unreadCount === 0', async () => {
      const items = [makeNotificationRecord({ read: true })]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items })

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.hasUnread).toBe(false))
    })
  })

  // ── markAsRead ──────────────────────────────────────────────────────────────
  describe('markAsRead', () => {
    it('calls pb.collection update with read=true', async () => {
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: [makeNotificationRecord()] })
      ;(mockNotificationsCollection.update as Mock).mockResolvedValue({})

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      act(() => { result.current.markAsRead('n1') })

      await waitFor(() => expect(mockNotificationsCollection.update).toHaveBeenCalledWith('n1', { read: true }))
    })
  })

  // ── markAllAsRead ───────────────────────────────────────────────────────────
  describe('markAllAsRead', () => {
    it('updates all unread notifications via bulk endpoint', async () => {
      const unread = [
        makeNotificationRecord({ id: 'n1', read: false }),
        makeNotificationRecord({ id: 'n2', read: false }),
      ]
      ;(mockNotificationsCollection.getList as Mock).mockResolvedValue({ items: unread })
      ;(mockPb.send as Mock).mockResolvedValue({})

      const { result } = renderHook(() => useNotifications('u1'), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.unreadCount).toBe(2))

      act(() => { result.current.markAllAsRead() })

      await waitFor(() => expect(mockPb.send).toHaveBeenCalledWith('/notifications/mark-read', {
        method: 'POST',
        body: JSON.stringify({ ids: 'all' }),
      }))
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
        data: '{"orderId":"o123"}',
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
        expect.objectContaining({ message: null, data: null, link: null })
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
