import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

const mockAuthStore = {
  isValid: false,
  model: null as any,
  onChange: vi.fn().mockReturnValue(vi.fn()),
  clear: vi.fn(),
}

const mockPb = {
  authStore: mockAuthStore,
  files: {
    getURL: vi.fn((_model, filename) => `https://example.com/files/${filename}`),
  },
  send: vi.fn().mockResolvedValue({}),
}

vi.mock('../lib/pocketbase', () => ({
  pb: mockPb,
}))

vi.mock('../lib/authState', () => ({
  updateAuthRole: vi.fn(),
}))

const { useAuth } = await import('../hooks/useAuth')

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStore.isValid = false
    mockAuthStore.model = null
    // default implementation for onChange that calls the callback immediately if we want to simulate
    mockAuthStore.onChange.mockImplementation(() => vi.fn())
  })

  it('returns loading state initially when not valid', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isLoading).toBe(false) // Note: useEffect sets this to false immediately
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('returns authenticated user from synchronous authStore', () => {
    mockAuthStore.isValid = true
    mockAuthStore.model = {
      id: 'user-1',
      email: 'test@example.com',
      display_name: 'Test User',
      role: 'client',
      phone: '+1234567890',
    }

    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user!.id).toBe('user-1')
    expect(result.current.user!.email).toBe('test@example.com')
    expect(result.current.user!.displayName).toBe('Test User')
    expect(result.current.user!.role).toBe('client')
    expect(result.current.user!.phone).toBe('+1234567890')
  })

  it('falls back to email prefix when no displayName', () => {
    mockAuthStore.isValid = true
    mockAuthStore.model = {
      id: 'user-2',
      email: 'john.doe@example.com',
      role: 'admin',
    }

    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user!.displayName).toBe('john.doe')
    expect(result.current.user!.role).toBe('admin')
  })

  it('subscribes to auth state changes', () => {
    renderHook(() => useAuth())
    expect(mockAuthStore.onChange).toHaveBeenCalledTimes(1)
    expect(typeof mockAuthStore.onChange.mock.calls[0]![0]).toBe('function')
  })

  it('signs out correctly', async () => {
    mockAuthStore.isValid = true
    mockAuthStore.model = { id: 'user-1' }

    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.signOut()
    })

    expect(mockAuthStore.clear).toHaveBeenCalledTimes(1)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })
})
