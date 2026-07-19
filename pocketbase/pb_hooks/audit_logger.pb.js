function logAudit(e, action) {
    try {
        var req = e.httpContext.request();
        if (e.collection && e.collection.name === "admin_audit_log") return;
        if (e.collection && e.collection.name === "rate_limits") return;
        
        var authRecord = null;
        try { authRecord = e.httpContext.get("authRecord"); } catch(err) {}
        
        var adminId = authRecord ? authRecord.id : null;
        if (!adminId) return; 
        
        var dao = $app.dao();
        var collection = dao.findCollectionByNameOrId("admin_audit_log");
        var log = new Record(collection);
        
        log.set("admin", adminId);
        log.set("action", action);
        log.set("table_name", e.collection ? e.collection.name : "");
        log.set("record_id", e.record ? e.record.id : "");
        log.set("details", "IP: " + e.httpContext.realIP());
        
        dao.saveRecord(log);
    } catch (err) {
        console.log("Audit log failed: ", err);
    }
}

onRecordAfterCreateRequest(function (e) { logAudit(e, "CREATE"); });
onRecordAfterUpdateRequest(function (e) { logAudit(e, "UPDATE"); });
onRecordAfterDeleteRequest(function (e) { logAudit(e, "DELETE"); });
