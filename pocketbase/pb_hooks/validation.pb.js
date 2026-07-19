function sanitizeRecord(e) {
    var record = e.record;
    if (!record) return;

    var fieldsToCheck = ["name", "title", "description", "content", "metadata", "display_name", "company_name", "email", "address", "phone", "notes", "message", "subject"];
    for (var i = 0; i < fieldsToCheck.length; i++) {
        var field = fieldsToCheck[i];
        var val = record.get(field);
        if (typeof val === "string") {
            var lower = val.toLowerCase();
            if (lower.indexOf("<script") !== -1 || lower.indexOf("javascript:") !== -1 || lower.indexOf("onerror=") !== -1 || lower.indexOf("onload=") !== -1) {
                throw new Error("Security violation: Malicious payload detected in field '" + field + "'.");
            }
        }
    }
}

onRecordBeforeCreateRequest(function (e) { sanitizeRecord(e); });
onRecordBeforeUpdateRequest(function (e) { sanitizeRecord(e); });
