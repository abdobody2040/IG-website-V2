import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

const mockInvitationsCollection = {
  getList: vi.fn(),
  create: vi.fn(),
}

const mockPb = {
  collection: vi.fn((name: string) => {
    if (name === 'invitations') return mockInvitationsCollection
    return {}
  }),
  authStore: { 
    isValid: true,
    model: { id: 'admin-1', role: 'admin' }
  },
}

vi.mock('../lib/pocketbase', () => ({ pb: mockPb }))

const { useInvitations, useInvitationByToken } = await import('../hooks/useInvitations')

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

describe('useInvitations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPb.authStore.isValid = true
    mockPb.authStore.model = { id: 'admin-1', role: 'admin' }
    ;(mockInvitationsCollection.getList as Mock).mockResolvedValue({ items: [] })
    ;(mockInvitationsCollection.create as Mock).mockResolvedValue({ id: 'new-inv' })
  })

  it('fetches invitations list', async () => {
    ;(mockInvitationsCollection.getList as Mock).mockResolvedValue({
      items: [
        { id: 'inv-1', email: 'a@test.com', company_name: 'Acme', role: 'client', status: 'pending', created: '2024', updated: '2024' },
        { id: 'inv-2', email: 'b@test.com', company_name: null, role: 'admin', status: 'accepted', created: '2024', updated: '2024' }
      ]
    })

    const { result } = renderHook(() => useInvitations(), { wrapper: createWrapper() })
    
    await waitFor(() => expect(result.current.invitations).toHaveLength(2))
    expect(result.current.invitations[0]!.email).toBe('a@test.com')
    expect(result.current.invitations[0]!.companyName).toBe('Acme')
    expect(mockInvitationsCollection.getList).toHaveBeenCalledWith(1, 200, { sort: '-created' })
  })

  it('calls create on invitations collection on createInvite', async () => {
    const { result } = renderHook(() => useInvitations(), { wrapper: createWrapper() })
    
    await act(async () => {
      await result.current.createInvite({ email: 'new@test.com' })
    })

    expect(mockInvitationsCollection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@test.com',
        company_name: null,
        role: 'client',
        invited_by: 'admin-1',
        status: 'pending',
      })
    )
  })
})

describe('useInvitationByToken', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns undefined when token is null', () => {
    const { result } = renderHook(() => useInvitationByToken(null), { wrapper: createWrapper() })
    expect(result.current.data).toBeUndefined()
  })

  it('fetches invitation by token', async () => {
    ;(mockInvitationsCollection.getList as Mock).mockResolvedValue({
      items: [
        { id: 'valid-token', email: 'invited@test.com', company_name: 'Biz Inc', role: 'client', status: 'pending', created: '2024', updated: '2024' }
      ]
    })

    const { result } = renderHook(() => useInvitationByToken('valid-token'), { wrapper: createWrapper() })
    
    await waitFor(() => expect(result.current.data).not.toBeUndefined())
    expect(mockInvitationsCollection.getList).toHaveBeenCalledWith(1, 1, {
      filter: 'id = "valid-token" && status = "pending"'
    })
    expect(result.current.data!.email).toBe('invited@test.com')
    expect(result.current.data!.companyName).toBe('Biz Inc')
  })

  it('returns null when token is invalid or not found', async () => {
    ;(mockInvitationsCollection.getList as Mock).mockResolvedValue({ items: [] })

    const { result } = renderHook(() => useInvitationByToken('bad-token'), { wrapper: createWrapper() })
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})
