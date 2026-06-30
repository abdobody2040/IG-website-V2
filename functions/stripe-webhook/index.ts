import Stripe from "stripe";

export interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PB_URL: string;
  PB_ADMIN_EMAIL: string;
  PB_ADMIN_PASSWORD: string;
  ALLOWED_ORIGIN: string;
}

function getCorsOrigin(req: Request, env: Env): string {
  const allowed = env.ALLOWED_ORIGIN || "";
  const origin = req.headers.get("origin") || "";
  return allowed && origin === allowed ? origin : "";
}

function corsHeaders(req: Request, env: Env) {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(req, env),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, stripe-signature",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req, env), "Content-Type": "application/json" },
  });
}

async function getAdminToken(pbUrl: string, email: string, pass: string): Promise<string> {
  // Try PocketBase v0.23+ superuser endpoint first
  let res = await fetch(`${pbUrl}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password: pass }),
  });

  if (!res.ok && res.status === 404) {
    // Fallback to legacy admin endpoint
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

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    }

    const stripeKey = env.STRIPE_SECRET_KEY;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    const pbUrl = env.PB_URL || "http://127.0.0.1:8090";
    const pbEmail = env.PB_ADMIN_EMAIL;
    const pbPass = env.PB_ADMIN_PASSWORD;

    if (!stripeKey || !webhookSecret || !pbEmail || !pbPass) {
      console.error("Missing config variables in Stripe Webhook");
      return jsonResponse(req, env, { error: "Missing config" }, 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify Stripe signature
    const sig = req.headers.get("stripe-signature");
    const bodyText = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(bodyText, sig!, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return jsonResponse(req, env, { error: "Invalid signature" }, 400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};
      const isAddon = meta.mode === "addon";

      try {
        // Authenticate admin token to PocketBase
        const adminToken = await getAdminToken(pbUrl, pbEmail, pbPass);

        // 1. Idempotency Check: check if stripe_session_id order already exists
        const checkRes = await fetch(`${pbUrl}/api/collections/orders/records?filter=stripe_session_id%3D%22${session.id}%22`, {
          headers: { "Authorization": adminToken }
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json() as { items: unknown[] };
          if (checkData.items && checkData.items.length > 0) {
            console.log(`⏭️ Session ${session.id} already processed, skipping`);
            return jsonResponse(req, env, { received: true, duplicate: true });
          }
        }

        const userId = meta.userId || null;

        if (isAddon) {
          // ── Add-on service payment ─────────────────────────────────────────
          const invoiceId = `INV-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
          const orderNumber = `SVC-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

          // Create order first
          const orderRes = await fetch(`${pbUrl}/api/collections/orders/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              order_number: orderNumber,
              package_name: meta.serviceName ?? "Add-on Service",
              company_name: "",
              company_state: "",
              company_type: "LLC",
              status: "in_progress",
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency?.toUpperCase() ?? "USD",
              customer_email: meta.customerEmail || null,
              stripe_session_id: session.id,
              notes: "Add-on service purchase.",
            })
          });

          if (!orderRes.ok) {
            const errText = await orderRes.text();
            throw new Error(`Order creation failed: ${orderRes.status} ${errText}`);
          }
          const createdOrder = await orderRes.json() as { id: string };

          // Record payment
          const paymentRes = await fetch(`${pbUrl}/api/collections/payments/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              order: createdOrder.id,
              invoice_id: invoiceId,
              service: meta.serviceName ?? "Add-on Service",
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency?.toUpperCase() ?? "USD",
              status: "paid",
              stripe_payment_id: session.id,
            })
          });

          if (!paymentRes.ok) {
            console.error("Payment insert failed:", await paymentRes.text());
          }

          // Create in-app notification for the user
          await fetch(`${pbUrl}/api/collections/notifications/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              type: "payment_received",
              title: "Payment Confirmed",
              message: `Payment received for ${meta.serviceName ?? "Add-on Service"}.`,
              link: "/client/dashboard",
              read: false,
            })
          }).catch(e => console.error("Notification creation failed:", e));

          console.log(`✅ Add-on service paid: ${meta.serviceName} by ${meta.customerEmail}`);

        } else {
          // ── Company formation payment ──────────────────────────────────────
          const orderNumber = `IG-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
          const invoiceId = `INV-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

          // Create order
          const orderRes = await fetch(`${pbUrl}/api/collections/orders/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              order_number: orderNumber,
              package_name: meta.plan ?? "Unknown Plan",
              company_name: meta.companyName ?? "Unknown",
              company_state: meta.companyState ?? "",
              company_type: meta.companyType ?? "LLC",
              status: "pending",
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency?.toUpperCase() ?? "USD",
              customer_name: meta.customerName || null,
              customer_email: meta.customerEmail || null,
              customer_phone: meta.customerPhone || null,
              customer_country: meta.customerCountry || null,
              customer_address: meta.customerAddress || null,
              business_activity: meta.businessActivity || null,
              stripe_session_id: session.id,
            })
          });

          if (!orderRes.ok) {
            const errText = await orderRes.text();
            throw new Error(`Order creation failed: ${orderRes.status} ${errText}`);
          }
          const createdOrder = await orderRes.json() as { id: string };

          // Record payment
          const paymentRes = await fetch(`${pbUrl}/api/collections/payments/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              order: createdOrder.id,
              invoice_id: invoiceId,
              service: meta.plan ?? "Formation",
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency?.toUpperCase() ?? "USD",
              status: "paid",
              stripe_payment_id: session.id,
            })
          });
          if (!paymentRes.ok) console.error("Payment insert failed:", await paymentRes.text());

          // Create pending company record
          const compRes = await fetch(`${pbUrl}/api/collections/companies/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              order: createdOrder.id,
              company_name: meta.companyName ?? "Unknown",
              company_type: meta.companyType ?? "LLC",
              state: meta.companyState ?? "",
              status: "pending",
            })
          });
          if (!compRes.ok) console.error("Company insert failed:", await compRes.text());

          // Create in-app notification for the user
          await fetch(`${pbUrl}/api/collections/notifications/records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": adminToken
            },
            body: JSON.stringify({
              user: userId,
              type: "order_status",
              title: "Order Placed Successfully",
              message: `Order #${orderNumber} is pending review.`,
              link: "/client/dashboard",
              read: false,
            })
          }).catch(e => console.error("Notification creation failed:", e));

          console.log(`✅ Formation order ${orderNumber} created for ${meta.companyName}`);
        }
      } catch (dbErr) {
        console.error("PocketBase write failed:", dbErr);
        return jsonResponse(req, env, { error: "Database write failed" }, 500);
      }
    }

    return jsonResponse(req, env, { received: true });
  },
};
