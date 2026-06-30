import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRequireAuth, useRequireAdmin } from '../hooks/useRequireAuth'

const mockNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

const mockUseAuth = vi.fn()
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRequireAuth', () => {
  it('redirects to login when not authenticated and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false })
    renderHook(() => useRequireAuth())
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth/login' })
  })

  it('does not redirect while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true, isAuthenticated: false })
    renderHook(() => useRequireAuth())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not redirect when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'client' },
      isLoading: false,
      isAuthenticated: true,
    })
    renderHook(() => useRequireAuth())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('returns auth state from underlying useAuth', () => {
    const authState = { user: { id: 'u1' }, isLoading: false, isAuthenticated: true }
    mockUseAuth.mockReturnValue(authState)
    const { result } = renderHook(() => useRequireAuth())
    expect(result.current).toEqual(authState)
  })
})

describe('useRequireAdmin', () => {
  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false })
    renderHook(() => useRequireAdmin())
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth/login' })
  })

  it('redirects non-admin to client dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'client' },
      isLoading: false,
      isAuthenticated: true,
    })
    renderHook(() => useRequireAdmin())
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/client/dashboard' })
  })

  it('does not redirect admin user', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', role: 'admin' },
      isLoading: false,
      isAuthenticated: true,
    })
    renderHook(() => useRequireAdmin())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('does not redirect while loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true, isAuthenticated: false })
    renderHook(() => useRequireAdmin())
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
