class AuthError extends Error {}
class ValidationError extends Error {}

export interface Env {
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

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req, env) });
    }

    if (req.method !== "POST") {
      return jsonResponse(req, env, { error: "Method not allowed" }, 405);
    }

    const pbUrl = env.PB_URL || "http://127.0.0.1:8090";

    // 1. Verify caller is authorized and is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(req, env, { error: "Unauthorized" }, 401);
    }

    const callerToken = authHeader.slice(7);

    try {
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

      // 2. Get user ID to delete from request body
      const body = await req.json() as { userId?: string };
      const userId = body.userId;

      if (!userId || typeof userId !== "string") {
        return jsonResponse(req, env, { error: "userId is required" }, 400);
      }

      // Prevent self-deletion
      if (userId === authData.record.id) {
        return jsonResponse(req, env, { error: "Cannot delete your own account" }, 400);
      }

      // 3. Delete user via PocketBase REST API using caller's auth token
      const deleteRes = await fetch(`${pbUrl}/api/collections/users/records/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": callerToken,
        },
      });

      if (!deleteRes.ok) {
        const errJson = await deleteRes.json().catch(() => ({}));
        throw new Error(errJson.message || `PocketBase returned ${deleteRes.status}`);
      }

      return jsonResponse(req, env, { success: true });
    } catch (err) {
      console.error("Delete user failed:", err);
      return jsonResponse(req, env, { error: err instanceof Error ? err.message : "Delete failed" }, 500);
    }
  },
};
