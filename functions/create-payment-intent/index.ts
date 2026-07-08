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

function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

      const body = await req.json();
      const bodyUserId = optionalString(body.userId);
      if (bodyUserId && bodyUserId !== authenticatedUserId) {
        return jsonResponse(req, env, { error: "User ID mismatch" }, 403);
      }

      const mode = optionalString(body.mode) || "formation";
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });

      let resolvedAmount = 0;
      let metadata: Record<string, string> = {};

      const headers: Record<string, string> = {};
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }

      if (mode === "formation") {
        const planId = requireString(body.planId, "planId");
        const companyName = requireString(body.companyName, "companyName");
        const companyState = requireString(body.companyState, "companyState");
        const companyType = requireString(body.companyType, "companyType");
        const businessActivity = requireString(body.businessActivity, "businessActivity");
        const customerEmail = requireString(body.customerEmail, "customerEmail");

        const [region, planLevel] = planId.split("-");
        if (!region || !planLevel) {
          throw new ValidationError("Invalid planId format");
        }

        // Fetch plan price (USD only)
        const pricingRes = await fetch(
          `${pbUrl}/api/collections/pricing_config/records?filter=region%3D%22${region}%22%26%26plan%3D%22${planLevel}%22`,
          { headers }
        );
        if (!pricingRes.ok) {
          throw new ValidationError(`Failed to fetch pricing config: ${pricingRes.statusText}`);
        }
        const pricingData = await pricingRes.json() as { items: Array<{ price: number, stripe_price_id?: string, stripe_product_id?: string }> };
        if (!pricingData.items || pricingData.items.length === 0) {
          throw new ValidationError(`Plan configuration not found for: ${planId}`);
        }
        
        const planConfig = pricingData.items[0];
        resolvedAmount += planConfig.price;

        // Resolve State Fee
        if (region === "us" && (companyState === "Delaware" || companyState === "Wyoming")) {
          const feeId = companyState === "Delaware" ? "statefee_delaw1" : "statefee_wyomin";
          const feeRes = await fetch(`${pbUrl}/api/collections/services/records/${feeId}`, { headers });
          if (feeRes.ok) {
            const feeConfig = await feeRes.json() as { price: number };
            resolvedAmount += feeConfig.price;
          }
        }

        // Resolve Add-ons
        const selectedAddOns = body.selectedAddOns || [];
        if (Array.isArray(selectedAddOns) && selectedAddOns.length > 0) {
          for (const addOnId of selectedAddOns) {
            const addonRes = await fetch(`${pbUrl}/api/collections/services/records/${addOnId}`, { headers });
            if (addonRes.ok) {
              const addonConfig = await addonRes.json() as { price: number };
              resolvedAmount += addonConfig.price;
            }
          }
        }

        metadata = {
          mode: "formation",
          planId,
          plan: `${region.toUpperCase()} LLC ${planLevel.toUpperCase()}`,
          companyName,
          companyState,
          companyType,
          businessActivity,
          customerName: optionalString(body.customerName),
          customerEmail,
          customerPhone: optionalString(body.customerPhone),
          customerCountry: optionalString(body.customerCountry),
          customerAddress: optionalString(body.customerAddress),
          userId: authenticatedUserId,
          selectedAddOns: JSON.stringify(selectedAddOns),
          stripePriceId: planConfig.stripe_price_id || "",
          stripeProductId: planConfig.stripe_product_id || "",
          payment_flow_type: "direct_payment_intent",
        };

      } else if (mode === "addon") {
        const serviceId = requireString(body.serviceId, "serviceId");
        const customerEmail = optionalString(body.customerEmail) || undefined;

        const svcRes = await fetch(`${pbUrl}/api/collections/services/records/${serviceId}`, { headers });
        if (!svcRes.ok) {
          throw new ValidationError(`Service not found: ${serviceId}`);
        }
        const svcConfig = await svcRes.json() as { stripe_price_id?: string, stripe_product_id?: string, price: number, title_en: string };
        resolvedAmount = svcConfig.price;

        metadata = {
          mode: "addon",
          serviceId,
          serviceName: svcConfig.title_en,
          userId: authenticatedUserId,
          customerEmail: customerEmail ?? "",
          stripePriceId: svcConfig.stripe_price_id || "",
          stripeProductId: svcConfig.stripe_product_id || "",
          payment_flow_type: "direct_payment_intent",
        };
      } else {
        return jsonResponse(req, env, { error: "Invalid payment mode" }, 400);
      }

      // Enforce USD currency strictly
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(resolvedAmount * 100),
        currency: "usd",
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return jsonResponse(req, env, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: resolvedAmount,
        currency: "USD",
      });
    } catch (err) {
      console.error("PaymentIntent error:", err);
      const status = err instanceof ValidationError ? 400 : err instanceof AuthError ? 401 : 500;
      return jsonResponse(req, env, { error: err instanceof Error ? err.message : "Internal error" }, status);
    }
  },
};
