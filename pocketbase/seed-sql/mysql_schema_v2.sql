-- ============================================================
-- Instant Grow LLC - MySQL Schema v2 (PHP API Compatible)
-- ⚠️  Run this in Hostinger phpMyAdmin to fix all 4 migration issues:
--     1. Admin login broken   → users table had wrong column names
--     2. Google login broken  → avatar_url / password_hash missing
--     3. No blogs             → services sort bug (fixed in PHP)
--     4. No services          → services sort bug (fixed in PHP)
--
-- HOW TO USE:
--   Option A (fresh install): Run this full file in phpMyAdmin SQL tab
--   Option B (fix existing):  Run only the ALTER TABLE section at bottom
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── users ──────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`                        VARCHAR(50)   NOT NULL,
  `email`                     VARCHAR(255)  DEFAULT NULL,
  `password_hash`             TEXT          DEFAULT NULL,
  `name`                      TEXT          DEFAULT NULL,
  `display_name`              TEXT          DEFAULT NULL,
  `role`                      VARCHAR(20)   DEFAULT 'client',
  `verified`                  TINYINT(1)    DEFAULT 0,
  `phone`                     TEXT          DEFAULT NULL,
  `country`                   TEXT          DEFAULT NULL,
  `address`                   LONGTEXT,
  `avatar_url`                TEXT          DEFAULT NULL,
  `metadata`                  LONGTEXT,
  `last_sign_in`              DATETIME(3)   DEFAULT NULL,
  `verification_token`        TEXT          DEFAULT NULL,
  `verification_token_expiry` DATETIME(3)   DEFAULT NULL,
  `reset_token`               TEXT          DEFAULT NULL,
  `reset_token_expiry`        DATETIME(3)   DEFAULT NULL,
  `created`                   DATETIME(3)   DEFAULT NULL,
  `updated`                   DATETIME(3)   DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── orders ─────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id`                        VARCHAR(50)   NOT NULL,
  `user`                      VARCHAR(50)   DEFAULT NULL,
  `order_number`              TEXT          DEFAULT NULL,
  `package_name`              TEXT          DEFAULT NULL,
  `company_name`              TEXT          DEFAULT NULL,
  `company_state`             TEXT          DEFAULT NULL,
  `company_type`              TEXT          DEFAULT NULL,
  `status`                    VARCHAR(50)   DEFAULT 'pending',
  `amount`                    DECIMAL(10,2) DEFAULT 0.00,
  `currency`                  VARCHAR(10)   DEFAULT 'USD',
  `notes`                     LONGTEXT,
  `customer_name`             TEXT          DEFAULT NULL,
  `customer_email`            TEXT          DEFAULT NULL,
  `customer_phone`            TEXT          DEFAULT NULL,
  `customer_country`          TEXT          DEFAULT NULL,
  `customer_address`          LONGTEXT,
  `business_activity`         LONGTEXT,
  `stripe_session_id`         TEXT          DEFAULT NULL,
  `stripe_payment_intent_id`  TEXT          DEFAULT NULL,
  `stripe_charge_id`          TEXT          DEFAULT NULL,
  `created`                   DATETIME(3)   DEFAULT NULL,
  `updated`                   DATETIME(3)   DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── companies ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id`                            VARCHAR(50) NOT NULL,
  `user`                          TEXT        DEFAULT NULL,
  `order`                         TEXT        DEFAULT NULL,
  `company_name`                  TEXT        DEFAULT NULL,
  `company_type`                  TEXT        DEFAULT NULL,
  `state`                         TEXT        DEFAULT NULL,
  `ein_number`                    TEXT        DEFAULT NULL,
  `formation_date`                DATETIME(3) DEFAULT NULL,
  `registered_agent`              TEXT        DEFAULT NULL,
  `renewal_due_date`              DATETIME(3) DEFAULT NULL,
  `annual_report_due_date`        DATETIME(3) DEFAULT NULL,
  `tax_filing_due_date`           DATETIME(3) DEFAULT NULL,
  `registered_agent_renewal_date` DATETIME(3) DEFAULT NULL,
  `compliance_status`             TEXT        DEFAULT NULL,
  `compliance_notes`              LONGTEXT,
  `status`                        TEXT        DEFAULT NULL,
  `created`                       DATETIME(3) DEFAULT NULL,
  `updated`                       DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── documents ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents` (
  `id`        VARCHAR(50) NOT NULL,
  `user`      TEXT        DEFAULT NULL,
  `order`     TEXT        DEFAULT NULL,
  `company`   TEXT        DEFAULT NULL,
  `name`      TEXT        DEFAULT NULL,
  `doc_type`  TEXT        DEFAULT NULL,
  `file_url`  TEXT        DEFAULT NULL,
  `file_name` TEXT        DEFAULT NULL,
  `status`    TEXT        DEFAULT NULL,
  `notes`     LONGTEXT,
  `file`      TEXT        DEFAULT NULL,
  `created`   DATETIME(3) DEFAULT NULL,
  `updated`   DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── notifications ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id`      VARCHAR(50) NOT NULL,
  `user`    TEXT        DEFAULT NULL,
  `type`    TEXT        DEFAULT NULL,
  `title`   TEXT        DEFAULT NULL,
  `message` LONGTEXT,
  `data`    LONGTEXT,
  `link`    TEXT        DEFAULT NULL,
  `read`    TINYINT(1)  DEFAULT 0,
  `created` DATETIME(3) DEFAULT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── payments ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id`                        VARCHAR(50)   NOT NULL,
  `user`                      TEXT          DEFAULT NULL,
  `order`                     TEXT          DEFAULT NULL,
  `service`                   TEXT          DEFAULT NULL,
  `invoice_id`                TEXT          DEFAULT NULL,
  `amount`                    DECIMAL(10,2) DEFAULT 0.00,
  `currency`                  TEXT          DEFAULT NULL,
  `status`                    TEXT          DEFAULT NULL,
  `stripe_payment_id`         TEXT          DEFAULT NULL,
  `stripe_session_id`         TEXT          DEFAULT NULL,
  `stripe_payment_intent_id`  TEXT          DEFAULT NULL,
  `stripe_charge_id`          TEXT          DEFAULT NULL,
  `stripe_customer_id`        TEXT          DEFAULT NULL,
  `stripe_invoice_id`         TEXT          DEFAULT NULL,
  `stripe_price_id`           TEXT          DEFAULT NULL,
  `stripe_product_id`         TEXT          DEFAULT NULL,
  `customer_name`             TEXT          DEFAULT NULL,
  `customer_email`            TEXT          DEFAULT NULL,
  `company_name`              TEXT          DEFAULT NULL,
  `customer_country`          TEXT          DEFAULT NULL,
  `invoice_url`               TEXT          DEFAULT NULL,
  `receipt_url`               TEXT          DEFAULT NULL,
  `notes`                     LONGTEXT,
  `created`                   DATETIME(3)   DEFAULT NULL,
  `updated`                   DATETIME(3)   DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── blogs ──────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `blogs`;
CREATE TABLE `blogs` (
  `id`          VARCHAR(50) NOT NULL,
  `title`       TEXT        DEFAULT NULL,
  `slug`        TEXT        DEFAULT NULL,
  `excerpt`     TEXT        DEFAULT NULL,
  `content`     LONGTEXT,
  `cover_image` TEXT        DEFAULT NULL,
  `author`      TEXT        DEFAULT NULL,
  `tags`        LONGTEXT,
  `published`   TINYINT(1)  DEFAULT 0,
  `featured`    TINYINT(1)  DEFAULT 0,
  `language`    TEXT        DEFAULT NULL,
  `title_ar`    TEXT        DEFAULT NULL,
  `slug_ar`     TEXT        DEFAULT NULL,
  `excerpt_ar`  TEXT        DEFAULT NULL,
  `content_ar`  LONGTEXT,
  `created_by`  TEXT        DEFAULT NULL,
  `created`     DATETIME(3) DEFAULT NULL,
  `updated`     DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── countries_seo_pages ────────────────────────────────────────────────────
DROP TABLE IF EXISTS `countries_seo_pages`;
CREATE TABLE `countries_seo_pages` (
  `id`                 VARCHAR(50) NOT NULL,
  `slug`               TEXT        DEFAULT NULL,
  `country_name`       TEXT        DEFAULT NULL,
  `country_code`       TEXT        DEFAULT NULL,
  `meta_title`         TEXT        DEFAULT NULL,
  `meta_description`   LONGTEXT,
  `hero_title`         TEXT        DEFAULT NULL,
  `hero_description`   LONGTEXT,
  `main_keyword`       TEXT        DEFAULT NULL,
  `secondary_keywords` LONGTEXT,
  `pain_points`        LONGTEXT,
  `benefits`           LONGTEXT,
  `best_bank`          TEXT        DEFAULT NULL,
  `bank_notes`         LONGTEXT,
  `tax_notes`          LONGTEXT,
  `faq_json`           LONGTEXT,
  `cta_text`           TEXT        DEFAULT NULL,
  `featured_image`     TEXT        DEFAULT NULL,
  `schema_json`        LONGTEXT,
  `published`          TINYINT(1)  DEFAULT 0,
  `created_by`         TEXT        DEFAULT NULL,
  `created`            DATETIME(3) DEFAULT NULL,
  `updated`            DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── invitations ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations` (
  `id`           VARCHAR(50) NOT NULL,
  `email`        TEXT        DEFAULT NULL,
  `company_name` TEXT        DEFAULT NULL,
  `role`         TEXT        DEFAULT NULL,
  `invited_by`   TEXT        DEFAULT NULL,
  `status`       TEXT        DEFAULT NULL,
  `expires_at`   DATETIME(3) DEFAULT NULL,
  `accepted`     TEXT        DEFAULT NULL,
  `created`      DATETIME(3) DEFAULT NULL,
  `updated`      DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── contact_messages ───────────────────────────────────────────────────────
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `id`      VARCHAR(50) NOT NULL,
  `name`    TEXT        DEFAULT NULL,
  `email`   TEXT        DEFAULT NULL,
  `subject` TEXT        DEFAULT NULL,
  `message` LONGTEXT,
  `created` DATETIME(3) DEFAULT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── admin_audit_log ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `admin_audit_log`;
CREATE TABLE `admin_audit_log` (
  `id`         VARCHAR(50) NOT NULL,
  `admin`      TEXT        DEFAULT NULL,
  `action`     TEXT        DEFAULT NULL,
  `table_name` TEXT        DEFAULT NULL,
  `record_id`  TEXT        DEFAULT NULL,
  `details`    LONGTEXT,
  `created`    DATETIME(3) DEFAULT NULL,
  `updated`    DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── pages ──────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `pages`;
CREATE TABLE `pages` (
  `id`         VARCHAR(50) NOT NULL,
  `slug`       TEXT        DEFAULT NULL,
  `title_en`   TEXT        DEFAULT NULL,
  `title_ar`   TEXT        DEFAULT NULL,
  `content_en` TEXT        DEFAULT NULL,
  `content_ar` LONGTEXT,
  `active`     TINYINT(1)  DEFAULT 0,
  `created`    DATETIME(3) DEFAULT NULL,
  `updated`    DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── services ───────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id`                VARCHAR(50)   NOT NULL,
  `title_en`          TEXT          DEFAULT NULL,
  `title_ar`          TEXT          DEFAULT NULL,
  `description_en`    LONGTEXT,
  `description_ar`    LONGTEXT,
  `price`             DECIMAL(10,2) DEFAULT 0.00,
  `period_en`         TEXT          DEFAULT NULL,
  `period_ar`         TEXT          DEFAULT NULL,
  `detail_en`         TEXT          DEFAULT NULL,
  `detail_ar`         TEXT          DEFAULT NULL,
  `badge_en`          TEXT          DEFAULT NULL,
  `badge_ar`          TEXT          DEFAULT NULL,
  `requires_company`  TINYINT(1)    DEFAULT 0,
  `icon`              TEXT          DEFAULT NULL,
  `active`            TINYINT(1)    DEFAULT 0,
  `sort_order`        INT           DEFAULT 10,
  `type`              TEXT          DEFAULT NULL,
  `color`             TEXT          DEFAULT NULL,
  `bg_color`          TEXT          DEFAULT NULL,
  `href`              TEXT          DEFAULT NULL,
  `category`          TEXT          DEFAULT NULL,
  `stripe_product_id` TEXT          DEFAULT NULL,
  `stripe_price_id`   TEXT          DEFAULT NULL,
  `features`          LONGTEXT,
  `benefits`          LONGTEXT,
  `process_steps`     LONGTEXT,
  `faq`               LONGTEXT,
  `testimonials`      LONGTEXT,
  `created`           DATETIME(3)   DEFAULT NULL,
  `updated`           DATETIME(3)   DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── order_updates ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `order_updates`;
CREATE TABLE `order_updates` (
  `id`         VARCHAR(50) NOT NULL,
  `order_id`   TEXT        DEFAULT NULL,
  `created_by` TEXT        DEFAULT NULL,
  `message`    LONGTEXT,
  `status`     TEXT        DEFAULT NULL,
  `created`    DATETIME(3) DEFAULT NULL,
  `updated`    DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── notification_preferences ───────────────────────────────────────────────
DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE `notification_preferences` (
  `id`                   VARCHAR(50) NOT NULL,
  `user`                 TEXT        DEFAULT NULL,
  `role`                 TEXT        DEFAULT NULL,
  `email_notifications`  TINYINT(1)  DEFAULT 1,
  `order_updates`        TINYINT(1)  DEFAULT 1,
  `marketing_emails`     TINYINT(1)  DEFAULT 0,
  `email_enabled`        TEXT        DEFAULT NULL,
  `document_ready`       TEXT        DEFAULT NULL,
  `document_updates`     TEXT        DEFAULT NULL,
  `order_placed`         TEXT        DEFAULT NULL,
  `order_status_changed` TEXT        DEFAULT NULL,
  `payment_received`     TEXT        DEFAULT NULL,
  `payment_updates`      TEXT        DEFAULT NULL,
  `weekly_summary`       TEXT        DEFAULT NULL,
  `admin_new_order`      TEXT        DEFAULT NULL,
  `admin_payment_failed` TEXT        DEFAULT NULL,
  `admin_status_changed` TEXT        DEFAULT NULL,
  `created`              DATETIME(3) DEFAULT NULL,
  `updated`              DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── pricing_config ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `pricing_config`;
CREATE TABLE `pricing_config` (
  `id`          VARCHAR(50) NOT NULL,
  `region`      VARCHAR(50) NOT NULL,
  `plan`        VARCHAR(50) NOT NULL,
  `price`       DECIMAL(10,2) DEFAULT 0.00,
  `features_en` LONGTEXT,
  `features_ar` LONGTEXT,
  `created`     DATETIME(3) DEFAULT NULL,
  `updated`     DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ── workspaces ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `workspace_members`;
DROP TABLE IF EXISTS `workspaces`;
CREATE TABLE `workspaces` (
  `id`          VARCHAR(50) NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `owner`       VARCHAR(50) NOT NULL,
  `created`     DATETIME(3) DEFAULT NULL,
  `updated`     DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_workspace_owner` (`owner`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── workspace_members ──────────────────────────────────────────────────────
CREATE TABLE `workspace_members` (
  `id`          VARCHAR(50) NOT NULL,
  `workspace`   VARCHAR(50) NOT NULL,
  `user`        VARCHAR(50) NOT NULL,
  `role`        ENUM('admin','member','viewer') NOT NULL DEFAULT 'member',
  `created`     DATETIME(3) DEFAULT NULL,
  `updated`     DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ws_user` (`workspace`, `user`),
  KEY `idx_wm_workspace` (`workspace`),
  KEY `idx_wm_user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
