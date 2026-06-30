import { useQuery } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import type { Document } from '../types/db'

export function useDocuments(userId: string | undefined | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const result = await pb.collection('documents').getList(1, 200, {
        filter: `user = "${userId}"`,
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
