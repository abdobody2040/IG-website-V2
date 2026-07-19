import { useQuery } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import type { Document } from '../types/db'

import { useWorkspace } from './useWorkspace'

export function useDocuments(userId: string | undefined | null) {
  const { activeWorkspace } = useWorkspace()
  const workspaceId = activeWorkspace?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', workspaceId, userId],
    queryFn: async () => {
      const filterStr = `user = "${userId}"`

      const result = await pb.collection('documents').getList(1, 200, {
        filter: filterStr,
        sort: '-created',
      })
      return result.items.map(mapDocument)
    },
    enabled: !!userId,
  })

  return {
    documents: data ?? [],
    isLoading,
    error,
  }
}

function mapDocument(row: Record<string, unknown>): Document {
  return {
    id: row['id'] as string,
    userId: row['user'] as string,
    orderId: row['order'] as string,
    companyId: row['company'] as string,
    name: row['name'] as string,
    docType: row['doc_type'] as string,
    fileUrl: (row['file_url'] as string) ?? '',
    fileName: (row['file_name'] as string) ?? '',
    status: row['status'] as string,
    notes: (row['notes'] as string) ?? '',
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
  }
}
