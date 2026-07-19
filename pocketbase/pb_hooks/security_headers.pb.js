onAfterApiRequest(function (e) {
    var res = e.httpContext.response();
    if (res && res.header) {
        res.header().Set("X-Content-Type-Options", "nosniff");
        res.header().Set("X-Frame-Options", "DENY");
        res.header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        // For API responses, we don't need permissive CSP, just block everything
        res.header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");
    }
});
