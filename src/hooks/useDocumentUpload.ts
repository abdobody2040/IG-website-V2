import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'

interface UploadOptions {
  userId: string
  orderId?: string
  companyId?: string
}

interface UploadState {
  uploading: boolean
  progress: number
  error: string | null
}

const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT as string | undefined

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export function useDocumentUpload({ userId, orderId = '', companyId = '' }: UploadOptions) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  })

  const upload = useCallback(async (file: File, docType: string = 'other'): Promise<boolean> => {
    setState({ uploading: true, progress: 0, error: null })

    try {
      // Client-side pre-validation (fast UX feedback)
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large. Maximum size is 10 MB.')
      }
      if (ALLOWED_TYPES.length > 0 && !ALLOWED_TYPES.includes(file.type)) {
        throw new Error('File type not allowed. Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.')
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      let publicUrl: string

      if (R2_UPLOAD_ENDPOINT) {
        // Upload via upload-validator Cloudflare Worker (server-side MIME + size check)
        const path = `user-docs/${userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', path)

        const res = await fetch(R2_UPLOAD_ENDPOINT, {
          method: 'POST',
          headers: pb.authStore.token
            ? { Authorization: `Bearer ${pb.authStore.token}` }
            : {},
          body: formData,
        })

        if (!res.ok) {
          let errMsg = 'Upload failed. Please try again.'
          try {
            const body = await res.json() as { error?: string }
            if (body.error) errMsg = body.error
          } catch { /* ignore parse error */ }

          if (res.status === 413) errMsg = 'File too large. Maximum size is 10 MB.'
          if (res.status === 415) errMsg = 'File type not allowed. Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.'

          throw new Error(errMsg)
        }

        const json = await res.json() as { url: string }
        publicUrl = json.url
      } else {
        // Fallback: upload directly to PocketBase file storage
        const formData = new FormData()
        formData.append('user', userId)
        formData.append('order', orderId || '')
        formData.append('company', companyId || '')
        formData.append('name', file.name)
        formData.append('doc_type', docType)
        formData.append('file_name', safeName)
        formData.append('status', 'ready')
        formData.append('file', file)

        const record = await pb.collection('documents').create(formData)
        publicUrl = pb.files.getURL(record, record['file'] as string)

        setState({ uploading: false, progress: 100, error: null })
        await queryClient.invalidateQueries({ queryKey: ['documents', userId] })
        return true
      }

      setState(s => ({ ...s, progress: 80 }))

      // Save document record to PocketBase
      await pb.collection('documents').create({
        user: userId,
        order: orderId || null,
        company: companyId || null,
        name: file.name,
        doc_type: docType,
        file_url: publicUrl,
        file_name: safeName,
        status: 'ready',
      })

      await queryClient.invalidateQueries({ queryKey: ['documents', userId] })
      setState({ uploading: false, progress: 100, error: null })
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.'
      setState({ uploading: false, progress: 0, error: msg })
      return false
    }
  }, [userId, orderId, companyId, queryClient])

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null })
  }, [])

  return { ...state, upload, reset }
}
