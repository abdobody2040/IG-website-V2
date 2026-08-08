<?php
// ─────────────────────────────────────────────────────────────────────────────
//  test-mysql-migration.php
//  Run: php scripts/test-mysql-migration.php
//
//  Override DB credentials with env vars:
//    DB_HOST=localhost DB_NAME=instantgrow_dev DB_USER=root DB_PASS= php scripts/test-mysql-migration.php
// ─────────────────────────────────────────────────────────────────────────────

$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_PORT = getenv('DB_PORT') ?: '3306';
$DB_NAME = getenv('DB_NAME') ?: 'instantgrow_dev';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

$SCHEMA_FILE = __DIR__ . '/../pocketbase/seed-sql/mysql_schema_v2.sql';

// ── Colour helpers ────────────────────────────────────────────────────────────
$noColor = (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN')
        && !getenv('ANSICON') && !getenv('WT_SESSION');

function c(string $code, string $t): string {
    global $noColor;
    return $noColor ? $t : "\033[{$code}m{$t}\033[0m";
}
function ok(string $m)   { echo c('32','  [PASS] ') . $m . PHP_EOL; }
function fail(string $m) { echo c('31','  [FAIL] ') . $m . PHP_EOL; }
function warn(string $m) { echo c('33','  [WARN] ') . $m . PHP_EOL; }
function info(string $m) { echo c('36','  [INFO] ') . $m . PHP_EOL; }
function head(string $m) { echo PHP_EOL . c('1;35', "=== {$m} ===") . PHP_EOL; }

$pass = 0; $fail = 0;

function chk(bool $cond, string $ok, string $err): void {
    global $pass, $fail;
    if ($cond) { ok($ok); $pass++; } else { fail($err); $fail++; }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Connect — auto-create DB if missing
// ─────────────────────────────────────────────────────────────────────────────
head('1. Database Connection');
info("Connecting to {$DB_HOST}:{$DB_PORT}  db={$DB_NAME}  user={$DB_USER}");

$pdo = null;
try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER, $DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    ok("Connected to MySQL and database '{$DB_NAME}' exists");
    $pass++;
} catch (PDOException $e) {
    if (str_contains($e->getMessage(), 'Unknown database')) {
        // DB doesn't exist — create it
        try {
            $root = new PDO(
                "mysql:host={$DB_HOST};port={$DB_PORT};charset=utf8mb4",
                $DB_USER, $DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
            $root->exec("CREATE DATABASE `{$DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            info("Database '{$DB_NAME}' did not exist — created it.");
            $pdo = new PDO(
                "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4",
                $DB_USER, $DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
            );
            ok("Database '{$DB_NAME}' created and connection established");
            $pass++;
        } catch (PDOException $e2) {
            fail("Cannot create DB: " . $e2->getMessage());
            $fail++;
            exit(1);
        }
    } else {
        fail("Connection failed: " . $e->getMessage());
        $fail++;
        echo PHP_EOL;
        echo c('33', "  TROUBLESHOOTING:") . PHP_EOL;
        echo "  1. Make sure XAMPP MySQL is RUNNING (green in XAMPP Control Panel)" . PHP_EOL;
        echo "  2. Check DB_HOST={$DB_HOST}  DB_USER={$DB_USER}" . PHP_EOL;
        echo "  3. If you set a MySQL root password, pass it:  DB_PASS=yourpass php scripts/test-mysql-migration.php" . PHP_EOL;
        exit(1);
    }
}

$version = $pdo->query("SELECT VERSION()")->fetchColumn();
info("MySQL version: {$version}");

// ─────────────────────────────────────────────────────────────────────────────
// 2. Run schema if no tables yet
// ─────────────────────────────────────────────────────────────────────────────
head('2. Schema Import');

$tableCount = (int)$pdo->query(
    "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()"
)->fetchColumn();

if ($tableCount === 0) {
    info("No tables found — importing schema from mysql_schema_v2.sql …");
    if (!file_exists($SCHEMA_FILE)) {
        fail("Schema file not found: {$SCHEMA_FILE}");
        $fail++;
    } else {
        $sql        = file_get_contents($SCHEMA_FILE);
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        $imported   = 0;
        $errors     = 0;
        foreach ($statements as $stmt) {
            if (empty($stmt)) continue;
            try   { $pdo->exec($stmt); $imported++; }
            catch (PDOException $e) {
                warn("SQL error: " . substr($e->getMessage(), 0, 140));
                $errors++;
            }
        }
        chk($errors === 0,
            "Schema imported — {$imported} statements executed, 0 errors",
            "Schema imported with {$errors} error(s) — see warnings above"
        );
    }
} else {
    info("Database already has {$tableCount} table(s) — skipping import");
    ok("Schema already present");
    $pass++;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Table existence
// ─────────────────────────────────────────────────────────────────────────────
head('3. Table Existence  (18 tables expected)');

$expectedTables = [
    'users','orders','companies','documents','notifications','payments',
    'blogs','countries_seo_pages','invitations','contact_messages',
    'admin_audit_log','pages','services','order_updates',
    'notification_preferences','pricing_config','workspaces','workspace_members',
];

$existing = $pdo->query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()"
)->fetchAll(PDO::FETCH_COLUMN);

foreach ($expectedTables as $tbl) {
    chk(in_array($tbl, $existing), "Table `{$tbl}` exists", "Table `{$tbl}` MISSING");
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Critical columns
// ─────────────────────────────────────────────────────────────────────────────
head('4. Critical Column Checks');

$columnMap = [
    'users'                  => ['id','email','password_hash','name','display_name','role','verified','avatar_url','created','updated'],
    'orders'                 => ['id','user','order_number','package_name','status','amount','stripe_session_id','stripe_payment_intent_id','created'],
    'companies'              => ['id','user','order','company_name','company_type','state','ein_number','status','created'],
    'documents'              => ['id','user','order','company','name','doc_type','file_url','file_name','status'],
    'payments'               => ['id','user','order','amount','status','stripe_payment_id','stripe_session_id','stripe_payment_intent_id'],
    'blogs'                  => ['id','title','slug','content','published','featured','title_ar','slug_ar','content_ar'],
    'services'               => ['id','title_en','title_ar','price','active','sort_order','stripe_product_id','stripe_price_id'],
    'invitations'            => ['id','email','role','invited_by','status','expires_at'],
    'notifications'          => ['id','user','type','title','message','read'],
    'workspaces'             => ['id','name','owner','created'],
    'workspace_members'      => ['id','workspace','user','role'],
    'notification_preferences'=> ['id','user','email_notifications','order_updates'],
];

foreach ($columnMap as $tbl => $cols) {
    $actualCols = $pdo->query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{$tbl}'"
    )->fetchAll(PDO::FETCH_COLUMN);

    foreach ($cols as $col) {
        chk(in_array($col, $actualCols),
            "`{$tbl}`.`{$col}`",
            "`{$tbl}`.`{$col}` MISSING"
        );
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CRUD smoke test
// ─────────────────────────────────────────────────────────────────────────────
head('5. CRUD Smoke Test');

$uid   = 'T_' . bin2hex(random_bytes(6));
$now   = date('Y-m-d H:i:s');
$email = "test+{$uid}@example.com";

// INSERT
try {
    $pdo->prepare(
        "INSERT INTO `users` (id,email,name,role,verified,created,updated) VALUES (?,?,?,'client',0,?,?)"
    )->execute([$uid, $email, 'Migration Test', $now, $now]);
    ok("INSERT user");
    $pass++;
} catch (PDOException $e) {
    fail("INSERT user failed: " . $e->getMessage());
    $fail++;
}

// SELECT
$stmt = $pdo->prepare("SELECT id, email, role FROM `users` WHERE id = ?");
$stmt->execute([$uid]);
$row = $stmt->fetch();
chk(
    $row && $row['id'] === $uid && $row['email'] === $email,
    "SELECT user — correct row returned",
    "SELECT user — wrong or no row returned"
);

// UPDATE
try {
    $pdo->prepare("UPDATE `users` SET name=?, updated=? WHERE id=?")->execute(['Updated', date('Y-m-d H:i:s'), $uid]);
    $stmt2 = $pdo->prepare("SELECT name FROM `users` WHERE id=?");
    $stmt2->execute([$uid]);
    chk($stmt2->fetchColumn() === 'Updated', "UPDATE user persisted", "UPDATE user did not persist");
} catch (PDOException $e) {
    fail("UPDATE user failed: " . $e->getMessage());
    $fail++;
}

// INSERT order
$oid = 'O_' . bin2hex(random_bytes(6));
try {
    $pdo->prepare(
        "INSERT INTO `orders` (id,user,order_number,status,amount,currency,created,updated) VALUES (?,?,?,'pending',199.00,'USD',?,?)"
    )->execute([$oid, $uid, 'TEST-001', $now, $now]);
    ok("INSERT order");
    $pass++;
} catch (PDOException $e) {
    fail("INSERT order failed: " . $e->getMessage());
    $fail++;
}

// INSERT notification
$nid = 'N_' . bin2hex(random_bytes(6));
try {
    $pdo->prepare(
        "INSERT INTO `notifications` (id,user,type,title,message,`read`,created,updated) VALUES (?,?,'info','Test','Migration test',0,?,?)"
    )->execute([$nid, $uid, $now, $now]);
    ok("INSERT notification");
    $pass++;
} catch (PDOException $e) {
    fail("INSERT notification failed: " . $e->getMessage());
    $fail++;
}

// ── Unique email constraint (test BEFORE cleanup so original row still exists) ──
head('6. Unique Email Constraint');
$uid2 = 'T_' . bin2hex(random_bytes(6));
try {
    $pdo->prepare("INSERT INTO `users` (id,email,name,role,verified,created,updated) VALUES (?,?,?,'client',0,?,?)")
        ->execute([$uid2, $email, 'Duplicate', $now, $now]);
    // If we reach here, MySQL allowed a duplicate email — constraint is broken
    fail("Duplicate email was ALLOWED (unique constraint missing or not enforced)");
    $fail++;
    $pdo->prepare("DELETE FROM `users` WHERE id=?")->execute([$uid2]);
} catch (PDOException $e) {
    if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), '1062')) {
        ok("Unique email constraint enforced — duplicate correctly rejected (errno 1062)");
        $pass++;
    } else {
        warn("Unexpected error testing unique constraint: " . $e->getMessage());
    }
}

// DELETE (cleanup — runs AFTER unique constraint test)
try {
    $pdo->prepare("DELETE FROM `notifications` WHERE id=?")->execute([$nid]);
    $pdo->prepare("DELETE FROM `orders`        WHERE id=?")->execute([$oid]);
    $pdo->prepare("DELETE FROM `users`         WHERE id=?")->execute([$uid]);
    ok("Cleanup — all test records deleted");
    $pass++;
} catch (PDOException $e) {
    warn("Cleanup error (may need manual delete): " . $e->getMessage());
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Charset / collation
// ─────────────────────────────────────────────────────────────────────────────
head('7. Charset & Collation');

$rows  = $pdo->query(
    "SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()"
)->fetchAll();

$badCollation = [];
foreach ($rows as $r) {
    if ($r['TABLE_COLLATION'] !== 'utf8mb4_unicode_ci') {
        $badCollation[] = $r['TABLE_NAME'] . ' (' . $r['TABLE_COLLATION'] . ')';
    }
}
chk(count($badCollation) === 0,
    "All tables use utf8mb4_unicode_ci",
    "Wrong collation: " . implode(', ', $badCollation)
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. Primary keys & unique indexes
// ─────────────────────────────────────────────────────────────────────────────
head('8. Primary Keys & Indexes');

$withPK = $pdo->query(
    "SELECT TABLE_NAME FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA=DATABASE() AND CONSTRAINT_TYPE='PRIMARY KEY'"
)->fetchAll(PDO::FETCH_COLUMN);

$missingPK = array_diff($expectedTables, $withPK);
chk(count($missingPK) === 0,
    "All 18 tables have a PRIMARY KEY",
    "Missing PRIMARY KEY: " . implode(', ', $missingPK)
);

$uqEmail = (int)$pdo->query(
    "SELECT COUNT(*) FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND INDEX_NAME='uq_users_email' AND NON_UNIQUE=0"
)->fetchColumn();
chk($uqEmail > 0, "UNIQUE index `uq_users_email` exists", "UNIQUE index `uq_users_email` MISSING");

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
$total = $pass + $fail;
echo PHP_EOL . str_repeat('─', 56) . PHP_EOL;
if ($fail === 0) {
    echo c('1;32', "  ALL {$total} CHECKS PASSED ✔  Migration looks good!") . PHP_EOL;
} else {
    echo c('1;32', "  PASSED: {$pass}/{$total}") . "   " . c('1;31', "FAILED: {$fail}/{$total}") . PHP_EOL;
}
echo str_repeat('─', 56) . PHP_EOL . PHP_EOL;

exit($fail > 0 ? 1 : 0);
