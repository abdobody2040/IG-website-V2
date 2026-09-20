/**
 * test-email.mjs
 * Test sending emails and contact messages in Instant Grow.
 * Usage:
 *   node scripts/test-email.mjs [target_email]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env.local if present
const envLocalPath = path.resolve(__dirname, '..', '.env.local')
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=')
      if (!process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim()
      }
    }
  }
}

const targetEmail = process.argv[2] || process.env.TEST_EMAIL || 'support@instantgrow.net'
const resendApiKey = process.env.RESEND_API_KEY || ''
const emailEndpoint = process.env.VITE_EMAIL_ENDPOINT || ''

console.log('═══════════════════════════════════════════════════════════')
console.log('📧 Instant Grow — Email & Messaging Diagnostics & Testing')
console.log('═══════════════════════════════════════════════════════════')
console.log(`🎯 Target Email:        ${targetEmail}`)
console.log(`🔑 Resend API Key:      ${resendApiKey ? '✅ Present (' + resendApiKey.slice(0, 7) + '...)' : '❌ Not set (Mock mode)'}`)
console.log(`🌐 Email Endpoint:      ${emailEndpoint || 'None configured (Local/Direct)'}`)
console.log('───────────────────────────────────────────────────────────')

// Template generator
function generateSampleEmailHtml(type, data) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:sans-serif;background:#f8fafc;padding:24px;margin:0;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="background:#070C1E;padding:24px;text-align:center;">
          <h1 style="color:#10b981;margin:0;font-size:20px;">Instant Grow LLC</h1>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Corporate Formation & Compliance</p>
        </div>
        <div style="padding:28px;">
          <h2 style="font-size:18px;color:#0f172a;margin-top:0;">Test Notification: ${type}</h2>
          <p style="font-size:14px;line-height:1.6;color:#475569;">
            This is a test message generated to verify email rendering and delivery.
          </p>
          <div style="background:#f1f5f9;padding:16px;border-radius:8px;font-size:13px;line-height:1.6;">
            <strong>Test Details:</strong><br>
            • Message Type: ${type}<br>
            • Recipient: ${targetEmail}<br>
            • Timestamp: ${new Date().toISOString()}<br>
            ${data ? '• Payload: ' + JSON.stringify(data) : ''}
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="https://instantgrow.net" style="background:#10b981;color:#070C1E;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;font-size:13px;">
              Visit Instant Grow
            </a>
          </div>
        </div>
        <div style="background:#f8fafc;padding:16px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
          © ${new Date().getFullYear()} Instant Grow LLC. All rights reserved.<br>
          support@instantgrow.net | [REGISTERED_ADDRESS]
        </div>
      </div>
    </body>
    </html>
  `
}

// Resend test address — works without domain verification
// Once instantgrow.net is verified in Resend dashboard, change this back to noreply@instantgrow.net
const FROM_ADDRESS = 'Instant Grow <onboarding@resend.dev>'

async function sendDirectResend(to, subject, html) {
  if (!resendApiKey) {
    console.log(`ℹ️ [SIMULATION] Would send via Resend to "${to}":`)
    console.log(`   Subject: ${subject}`)
    console.log(`   HTML Length: ${html.length} chars`)
    return { success: true, simulated: true }
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Resend API HTTP ${res.status}: ${errText}`)
  }

  const json = await res.json()
  return { success: true, id: json.id }
}

async function run() {
  console.log('🚀 Running test suite for 5 email notification templates:\n')

  const tests = [
    {
      name: '1. Order Confirmation Email',
      subject: 'Order Confirmed #TEST-1001 — Instant Grow',
      type: 'Order Confirmation',
      data: { orderId: 'TEST-1001', companyName: 'Horizon Ventures LLC', state: 'Wyoming', total: '$197' }
    },
    {
      name: '2. Status Update Email',
      subject: 'Status Update: Articles Filed — Horizon Ventures LLC',
      type: 'Status Update',
      data: { companyName: 'Horizon Ventures LLC', newStatus: 'Filed with Wyoming SOS' }
    },
    {
      name: '3. Document Ready Email',
      subject: 'Documents Ready: Certified Articles of Organization',
      type: 'Document Ready',
      data: { documentName: 'Articles_of_Organization.pdf', companyName: 'Horizon Ventures LLC' }
    },
    {
      name: '4. Contact Form Lead Notification',
      subject: 'New Contact Inquiry: US LLC & Stripe Setup',
      type: 'Contact Inquiry',
      data: { fromName: 'Ahmed Founder', fromEmail: targetEmail, subject: 'US LLC from Egypt' }
    },
    {
      name: '5. Compliant Trustpilot Review Request',
      subject: 'How was your formation experience with Instant Grow?',
      type: 'Review Request',
      data: { companyName: 'Horizon Ventures LLC', orderNumber: 'TEST-1001' }
    }
  ]

  for (const t of tests) {
    process.stdout.write(`  ⏳ Testing ${t.name}... `)
    try {
      const html = generateSampleEmailHtml(t.type, t.data)
      const res = await sendDirectResend(targetEmail, t.subject, html)
      if (res.simulated) {
        console.log(`✅ OK (Simulated - no key)`)
      } else {
        console.log(`✅ SENT (Resend ID: ${res.id})`)
      }
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`)
    }
  }

  console.log('\n───────────────────────────────────────────────────────────')
  console.log('✅ Diagnostics complete!')
  if (!resendApiKey) {
    console.log('💡 Note: To send real emails directly to an inbox, set RESEND_API_KEY in .env.local')
    console.log('   Example: RESEND_API_KEY=re_123456789')
  }
  console.log('═══════════════════════════════════════════════════════════\n')
}

run().catch(console.error)
