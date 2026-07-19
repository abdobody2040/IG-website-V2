// ─────────────────────────────────────────────────────────────────────────────
// Instant Grow — Restrict PocketBase Admin UI to Localhost / SSH Tunnels
//
// This hook intercepts all requests to the admin panel (path starts with /_/)
// and blocks access if the request host is not localhost or 127.0.0.1.
// ─────────────────────────────────────────────────────────────────────────────

onBeforeApiRequest(function (e) {
    var req = e.httpContext.request();
    var path = req.url.path;

    // Check if the request path points to the admin panel
    if (path === "/_/" || path.indexOf("/_/") === 0) {
        var host = req.host || "";
        var isLocal = host.indexOf("localhost:") === 0 || 
                      host.indexOf("127.0.0.1:") === 0 || 
                      host === "localhost" || 
                      host === "127.0.0.1";
        
        if (!isLocal) {
            throw new Error("Forbidden: Access to the admin UI is restricted to localhost or secure SSH tunnels.");
        }
    }
});
