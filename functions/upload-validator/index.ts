/**
 * upload-validator — Cloudflare Worker
 *
 * Validates file uploads by reading magic bytes (file signatures) before
 * forwarding to storage. This prevents MIME type spoofing that client-side
 * validation cannot catch.
 *
 * Allowlist (magic bytes):
 *   PDF  : 25 50 44 46  (%PDF)
 *   PNG  : 89 50 4E 47  (.PNG)
 *   JPEG : FF D8 FF      (SOI marker)
 *   WEBP : 52 49 46 46 ... 57 45 42 50  (RIFF....WEBP)
 *   DOC  : D0 CF 11 E0  (OLE2 compound document)
 *   DOCX : 50 4B 03 04  (ZIP/PK header — Office Open XML)
 *
 * Deploy:
 *   wrangler deploy functions/upload-validator/index.ts
 *
 * Environment variables (set in wrangler.toml or Cloudflare dashboard):
 *   ALLOWED_ORIGIN   — CORS origin (e.g. https://instantgrow.co)
 *   R2_BUCKET        — bound R2 bucket (binding name: UPLOADS)
 *   AUTH_SECRET      — shared secret or rely on Supabase JWT verification
 */

export interface Env {
  UPLOADS: R2Bucket
  ALLOWED_ORIGIN: string
}

// Magic byte signatures (first N bytes) for each allowed MIME type
const MAGIC_SIGNATURES: Array<{ label: string; bytes: number[]; offset: number }> = [
  { label: 'PDF',  bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },   // %PDF
  { label: 'PNG',  bytes: [0x89, 0x50, 0x4E, 0x47], offset: 0 },   // .PNG
  { label: 'JPEG', bytes: [0xFF, 0xD8, 0xFF],        offset: 0 },   // SOI
  { label: 'DOC',  bytes: [0xD0, 0xCF, 0x11, 0xE0], offset: 0 },   // OLE2
  { label: 'DOCX', bytes: [0x50, 0x4B, 0x03, 0x04], offset: 0 },   // PK (ZIP)
  { label: 'WEBP', bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },   // WEBP at offset 8 in RIFF
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

/**
 * Read the first 16 bytes of the file and check against magic byte signatures.
 */
async function detectMimeFromBytes(buffer: ArrayBuffer): Promise<string | null> {
  const bytes = new Uint8Array(buffer.slice(0, 16))
  for (const sig of MAGIC_SIGNATURES) {
    const slice = bytes.slice(sig.offset, sig.offset + sig.bytes.length)
    const match = sig.bytes.every((b, i) => slice[i] === b)
    if (match) return sig.label
  }
  return null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN || '*'

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    try {
      const formData = await request.formData()
      const file = formData.get('file')
      const path = formData.get('path') as string | null

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        })
      }

      if (!path) {
        return new Response(JSON.stringify({ error: 'No storage path provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
        })
      }

      // 1. Check file size
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: 'File too large. Maximum size is 10 MB.' }),
          { status: 413, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        )
      }

      // 2. Read magic bytes and validate MIME type server-side
      const arrayBuffer = await file.arrayBuffer()
      const detectedType = await detectMimeFromBytes(arrayBuffer)

      if (!detectedType) {
        return new Response(
          JSON.stringify({
            error: 'File type not allowed. Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.',
          }),
          { status: 415, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) } }
        )
      }

      // 3. Upload to R2
      const r2Key = path.startsWith('/') ? path.slice(1) : path
      await env.UPLOADS.put(r2Key, arrayBuffer, {
        httpMetadata: { contentType: file.type },
        customMetadata: { detectedType, originalName: file.name },
      })

      // 4. Return public URL (format depends on your R2 public bucket config)
      const publicUrl = `https://files.instantgrow.co/${r2Key}`

      return new Response(JSON.stringify({ url: publicUrl, detectedType }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    } catch (err) {
      console.error('Upload validator error:', err)
      return new Response(JSON.stringify({ error: 'Upload failed. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }
  },
}
