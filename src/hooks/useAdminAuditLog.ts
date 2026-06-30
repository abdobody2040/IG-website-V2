import { pb } from '../lib/pocketbase'

interface AuditEntry {
  action: string
  tableName: string
  recordId: string
  details?: Record<string, unknown>
}

export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    if (!pb.authStore.isValid || !pb.authStore.model) return
    await pb.collection('admin_audit_log').create({
      admin: pb.authStore.model.id,
      action: entry.action,
      table_name: entry.tableName,
      record_id: entry.recordId,
      details: entry.details ? JSON.stringify(entry.details) : null,
    })
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}
