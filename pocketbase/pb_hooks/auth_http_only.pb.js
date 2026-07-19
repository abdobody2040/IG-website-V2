// Extract HttpOnly cookie and set as Authorization header
onBeforeApiRequest(function (e) {
    var req = e.httpContext.request();
    var authCookie = null;
    try {
        authCookie = e.httpContext.cookie("pb_auth");
    } catch (err) {
        // Cookie not found
    }

    if (authCookie && authCookie.value) {
        var currentAuth = req.header.Get("Authorization");
        if (!currentAuth) {
            req.header.Set("Authorization", "Bearer " + authCookie.value);
        }
    }

    // CSRF Check for mutations
    var method = req.method;
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
        var path = req.url.path;
        // Skip auth routes and external webhooks (like Stripe)
        if (path !== "/api/auth/login" && path !== "/api/auth/logout" && path.indexOf("/api/stripe/webhook") === -1) {
            var csrfCookie = null;
            try {
                csrfCookie = e.httpContext.cookie("csrf-token");
            } catch (err) {}

            var csrfHeader = req.header.Get("X-CSRF-Token");
            
            if (!csrfCookie || !csrfCookie.value || !csrfHeader || csrfCookie.value !== csrfHeader) {
                // If token missing or mismatched, reject request
                throw new Error("CSRF token missing or invalid.");
            }
        }
    }
});

routerAdd("POST", "/api/auth/login", function (c) {
    var body = new DynamicModel({
        email: "",
        password: ""
    });
    c.bind(body);

    var email = body.email;
    var password = body.password;

    try {
        var user = $app.dao().findAuthRecordByEmail("users", email);
        var isValid = user.validatePassword(password);
        
        if (!isValid) {
            throw new Error("Invalid login credentials.");
        }

        var token = $tokens.recordAuthToken($app, user); // In v0.22+ $tokens.recordAuthToken($app, user)
        // Wait, $tokens.recordAuthToken takes ($app, record).
        
        c.response().header().Set("Set-Cookie", "pb_auth=" + token + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600");
        
        var csrfToken = $security.randomString(32);
        c.response().header().Add("Set-Cookie", "csrf-token=" + csrfToken + "; Path=/; Secure; SameSite=Lax; Max-Age=1209600");

        return c.json(200, {
            "token": "", // Hide from frontend
            "record": user
        });

    } catch (err) {
        return c.json(400, { "error": "Invalid email or password." });
    }
});

routerAdd("POST", "/api/auth/logout", function (c) {
    c.response().header().Set("Set-Cookie", "pb_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    c.response().header().Add("Set-Cookie", "csrf-token=; Path=/; Secure; SameSite=Lax; Max-Age=0");
    return c.json(200, { "success": true });
});
