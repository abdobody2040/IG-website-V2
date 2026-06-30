export interface Env {
  ALLOWED_ORIGIN: string;
  PB_URL: string;
  PB_ADMIN_EMAIL: string;
  PB_ADMIN_PASSWORD: string;
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

    if (req.method !== "POST") {
      return jsonResponse(req, env, { error: "Method not allowed" }, 405);
    }

    const pbUrl = env.PB_URL || "http://127.0.0.1:8090";
    const pbEmail = env.PB_ADMIN_EMAIL;
    const pbPass = env.PB_ADMIN_PASSWORD;

    if (!pbEmail || !pbPass) {
      return jsonResponse(req, env, { error: "Missing admin configuration" }, 500);
    }

    // Verify caller is authorized and is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(req, env, { error: "Unauthorized" }, 401);
    }

    const callerToken = authHeader.slice(7);

    try {
      // 1. Authenticate caller against PocketBase
      const authRes = await fetch(`${pbUrl}/api/collections/users/auth-refresh`, {
        method: "POST",
        headers: {
          "Authorization": callerToken,
        },
      });

      if (!authRes.ok) {
        return jsonResponse(req, env, { error: "Invalid token" }, 401);
      }

      const authData = await authRes.json() as { record: { id: string; role: string } };
      if (authData.record.role !== "admin") {
        return jsonResponse(req, env, { error: "Forbidden: admin only" }, 403);
      }

      // 2. Parse request body
      const body = await req.json() as {
        email?: string;
        password?: string;
        displayName?: string;
        phone?: string;
      };

      const email = body.email?.trim();
      const password = body.password;
      const displayName = body.displayName?.trim() || null;
      const phone = body.phone?.trim() || null;

      if (!email || !password) {
        return jsonResponse(req, env, { error: "email and password are required" }, 400);
      }

      if (password.length < 6) {
        return jsonResponse(req, env, { error: "Password must be at least 6 characters" }, 400);
      }

      // 3. Obtain admin token to create users collection record
      const adminToken = await getAdminToken(pbUrl, pbEmail, pbPass);

      // 4. Create new client user
      const createRes = await fetch(`${pbUrl}/api/collections/users/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": adminToken,
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm: password,
          emailVisibility: true,
          verified: true,
          display_name: displayName,
          role: "client",
          phone,
        }),
      });

      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(errJson.message || `PocketBase returned ${createRes.status}`);
      }

      const newUser = await createRes.json() as { id: string; email: string };

      return jsonResponse(req, env, {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName,
          phone,
          role: "client",
        },
      });
    } catch (err) {
      console.error("Create user failed:", err);
      return jsonResponse(req, env, { error: err instanceof Error ? err.message : "Creation failed" }, 500);
    }
  },
};
