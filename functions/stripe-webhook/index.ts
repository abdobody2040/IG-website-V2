import Stripe from "stripe";

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PB_URL: string;
  PB_ADMIN_EMAIL: string;
  PB_ADMIN_PASSWORD: string;
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

async function getAdminToken(pbUrl: string, email: string, pass: string): Promise<string> {
  let res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password: pass }),
  });

  if (!res.ok && res.status === 404) {
    res = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password: pass }),
    });
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Admin auth failed: ${res.status} ${errText}`);
  }
  const data = await res.json() as { token: string };
  return data.token;
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

    const stripeKey = env.STRIPE_SECRET_KEY;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    const pbUrl = env.PB_URL || "http://127.0.0.1:8090";
    const pbEmail = env.PB_ADMIN_EMAIL;
    const pbPass = env.PB_ADMIN_PASSWORD;

    if (!stripeKey || !webhookSecret || !pbEmail || !pbPass) {
      console.error("Missing config variables in Stripe Webhook");
      return jsonResponse({ error: "Missing config" }, 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });
    const sig = req.headers.get("stripe-signature");
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
      const adminToken = await getAdminToken(pbUrl, pbEmail, pbPass);
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      };

      // 1. Event: checkout.session.completed
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata ?? {};
        const isAddon = meta.mode === "addon";

        // Idempotency: Check if order already exists
        const checkRes = await fetch(
          `${pbUrl}/api/collections/orders/records?filter=stripe_session_id%3D%22${session.id}%22`,
          { headers }
        );
        if (checkRes.ok) {
          const checkData = await checkRes.json() as { items: unknown[] };
          if (checkData.items && checkData.items.length > 0) {
            console.log(`⏭️ Session ${session.id} already processed, skipping`);
            return jsonResponse({ received: true, duplicate: true });
          }
        }

        const userId = meta.userId || null;
        const amountUSD = (session.amount_total ?? 0) / 100;
        const currency = "USD";

        let orderId = "";
        let orderNumber = "";
        let packageName = "";

        if (isAddon) {
          orderNumber = `IG-ADD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          packageName = meta.serviceName ?? "Add-on Service";

          // Create Order
          const orderRes = await fetch(`${pbUrl}/api/collections/orders/records`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              user: userId,
              order_number: orderNumber,
              package_name: packageName,
              company_name: "N/A (Add-on)",
              company_state: "N/A",
              company_type: "N/A",
              status: "in_progress",
              amount: amountUSD,
              currency,
              customer_email: meta.customerEmail || null,
              stripe_session_id: session.id,
              notes: `Add-on purchase: ${packageName}`,
            }),
          });
          if (!orderRes.ok) {
            throw new Error(`Fallback order creation failed: ${await orderRes.text()}`);
          }
          const createdOrder = await orderRes.json() as { id: string };
          orderId = createdOrder.id;

          // Notification
          await fetch(`${pbUrl}/api/collections/notifications/records`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              user: userId,
              type: "payment_received",
              title: "Payment Confirmed",
              message: `Payment received for ${packageName}.`,
              link: "/client/payments",
              read: false,
            }),
          }).catch(e => console.error("Notification failed:", e));

        } else {
          // Company Formation
          orderNumber = `IG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          packageName = meta.plan ?? "LLC Formation";
          const companyName = meta.companyName ?? "Unknown Company";
          const state = meta.companyState ?? "";
          const companyType = meta.companyType ?? "LLC";

          // Create Order
          const orderRes = await fetch(`${pbUrl}/api/collections/orders/records`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              user: userId,
              order_number: orderNumber,
              package_name: packageName,
              company_name: companyName,
              company_state: state,
              company_type: companyType,
              status: "pending",
              amount: amountUSD,
              currency,
              customer_name: meta.customerName || null,
              customer_email: meta.customerEmail || null,
              customer_phone: meta.customerPhone || null,
              customer_country: meta.customerCountry || null,
              customer_address: meta.customerAddress || null,
              business_activity: meta.businessActivity || null,
              stripe_session_id: session.id,
            }),
          });
          if (!orderRes.ok) {
            throw new Error(`Fallback order creation failed: ${await orderRes.text()}`);
          }
          const createdOrder = await orderRes.json() as { id: string };
          orderId = createdOrder.id;

          // Create Company
          await fetch(`${pbUrl}/api/collections/companies/records`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              user: userId,
              order: orderId,
              company_name: companyName,
              company_type: companyType,
              state,
              status: "pending",
            }),
          });

          // Notification
          await fetch(`${pbUrl}/api/collections/notifications/records`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              user: userId,
              type: "order_status",
              title: "Order Placed Successfully",
              message: `Order #${orderNumber} is pending review.`,
              link: "/client/dashboard",
              read: false,
            }),
          }).catch(e => console.error("Notification failed:", e));
        }

        // Record Payment (initial, status = paid or pending based on session)
        const stripeInvoiceId = session.invoice ? String(session.invoice) : "";
        const paymentRes = await fetch(`${pbUrl}/api/collections/payments/records`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            user: userId,
            order: orderId,
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
          }),
        });
        if (!paymentRes.ok) {
          console.error("Failed to create payment record:", await paymentRes.text());
        }

        // Emails via Resend (Welcome + Purchase Summary)
        if (env.RESEND_API_KEY && meta.customerEmail) {
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #1a56ff; margin-bottom: 20px;">Welcome to Instant Grow!</h2>
              <p>Dear ${meta.customerName || "Customer"},</p>
              <p>Thank you for choosing Instant Grow. We are excited to support you in launching and growing your company!</p>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 24px 0; border: 1px solid #f1f5f9;">
                <h3 style="margin-top: 0; color: #0f172a;">Purchase Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 6px 0; color: #64748b;"><strong>Order Number:</strong></td><td style="color: #0f172a;">${orderNumber}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;"><strong>Service:</strong></td><td style="color: #0f172a;">${packageName}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;"><strong>Total Paid:</strong></td><td style="color: #0f172a; font-weight: bold;">$${amountUSD.toFixed(2)} USD</td></tr>
                </table>
              </div>
              <p>Our filing team has been notified, and we will begin processing your details right away.</p>
              <p style="margin-top: 30px; font-size: 13px; color: #64748b;">Best regards,<br>The Instant Grow Team</p>
            </div>
          `;
          await sendEmail(env.RESEND_API_KEY, meta.customerEmail, `Payment Confirmed - Order #${orderNumber}`, emailHtml);
        }
      }

      // 2. Event: payment_intent.succeeded
      else if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object as Stripe.PaymentIntent;
        // Update payments status to paid
        const filterStr = `stripe_payment_id%3D%22${pi.id}%22%7C%7Cstripe_session_id%3D%22${pi.id}%22`;
        const payRes = await fetch(`${pbUrl}/api/collections/payments/records?filter=${filterStr}`, { headers });
        if (payRes.ok) {
          const payData = await payRes.json() as { items: Array<{ id: string, status: string }> };
          if (payData.items.length > 0) {
            const payId = payData.items[0].id;
            await fetch(`${pbUrl}/api/collections/payments/records/${payId}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ status: "paid", stripe_payment_intent_id: pi.id }),
            });
            console.log(`✅ Payment intent ${pi.id} status updated to paid in DB`);
          }
        }
      }

      // 3. Event: payment_intent.payment_failed
      else if (event.type === "payment_intent.payment_failed") {
        const pi = event.data.object as Stripe.PaymentIntent;
        const filterStr = `stripe_payment_id%3D%22${pi.id}%22%7C%7Cstripe_payment_intent_id%3D%22${pi.id}%22`;
        const payRes = await fetch(`${pbUrl}/api/collections/payments/records?filter=${filterStr}`, { headers });
        if (payRes.ok) {
          const payData = await payRes.json() as { items: Array<{ id: string, customer_email?: string, service?: string }> };
          if (payData.items.length > 0) {
            const payRecord = payData.items[0];
            await fetch(`${pbUrl}/api/collections/payments/records/${payRecord.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ status: "failed" }),
            });

            // Send Failed Payment Email
            if (env.RESEND_API_KEY && payRecord.customer_email) {
              const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 8px;">
                  <h2 style="color: #ef4444; margin-bottom: 16px;">Payment Attempt Failed</h2>
                  <p>Hello,</p>
                  <p>We were unable to process your payment for <strong>${payRecord.service || "Instant Grow Services"}</strong>.</p>
                  <p>Please log in to your dashboard and retry the payment to prevent delays in processing.</p>
                  <p style="margin-top: 24px;"><a href="https://instantgrow.net/client/payments" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Retry Payment</a></p>
                </div>
              `;
              await sendEmail(env.RESEND_API_KEY, payRecord.customer_email, "Payment Failed - Action Required", html);
            }
          }
        }
      }

      // 4. Event: charge.refunded
      else if (event.type === "charge.refunded") {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : "";
        const filterStr = `stripe_payment_id%3D%22${piId}%22%7C%7Cstripe_payment_intent_id%3D%22${piId}%22`;
        const payRes = await fetch(`${pbUrl}/api/collections/payments/records?filter=${filterStr}`, { headers });
        if (payRes.ok) {
          const payData = await payRes.json() as { items: Array<{ id: string, order?: string, customer_email?: string, service?: string, amount: number }> };
          if (payData.items.length > 0) {
            const payRecord = payData.items[0];
            await fetch(`${pbUrl}/api/collections/payments/records/${payRecord.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ status: "refunded", stripe_charge_id: charge.id }),
            });

            // Update order status if exists
            if (payRecord.order) {
              await fetch(`${pbUrl}/api/collections/orders/records/${payRecord.order}`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ status: "cancelled", notes: "Order refunded." }),
              });
            }

            // Refund Email
            if (env.RESEND_API_KEY && payRecord.customer_email) {
              const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #475569; margin-bottom: 16px;">Refund Confirmation</h2>
                  <p>Hello,</p>
                  <p>A refund of <strong>$${payRecord.amount.toFixed(2)} USD</strong> has been successfully processed for <strong>${payRecord.service}</strong>.</p>
                  <p>The funds will reflect back on your original payment method in 5 to 10 business days.</p>
                </div>
              `;
              await sendEmail(env.RESEND_API_KEY, payRecord.customer_email, "Refund Confirmation - Instant Grow", html);
            }
          }
        }
      }

      // 5. Event: charge.dispute.created
      else if (event.type === "charge.dispute.created") {
        const dispute = event.data.object as Stripe.Dispute;
        const piId = typeof dispute.charge === "string" ? dispute.charge : "";
        const filterStr = `stripe_payment_id%3D%22${piId}%22%7C%7Cstripe_charge_id%3D%22${piId}%22`;
        const payRes = await fetch(`${pbUrl}/api/collections/payments/records?filter=${filterStr}`, { headers });
        if (payRes.ok) {
          const payData = await payRes.json() as { items: Array<{ id: string, order?: string, company_name?: string }> };
          if (payData.items.length > 0) {
            const payRecord = payData.items[0];
            await fetch(`${pbUrl}/api/collections/payments/records/${payRecord.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ status: "failed", notes: `Disputed. Reason: ${dispute.reason}` }),
            });

            // Alert admin
            if (env.RESEND_API_KEY) {
              const adminHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ef4444; border-radius: 8px;">
                  <h2 style="color: #ef4444;">⚠️ Dispute / Chargeback Alert</h2>
                  <p>A dispute has been opened for customer payment.</p>
                  <ul>
                    <li><strong>Dispute ID:</strong> ${dispute.id}</li>
                    <li><strong>Amount:</strong> $${(dispute.amount / 100).toFixed(2)} USD</li>
                    <li><strong>Reason:</strong> ${dispute.reason}</li>
                    <li><strong>Company Name:</strong> ${payRecord.company_name || "N/A"}</li>
                  </ul>
                  <p>Please resolve this dispute from the Stripe Dashboard.</p>
                </div>
              `;
              await sendEmail(env.RESEND_API_KEY, "info@instantgrow.net", "URGENT: Dispute Opened on Stripe", adminHtml);
            }
          }
        }
      }

      // 6. Event: invoice.payment_succeeded
      else if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as any;
        const piId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : "";
        const invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf || "";
        const receiptUrl = invoice.charge ? (typeof invoice.charge === "string" ? "" : (invoice.charge as Stripe.Charge).receipt_url) : "";

        const filterStr = `stripe_payment_id%3D%22${piId}%22%7C%7Cstripe_invoice_id%3D%22${invoice.id}%22`;
        const payRes = await fetch(`${pbUrl}/api/collections/payments/records?filter=${filterStr}`, { headers });
        if (payRes.ok) {
          const payData = await payRes.json() as { items: Array<{ id: string, customer_email?: string, service?: string }> };
          if (payData.items.length > 0) {
            const payRecord = payData.items[0];
            await fetch(`${pbUrl}/api/collections/payments/records/${payRecord.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({
                status: "paid",
                invoice_url: invoiceUrl,
                receipt_url: receiptUrl || undefined,
                stripe_invoice_id: invoice.id,
              }),
            });

            // Send Invoice & Receipt links email
            if (env.RESEND_API_KEY && payRecord.customer_email) {
              const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                  <h2 style="color: #1a56ff; margin-bottom: 16px;">Invoice & Receipt Ready</h2>
                  <p>Hello,</p>
                  <p>Your payment invoice and official receipt are now ready for download.</p>
                  <p>Thank you for purchasing <strong>${payRecord.service}</strong>!</p>
                  <div style="margin: 24px 0;">
                    ${invoiceUrl ? `<a href="${invoiceUrl}" style="display: inline-block; background-color: #1a56ff; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 12px;">Download Invoice</a>` : ""}
                    ${receiptUrl ? `<a href="${receiptUrl}" style="display: inline-block; background-color: #475569; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Stripe Receipt</a>` : ""}
                  </div>
                </div>
              `;
              await sendEmail(env.RESEND_API_KEY, payRecord.customer_email, "Invoice & Receipt - Instant Grow", html);
            }
          }
        }
      }

      // 7. Event: invoice.payment_failed
      else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as any;
        const piId = typeof invoice.payment_intent === "string" ? invoice.payment_intent : "";
        const filterStr = `stripe_payment_id%3D%22${piId}%22%7C%7Cstripe_invoice_id%3D%22${invoice.id}%22`;
        const payRes = await fetch(`${pbUrl}/api/collections/payments/records?filter=${filterStr}`, { headers });
        if (payRes.ok) {
          const payData = await payRes.json() as { items: Array<{ id: string, customer_email?: string }> };
          if (payData.items.length > 0) {
            const payRecord = payData.items[0];
            await fetch(`${pbUrl}/api/collections/payments/records/${payRecord.id}`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ status: "failed", notes: "Invoice payment failed." }),
            });

            if (env.RESEND_API_KEY && payRecord.customer_email) {
              const html = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fca5a5; border-radius: 8px;">
                  <h2 style="color: #ef4444; margin-bottom: 16px;">Invoice Payment Failed</h2>
                  <p>Hello,</p>
                  <p>A recent invoice payment failed to process. Please check your billing information to prevent service disruption.</p>
                  <p><a href="https://instantgrow.net/client/payments" style="color: #1a56ff; font-weight: bold; text-decoration: underline;">Update Billing Details</a></p>
                </div>
              `;
              await sendEmail(env.RESEND_API_KEY, payRecord.customer_email, "Invoice Payment Failed - Instant Grow", html);
            }
          }
        }
      }

    } catch (err) {
      console.error("Error handling webhook event:", err);
      // Still return 200 to Stripe to avoid infinite retries on transient errors
      return jsonResponse({ received: true, error: err instanceof Error ? err.message : "Internal error" });
    }

    return jsonResponse({ received: true });
  },
};
