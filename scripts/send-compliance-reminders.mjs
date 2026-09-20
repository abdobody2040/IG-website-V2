/**
 * send-compliance-reminders.mjs
 *
 * Run as a cron job or scheduled task to send automated compliance email
 * reminders to clients whose company deadlines are approaching or overdue.
 *
 * Schedule (example): 0 9 * * * node scripts/send-compliance-reminders.mjs
 *
 * Environment variables (from .env.local or shell / GitHub Actions secrets):
 *   API_URL          — PHP API base URL  (e.g. https://instantgrow.net/api)
 *   PB_ADMIN_EMAIL   — Admin user email
 *   PB_ADMIN_PASS    — Admin user password
 *   RESEND_API_KEY   — Resend API key for sending emails
 *   FROM_EMAIL       — Sender address  (default: noreply@instantgrow.net)
 *   APP_URL          — App base URL     (default: https://instantgrow.net)
 *
 * NOTE: PB_URL is accepted as a fallback alias for API_URL to avoid
 * needing to rename the existing GitHub Actions secret immediately.
 */

import 'dotenv/config'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Accept PB_URL as alias so the existing GitHub Actions secret still works.
// PB_URL was previously set to something like https://instantgrow.net/api
// If it was the old PocketBase URL (port 8090 etc.) we correct it here.
const rawApiUrl = process.env.API_URL || process.env.PB_URL || 'https://instantgrow.net/api'
// Strip any trailing slash for consistent path building
const API_URL = rawApiUrl.replace(/\/+$/, '')

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL
const ADMIN_PASS  = process.env.PB_ADMIN_PASS

if (!ADMIN_EMAIL || !ADMIN_PASS) {
  console.error('❌ Error: PB_ADMIN_EMAIL and PB_ADMIN_PASS environment variables must be set.')
  process.exit(1)
}

const RESEND_KEY  = process.env.RESEND_API_KEY
const FROM_EMAIL  = process.env.FROM_EMAIL || 'noreply@instantgrow.net'
const APP_URL     = process.env.APP_URL    || 'https://instantgrow.net'

// Days before due date that trigger a reminder
const REMINDER_WINDOWS = [30, 7]
// Days past due date (negative = overdue) that trigger an overdue alert
const OVERDUE_DAYS     = [-1]

// ---------------------------------------------------------------------------
// PHP API auth — POST /auth/login  →  { token, record }
// ---------------------------------------------------------------------------

async function adminLogin() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Admin login failed (${res.status}): ${body}`)
  }
  const { token } = await res.json()
  if (!token) throw new Error('Admin login returned no token')
  console.log('✅ Authenticated as admin\n')
  return token
}

// ---------------------------------------------------------------------------
// Helper: build auth headers for every subsequent request
// Sends both Authorization AND X-Auth-Token because Hostinger/FastCGI
// sometimes strips the Authorization header on Apache.
// ---------------------------------------------------------------------------

function authHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'X-Auth-Token':  `Bearer ${token}`,
    'Content-Type':  'application/json',
  }
}

// ---------------------------------------------------------------------------
// Fetch all companies — GET /collections/companies/records?perPage=500
// Returns items[] containing { id, user, company_name, renewal_due_date, ... }
// ---------------------------------------------------------------------------

async function fetchAllCompanies(token) {
  const url = `${API_URL}/collections/companies/records?perPage=500&sort=-created`
  const res = await fetch(url, { headers: authHeaders(token) })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to fetch companies (${res.status}): ${body}`)
  }
  const data = await res.json()
  return data.items || []
}

// ---------------------------------------------------------------------------
// Fetch user email — GET /collections/users/records/<id>
// Returns { email, display_name, name } or null on error
// ---------------------------------------------------------------------------

async function fetchUser(userId, token) {
  try {
    const res = await fetch(`${API_URL}/collections/users/records/${userId}`, {
      headers: authHeaders(token),
    })
    if (!res.ok) return null
    const user = await res.json()
    return {
      email: user.email,
      name:  user.display_name || user.name || user.email,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Create in-app notification — POST /collections/notifications/records
// Columns: user, type, title, message, link, read
// ---------------------------------------------------------------------------

async function createNotification(token, userId, title, message) {
  try {
    const res = await fetch(`${API_URL}/collections/notifications/records`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({
        user:    userId,
        type:    'compliance',
        title,
        message,
        link:    '/client/dashboard',
        read:    false,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.warn(`  ⚠️  Notification creation failed (${res.status}): ${body}`)
    }
  } catch (err) {
    console.warn(`  ⚠️  Notification request error: ${err.message}`)
  }
}

// ---------------------------------------------------------------------------
// Email via Resend
// ---------------------------------------------------------------------------

async function sendEmail(to, subject, html) {
  if (!RESEND_KEY) {
    console.warn(`  [skip email — no RESEND_API_KEY] Would have sent: ${subject} → ${to}`)
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    `Instant Grow <${FROM_EMAIL}>`,
        to:      [to],
        subject,
        html,
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      console.error(`  ❌ Email error (${res.status}): ${body}`)
    }
  } catch (err) {
    console.error(`  ❌ Email request failed: ${err.message}`)
  }
}

function buildEmailHtml(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;">
    <div style="background:#0a0f1e;padding:28px 32px;text-align:center;border-radius:16px 16px 0 0;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Instant Grow</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,.5);font-size:13px;">Company Formation Services</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 16px;color:#0a0f1e;font-size:20px;font-weight:700;">${title}</h2>
      <div style="color:#475569;font-size:15px;line-height:1.7;">${body}</div>
      <div style="margin-top:28px;text-align:center;">
        <a href="${APP_URL}/client/dashboard"
           style="display:inline-block;background:#1a56ff;color:#fff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
          View Dashboard
        </a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} Instant Grow ·
        <a href="mailto:info@instantgrow.net" style="color:#1a56ff;text-decoration:none;">info@instantgrow.net</a>
      </p>
    </div>
  </div>
</body></html>`
}

// ---------------------------------------------------------------------------
// Compliance date checker
// ---------------------------------------------------------------------------

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const due = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - now.getTime()) / 86_400_000)
}

// PHP API field names match the MySQL companies table columns exactly
const COMPLIANCE_FIELDS = [
  { key: 'renewal_due_date',              label: 'Company Renewal' },
  { key: 'annual_report_due_date',        label: 'Annual Report Filing' },
  { key: 'tax_filing_due_date',           label: 'Tax Filing' },
  { key: 'registered_agent_renewal_date', label: 'Registered Agent Renewal' },
]

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`🔐 Authenticating to PHP API at ${API_URL} ...`)
  const token = await adminLogin()

  console.log('📋 Fetching companies ...')
  const companies = await fetchAllCompanies(token)
  console.log(`   Found ${companies.length} companies.\n`)

  let sent    = 0
  let skipped = 0

  for (const company of companies) {
    const userId = company.user || company.user_id
    if (!userId) { skipped++; continue }

    const userInfo = await fetchUser(userId, token)
    if (!userInfo?.email) { skipped++; continue }

    const companyName = company.company_name || 'Your Company'

    for (const field of COMPLIANCE_FIELDS) {
      const dateStr = company[field.key]
      const days    = getDaysUntil(dateStr)
      if (days === null) continue

      const shouldSend = REMINDER_WINDOWS.includes(days) || OVERDUE_DAYS.includes(days)
      if (!shouldSend) continue

      let urgencyLabel, emailTitle

      if (days < 0) {
        urgencyLabel = '🔴 OVERDUE'
        emailTitle   = `Action Required: ${field.label} is Overdue`
      } else if (days <= 7) {
        urgencyLabel = '🟡 Due in 7 days'
        emailTitle   = `Reminder: ${field.label} Due in ${days} Day${days !== 1 ? 's' : ''}`
      } else {
        urgencyLabel = '🔔 Upcoming'
        emailTitle   = `Upcoming Deadline: ${field.label} in ${days} Days`
      }

      const bodyHtml = `
        <p>Hi <strong>${userInfo.name}</strong>,</p>
        <p>This is a compliance reminder for <strong>${companyName}</strong>:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Compliance Item</td>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${field.label}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Due Date</td>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b;font-size:13px;">Status</td>
            <td style="padding:10px 0;font-weight:700;color:${days < 0 ? '#ef4444' : '#f59e0b'};text-align:right;">${urgencyLabel}</td>
          </tr>
        </table>
        <p>Please take action promptly to keep your company in good standing.</p>
      `

      await sendEmail(userInfo.email, emailTitle, buildEmailHtml(emailTitle, bodyHtml))

      await createNotification(
        token,
        userId,
        emailTitle,
        `Compliance reminder for ${companyName}: ${field.label} is ${days < 0 ? 'overdue' : `due in ${days} days`}.`,
      )

      console.log(`  ✅ Sent: ${urgencyLabel} — ${companyName} — ${field.label} → ${userInfo.email}`)
      sent++
    }
  }

  console.log(`\n✅ Done. ${sent} reminder(s) sent. ${skipped} companies skipped (no user/email).`)
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
