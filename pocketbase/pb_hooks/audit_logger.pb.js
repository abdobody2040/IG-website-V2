// ─────────────────────────────────────────────────────────────────────────────
// Instant Grow — Audit Logger
// Logs CREATE / UPDATE / DELETE actions performed by authenticated app users.
//
// NOTE: PocketBase v0.22 executes hook callbacks in isolated goja contexts.
// Helper functions defined at file scope are NOT visible inside callbacks.
// All logic must be inlined directly inside each hook function.
//
// Admin (superuser) UI operations are intentionally skipped:
//   - httpContext.get("admin") is set when a PocketBase superuser is acting.
//   - httpContext.get("authRecord") is set when an app user is acting.
// ─────────────────────────────────────────────────────────────────────────────

var SKIP_COLLECTIONS = ["admin_audit_log", "rate_limits"];

onRecordAfterCreateRequest(function (e) {
    try {
        if (!e.collection) return;
        for (var i = 0; i < SKIP_COLLECTIONS.length; i++) {
            if (e.collection.name === SKIP_COLLECTIONS[i]) return;
        }

        // Skip if a PocketBase superuser/admin is performing this action.
        try { var pbAdmin = e.httpContext.get("admin"); if (pbAdmin && pbAdmin.id) return; } catch (_) {}

        // Only log actions performed by authenticated app users.
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch (_) {}
        var actorId = authRecord ? authRecord.id : null;
        if (!actorId) return;

        var dao        = $app.dao();
        var collection = dao.findCollectionByNameOrId("admin_audit_log");
        var log        = new Record(collection);
        log.set("admin",      actorId);
        log.set("action",     "CREATE");
        log.set("table_name", e.collection.name);
        log.set("record_id",  e.record ? e.record.id : "");
        log.set("details",    "IP: " + e.httpContext.realIP());
        dao.saveRecord(log);
    } catch (err) {
        console.log("[audit_logger] CREATE log failed:", err);
    }
});

onRecordAfterUpdateRequest(function (e) {
    try {
        if (!e.collection) return;
        for (var i = 0; i < SKIP_COLLECTIONS.length; i++) {
            if (e.collection.name === SKIP_COLLECTIONS[i]) return;
        }

        // Skip if a PocketBase superuser/admin is performing this action.
        try { var pbAdmin = e.httpContext.get("admin"); if (pbAdmin && pbAdmin.id) return; } catch (_) {}

        // Only log actions performed by authenticated app users.
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch (_) {}
        var actorId = authRecord ? authRecord.id : null;
        if (!actorId) return;

        var dao        = $app.dao();
        var collection = dao.findCollectionByNameOrId("admin_audit_log");
        var log        = new Record(collection);
        log.set("admin",      actorId);
        log.set("action",     "UPDATE");
        log.set("table_name", e.collection.name);
        log.set("record_id",  e.record ? e.record.id : "");
        log.set("details",    "IP: " + e.httpContext.realIP());
        dao.saveRecord(log);
    } catch (err) {
        console.log("[audit_logger] UPDATE log failed:", err);
    }
});

onRecordAfterDeleteRequest(function (e) {
    try {
        if (!e.collection) return;
        for (var i = 0; i < SKIP_COLLECTIONS.length; i++) {
            if (e.collection.name === SKIP_COLLECTIONS[i]) return;
        }

        // Skip if a PocketBase superuser/admin is performing this action.
        try { var pbAdmin = e.httpContext.get("admin"); if (pbAdmin && pbAdmin.id) return; } catch (_) {}

        // Only log actions performed by authenticated app users.
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch (_) {}
        var actorId = authRecord ? authRecord.id : null;
        if (!actorId) return;

        var dao        = $app.dao();
        var collection = dao.findCollectionByNameOrId("admin_audit_log");
        var log        = new Record(collection);
        log.set("admin",      actorId);
        log.set("action",     "DELETE");
        log.set("table_name", e.collection.name);
        log.set("record_id",  e.record ? e.record.id : "");
        log.set("details",    "IP: " + e.httpContext.realIP());
        dao.saveRecord(log);
    } catch (err) {
        console.log("[audit_logger] DELETE log failed:", err);
    }
});
