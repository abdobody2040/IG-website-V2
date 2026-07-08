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
      const successUrl = requireUrl(body.successUrl, "successUrl");
      const cancelUrl = requireUrl(body.cancelUrl, "cancelUrl");

      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" as any });
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let metadata: Record<string, string> = {};
      let customerEmail: string | undefined;

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
        customerEmail = requireString(body.customerEmail, "customerEmail");

        // Parse region and plan level
        const [region, planLevel] = planId.split("-");
        if (!region || !planLevel) {
          throw new ValidationError("Invalid planId format");
        }

        // 1. Retrieve secure pricing configuration from PocketBase (USD only)
        const pricingRes = await fetch(
          `${pbUrl}/api/collections/pricing_config/records?filter=region%3D%22${region}%22%26%26plan%3D%22${planLevel}%22`,
          { headers }
        );
        if (!pricingRes.ok) {
          throw new ValidationError(`Failed to fetch pricing config: ${pricingRes.statusText}`);
        }
        const pricingData = await pricingRes.json() as { items: Array<{ stripe_price_id?: string, stripe_product_id?: string, price: number }> };
        if (!pricingData.items || pricingData.items.length === 0) {
          throw new ValidationError(`Plan configuration not found for: ${planId}`);
        }
        const planConfig = pricingData.items[0];
        
        // Add plan item
        if (planConfig.stripe_price_id) {
          lineItems.push({ price: planConfig.stripe_price_id, quantity: 1 });
        } else {
          // Dev Mode dynamic fallback
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: `${region.toUpperCase()} ${planLevel.toUpperCase()} Formation`,
                description: `${companyType} formation in ${companyState}`,
              },
              unit_amount: Math.round(planConfig.price * 100),
            },
            quantity: 1,
          });
        }

        // 2. Resolve State Fee
        if (region === "us" && (companyState === "Delaware" || companyState === "Wyoming")) {
          const feeId = companyState === "Delaware" ? "statefee_delaw1" : "statefee_wyomin";
          const feeRes = await fetch(`${pbUrl}/api/collections/services/records/${feeId}`, { headers });
          if (feeRes.ok) {
            const feeConfig = await feeRes.json() as { stripe_price_id?: string, price: number };
            if (feeConfig.stripe_price_id) {
              lineItems.push({ price: feeConfig.stripe_price_id, quantity: 1 });
            } else {
              lineItems.push({
                price_data: {
                  currency: "usd",
                  product_data: {
                    name: `${companyState} State Filing Fee`,
                    description: `Required state filing fee for ${companyState}`,
                  },
                  unit_amount: Math.round(feeConfig.price * 100),
                },
                quantity: 1,
              });
            }
          }
        }

        // 3. Resolve Selected Add-Ons
        const selectedAddOns = body.selectedAddOns || [];
        if (Array.isArray(selectedAddOns) && selectedAddOns.length > 0) {
          for (const addOnId of selectedAddOns) {
            const addonRes = await fetch(`${pbUrl}/api/collections/services/records/${addOnId}`, { headers });
            if (addonRes.ok) {
              const addonConfig = await addonRes.json() as { stripe_price_id?: string, price: number, title_en: string, description_en: string };
              if (addonConfig.stripe_price_id) {
                lineItems.push({ price: addonConfig.stripe_price_id, quantity: 1 });
              } else {
                lineItems.push({
                  price_data: {
                    currency: "usd",
                    product_data: {
                      name: addonConfig.title_en,
                      description: addonConfig.description_en,
                    },
                    unit_amount: Math.round(addonConfig.price * 100),
                  },
                  quantity: 1,
                });
              }
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
        };

      } else if (mode === "addon") {
        const serviceId = requireString(body.serviceId, "serviceId");
        customerEmail = optionalString(body.customerEmail) || undefined;

        // Retrieve service pricing from PocketBase
        const svcRes = await fetch(`${pbUrl}/api/collections/services/records/${serviceId}`, { headers });
        if (!svcRes.ok) {
          throw new ValidationError(`Service not found: ${serviceId}`);
        }
        const svcConfig = await svcRes.json() as { stripe_price_id?: string, stripe_product_id?: string, price: number, title_en: string, description_en: string };
        
        if (svcConfig.stripe_price_id) {
          lineItems.push({ price: svcConfig.stripe_price_id, quantity: 1 });
        } else {
          // Dev Mode dynamic fallback
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: svcConfig.title_en,
                description: svcConfig.description_en,
              },
              unit_amount: Math.round(svcConfig.price * 100),
            },
            quantity: 1,
          });
        }

        metadata = {
          mode: "addon",
          serviceId,
          serviceName: svcConfig.title_en,
          userId: authenticatedUserId,
          customerEmail: customerEmail ?? "",
          stripePriceId: svcConfig.stripe_price_id || "",
          stripeProductId: svcConfig.stripe_product_id || "",
        };
      } else {
        return jsonResponse(req, env, { error: "Invalid checkout mode" }, 400);
      }

      // Create Stripe checkout session using automatic payment methods
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
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
