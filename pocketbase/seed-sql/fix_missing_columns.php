<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=u238131962_instantgrowllc;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$fixes = [
    // contact_messages: add missing columns
    "ALTER TABLE `contact_messages` ADD COLUMN IF NOT EXISTS `phone` TEXT DEFAULT NULL AFTER `email`",
    "ALTER TABLE `contact_messages` ADD COLUMN IF NOT EXISTS `country` TEXT DEFAULT NULL AFTER `phone`",
    "ALTER TABLE `contact_messages` ADD COLUMN IF NOT EXISTS `service_interest` TEXT DEFAULT NULL AFTER `country`",
    "ALTER TABLE `contact_messages` ADD COLUMN IF NOT EXISTS `status` VARCHAR(50) DEFAULT 'new' AFTER `message`",

    // invitations: add token column (currently missing)
    "ALTER TABLE `invitations` ADD COLUMN IF NOT EXISTS `token` TEXT DEFAULT NULL AFTER `invited_by`",

    // order_updates: make sure `order` column exists (some schemas use order_id)
    "ALTER TABLE `order_updates` ADD COLUMN IF NOT EXISTS `order` TEXT DEFAULT NULL AFTER `id`",
];

foreach ($fixes as $sql) {
    try {
        $pdo->exec($sql);
        echo "[OK] " . substr(trim($sql), 0, 80) . "\n";
    } catch (PDOException $e) {
        echo "[ERR] " . $e->getMessage() . "\n  SQL: " . substr($sql, 0, 80) . "\n";
    }
}
echo "\nDone. Re-run test-admin-crud.php to verify all 81 pass.\n";
