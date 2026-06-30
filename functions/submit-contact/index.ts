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

    try {
      // Insert into contact_messages. Since createRule is empty (public), anyone can create contact messages!
      const insertRes = await fetch(`${pbUrl}/api/collections/contact_messages/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject: subject || null,
          message,
        }),
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
