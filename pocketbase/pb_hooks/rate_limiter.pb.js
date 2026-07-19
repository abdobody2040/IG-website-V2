onBeforeApiRequest(function (e) {
    var req = e.httpContext.request();
    var ip = e.httpContext.realIP();
    var path = req.url.path;

    if (path === "/api/auth/login") {
        var dao = $app.dao();
        var now = Date.now();
        var windowMs = 60 * 1000; // 1 min
        var maxLimit = 5;

        var limitRecord = null;
        try {
            limitRecord = dao.findFirstRecordByData("rate_limits", "ip", ip);
        } catch(err) {}

        if (limitRecord) {
            if (now > limitRecord.get("reset_time")) {
                limitRecord.set("count", 1);
                limitRecord.set("reset_time", now + windowMs);
                limitRecord.set("endpoint", path);
                dao.saveRecord(limitRecord);
            } else {
                var count = limitRecord.get("count");
                if (count >= maxLimit) {
                    throw new Error("Too many login attempts. Please try again later.");
                }
                limitRecord.set("count", count + 1);
                dao.saveRecord(limitRecord);
            }
        } else {
            var collection = dao.findCollectionByNameOrId("rate_limits");
            var newRecord = new Record(collection);
            newRecord.set("ip", ip);
            newRecord.set("endpoint", path);
            newRecord.set("count", 1);
            newRecord.set("reset_time", now + windowMs);
            dao.saveRecord(newRecord);
        }
    }
});
