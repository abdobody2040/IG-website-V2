
var SKIP_COLLECTIONS = ["admin_audit_log", "rate_limits"];

onRecordAfterCreateRequest(function (e) {
    try {
        if (!e.collection) return;
        for (var i = 0; i < SKIP_COLLECTIONS.length; i++) {
            if (e.collection.name === SKIP_COLLECTIONS[i]) return;
        }

        // Skip if a PocketBase superuser/admin is performing this action.
        try { var pbAdmin = e.httpContext.get("admin"); if (pbAdmin && pbAdmin.id) return; } catch (_) { /* httpContext.get may not be available in all PB versions */ }

        // Only log actions performed by authenticated app users.
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch (_) { /* httpContext.get may not be available in all PB versions */ }
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
        $app.logger().error("[audit_logger] CREATE log failed:", { error: err.message || err });
    }
});

onRecordAfterUpdateRequest(function (e) {
    try {
        if (!e.collection) return;
        for (var i = 0; i < SKIP_COLLECTIONS.length; i++) {
            if (e.collection.name === SKIP_COLLECTIONS[i]) return;
        }

        // Skip if a PocketBase superuser/admin is performing this action.
        try { var pbAdmin = e.httpContext.get("admin"); if (pbAdmin && pbAdmin.id) return; } catch (_) { /* httpContext.get may not be available in all PB versions */ }

        // Only log actions performed by authenticated app users.
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch (_) { /* httpContext.get may not be available in all PB versions */ }
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
        $app.logger().error("[audit_logger] UPDATE log failed:", { error: err.message || err });
    }
});

onRecordAfterDeleteRequest(function (e) {
    try {
        if (!e.collection) return;
        for (var i = 0; i < SKIP_COLLECTIONS.length; i++) {
            if (e.collection.name === SKIP_COLLECTIONS[i]) return;
        }

        // Skip if a PocketBase superuser/admin is performing this action.
        try { var pbAdmin = e.httpContext.get("admin"); if (pbAdmin && pbAdmin.id) return; } catch (_) { /* httpContext.get may not be available in all PB versions */ }

        // Only log actions performed by authenticated app users.
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch (_) { /* httpContext.get may not be available in all PB versions */ }
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
        $app.logger().error("[audit_logger] DELETE log failed:", { error: err.message || err });
    }
});
