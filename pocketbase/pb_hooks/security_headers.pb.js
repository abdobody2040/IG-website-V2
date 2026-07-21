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
            // Non-critical — don't block response
        }
        return result;
    };
});
