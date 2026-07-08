/**
 * send-compliance-reminders.mjs
 *
 * Run as a cron job or scheduled task to send automated compliance email
 * reminders to clients whose company deadlines are approaching or overdue.
 *
 * Schedule (example): 0 9 * * * node scripts/send-compliance-reminders.mjs
 *
 * Environment variables (from .env.local or shell):
 *   PB_URL           — PocketBase URL  (default: http://127.0.0.1:8090)
 *   PB_ADMIN_EMAIL   — Admin email for PocketBase authentication
 *   PB_ADMIN_PASS    — Admin password  for PocketBase authentication
 *   RESEND_API_KEY   — Resend API key for sending emails directly
 *   FROM_EMAIL       — Sender address  (default: noreply@instantgrow.net)
 *   APP_URL          — App URL for dashboard link (default: https://instantgrow.net)
 */

import 'dotenv/config'

const PB_URL        = process.env.PB_URL         || 'http://127.0.0.1:8090'
const ADMIN_EMAIL   = process.env.PB_ADMIN_EMAIL || 'instantgrow.net@gmail.com'
const ADMIN_PASS    = process.env.PB_ADMIN_PASS  || 'admin12345678'
const RESEND_KEY    = process.env.RESEND_API_KEY
const FROM_EMAIL    = process.env.FROM_EMAIL     || 'noreply@instantgrow.net'
const APP_URL       = process.env.APP_URL        || 'https://instantgrow.net'

const REMINDER_WINDOWS = [30, 7] // days before due date to send a reminder
const OVERDUE_DAYS     = [-1]    // days after due date (1 day overdue)

// ---------------------------------------------------------------------------
// PocketBase admin auth
// ---------------------------------------------------------------------------

async function adminLogin() {
  const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  if (!res.ok) throw new Error(`PocketBase admin login failed: ${res.status}`)
  const { token } = await res.json()
  return token
}

// ---------------------------------------------------------------------------
// Fetch data
// ---------------------------------------------------------------------------

async function fetchAllCompanies(token) {
  const res = await fetch(
    `${PB_URL}/api/collections/companies/records?perPage=500&expand=user`,
    { headers: { Authorization: token } }
  )
  if (!res.ok) throw new Error(`Failed to fetch companies: ${res.status}`)
  const data = await res.json()
  return data.items || []
}

async function fetchUserEmail(userId, token) {
  const res = await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
    headers: { Authorization: token },
  })
  if (!res.ok) return null
  const user = await res.json()
  return { email: user.email, name: user.display_name || user.email }
}

// ---------------------------------------------------------------------------
// In-app notification creation
// ---------------------------------------------------------------------------

async function createNotification(token, userId, title, message) {
  await fetch(`${PB_URL}/api/collections/notifications/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({ user: userId, title, message, read: false }),
  }).catch(() => {}) // Non-critical
}

// ---------------------------------------------------------------------------
// Email sending via Resend
// ---------------------------------------------------------------------------

async function sendEmail(to, subject, html) {
  if (!RESEND_KEY) {
    console.warn(`[skip] No RESEND_API_KEY — would have emailed: ${to} — ${subject}`)
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `Instant Grow <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`[email error] ${res.status}: ${body}`)
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
  return Math.ceil((due.getTime() - now.getTime()) / 86400000)
}

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
  console.log('🔐 Authenticating to PocketBase...')
  const token = await adminLogin()
  console.log('✅ Authenticated.\n')

  console.log('📋 Fetching companies...')
  const companies = await fetchAllCompanies(token)
  console.log(`Found ${companies.length} companies.\n`)

  let sent = 0
  let skipped = 0

  for (const company of companies) {
    const userId = company['user'] || company['user_id']
    if (!userId) { skipped++; continue }

    const userInfo = await fetchUserEmail(userId, token)
    if (!userInfo?.email) { skipped++; continue }

    const companyName = company['company_name'] || 'Your Company'

    for (const field of COMPLIANCE_FIELDS) {
      const dateStr = company[field.key]
      const days = getDaysUntil(dateStr)
      if (days === null) continue

      const shouldSend =
        REMINDER_WINDOWS.includes(days) || OVERDUE_DAYS.includes(days)

      if (!shouldSend) continue

      let urgencyLabel, emailTitle

      if (days < 0) {
        urgencyLabel = '🔴 OVERDUE'
        emailTitle = `Action Required: ${field.label} is Overdue`
      } else if (days <= 7) {
        urgencyLabel = '🟡 Due in 7 days'
        emailTitle = `Reminder: ${field.label} Due in ${days} Day${days !== 1 ? 's' : ''}`
      } else {
        urgencyLabel = '🔔 Upcoming'
        emailTitle = `Upcoming Deadline: ${field.label} in ${days} Days`
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

      await sendEmail(
        userInfo.email,
        emailTitle,
        buildEmailHtml(emailTitle, bodyHtml)
      )

      await createNotification(
        token,
        userId,
        emailTitle,
        `Compliance reminder for ${companyName}: ${field.label} is ${days < 0 ? 'overdue' : `due in ${days} days`}.`
      )

      console.log(`[✅] Sent: ${urgencyLabel} — ${companyName} — ${field.label} — ${userInfo.email}`)
      sent++
    }
  }

  console.log(`\n✅ Done. ${sent} reminder(s) sent. ${skipped} companies skipped (no user or email).`)
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
