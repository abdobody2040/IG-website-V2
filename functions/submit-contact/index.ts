export interface Env {
  ALLOWED_ORIGIN: string;
  PB_URL: string;
  TURNSTILE_SECRET_KEY: string;
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

/**
 * Attempt to resolve the authenticated user ID from the Bearer token.
 * Returns null if the token is absent, invalid, or the PocketBase call fails.
 * Never throws — contact submission must always succeed.
 */
async function resolveUserId(req: Request, pbUrl: string): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return null;

  try {
    const res = await fetch(`${pbUrl}/api/collections/users/auth-refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json() as { record?: { id?: string } };
    return data?.record?.id ?? null;
  } catch {
    return null;
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    }

    if (req.method !== "POST") {
      return jsonResponse(req, env, { error: "Method not allowed" }, 405);
    }

    const pbUrl = env.PB_URL || "http://127.0.0.1:8090";
    const turnstileSecret = env.TURNSTILE_SECRET_KEY;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(req, env, { error: "Invalid JSON body" }, 400);
    }

    const { name, email, subject, message, captchaToken } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      captchaToken?: string;
    };

    if (!name || !email || !message) {
      return jsonResponse(req, env, { error: "name, email, and message are required" }, 400);
    }

    // Verify Turnstile token server-side (if secret key is configured)
    // SECURITY NOTE: If TURNSTILE_SECRET_KEY is not set, CAPTCHA checks are bypassed entirely.
    // Ensure this key is set in production to protect the contact endpoint from spam.
    if (turnstileSecret) {
      if (!captchaToken) {
        return jsonResponse(req, env, { error: "CAPTCHA verification required" }, 400);
      }

      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: turnstileSecret,
            response: captchaToken,
            remoteip: req.headers.get("cf-connecting-ip") || "",
          }),
        }
      );

      const verifyData = await verifyRes.json() as { success: boolean };
      if (!verifyData.success) {
        return jsonResponse(req, env, { error: "CAPTCHA verification failed" }, 403);
      }
    }

    // Resolve authenticated user (B-009) — best-effort, never blocks submission
    const userId = await resolveUserId(req, pbUrl);

    try {
      // Insert into contact_messages, linking to authenticated user when available
      const payload: Record<string, unknown> = {
        name,
        email,
        subject: subject || null,
        message,
      };
      if (userId) {
        payload.user = userId;
      }

      const insertRes = await fetch(`${pbUrl}/api/collections/contact_messages/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!insertRes.ok) {
        const errText = await insertRes.text();
        throw new Error(`PocketBase insert failed: ${insertRes.status} ${errText}`);
      }

      return jsonResponse(req, env, { success: true });
    } catch (err) {
      console.error("Contact message submission failed:", err);
      return jsonResponse(req, env, { error: "Failed to save message" }, 500);
    }
  },
};

