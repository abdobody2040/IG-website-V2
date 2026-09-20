routerUse(function (next) {
    return function (c) {
        var result = next(c);
        try {
            var res = c.response();
            if (res && res.header) {
                res.header().Set("X-Content-Type-Options", "nosniff");
                res.header().Set("X-Frame-Options", "DENY");
                res.header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none';");
            }
        } catch (err) {
            $app.logger().warn("[security_headers] Failed to set security headers (non-critical):", err.message || err);
        }
        return result;
    };
});
