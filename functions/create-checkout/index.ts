import Stripe from "stripe";

class AuthError extends Error {}
class ValidationError extends Error {}

export interface Env {
  STRIPE_SECRET_KEY: string;
  ALLOWED_ORIGIN: string;
  PB_URL: string;
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

function requireUrl(value: unknown, field: string): string {
  const url = requireString(value, field);
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ValidationError(`${field} must be a valid URL`);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ValidationError(`${field} must be an HTTP URL`);
  }
  return url;
}

function requireAmount(value: unknown): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("amount must be greater than 0");
  }
  return Math.round(amount * 100);
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

      const body = await req.json();
      const bodyUserId = optionalString(body.userId);
      if (bodyUserId && bodyUserId !== authenticatedUserId) {
        return jsonResponse(req, env, { error: "User ID mismatch" }, 403);
      }

      const mode = optionalString(body.mode) || "formation";
      const successUrl = requireUrl(body.successUrl, "successUrl");
      const cancelUrl = requireUrl(body.cancelUrl, "cancelUrl");
      const unitAmount = requireAmount(body.amount);

      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
      let metadata: Record<string, string>;
      let customerEmail: string | undefined;

      if (mode === "addon") {
        const serviceName = requireString(body.serviceName, "serviceName");
        const serviceDescription = optionalString(body.serviceDescription) || serviceName;
        customerEmail = optionalString(body.customerEmail) || undefined;

        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: serviceName,
                description: serviceDescription,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ];

        metadata = {
          mode: "addon",
          serviceName,
          userId: optionalString(body.userId),
          customerEmail: customerEmail ?? "",
        };
      } else if (mode === "formation") {
        const planName = requireString(body.planName, "planName");
        const companyName = requireString(body.companyName, "companyName");
        const companyState = requireString(body.companyState, "companyState");
        const companyType = requireString(body.companyType, "companyType");
        const businessActivity = requireString(body.businessActivity, "businessActivity");
        customerEmail = requireString(body.customerEmail, "customerEmail");

        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: planName,
                description: `${companyType} formation - ${companyState} - ${businessActivity}`,
                metadata: {
                  companyName,
                  companyState,
                  companyType,
                  businessActivity,
                },
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ];

        metadata = {
          mode: "formation",
          plan: planName,
          companyName,
          companyState,
          companyType,
          businessActivity,
          customerName: optionalString(body.customerName),
          customerEmail,
          customerPhone: optionalString(body.customerPhone),
          customerCountry: optionalString(body.customerCountry),
          customerAddress: optionalString(body.customerAddress),
          userId: optionalString(body.userId),
        };
      } else {
        return jsonResponse(req, env, { error: "Invalid checkout mode" }, 400);
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        customer_email: customerEmail,
        allow_promotion_codes: true,
        metadata,
        success_url: `${successUrl}${successUrl.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
      });

      return jsonResponse(req, env, { url: session.url, sessionId: session.id });
    } catch (err) {
      console.error("Checkout error:", err);
      const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
      return jsonResponse(req, env, { error: err instanceof Error ? err.message : "Internal error" }, status);
    }
  },
};
