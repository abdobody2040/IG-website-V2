import Stripe from "stripe";

class AuthError extends Error {}
class ValidationError extends Error {}

export interface Env {
  STRIPE_SECRET_KEY: string;
  ALLOWED_ORIGIN: string;
  PB_URL: string;
  PB_ADMIN_EMAIL?: string;
  PB_ADMIN_PASSWORD?: string;
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
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req, env), "Content-Type": "application/json" },
  });
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required`);
  }
  return value.trim();
}

async function getAdminToken(pbUrl: string, email?: string, pass?: string): Promise<string | null> {
  if (!email || !pass) return null;
  try {
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

    if (!res.ok) return null;
    const data = await res.json() as { token: string };
    return data.token;
  } catch {
    return null;
  }
}

async function verifyAuth(req: Request, env: Env): Promise<string> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new AuthError("Missing Authorization header");

  const pbUrl = env.PB_URL || "http://127.0.0.1:8090";
  const res = await fetch(`${pbUrl}/api/collections/users/auth-refresh`, {
    method: "POST",
    headers: {
      "Authorization": token,
    },
  });

  if (!res.ok) {
    throw new AuthError("Invalid or expired token");
  }
  const data = await res.json() as { record: { id: string } };
  return data.record.id;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    }

    if (req.method !== "POST") {
      return jsonResponse(req, env, { error: "Method not allowed" }, 405);
    }

    try {
      const authenticatedUserId = await verifyAuth(req, env);

      const stripeKey = env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return jsonResponse(req, env, { error: "Stripe not configured" }, 500);
      }

      const pbUrl = env.PB_URL || "http://127.0.0.1:8090";
      const adminToken = await getAdminToken(pbUrl, env.PB_ADMIN_EMAIL, env.PB_ADMIN_PASSWORD);
      if (!adminToken) {
        return jsonResponse(req, env, { error: "Database authentication failed" }, 500);
      }

      const body = await req.json();
      const sessionId = requireString(body.sessionId, "sessionId");

      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== "paid") {
        return jsonResponse(req, env, { verified: false, status: session.payment_status }, 400);
      }

      const metadata = session.metadata || {};
      const metadataUserId = metadata.userId || "";
      if (metadataUserId && metadataUserId !== authenticatedUserId) {
        return jsonResponse(req, env, { error: "Unauthorized access to this session" }, 403);
      }

      // Fetch invoice and receipt details directly from Stripe
      let invoiceUrl = "";
      if (session.invoice) {
        try {
          const invoiceObj = await stripe.invoices.retrieve(String(session.invoice));
          invoiceUrl = invoiceObj.hosted_invoice_url || invoiceObj.invoice_pdf || "";
        } catch (err) {
          console.error("Failed to retrieve Stripe invoice details:", err);
        }
      }

      let receiptUrl = "";
      if (session.payment_intent) {
        try {
          const piObj = await stripe.paymentIntents.retrieve(String(session.payment_intent), {
            expand: ["latest_charge"],
          });
          const chargeObj = piObj.latest_charge as Stripe.Charge;
          if (chargeObj && chargeObj.receipt_url) {
            receiptUrl = chargeObj.receipt_url;
          }
        } catch (err) {
          console.error("Failed to retrieve Stripe receipt details:", err);
        }
      }

      // Check if order already exists in PocketBase
      const ordersRes = await fetch(
        `${pbUrl}/api/collections/orders/records?filter=stripe_session_id%3D%22${sessionId}%22`,
        { headers: { "Authorization": `Bearer ${adminToken}` } }
      );
      if (!ordersRes.ok) {
        throw new Error(`Failed to check database: ${ordersRes.statusText}`);
      }
      const ordersData = await ordersRes.json() as { items: Array<{ id: string, order_number: string, package_name: string, company_name: string }> };

      if (ordersData.items.length > 0) {
        // Order exists! Payment already verified & processed.
        const order = ordersData.items[0];

        // Also update the payment record with invoice/receipt urls if they were retrieved
        const payCheck = await fetch(
          `${pbUrl}/api/collections/payments/records?filter=stripe_session_id%3D%22${sessionId}%22`,
          { headers: { "Authorization": `Bearer ${adminToken}` } }
        );
        if (payCheck.ok) {
          const payData = await payCheck.json() as { items: Array<{ id: string }> };
          if (payData.items.length > 0 && (invoiceUrl || receiptUrl)) {
            await fetch(`${pbUrl}/api/collections/payments/records/${payData.items[0].id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,
              },
              body: JSON.stringify({
                invoice_url: invoiceUrl || undefined,
                receipt_url: receiptUrl || undefined,
              }),
            });
          }
        }

        return jsonResponse(req, env, {
          verified: true,
          orderId: order.id,
          orderNumber: order.order_number,
          plan: order.package_name,
          company: order.company_name,
          invoiceUrl,
          receiptUrl,
        });
      }

      // ── Webhook Fallback Sync ──
      console.log(`verify-payment: Webhook fallback triggered for session ${sessionId}`);

      const mode = metadata.mode || "formation";
      const user = metadataUserId;
      const amountUSD = (session.amount_total || 0) / 100;
      const currency = "USD";

      let orderId = "";
      let orderNumber = "";
      let packageName = "";
      let companyName = "";

      if (mode === "formation") {
        orderNumber = "IG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        packageName = metadata.plan || "LLC Formation";
        companyName = metadata.companyName || "My Company";

        const state = metadata.companyState || "N/A";
        const companyType = metadata.companyType || "LLC";

        // Create Order
        const orderRes = await fetch(`${pbUrl}/api/collections/orders/records`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            user,
            order_number: orderNumber,
            package_name: packageName,
            company_name: companyName,
            company_state: state,
            company_type: companyType,
            status: "pending",
            amount: amountUSD,
            currency,
            customer_name: metadata.customerName || "",
            customer_email: metadata.customerEmail || "",
            customer_phone: metadata.customerPhone || "",
            customer_country: metadata.customerCountry || "",
            customer_address: metadata.customerAddress || "",
            notes: "Processed via verification fallback",
            stripe_session_id: sessionId,
          }),
        });

        if (!orderRes.ok) {
          const errTxt = await orderRes.text();
          throw new Error(`Fallback: failed to create order: ${errTxt}`);
        }
        const orderData = await orderRes.json() as { id: string };
        orderId = orderData.id;

        // Create Company
        await fetch(`${pbUrl}/api/collections/companies/records`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            user,
            order: orderId,
            company_name: companyName,
            company_type: companyType,
            state,
            status: "pending",
          }),
        });

      } else if (mode === "addon") {
        orderNumber = "IG-ADD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        packageName = metadata.serviceName || "Add-on Service";

        const orderRes = await fetch(`${pbUrl}/api/collections/orders/records`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            user,
            order_number: orderNumber,
            package_name: packageName,
            company_name: "N/A (Add-on)",
            company_state: "N/A",
            company_type: "N/A",
            status: "in_progress",
            amount: amountUSD,
            currency,
            customer_email: metadata.customerEmail || "",
            notes: `Add-on service purchase: ${packageName}`,
            stripe_session_id: sessionId,
          }),
        });
        if (orderRes.ok) {
          const orderData = await orderRes.json() as { id: string };
          orderId = orderData.id;
        }
      }

      // Create Payment Record
      const invoiceId = session.invoice ? String(session.invoice) : `INV-${orderNumber.split("-").pop()}`;
      await fetch(`${pbUrl}/api/collections/payments/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          user,
          order: orderId,
          service: packageName,
          invoice_id: invoiceId,
          amount: amountUSD,
          currency,
          status: "paid",
          stripe_payment_id: session.payment_intent ? String(session.payment_intent) : "",
          stripe_session_id: sessionId,
          stripe_customer_id: session.customer ? String(session.customer) : "",
          stripe_invoice_id: session.invoice ? String(session.invoice) : "",
          stripe_price_id: metadata.stripePriceId || "",
          stripe_product_id: metadata.stripeProductId || "",
          customer_name: metadata.customerName || "",
          customer_email: metadata.customerEmail || "",
          company_name: companyName,
          customer_country: metadata.customerCountry || "",
          invoice_url: invoiceUrl || undefined,
          receipt_url: receiptUrl || undefined,
          notes: "Processed via verification fallback",
        }),
      });

      return jsonResponse(req, env, {
        verified: true,
        orderId,
        orderNumber,
        plan: packageName,
        company: companyName,
        invoiceUrl,
        receiptUrl,
      });
    } catch (err) {
      console.error("Verify payment error:", err);
      const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
      return jsonResponse(req, env, { error: err instanceof Error ? err.message : "Internal error" }, status);
    }
  },
};
