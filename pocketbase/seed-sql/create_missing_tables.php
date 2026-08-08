<?php
$pdo = new PDO('mysql:host=127.0.0.1;dbname=u238131962_instantgrowllc;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

$stmts = [
    "CREATE TABLE IF NOT EXISTS `site_content` (
      `id`       VARCHAR(50) NOT NULL,
      `key`      VARCHAR(255) NOT NULL,
      `value_en` LONGTEXT,
      `value_ar` LONGTEXT,
      `created`  DATETIME(3) DEFAULT NULL,
      `updated`  DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `uq_site_content_key` (`key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS `tracking_integrations` (
      `id`                 VARCHAR(50) NOT NULL,
      `provider`           VARCHAR(100) DEFAULT NULL,
      `name`               TEXT DEFAULT NULL,
      `category`           VARCHAR(100) DEFAULT NULL,
      `status`             VARCHAR(50) DEFAULT 'inactive',
      `enabled`            TINYINT(1) DEFAULT 0,
      `config`             LONGTEXT,
      `lastSync`           DATETIME(3) DEFAULT NULL,
      `verificationStatus` VARCHAR(50) DEFAULT NULL,
      `created`            DATETIME(3) DEFAULT NULL,
      `updated`            DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS `tracking_events` (
      `id`       VARCHAR(50) NOT NULL,
      `name`     VARCHAR(255) DEFAULT NULL,
      `category` VARCHAR(100) DEFAULT NULL,
      `trigger`  TEXT DEFAULT NULL,
      `selector` TEXT DEFAULT NULL,
      `platform` VARCHAR(100) DEFAULT NULL,
      `enabled`  TINYINT(1) DEFAULT 1,
      `value`    DECIMAL(10,2) DEFAULT NULL,
      `currency` VARCHAR(10) DEFAULT NULL,
      `created`  DATETIME(3) DEFAULT NULL,
      `updated`  DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS `tracking_domains` (
      `id`         VARCHAR(50) NOT NULL,
      `domain`     VARCHAR(255) DEFAULT NULL,
      `isPrimary`  TINYINT(1) DEFAULT 0,
      `trackingId` VARCHAR(255) DEFAULT NULL,
      `status`     VARCHAR(50) DEFAULT 'active',
      `created`    DATETIME(3) DEFAULT NULL,
      `updated`    DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS `tracking_consent` (
      `id`               VARCHAR(50) NOT NULL,
      `enabled`          TINYINT(1) DEFAULT 1,
      `bannerTitle`      TEXT DEFAULT NULL,
      `bannerMessage`    LONGTEXT,
      `acceptAllText`    TEXT DEFAULT NULL,
      `rejectAllText`    TEXT DEFAULT NULL,
      `preferencesText`  TEXT DEFAULT NULL,
      `gdprEnabled`      TINYINT(1) DEFAULT 1,
      `ccpaEnabled`      TINYINT(1) DEFAULT 0,
      `consentModeV2`    TINYINT(1) DEFAULT 0,
      `defaultAnalytics` TINYINT(1) DEFAULT 0,
      `defaultMarketing` TINYINT(1) DEFAULT 0,
      `created`          DATETIME(3) DEFAULT NULL,
      `updated`          DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS `tracking_custom_events` (
      `id`           VARCHAR(50) NOT NULL,
      `event_name`   VARCHAR(255) DEFAULT NULL,
      `trigger_type` VARCHAR(100) DEFAULT NULL,
      `platform`     VARCHAR(100) DEFAULT NULL,
      `enabled`      TINYINT(1) DEFAULT 1,
      `rules_json`   LONGTEXT,
      `created`      DATETIME(3) DEFAULT NULL,
      `updated`      DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    "CREATE TABLE IF NOT EXISTS `tracking_logs` (
      `id`         VARCHAR(50) NOT NULL,
      `event_name` VARCHAR(255) DEFAULT NULL,
      `provider`   VARCHAR(100) DEFAULT NULL,
      `user`       VARCHAR(50) DEFAULT NULL,
      `domain`     VARCHAR(255) DEFAULT NULL,
      `payload`    LONGTEXT,
      `status`     VARCHAR(50) DEFAULT 'success',
      `created`    DATETIME(3) DEFAULT NULL,
      `updated`    DATETIME(3) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    // Fix order_updates: add `order` column if missing
    "ALTER TABLE `order_updates` ADD COLUMN IF NOT EXISTS `order` TEXT DEFAULT NULL AFTER `id`",
];

$ok = 0; $errors = 0;
foreach ($stmts as $sql) {
    try {
        $pdo->exec($sql);
        echo "[OK] " . trim(substr(preg_replace('/\s+/', ' ', $sql), 0, 60)) . "...\n";
        $ok++;
    } catch (PDOException $e) {
        echo "[ERR] " . $e->getMessage() . "\n";
        $errors++;
    }
}

$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
echo "\nTotal tables: " . count($tables) . "\n";
echo implode(', ', $tables) . "\n";
echo "\nExecuted: $ok, Errors: $errors\n";
