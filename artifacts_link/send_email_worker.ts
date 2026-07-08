/**
 * Cloudflare Worker — send-email
 *
 * Sends transactional emails via the Resend REST API.
 * Reads RESEND_API_KEY and ALLOWED_ORIGIN from Worker environment variables.
 *
 * Environment variables (set in Cloudflare dashboard or wrangler.toml):
 *   RESEND_API_KEY   — Resend API key (re_xxxxx)
 *   ALLOWED_ORIGIN   — The production domain, e.g. https://instantgrow.net
 *   PB_URL           — PocketBase URL for token verification
 *   ADMIN_EMAIL      — Admin email that can receive guest emails without auth
 */

export interface Env {
  RESEND_API_KEY: string
  ALLOWED_ORIGIN: string
  PB_URL: string
  ADMIN_EMAIL: string
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

function getCorsOrigin(req: Request, env: Env): string {
  const allowed = env.ALLOWED_ORIGIN || ''
  const origin = req.headers.get('origin') || ''
  return allowed && origin === allowed ? origin : ''
}

function corsHeaders(req: Request, env: Env) {
  return {
    'Access-Control-Allow-Origin': getCorsOrigin(req, env),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin',
  }
}

function jsonResponse(req: Request, env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req, env), 'Content-Type': 'application/json' },
  })
}

// ---------------------------------------------------------------------------
// Auth verification (optional for admin-bound emails)
// ---------------------------------------------------------------------------

async function verifyAuth(req: Request, env: Env): Promise<string | null> {
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null

  const pbUrl = env.PB_URL || 'http://127.0.0.1:8090'
  try {
    const res = await fetch(`${pbUrl}/api/collections/users/auth-refresh`, {
      method: 'POST',
      headers: { Authorization: token },
    })
    if (!res.ok) return null
    const data = await res.json() as { record: { id: string } }
    return data.record.id
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(req, env) })
    }

    if (req.method !== 'POST') {
      return jsonResponse(req, env, { error: 'Method not allowed' }, 405)
    }

    const resendKey = env.RESEND_API_KEY
    if (!resendKey) {
      return jsonResponse(req, env, { error: 'Email service not configured' }, 503)
    }

    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return jsonResponse(req, env, { error: 'Invalid JSON body' }, 400)
    }

    const to = typeof body['to'] === 'string' ? body['to'].trim() : ''
    const subject = typeof body['subject'] === 'string' ? body['subject'].trim() : ''
    const html = typeof body['html'] === 'string' ? body['html'] : ''
    const text = typeof body['text'] === 'string' ? body['text'] : ''

    if (!to || !subject || (!html && !text)) {
      return jsonResponse(req, env, { error: 'to, subject, and html or text are required' }, 400)
    }

    // Auth check: skip for emails addressed to the admin (e.g. contact form notifications)
    const adminEmail = env.ADMIN_EMAIL || 'info@instantgrow.net'
    const isAdminEmail = to === adminEmail
    if (!isAdminEmail) {
      const userId = await verifyAuth(req, env)
      if (!userId) {
        return jsonResponse(req, env, { error: 'Unauthorized' }, 401)
      }
    }

    // Send via Resend REST API
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Instant Grow <noreply@instantgrow.net>',
          to: [to],
          subject,
          html: html || undefined,
          text: text || undefined,
        }),
      })

      if (!resendRes.ok) {
        const errBody = await resendRes.text()
        console.error(`Resend error ${resendRes.status}:`, errBody)
        return jsonResponse(req, env, { error: 'Failed to send email' }, 502)
      }

      return jsonResponse(req, env, { success: true })
    } catch (err) {
      console.error('send-email worker error:', err)
      return jsonResponse(req, env, { error: 'Internal server error' }, 500)
    }
  },
}
