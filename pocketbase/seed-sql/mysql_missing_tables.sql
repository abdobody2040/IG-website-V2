-- ============================================================
-- Missing tables for Instant Grow LLC local dev
-- Run ONCE after mysql_schema_v2.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── site_content ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_content` (
  `id`       VARCHAR(50) NOT NULL,
  `key`      VARCHAR(255) NOT NULL,
  `value_en` LONGTEXT,
  `value_ar` LONGTEXT,
  `created`  DATETIME(3) DEFAULT NULL,
  `updated`  DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_site_content_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── tracking_integrations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_integrations` (
  `id`                 VARCHAR(50) NOT NULL,
  `provider`           VARCHAR(100) DEFAULT NULL,
  `name`               TEXT DEFAULT NULL,
  `category`           VARCHAR(100) DEFAULT NULL,
  `status`             VARCHAR(50)  DEFAULT 'inactive',
  `enabled`            TINYINT(1)   DEFAULT 0,
  `config`             LONGTEXT,
  `lastSync`           DATETIME(3)  DEFAULT NULL,
  `verificationStatus` VARCHAR(50)  DEFAULT NULL,
  `created`            DATETIME(3)  DEFAULT NULL,
  `updated`            DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── tracking_events ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_events` (
  `id`       VARCHAR(50) NOT NULL,
  `name`     VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `trigger`  TEXT         DEFAULT NULL,
  `selector` TEXT         DEFAULT NULL,
  `platform` VARCHAR(100) DEFAULT NULL,
  `enabled`  TINYINT(1)   DEFAULT 1,
  `value`    DECIMAL(10,2) DEFAULT NULL,
  `currency` VARCHAR(10)  DEFAULT NULL,
  `created`  DATETIME(3)  DEFAULT NULL,
  `updated`  DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── tracking_domains ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_domains` (
  `id`         VARCHAR(50) NOT NULL,
  `domain`     VARCHAR(255) DEFAULT NULL,
  `isPrimary`  TINYINT(1)   DEFAULT 0,
  `trackingId` VARCHAR(255) DEFAULT NULL,
  `status`     VARCHAR(50)  DEFAULT 'active',
  `created`    DATETIME(3)  DEFAULT NULL,
  `updated`    DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── tracking_consent ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_consent` (
  `id`               VARCHAR(50)  NOT NULL,
  `enabled`          TINYINT(1)   DEFAULT 1,
  `bannerTitle`      TEXT         DEFAULT NULL,
  `bannerMessage`    LONGTEXT,
  `acceptAllText`    TEXT         DEFAULT NULL,
  `rejectAllText`    TEXT         DEFAULT NULL,
  `preferencesText`  TEXT         DEFAULT NULL,
  `gdprEnabled`      TINYINT(1)   DEFAULT 1,
  `ccpaEnabled`      TINYINT(1)   DEFAULT 0,
  `consentModeV2`    TINYINT(1)   DEFAULT 0,
  `defaultAnalytics` TINYINT(1)   DEFAULT 0,
  `defaultMarketing` TINYINT(1)   DEFAULT 0,
  `created`          DATETIME(3)  DEFAULT NULL,
  `updated`          DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── tracking_custom_events ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_custom_events` (
  `id`           VARCHAR(50) NOT NULL,
  `event_name`   VARCHAR(255) DEFAULT NULL,
  `trigger_type` VARCHAR(100) DEFAULT NULL,
  `platform`     VARCHAR(100) DEFAULT NULL,
  `enabled`      TINYINT(1)   DEFAULT 1,
  `rules_json`   LONGTEXT,
  `created`      DATETIME(3)  DEFAULT NULL,
  `updated`      DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── tracking_logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_logs` (
  `id`         VARCHAR(50) NOT NULL,
  `event_name` VARCHAR(255) DEFAULT NULL,
  `provider`   VARCHAR(100) DEFAULT NULL,
  `user`       VARCHAR(50)  DEFAULT NULL,
  `domain`     VARCHAR(255) DEFAULT NULL,
  `payload`    LONGTEXT,
  `status`     VARCHAR(50)  DEFAULT 'success',
  `created`    DATETIME(3)  DEFAULT NULL,
  `updated`    DATETIME(3)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Fix order_updates: add `order` column if using old schema with order_id ─
ALTER TABLE `order_updates` 
  ADD COLUMN IF NOT EXISTS `order` TEXT DEFAULT NULL AFTER `id`;

SET FOREIGN_KEY_CHECKS = 1;
