import Stripe from "stripe";

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  // PHP API config (replaces PocketBase)
  API_URL: string;          // e.g. https://instantgrow.net/api
  ADMIN_SECRET: string;     // matches ADMIN_SECRET in api/config.php
  RESEND_API_KEY?: string;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "stripe-signature, content-type",
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

// ── PHP API helpers ───────────────────────────────────────────────────────────

function apiHeaders(adminSecret: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Admin-Secret": adminSecret,
  };
}

async function apiGet(apiUrl: string, adminSecret: string, path: string): Promise<Response> {
  return fetch(`${apiUrl}${path}`, { headers: apiHeaders(adminSecret) });
}

async function apiPost(apiUrl: string, adminSecret: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: apiHeaders(adminSecret),
    body: JSON.stringify(body),
  });
}

async function apiPatch(apiUrl: string, adminSecret: string, path: string, body: unknown): Promise<Response> {
  return fetch(`${apiUrl}${path}`, {
    method: "PATCH",
    headers: apiHeaders(adminSecret),
    body: JSON.stringify(body),
  });
}

async function sendEmail(resendApiKey: string, to: string, subject: string, html: string) {
  if (!resendApiKey) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Instant Grow <noreply@instantgrow.net>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend send failed:", await res.text());
    }
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const stripeKey     = env.STRIPE_SECRET_KEY;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    const apiUrl        = env.API_URL || "https://instantgrow.net/api";
    const adminSecret   = env.ADMIN_SECRET;

    if (!stripeKey || !webhookSecret || !adminSecret) {
      console.error("Missing config variables in Stripe Webhook");
      return jsonResponse({ error: "Missing config" }, 500);
    }

    const stripe  = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });
    const sig     = req.headers.get("stripe-signature");
    const bodyText = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(bodyText, sig!, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return jsonResponse({ error: "Invalid signature" }, 400);
    }

    console.log(`Stripe Webhook: Received event ${event.id} of type ${event.type}`);

    try {

      // ── 1. checkout.session.completed ──────────────────────────────────────
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta    = session.metadata ?? {};
        const isAddon = meta.mode === "addon";

        // Idempotency check
        const checkRes = await apiGet(apiUrl, adminSecret,
          `/collections/orders/records?perPage=1&filter=stripe_session_id="${session.id}"`);
        if (checkRes.ok) {
          const checkData = await checkRes.json() as { items: unknown[] };
          if (checkData.items?.length > 0) {
            console.log(`⏭️ Session ${session.id} already processed, skipping`);
            return jsonResponse({ received: true, duplicate: true });
          }
        }

        const userId   = meta.userId || null;
        const amountUSD = (session.amount_total ?? 0) / 100;
        const currency  = "USD";

        let orderNumber = "";
        let packageName = "";

        if (isAddon) {
          orderNumber = `IG-ADD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          packageName = meta.serviceName ?? "Add-on Service";

          // Forward to PHP /webhook/stripe
          const createRes = await apiPost(apiUrl, adminSecret, "/webhook/stripe", {
            action: "create_order",
            order: {
              order_number: orderNumber,
              package_name: packageName,
              company_name: "N/A (Add-on)",
              company_state: "N/A",
              company_type: "N/A",
              status: "in_progress",
              amount: amountUSD,
              currency,
              user: userId,
              customer_email: meta.customerEmail || null,
              stripe_session_id: session.id,
              notes: `Add-on purchase: ${packageName}`,
            },
          });
          if (!createRes.ok) {
            throw new Error(`Order creation failed: ${await createRes.text()}`);
          }

        } else {
          orderNumber = `IG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          packageName = meta.plan ?? "LLC Formation";

          const createRes = await apiPost(apiUrl, adminSecret, "/webhook/stripe", {
            action: "create_order",
            order: {
              order_number: orderNumber,
              package_name: packageName,
              company_name: meta.companyName ?? "Unknown Company",
              company_state: meta.companyState ?? "",
              company_type: meta.companyType ?? "LLC",
              status: "pending",
              amount: amountUSD,
              currency,
              user: userId,
              customer_name: meta.customerName || null,
              customer_email: meta.customerEmail || null,
              customer_phone: meta.customerPhone || null,
              customer_country: meta.customerCountry || null,
              customer_address: meta.customerAddress || null,
              business_activity: meta.businessActivity || null,
              stripe_session_id: session.id,
            },
            company: userId ? {
              user: userId,
              company_name: meta.companyName ?? "Unknown Company",
              company_type: meta.companyType ?? "LLC",
              state: meta.companyState ?? "",
            } : null,
          });
          if (!createRes.ok) {
            throw new Error(`Order creation failed: ${await createRes.text()}`);
          }
        }

        // Create payment record
        const stripeInvoiceId = session.invoice ? String(session.invoice) : "";
        const payRes = await apiPost(apiUrl, adminSecret, "/webhook/stripe", {
          action: "create_payment",
          payment: {
            user: userId,
            service: packageName,
            invoice_id: stripeInvoiceId || `INV-${orderNumber.split("-").pop()}`,
            amount: amountUSD,
            currency,
            status: session.payment_status === "paid" ? "paid" : "pending",
            stripe_payment_id: session.payment_intent ? String(session.payment_intent) : "",
            stripe_session_id: session.id,
            stripe_customer_id: session.customer ? String(session.customer) : "",
            stripe_invoice_id: stripeInvoiceId,
            stripe_price_id: meta.stripePriceId || "",
            stripe_product_id: meta.stripeProductId || "",
            customer_name: meta.customerName || "",
            customer_email: meta.customerEmail || "",
            company_name: meta.companyName || "N/A",
            customer_country: meta.customerCountry || "",
          },
        });
        if (!payRes.ok) {
          console.error("Failed to create payment record:", await payRes.text());
        }

        // Send confirmation email
        if (env.RESEND_API_KEY && meta.customerEmail) {
          await sendEmail(env.RESEND_API_KEY, meta.customerEmail,
            `Payment Confirmed - Order #${orderNumber}`,
            `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
               <h2 style="color:#1a56ff">Welcome to Instant Grow!</h2>
               <p>Dear ${meta.customerName || "Customer"},</p>
               <p>Thank you for choosing Instant Grow. We are excited to support you!</p>
               <div style="background:#f8fafc;padding:20px;border-radius:6px;margin:24px 0;">
                 <h3 style="margin-top:0">Purchase Summary</h3>
                 <table style="width:100%;border-collapse:collapse;font-size:14px;">
                   <tr><td style="color:#64748b">Order Number:</td><td>${orderNumber}</td></tr>
                   <tr><td style="color:#64748b">Service:</td><td>${packageName}</td></tr>
                   <tr><td style="color:#64748b">Total Paid:</td><td><strong>$${amountUSD.toFixed(2)} USD</strong></td></tr>
                 </table>
               </div>
               <p>Our filing team has been notified and will begin processing right away.</p>
               <p style="color:#64748b;font-size:13px">Best regards,<br>The Instant Grow Team</p>
             </div>`
          );
        }
      }

      // ── 2. payment_intent.succeeded ────────────────────────────────────────
      else if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object as Stripe.PaymentIntent;
        const res = await apiGet(apiUrl, adminSecret,
          `/collections/payments/records?perPage=1&filter=stripe_payment_id="${pi.id}"`);
        if (res.ok) {
          const data = await res.json() as { items: Array<{ id: string }> };
          if (data.items.length > 0) {
            await apiPatch(apiUrl, adminSecret,
              `/collections/payments/records/${data.items[0].id}`,
              { status: "paid", stripe_payment_intent_id: pi.id });
          }
        }
      }

      // ── 3. payment_intent.payment_failed ───────────────────────────────────
      else if (event.type === "payment_intent.payment_failed") {
        const pi = event.data.object as Stripe.PaymentIntent;
        const res = await apiGet(apiUrl, adminSecret,
          `/collections/payments/records?perPage=1&filter=stripe_payment_id="${pi.id}"`);
        if (res.ok) {
          const data = await res.json() as { items: Array<{ id: string; customer_email?: string; service?: string }> };
          if (data.items.length > 0) {
            const p = data.items[0];
            await apiPatch(apiUrl, adminSecret,
              `/collections/payments/records/${p.id}`, { status: "failed" });
            if (env.RESEND_API_KEY && p.customer_email) {
              await sendEmail(env.RESEND_API_KEY, p.customer_email,
                "Payment Failed - Action Required",
                `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #fca5a5;border-radius:8px;">
                   <h2 style="color:#ef4444">Payment Attempt Failed</h2>
                   <p>We were unable to process your payment for <strong>${p.service || "Instant Grow Services"}</strong>.</p>
                   <p>Please log in and retry the payment.</p>
                   <a href="https://instantgrow.net/client/payments" style="background:#ef4444;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Retry Payment</a>
                 </div>`);
            }
          }
        }
      }

      // ── 4. charge.refunded ─────────────────────────────────────────────────
      else if (event.type === "charge.refunded") {
        const charge = event.data.object as Stripe.Charge;
        const piId   = typeof charge.payment_intent === "string" ? charge.payment_intent : "";
        const res    = await apiGet(apiUrl, adminSecret,
          `/collections/payments/records?perPage=1&filter=stripe_payment_id="${piId}"`);
        if (res.ok) {
          const data = await res.json() as { items: Array<{ id: string; order?: string; customer_email?: string; service?: string; amount: number }> };
          if (data.items.length > 0) {
            const p = data.items[0];
            await apiPatch(apiUrl, adminSecret,
              `/collections/payments/records/${p.id}`,
              { status: "refunded", stripe_charge_id: charge.id });
            if (p.order) {
              await apiPatch(apiUrl, adminSecret,
                `/collections/orders/records/${p.order}`,
                { status: "cancelled", notes: "Order refunded." });
            }
            if (env.RESEND_API_KEY && p.customer_email) {
              await sendEmail(env.RESEND_API_KEY, p.customer_email,
                "Refund Confirmation - Instant Grow",
                `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
                   <h2 style="color:#475569">Refund Confirmation</h2>
                   <p>A refund of <strong>$${p.amount.toFixed(2)} USD</strong> has been processed for <strong>${p.service}</strong>.</p>
                   <p>Funds will appear in 5–10 business days.</p>
                 </div>`);
            }
          }
        }
      }

      // ── 5. charge.dispute.created ──────────────────────────────────────────
      else if (event.type === "charge.dispute.created") {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === "string" ? dispute.charge : "";
        const res = await apiGet(apiUrl, adminSecret,
          `/collections/payments/records?perPage=1&filter=stripe_charge_id="${chargeId}"`);
        if (res.ok) {
          const data = await res.json() as { items: Array<{ id: string; company_name?: string }> };
          if (data.items.length > 0) {
            const p = data.items[0];
            await apiPatch(apiUrl, adminSecret,
              `/collections/payments/records/${p.id}`,
              { status: "failed", notes: `Disputed. Reason: ${dispute.reason}` });
            if (env.RESEND_API_KEY) {
              await sendEmail(env.RESEND_API_KEY, "info@instantgrow.net",
                "URGENT: Dispute Opened on Stripe",
                `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ef4444;border-radius:8px;">
                   <h2 style="color:#ef4444">⚠️ Dispute / Chargeback Alert</h2>
                   <ul>
                     <li><strong>Dispute ID:</strong> ${dispute.id}</li>
                     <li><strong>Amount:</strong> $${(dispute.amount / 100).toFixed(2)} USD</li>
                     <li><strong>Reason:</strong> ${dispute.reason}</li>
                     <li><strong>Company:</strong> ${p.company_name || "N/A"}</li>
                   </ul>
                   <p>Resolve from the Stripe Dashboard.</p>
                 </div>`);
            }
          }
        }
      }

      // ── 6. invoice.payment_succeeded ───────────────────────────────────────
      else if (event.type === "invoice.payment_succeeded") {
        const invoice    = event.data.object as any;
        const piId       = typeof invoice.payment_intent === "string" ? invoice.payment_intent : "";
        const invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf || "";
        const res        = await apiGet(apiUrl, adminSecret,
          `/collections/payments/records?perPage=1&filter=stripe_payment_id="${piId}"`);
        if (res.ok) {
          const data = await res.json() as { items: Array<{ id: string; customer_email?: string; service?: string }> };
          if (data.items.length > 0) {
            const p = data.items[0];
            await apiPatch(apiUrl, adminSecret,
              `/collections/payments/records/${p.id}`,
              { status: "paid", invoice_url: invoiceUrl, stripe_invoice_id: invoice.id });
            if (env.RESEND_API_KEY && p.customer_email) {
              await sendEmail(env.RESEND_API_KEY, p.customer_email,
                "Invoice & Receipt - Instant Grow",
                `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;">
                   <h2 style="color:#1a56ff">Invoice & Receipt Ready</h2>
                   <p>Thank you for purchasing <strong>${p.service}</strong>!</p>
                   ${invoiceUrl ? `<a href="${invoiceUrl}" style="background:#1a56ff;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Download Invoice</a>` : ""}
                 </div>`);
            }
          }
        }
      }

      // ── 7. invoice.payment_failed ──────────────────────────────────────────
      else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as any;
        const piId    = typeof invoice.payment_intent === "string" ? invoice.payment_intent : "";
        const res     = await apiGet(apiUrl, adminSecret,
          `/collections/payments/records?perPage=1&filter=stripe_payment_id="${piId}"`);
        if (res.ok) {
          const data = await res.json() as { items: Array<{ id: string; customer_email?: string }> };
          if (data.items.length > 0) {
            const p = data.items[0];
            await apiPatch(apiUrl, adminSecret,
              `/collections/payments/records/${p.id}`,
              { status: "failed", notes: "Invoice payment failed." });
            if (env.RESEND_API_KEY && p.customer_email) {
              await sendEmail(env.RESEND_API_KEY, p.customer_email,
                "Invoice Payment Failed - Instant Grow",
                `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #fca5a5;border-radius:8px;">
                   <h2 style="color:#ef4444">Invoice Payment Failed</h2>
                   <p>A recent invoice payment failed. Please update your billing info.</p>
                   <a href="https://instantgrow.net/client/payments" style="color:#1a56ff;font-weight:bold">Update Billing Details</a>
                 </div>`);
            }
          }
        }
      }

    } catch (err) {
      console.error("Error handling webhook event:", err);
      return jsonResponse({ received: true, error: err instanceof Error ? err.message : "Internal error" });
    }

    return jsonResponse({ received: true });
  },
};
