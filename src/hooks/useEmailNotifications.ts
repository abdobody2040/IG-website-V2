import { pb } from '../lib/pocketbase'

const ADMIN_EMAIL = 'info@instantgrow.net'
const EMAIL_ENDPOINT = import.meta.env.VITE_EMAIL_ENDPOINT as string | undefined

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendEmail(params: { to: string; subject: string; html: string; text: string }) {
  if (!EMAIL_ENDPOINT) {
    console.warn('Email endpoint not configured (VITE_EMAIL_ENDPOINT). Skipping email:', params.subject)
    return
  }
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (pb.authStore.token) {
      headers['Authorization'] = `Bearer ${pb.authStore.token}`
    }

    const res = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    })
    if (!res.ok) {
      console.error(`Email send failed (${res.status})`)
    }
  } catch {
    console.error('Failed to send email')
  }
}

function buildEmailHtml(title: string, body: string, cta?: { label: string; href: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Inter,Arial,sans-serif;">
      <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background:#0a0f1e;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Instant Grow</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:13px;">Company Formation Services</p>
        </div>
        <!-- Body -->
        <div style="padding:32px;">
          <h2 style="margin:0 0 16px;color:#0a0f1e;font-size:20px;font-weight:700;">${title}</h2>
          <div style="color:#475569;font-size:15px;line-height:1.7;">${body}</div>
          ${cta ? `
          <div style="margin-top:28px;text-align:center;">
            <a href="${cta.href}" style="display:inline-block;background:#1a56ff;color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">${cta.label}</a>
          </div>` : ''}
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} Instant Grow · <a href="mailto:info@instantgrow.net" style="color:#1a56ff;text-decoration:none;">info@instantgrow.net</a></p>
          <p style="margin:6px 0 0;color:#cbd5e1;font-size:11px;">You're receiving this because you have an account with Instant Grow.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ── Order placed ─────────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(params: {
  toEmail: string
  toName: string
  orderNumber: string
  companyName: string
  packageName: string
  amount: number
  currency: string
}) {
  const { toEmail, toName, orderNumber, companyName, packageName, amount, currency } = params

  const _toName = escapeHtml(toName)
  const _orderNumber = escapeHtml(orderNumber)
  const _companyName = escapeHtml(companyName)
  const _packageName = escapeHtml(packageName)

  const clientHtml = buildEmailHtml(
    'Your Order Has Been Received! 🎉',
    `<p>Hi <strong>${_toName}</strong>,</p>
     <p>Thank you for choosing Instant Grow! We've received your order and our team will start processing it shortly.</p>
     <table style="width:100%;border-collapse:collapse;margin:20px 0;">
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Order Number</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${_orderNumber}</td></tr>
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Company Name</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${_companyName}</td></tr>
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Package</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${_packageName}</td></tr>
       <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Amount Paid</td><td style="padding:10px 0;font-weight:700;color:#1a56ff;text-align:right;">${currency} ${amount.toFixed(2)}</td></tr>
     </table>
     <p>You'll receive updates as your company formation progresses. Typical processing time is 1-2 business days.</p>`,
    { label: 'View Your Dashboard', href: 'https://instantgrow.net/client/dashboard' }
  )

  const adminHtml = buildEmailHtml(
    `New Order Received: ${_orderNumber}`,
    `<p>A new order has been placed and requires processing.</p>
     <table style="width:100%;border-collapse:collapse;margin:20px 0;">
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Order #</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${_orderNumber}</td></tr>
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Client</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;">${_toName} (${toEmail})</td></tr>
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Company</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${_companyName}</td></tr>
       <tr><td style="padding:10px 0;color:#64748b;font-size:13px;">Package / Amount</td><td style="padding:10px 0;font-weight:700;color:#1a56ff;text-align:right;">${_packageName} — ${currency} ${amount.toFixed(2)}</td></tr>
     </table>`,
    { label: 'Open Admin Dashboard', href: 'https://instantgrow.net/admin/orders' }
  )

  await Promise.allSettled([
    sendEmail({
      to: toEmail,
      subject: `Order Confirmed — ${orderNumber} | Instant Grow`,
      html: clientHtml,
      text: `Hi ${toName}, your order ${orderNumber} for ${companyName} has been received. Package: ${packageName}. Amount: ${currency} ${amount.toFixed(2)}. Visit your dashboard: https://instantgrow.net/client/dashboard`,
    }),
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `[New Order] ${orderNumber} — ${companyName}`,
      html: adminHtml,
      text: `New order ${orderNumber} from ${toName} (${toEmail}) for ${companyName}. Package: ${packageName}. Amount: ${currency} ${amount.toFixed(2)}.`,
    }),
  ])
}

// ── Order status changed ──────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  in_review: 'Under Review',
  processing: 'Processing',
  documents_filed: 'Documents Filed',
  ein_processing: 'EIN Processing',
  completed: 'Completed ✅',
  cancelled: 'Cancelled',
}

export async function sendStatusUpdateEmail(params: {
  toEmail: string
  toName: string
  orderNumber: string
  companyName: string
  newStatus: string
  message?: string
}) {
  const { toEmail, toName, orderNumber, companyName, newStatus, message } = params
  const statusLabel = STATUS_LABELS[newStatus] ?? newStatus

  const isCompleted = newStatus === 'completed'
  const _toName = escapeHtml(toName)
  const _orderNumber = escapeHtml(orderNumber)
  const _companyName = escapeHtml(companyName)
  const _message = message ? escapeHtml(message) : undefined

  const html = buildEmailHtml(
    isCompleted ? 'Your Company Formation is Complete! 🏆' : `Formation Update: ${statusLabel}`,
    `<p>Hi <strong>${_toName}</strong>,</p>
     <p>Your order <strong>${_orderNumber}</strong> for <strong>${_companyName}</strong> has been updated.</p>
     <div style="background:${isCompleted ? '#f0fdf4' : '#eff6ff'};border:1px solid ${isCompleted ? '#bbf7d0' : '#bfdbfe'};border-radius:10px;padding:16px;margin:20px 0;">
       <p style="margin:0;font-weight:600;color:${isCompleted ? '#16a34a' : '#1a56ff'};font-size:15px;">Status: ${statusLabel}</p>
       ${_message ? `<p style="margin:8px 0 0;color:#475569;font-size:13px;">${_message}</p>` : ''}
     </div>
     ${isCompleted ? '<p>Your company documents are ready. Log in to your dashboard to download all formation documents including your Certificate of Formation and Operating Agreement.</p>' : '<p>We\'ll keep you updated as your formation progresses. You can track the status in your dashboard at any time.</p>'}`,
    { label: 'View Your Dashboard', href: 'https://instantgrow.net/client/dashboard' }
  )

  await sendEmail({
    to: toEmail,
    subject: `Formation Update: ${statusLabel} — ${_orderNumber}`,
    html,
    text: `Hi ${_toName}, your order ${_orderNumber} for ${_companyName} has been updated to: ${statusLabel}. ${_message ?? ''} Visit dashboard: https://instantgrow.net/client/dashboard`,
  })
}

// ── Document ready ────────────────────────────────────────────────────────────
export async function sendDocumentReadyEmail(params: {
  toEmail: string
  toName: string
  companyName: string
  documentName: string
  dashboardUrl?: string
}) {
  const { toEmail, toName, companyName, documentName, dashboardUrl = 'https://instantgrow.net/client/documents' } = params
  const _toName = escapeHtml(toName)
  const _companyName = escapeHtml(companyName)
  const _documentName = escapeHtml(documentName)

  const html = buildEmailHtml(
    'Your Document is Ready 📄',
    `<p>Hi <strong>${_toName}</strong>,</p>
     <p>A new document is available for your company <strong>${_companyName}</strong>.</p>
     <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:20px 0;display:flex;align-items:center;gap:12px;">
       <span style="font-size:24px;">📄</span>
       <span style="font-weight:600;color:#0a0f1e;">${_documentName}</span>
     </div>
     <p>Log in to your dashboard to view and download your document.</p>`,
    { label: 'View Documents', href: dashboardUrl }
  )

  await sendEmail({
    to: toEmail,
    subject: `Document Ready: ${_documentName} — ${_companyName}`,
    html,
    text: `Hi ${_toName}, a new document "${_documentName}" is ready for ${_companyName}. Download it here: ${dashboardUrl}`,
  })
}

// ── Contact message notification ─────────────────────────────────────────────
export async function sendContactNotificationEmail(params: {
  fromName: string
  fromEmail: string
  subject: string
  message: string
  phone?: string
}) {
  const { fromName, fromEmail, subject, message, phone } = params

  const adminHtml = buildEmailHtml(
    `New Contact Message: ${subject}`,
    `<p>You have received a new message from the website contact form.</p>
     <table style="width:100%;border-collapse:collapse;margin:20px 0;">
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;text-align:right;">${escapeHtml(fromName)}</td></tr>
       <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;">${escapeHtml(fromEmail)}</td></tr>
       ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;">${escapeHtml(phone)}</td></tr>` : ''}
     </table>
     <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:16px 0;">
       <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
     </div>`,
    { label: 'Reply', href: `mailto:${fromEmail}?subject=Re: ${encodeURIComponent(subject)}` }
  )

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Contact Form] ${subject} — from ${fromName}`,
    html: adminHtml,
    text: `Contact form message from ${fromName} (${fromEmail})${phone ? ` Phone: ${phone}` : ''}. Subject: ${subject}. Message: ${message}`,
  })
}
