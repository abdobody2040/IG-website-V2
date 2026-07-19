import { useQuery } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import type { Order } from '../types/db'

import { useWorkspace } from './useWorkspace'

export function useOrders(userId: string | undefined | null) {
  const { activeWorkspace } = useWorkspace()
  const workspaceId = activeWorkspace?.id

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', workspaceId, userId],
    queryFn: async () => {
      const filterStr = `user = "${userId}"`

      const result = await pb.collection('orders').getList(1, 200, {
        filter: filterStr,
        sort: '-created',
      })
      return result.items.map(mapOrder)
    },
    enabled: !!userId,
  })

  return {
    orders: data ?? [],
    isLoading,
    error,
  }
}

function mapOrder(row: Record<string, unknown>): Order {
  return {
    id: row['id'] as string,
    userId: row['user'] as string,
    orderNumber: row['order_number'] as string,
    packageName: row['package_name'] as string,
    companyName: row['company_name'] as string,
    companyState: row['company_state'] as string,
    companyType: row['company_type'] as string,
    status: row['status'] as string,
    amount: row['amount'] as number,
    currency: row['currency'] as string,
    notes: row['notes'] as string,
    customerName: (row['customer_name'] as string) ?? null,
    customerEmail: (row['customer_email'] as string) ?? null,
    customerPhone: (row['customer_phone'] as string) ?? null,
    customerCountry: (row['customer_country'] as string) ?? null,
    customerAddress: (row['customer_address'] as string) ?? null,
    businessActivity: (row['business_activity'] as string) ?? null,
    stripeSessionId: (row['stripe_session_id'] as string) ?? null,
    createdAt: row['created'] as string,
    updatedAt: row['updated'] as string,
  }
}
