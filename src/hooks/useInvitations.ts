import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Invitation } from '../types/db'

function mapInvitation(raw: Record<string, unknown>): Invitation {
  return {
    id: raw['id'] as string,
    email: raw['email'] as string,
    companyName: raw['company_name'] as string | null,
    role: raw['role'] as string,
    token: raw['id'] as string, // PocketBase record ID used as token
    invitedBy: raw['invited_by'] as string | null,
    status: raw['status'] as Invitation['status'],
    expiresAt: raw['expires_at'] as string,
    createdAt: raw['created'] as string,
    updatedAt: raw['updated'] as string,
  }
}

export function useInvitations() {
  const qc = useQueryClient()

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      if (!pb.authStore.isValid) throw new Error('Unauthorized')
      const role = pb.authStore.model?.['role'] as string
      if (role !== 'admin') throw new Error('Unauthorized')

      const result = await pb.collection('invitations').getList(1, 200, {
        sort: '-created',
      })
      return result.items.map(mapInvitation)
    },
  })

  const createInviteMutation = useMutation({
    mutationFn: async (params: { email: string; companyName?: string; role?: string }) => {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7-day expiry

      await pb.collection('invitations').create({
        email: params.email,
        company_name: params.companyName ?? null,
        role: params.role ?? 'client',
        invited_by: pb.authStore.model?.['id'] ?? null,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        accepted: false,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
      toast.success('Invitation sent!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create invitation')
    },
  })

  return {
    invitations,
    isLoading,
    createInvite: createInviteMutation.mutate,
    isCreating: createInviteMutation.isPending,
  }
}

export function useInvitationByToken(token: string | null) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null
      try {
        // Invitations are looked up by email filter for the invite flow
        const result = await pb.collection('invitations').getList(1, 1, {
          filter: `id = "${token}" && status = "pending"`,
        })
        if (result.items.length === 0) return null
        return mapInvitation(result.items[0] as unknown as Record<string, unknown>)
      } catch {
        return null
      }
    },
    enabled: !!token,
  })
}
