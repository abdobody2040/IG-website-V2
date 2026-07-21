// Extract HttpOnly cookie and set as Authorization header + CSRF check
routerUse(function (next) {
    return function (c) {
        var req = c.request();

        // PocketBase v0.22 c.request().header provides lowercase methods: get, set, add, del
        function getHeader(name) {
            try {
                if (req && req.header && typeof req.header.get === "function") {
                    return req.header.get(name) || "";
                }
            } catch (_) {}
            return "";
        }

        function setHeader(name, value) {
            try {
                if (req && req.header && typeof req.header.set === "function") {
                    req.header.set(name, value);
                }
            } catch (_) {}
        }

        // ── Cookie → Authorization injection ───────────────────────────────────
        // Only inject for app-user endpoints. Skip admin endpoints entirely so
        // a stale pb_auth cookie never blocks the Admin UI login.
        var reqPath = "";
        try { reqPath = req.url.path; } catch (_) {}

        var isAdminEndpoint = (
            reqPath.indexOf("/api/admins") === 0 ||
            reqPath.indexOf("/_/") === 0 ||
            reqPath === "/_"
        );

        if (!isAdminEndpoint) {
            var authCookie = null;
            try { authCookie = c.cookie("pb_auth"); } catch (_) {}

            if (authCookie && authCookie.value) {
                var currentAuth = getHeader("Authorization");
                if (!currentAuth) {
                    setHeader("Authorization", "Bearer " + authCookie.value);
                }
            }
        }

        // ── CSRF Check ──────────────────────────────────────────────────────────
        // Only enforced when the request comes from the frontend (port 3000).
        // Admin UI (8090), scripts, and direct API calls are exempt.
        var method = req.method || "";
        if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
            var origin  = getHeader("Origin");
            var referer = getHeader("Referer");

            var isFromFrontend = origin.indexOf(":3000") !== -1 || referer.indexOf(":3000") !== -1;

            if (isFromFrontend) {
                var isExempt = (
                    reqPath === "/api/auth/login" ||
                    reqPath === "/api/auth/logout" ||
                    reqPath.indexOf("/api/collections/users/auth") !== -1 ||
                    reqPath.indexOf("/api/collections/users/records") !== -1 ||
                    reqPath.indexOf("/api/oauth2") !== -1 ||
                    reqPath.indexOf("/api/stripe/webhook") !== -1
                );

                if (!isExempt) {
                    var csrfCookie = null;
                    try { csrfCookie = c.cookie("csrf-token"); } catch (_) {}

                    var csrfHeader = getHeader("X-CSRF-Token");

                    if (!csrfCookie || !csrfCookie.value || !csrfHeader || csrfCookie.value !== csrfHeader) {
                        throw new Error("CSRF token missing or invalid.");
                    }
                }
            }
        }

        return next(c);
    };
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

        // Generate auth token
        var token = $tokens.recordAuthToken($app, user);

        try {
            var resH = c.response().header();
            if (typeof resH.set === "function") {
                resH.set("Set-Cookie", "pb_auth=" + token + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600");
            } else if (typeof resH.Set === "function") {
                resH.Set("Set-Cookie", "pb_auth=" + token + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=1209600");
            }
            if (typeof resH.add === "function") {
                resH.add("Set-Cookie", "csrf-token=" + $security.randomString(32) + "; Path=/; SameSite=Lax; Max-Age=1209600");
            } else if (typeof resH.Add === "function") {
                resH.Add("Set-Cookie", "csrf-token=" + $security.randomString(32) + "; Path=/; SameSite=Lax; Max-Age=1209600");
            }
        } catch (hErr) {
            console.log("[auth_login_header_err]", hErr);
        }

        return c.json(200, {
            "token": token,
            "record": user
        });

    } catch (err) {
        console.log("[auth_login_error]", err);
        return c.json(400, { "error": "Invalid email or password." });
    }
});

routerAdd("POST", "/api/auth/logout", function (c) {
    try {
        var resH = c.response().header();
        if (typeof resH.set === "function") {
            resH.set("Set-Cookie", "pb_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
        } else if (typeof resH.Set === "function") {
            resH.Set("Set-Cookie", "pb_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
        }
        if (typeof resH.add === "function") {
            resH.add("Set-Cookie", "csrf-token=; Path=/; SameSite=Lax; Max-Age=0");
        } else if (typeof resH.Add === "function") {
            resH.Add("Set-Cookie", "csrf-token=; Path=/; SameSite=Lax; Max-Age=0");
        }
    } catch (_) {}
    return c.json(200, { "success": true });
});
