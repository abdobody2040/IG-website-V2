-- ============================================================
-- INSTANT GROW LLC — MASTER SEED FILE v2 (COMPLETE)
-- Generated: 2026-08-08 17:58
-- ============================================================
-- USAGE: Run this SINGLE file in Hostinger phpMyAdmin:
--   Database: u238131962_instantgrowllc → SQL tab → Paste & Go
--
-- WHAT IS INCLUDED:
--   SECTION 1: All 25 database tables (schema DDL)
--   SECTION 2: Pricing Config  — 8 rows (US/UK/UAE/Oman × Basic/Premium)
--   SECTION 3: Services        — 132 services (all categories)
--   SECTION 4: Blog Posts      — 10 articles (EN + AR)
--   SECTION 5: SEO Country Pages — Egypt, Saudi Arabia, UAE, Morocco, Jordan
--   SECTION 6: Tracking Tables (DDL only — 7 additional tables)
--   SECTION 7: Admin user setup (read instructions below)
--
-- Uses REPLACE INTO — safe to re-run without creating duplicates.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;


-- ============================================================
-- SECTION 1: DATABASE SCHEMA (25 tables)
-- ============================================================

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

-- ============================================================
-- SECTION 2: ADDITIONAL TABLES (tracking, site_content)
-- ============================================================



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


-- ============================================================
-- SECTION 3: PRICING CONFIG (8 rows — US/UK/UAE/Oman × Basic/Premium)
-- ============================================================


REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricusbasic001', 'us', 'basic', 297,
 '["Wyoming LLC formation","Registered Agent first year","EIN (US Tax ID from IRS)","All formation documents","BOI report filing (free)","US mailing address","Stripe bank account guidance","Email support"]',
 '["تأسيس Wyoming LLC","Registered Agent - أول سنة","EIN رقم ضريبي أمريكي","جميع مستندات التأسيس","BOI report filing مجاني","عنوان بريدي أمريكي","إرشاد فتح حساب بنكي Stripe","دعم عبر البريد الإلكتروني"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricusprem001', 'us', 'premium', 597,
 '["Everything in Basic","Priority / fast processing","Virtual US phone number","Custom Operating Agreement","Full Mercury/Relay account setup","Stripe activation assistance","WhatsApp + phone support","30-min onboarding call","Login credentials handover doc"]',
 '["كل ما في الأساسية","معالجة أولوية سريعة","رقم هاتف أمريكي افتراضي","عقد تشغيل مخصص","إعداد كامل لحساب Mercury/Relay","مساعدة تفعيل Stripe","دعم واتساب وهاتف","مكالمة تأهيلية 30 دقيقة","مستند تسليم بيانات الدخول الكامل"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricukbasic001', 'uk', 'basic', 249,
 '["UK LTD (Companies House)","Registered office first year","Certificate of Incorporation","All company documents","Wise business account referral","Stripe UK setup guidance","Email support"]',
 '["تأسيس UK LTD","عنوان مكتب مسجل - أول سنة","شهادة التأسيس","جميع مستندات الشركة","إحالة حساب Wise للأعمال","إرشاد إعداد Stripe UK","دعم عبر البريد الإلكتروني"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricukprem001', 'uk', 'premium', 497,
 '["Everything in Basic","Director service address (privacy)","Virtual UK phone number","First Confirmation Statement","Full Wise account setup","Stripe UK activation assistance","WhatsApp + phone support","30-min onboarding call","Login credentials handover doc"]',
 '["كل ما في الأساسية","عنوان خدمة للمدير","رقم هاتف بريطاني افتراضي","تقديم أول Confirmation Statement","إعداد كامل لحساب Wise","مساعدة تفعيل Stripe UK","دعم واتساب وهاتف","مكالمة تأهيلية 30 دقيقة","مستند تسليم بيانات الدخول الكامل"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricuaebasic01', 'uae', 'basic', 999,
 '["UAE Freezone company formation","Business license for 1 year","Virtual office address","Pre-approval & name reservation","Wise business bank guidance","Email support"]',
 '["تأسيس شركة في المنطقة الحرة للإمارات","رخصة تجارية لمدة سنة","عنوان مكتب افتراضي","الموافقة المسبقة وحجز الاسم","إرشاد فتح حساب Wise للأعمال","دعم عبر البريد الإلكتروني"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricuaeprem001', 'uae', 'premium', 2499,
 '["Everything in Basic","Mainland or premium Freezone company","Investor visa & residency assistance","Corporate bank account opening assistance","Physical address / desk lease (1 year)","PRO services support","WhatsApp + phone support","30-min onboarding call"]',
 '["كل ما في الأساسية","شركة في البر الرئيسي أو منطقة حرة مميزة","المساعدة في تأشيرة المستثمر والإقامة","مساعدة في فتح حساب بنكي تجاري","عنوان فعلي / عقد إيجار مكتب سنة","دعم خدمات العلاقات العامة PRO","دعم واتساب وهاتف","مكالمة تأهيلية 30 دقيقة"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricamente0001', 'oman', 'basic', 1499,
 '["Oman SPC (Single Person Company)","Commercial Register (CR) & tax card","Chamber of Commerce registration","Registered office address - 1 year","Bank account application guidance","Email support"]',
 '["تأسيس شركة الشخص الواحد في عُمان (SPC)","السجل التجاري (CR) والبطاقة الضريبية","التسجيل في غرفة التجارة والصناعة","عنوان مكتب مسجل لمدة سنة","إرشاد تقديم طلب الحساب البنكي","دعم عبر البريد الإلكتروني"]',
 NOW(3), NOW(3));

REPLACE INTO `pricing_config` (`id`, `region`, `plan`, `price`, `features_en`, `features_ar`, `created`, `updated`) VALUES
('pricomenprem01', 'oman', 'premium', 2999,
 '["Everything in Basic","Oman LLC (multiple shareholders)","Investor visa & residency assistance","Corporate bank account opening assistance","Local office address setup","Custom corporate bylaws (MoA)","WhatsApp + phone support","30-min onboarding call"]',
 '["كل ما في الأساسية","تأسيس شركة ذات مسؤولية محدودة (LLC)","المساعدة في تأشيرة المستثمر والإقامة","مساعدة في فتح حساب بنكي تجاري","إعداد عنوان مكتب محلي","عقد تأسيس مخصص (MoA)","دعم واتساب وهاتف","مكالمة تأهيلية 30 دقيقة"]',
 NOW(3), NOW(3));


-- ============================================================
-- SECTION 4: ALL SERVICES (132 rows — all categories)
-- ============================================================

-- Clean Services SQL Seed
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.825', 'formationlandin', '2026-07-19 11:19:03.779', 'Company Formation', 'تأسيس الشركات', 'Form your US LLC, UK LTD & more in 50+ countries.', 'أسس شركتك الأمريكية أو البريطانية وأكثر.', 149, 'one-time', 'مرة واحدة', '', '', '', '', 0, 'Building2', 1, 10, 'landing', '#2563EB', '#EFF6FF', '/order', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.868', 'bankinglanding1', '2026-07-19 11:19:03.797', 'Business Banking', 'الحساب البنكي التجاري', 'Open US business bank accounts remotely.', 'افتح حساباً بنكياً أمريكياً عن بُعد.', 0, 'included', 'مشمول', '', '', '', '', 0, 'Landmark', 1, 20, 'landing', '#7C3AED', '#F5F3FF', '/#pricing', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.877', 'paymentlanding1', '2026-07-19 11:19:03.808', 'Payment Solutions', 'حلول الدفع', 'Stripe, PayPal & merchant account setup.', 'إعداد Stripe وPayPal والحسابات التجارية.', 0, 'included', 'مشمول', '', '', '', '', 0, 'CreditCard', 1, 30, 'landing', '#059669', '#ECFDF5', '/#pricing', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.886', 'complianceland1', '2026-07-19 11:19:03.821', 'Compliance & EIN', 'الامتثال والرقم الضريبي', 'EIN, tax compliance, and annual reports.', 'رقم EIN والامتثال الضريبي والتقارير السنوية.', 0, 'included', 'مشمول', '', '', '', '', 0, 'Shield', 1, 40, 'landing', '#D97706', '#FFFBEB', '/#pricing', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.893', 'supportlanding1', '2026-07-19 11:19:03.834', 'Ongoing Support', 'الدعم المستمر', 'Dedicated support to keep your business growing.', 'دعم متخصص لمتابعة نمو أعمالك.', 0, 'free', 'مجاني', '', '', '', '', 0, 'Headphones', 1, 50, 'landing', '#0284C7', '#F0F9FF', '/#contact', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.900', 'usllc149onetime', '2026-07-19 11:19:03.845', 'US LLC Formation', 'تأسيس شركة ذات مسؤولية محدودة أمريكية (LLC)', 'Incorporate your business in Wyoming, Delaware, or Florida.', 'تأسيس شركتك في ولايات وايومنغ، ديلاوير، أو فلوريدا.', 149, 'one-time', 'مرة واحدة', 'Includes name verification, drafting articles, state filing, and certificate delivery.', 'تشمل فحص توفر الاسم، صياغة عقد التأسيس، التقديم للولاية، وتسليم الشهادة.', 'Most Popular', 'الأكثر شعبية', 0, 'Building2', 1, 1, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.907', 'ukltd149onetime', '2026-07-19 11:19:03.959', 'UK LTD Formation', 'تأسيس شركة مساهمة بريطانية (LTD)', 'Register your company in the UK with Companies House.', 'سجل شركتك في المملكة المتحدة لدى مسجل الشركات الرسمي.', 149, 'one-time', 'مرة واحدة', 'Includes incorporation fees, registered address, share certificates, and digital pack.', 'تشمل رسوم التأسيس، عنوان المكتب المسجل، شهادات الأسهم، والحقيبة الرقمية.', '', '', 0, 'Building', 1, 2, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.923', 'uaecompany999ot', '2026-07-19 11:19:03.968', 'UAE Company Formation', 'تأسيس شركة في الإمارات', 'Establish a business in UAE Free ones or Mainland.', 'تأسيس عملك التجاري في المناطق الحرة أو داخل دولة الإمارات.', 999, 'one-time', 'مرة واحدة', 'Full license processing, local sponsor assistance if needed, and visa guidance.', 'معالجة الرخصة بالكامل، توفير الشريك المحلي عند الحاجة، وتسهيل إجراءات التأشيرة.', 'Recommended', 'موصى به', 0, 'Briefcase', 1, 3, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.932', 'omancompany1499', '2026-07-19 11:19:03.976', 'Oman Company Formation', 'تأسيس شركة في سلطنة عمان', 'Form a 100% foreign-owned company in Oman.', 'تأسيس شركة مملوكة بالكامل لشركاء أجانب في سلطنة عمان.', 1499, 'one-time', 'مرة واحدة', 'Commercial registration, chamber of commerce membership, and local bank assistance.', 'السجل التجاري، عضوية غرفة التجارة، وتسهيل فتح حساب بنكي محلي.', '', '', 0, 'Shield', 1, 4, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.942', 'einapplication7', '2026-07-19 11:19:04.009', 'EIN Application', 'التقديم على الرقم الضريبي EIN', 'Get your Employer Identification Number from the IRS.', 'احصل على الرقم الضريبي لشركتك من مصلحة الضرائب الأمريكية.', 79, 'one-time', 'مرة واحدة', 'Preparation of Form SS-4, fax submission to IRS, and retrieval of official letter.', 'تجهيز نموذج SS-4، إرساله بالفاكس للضرائب، واستلام الخطاب الرسمي.', '', '', 1, 'Hash', 1, 10, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.951', 'operatingagree4', '2026-07-19 11:19:04.285', 'Operating Agreement', 'اتفاقية التشغيل للشركة (LLC)', 'Draft a customized operating agreement to establish LLC ownership and rules.', 'صياغة اتفاقية التشغيل القانونية المخصصة لتحديد ملكية وصلاحيات أعضاء الشركة.', 99, 'one-time', 'مرة واحدة', 'Customized operating agreement detailing ownership split and corporate governance rules.', 'صياغة كاملة تضمن حقوق الشركاء وتوضح نسب توزيع الأرباح والمسؤوليات.', '', '', 1, 'FileText', 1, 56, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.957', 'businessbank149', '2026-07-19 11:19:04.228', 'Business Banking Setup', 'توجيه الحساب البنكي للأعمال', 'Get guidance for opening accounts in major fintech business platforms.', 'الحصول على الدعم الكامل للتقديم وفتح الحسابات في البنوك الرقمية الرائدة.', 199, 'one-time', 'مرة واحدة', 'Assistance with documentation, application review, and bank approval process.', 'مراجعة الأوراق القانونية والمساعدة في التقديم والتواصل لتسريع موافقة البنك.', '', '', 1, 'Landmark', 1, 41, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.963', 'paymentgate249o', '2026-07-19 11:19:04.237', 'Payment Gateway Setup', 'إعداد بوابات الدفع الإلكتروني', 'Connect payment processors to your website to accept credit cards globally.', 'ربط ودمج معالجات الدفع بموقعك الإلكتروني لاستقبال مدفوعات العملاء محلياً وعالمياً.', 249, 'one-time', 'مرة واحدة', 'Includes gateway application, document upload, verification assistance, and API integration.', 'تشمل طلبات بوابات الدفع، رفع الوثائق، المساعدة في التفعيل، والربط التقني بالموقع.', '', '', 1, 'CreditCard', 1, 42, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.971', 'annualreportadd', '2026-07-19 11:19:04.057', 'Annual Report Filing', 'تقديم التقارير السنوية (أمريكا)', 'File annual reports with the US state registry to avoid penalties.', 'تقديم التقارير السنوية الرسمية للولاية لتجنب فرض غرامات أو شطب الشركة.', 129, 'one-time', 'مرة واحدة', 'We prepare and file your LLC annual report with the state to keep your business in good standing.', 'نقوم بتجهيز وتقديم التقرير السنوي للولاية للحفاظ على استمرار شركتك ووضعها القانوني.', '', '', 1, 'ClipboardList', 1, 16, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.977', 'agentrenewaladd', '2026-07-19 11:19:04.123', 'Registered Agent Renewal', 'تجديد الوكيل المسجل', 'Renew your registered agent representation in Delaware, Wyoming or Florida.', 'تجديد خدمة الوكيل المسجل المعتمد لشركتك في ولايات وايومنغ، ديلاوير، أو فلوريدا لعام إضافي.', 99, 'yearly', 'سنوياً', 'Renews your registered agent subscription for another 12 months. We receive and forward all state and legal correspondence.', 'تجديد التمثيل القانوني لـ12 شهراً، وتلقي وتوجيه الخطابات والمراسلات الرسمية والقضائية.', '', '', 1, 'RotateCw', 1, 25, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.984', 'einamendmentadd', '2026-07-19 11:19:04.130', 'EIN Amendment', 'تعديل الرقم الضريبي EIN', 'Update responsible party or address associated with your EIN.', 'تعديل وتحديث بيانات الشخص المسؤول أو عنوان الشركة المرتبط بالرقم الضريبي لدى الضرائب.', 99, 'one-time', 'مرة واحدة', 'We file IRS Form SS-4 amendments to update the responsible party, address, or other EIN-related changes on your behalf.', 'إيداع طلبات التعديل للضرائب وتحديث بيانات المالك وعنوان السجل الضريبي.', '', '', 1, 'FileEdit', 1, 26, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.990', 'agreementupdadd', '2026-07-19 11:19:04.314', 'Operating Agreement Update', 'تحديث اتفاقية التشغيل', 'Amend your existing agreement to add members or change split ratios.', 'تعديل الاتفاقية الحالية لإضافة شركاء جدد أو تعديل نسب الحصص وتوزيع الأرباح.', 99, 'one-time', 'مرة واحدة', 'Our legal team drafts a revised operating agreement reflecting your changes, signed and ready to use.', 'يقوم الفريق القانوني بإعادة صياغة الاتفاقية لتضم التعديلات الجديدة وتوقيعها.', '', '', 1, 'Edit3', 1, 60, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:06.997', 'goodstandingadd', '2026-07-19 11:19:04.137', 'Certificate of Good Standing', 'شهادة الوضع القانوني الجيد', 'Official state document proving your company is active and in compliance.', 'مستند رسمي من الولاية يثبت أن الشركة نشطة وملتزمة بكافة الالتزامات والتقارير.', 99, 'one-time', 'مرة واحدة', 'We request an official certificate from the state on your behalf, typically delivered in 3–5 business days.', 'طلب الشهادة الرسمية من الولاية وتسليمها خلال 3-5 أيام عمل.', '', '', 1, 'Award', 1, 27, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.004', 'regagent119year', '2026-07-19 11:19:04.028', 'Registered Agent', 'الوكيل المسجل الأمريكي', 'Required professional representative for receiving official state correspondence.', 'ممثل قانوني محلي معتمد لتلقي المراسلات الرسمية والدعاوى القضائية.', 99, 'yearly', 'سنوياً', 'Includes official address for service of process, mail forwarding, and compliance alerts.', 'تشمل عنواناً رسمياً لتلقي الإشعارات القانونية وإعادة توجيه البريد والتنبيهات.', '', '', 1, 'Shield', 1, 12, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.011', 'busaddress99yea', '2026-07-19 11:19:04.036', 'Business Address', 'عنوان العمل التجاري الأمريكي', 'Get a premium commercial street address for your website, cards, and banking.', 'احصل على عنوان تجاري مميز لاستخدامه على موقعك وبطاقتك وحساباتك البنكية.', 199, 'yearly', 'سنوياً', 'Ideal for branding, banking, and receiving corporate mail.', 'مثالي لبناء علامتك التجارية، وفتح الحسابات البنكية وتلقي بريد الشركة.', '', '', 0, 'Home', 1, 13, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.018', 'anncompliance14', '2026-07-19 11:19:04.116', 'Annual Compliance Assistance', 'مساعد الامتثال السنوي المتكامل', 'Comprehensive support to handle all annual filings and maintain active company standing.', 'دعم شامل لإدارة جميع التقديمات السنوية والحفاظ على استمرارية الشركة القانونية.', 249, 'yearly', 'سنوياً', 'Includes filing assistance, calendar reminders, and legal checks.', 'تشمل المساعدة في التقديم السنوي، التنبيهات الدورية، والمراجعات القانونية للملفات.', '', '', 1, 'ShieldAlert', 1, 24, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.024', 'idverificationk', '2026-07-19 11:19:04.081', 'Identity Verification (KYC)', 'التحقق من الهوية (KYC)', 'Verify founders and shareholder identities against international compliance databases.', 'التحقق من الهوية الشخصية للمؤسسين والمساهمين ضد قوائم التحقق والامتثال الدولية.', 39, 'one-time', 'مرة واحدة', 'Verify identity documents against global databases.', 'فحص وثائق الهوية والتحقق منها عبر قواعد بيانات عالمية معتمدة.', '', '', 0, 'UserCheck', 1, 19, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.030', 'dirverification', '2026-07-19 11:19:04.073', 'Director Verification', 'التحقق من هوية المدير', 'Required identity verification for directors in UK Companies House.', 'التحقق الإلزامي من هويات مدراء الشركات في مسجل الشركات البريطاني.', 49, 'one-time', 'مرة واحدة', 'Official verification of director identities for corporate governance.', 'التحقق الرسمي والمعتمد لهوية المدير تماشياً مع اللوائح الجديدة.', '', '', 1, 'CheckSquare', 1, 18, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.037', 'apostille119one', '2026-07-19 11:19:04.244', 'Apostille', 'توثيق الأبوستيل الدولي', 'Certify state-issued documents for international legal recognition.', 'تصديق وتوثيق المستندات والشهادات الصادرة من الدولة للاعتراف بها قانونياً على الصعيد الدولي.', 199, 'one-time', 'مرة واحدة', 'Standard international legalization according to the Hague Convention.', 'تصديق دولي رسمي معتمد للمستندات تماشياً مع اتفاقية لاهاي.', '', '', 0, 'FileCheck', 1, 50, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.042', 'embassylegal299', '2026-07-19 11:19:04.252', 'Embassy Legalization', 'التصديق من السفارات والقنصليات', 'Legalize documents for non-Hague Convention countries through embassy channels.', 'تصديق المستندات والوثائق للاستخدام في الدول غير الموقعة على اتفاقية لاهاي عبر السفارة المعنية.', 299, 'one-time', 'مرة واحدة', 'Full embassy authentication for non-Hague Convention countries.', 'إجراء دورة التصديق الكاملة من كاتب العدل، الخارجية، وحتى سفارة الدولة المستهدفة.', '', '', 0, 'Building', 1, 51, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.049', 'docauth129oneti', '2026-07-19 11:19:04.260', 'Document Authentication', 'توثيق وصحة المستندات', 'Authenticate corporate and personal documents with state departments.', 'التحقق وتوثيق صحة الوثائق الشخصية والتجارية من وزارات الخارجية والجهات الرسمية.', 149, 'one-time', 'مرة واحدة', 'Authentication of signatures and seals by governing authorities.', 'المصادقة الرسمية على التواقيع والأختام من الدوائر الحكومية المختصة.', '', '', 0, 'ShieldCheck', 1, 52, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.055', 'certtranslat45p', '2026-07-19 11:19:04.267', 'Certified Translation', 'الترجمة المعتمدة للمستندات', 'Translate corporate documents with certificates of translation accuracy.', 'ترجمة مستندات شركتك وهويتك ترجمة معتمدة تقبلها الجهات الحكومية والجهات البنكية.', 49, 'one-time', 'مرة واحدة', 'Certified translation for government, legal, and financial use.', 'ترجمة قانونية مطابقة للأصل مع شهادة دقة الترجمة الموثقة.', '', '', 0, 'Languages', 1, 53, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.061', 'websitedesign49', '2026-07-19 11:19:04.383', 'Website Design', 'تطوير وتصميم المواقع', 'Custom business or corporate website, responsive on all devices.', 'تصميم موقع إلكتروني احترافي للشركة متجاوب بالكامل مع مختلف الشاشات والهواتف.', 499, 'one-time', 'مرة واحدة', 'Professional designs, responsive on all devices, built for conversions.', 'تصاميم حديثة خفيفة، صديقة لمحركات البحث، وتزيد من ثقة العملاء.', 'Best Value', 'أفضل قيمة', 0, 'Laptop', 1, 81, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.067', 'landingpages149', '2026-07-19 11:19:04.377', 'Landing Pages', 'تصميم صفحات الهبوط', 'High-converting single-page layout designed to drive leads or sales.', 'تصميم صفحة هبوط مخصصة وموجهة لزيادة المبيعات وجمع بيانات العملاء المهتمين.', 199, 'one-time', 'مرة واحدة', 'Single page layout optimized for marketing campaigns.', 'تصميم صفحة واحدة متكاملة سريعة التصفح لزيادة معدل التحويل التسويقي.', '', '', 0, 'Layout', 1, 80, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.074', 'shopifystore799', '2026-07-19 11:19:04.394', 'Shopify Store Development', 'إنشاء متجر شوبيفاي (Shopify)', 'Launch your e-commerce business with a professional Shopify store setup.', 'أطلق متجرك الإلكتروني للبيع المباشر عبر إعداد وتصميم متكامل لمنصة شوبيفاي.', 599, 'one-time', 'مرة واحدة', 'Full store setup, theme customization, and essential app integrations.', 'ضبط وتعديل الثيم، رفع قائمة المنتجات، ودمج تطبيقات الدفع والشحن الأساسية.', '', '', 0, 'ShoppingBag', 1, 83, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.079', 'businessemail22', '2026-07-19 11:19:04.439', 'Business Email Setup', 'إعداد البريد الإلكتروني الرسمي', 'Setup custom business emails with Google Workspace or Microsoft 356.', 'تفعيل إيميلات احترافية باسم نطاقك على سيرفرات جوجل أو مايكروسوفت 356.', 62, 'one-time', 'مرة واحدة', 'Setup with Google Workspace, Microsoft 365, or oho Mail.', 'ربط النطاق وتعديل سجلات DNS (MX, SPF, DKIM) وتفعيل حسابات الموظفين.', '', '', 0, 'Mail', 1, 88, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.086', 'hostingmainte29', '2026-07-19 11:19:04.445', 'Hosting & Maintenance', 'الاستضافة والصيانة المستمرة', 'Keep your website secure, fast, and online with our managed hosting service.', 'صيانة موقعك ومراقبته وحمايته بشكل مستمر لضمان تواجده الدائم على الإنترنت.', 29, 'monthly', 'شهرياً', 'Includes server updates, daily backups, and security monitoring.', 'تشمل استضافة سحابية سريعة، نسخ احتياطي يومي، ومراقبة أمنية على مدار الساعة.', '', '', 0, 'Server', 1, 89, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.093', 'aiautomation399', '2026-07-19 11:19:04.597', 'AI Customer Support Chatbot', 'مساعد الدعم الفني بالذكاء الاصطناعي', 'Automate customer support inquiries on your site 24/7 with trained AI models.', 'أتمتة الرد على استفسارات عملائك على مدار الساعة بنظام محادثة مدعوم بالذكاء الاصطناعي.', 299, 'one-time', 'مرة واحدة', 'AI workflow integration, custom chatbot setup, and document training.', 'بناء تدفق المحادثات، تدريب الروبوت على مستندات شركتك، والربط الفني بالموقع.', 'AI Powered', 'ذكاء اصطناعي', 0, 'Bot', 1, 130, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.099', 'seo299permonth1', '2026-07-19 11:19:04.452', 'SEO (Search Engine Optimization)', 'تحسين محركات البحث SEO', 'Rank higher on Google and drive free organic search traffic to your site.', 'تصدر نتائج بحث جوجل الأولى وجذب آلاف الزوار المهتمين بموقعك مجاناً.', 299, 'monthly', 'شهرياً', 'On-page optimization, content strategy, and high-quality backlink building.', 'تحليل الكلمات المفتاحية، تهيئة الصفحات تقنياً، وبناء الروابط الخارجية القوية.', 'Popular', 'شائع', 0, 'TrendingUp', 1, 90, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.106', 'googleadsmanage', '2026-07-19 11:19:04.469', 'Google Ads Management', 'إدارة إعلانات جوجل الممولة', 'Run highly-targeted Search and Performance Max campaigns to drive leads.', 'إطلاق وإدارة الحملات الإعلانية على محرك بحث جوجل لزيادة المبيعات والاتصالات.', 399, 'monthly', 'شهرياً', 'Keyword research, ad copywriting, bid management, and ROI tracking.', 'بحث الكلمات الدلالية، كتابة نصوص الإعلان، إدارة المزايدة، وتتبع العائد المالي.', '', '', 0, 'Target', 1, 93, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.112', 'metaadsmanag249', '2026-07-19 11:19:04.474', 'Meta Ads Management', 'إدارة إعلانات فيسبوك وانستغرام', 'Scale your sales with Facebook & Instagram ads and target pixel tracking.', 'توسيع مبيعاتك عبر استهداف دقيق لعملائك بإعلانات فيسبوك وانستغرام الممولة.', 399, 'monthly', 'شهرياً', 'Audience targeting, creative direction, A/B testing, and conversion tracking.', 'تحديد الجماهير، إدارة المحتوى الإعلاني، اختبار النماذج، وتثبيت بيكسل التتبع.', '', '', 0, 'Facebook', 1, 94, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.119', 'socialmediaman2', '2026-07-19 11:19:04.585', 'Social Media Management', 'إدارة حسابات التواصل الاجتماعي', 'Consistent posting, scheduling, and community engagement for your profiles.', 'جدولة ونشر المنشورات والتفاعل الدائم مع المتابعين لبناء مجتمع نشط لعلامتك.', 249, 'monthly', 'شهرياً', 'Content creation, scheduled posting, community management, and monthly reports.', 'كتابة البوستات، جدولة النشر، الردود الأساسية، وتوفير تقرير الأداء الشهري.', '', '', 0, 'Instagram', 1, 119, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.127', 'contentmktg349p', '2026-07-19 11:19:04.591', 'Content Marketing', 'التسويق بالمحتوى المتكامل', 'Comprehensive strategy planning to drive sales through value-driven content.', 'تخطيط وإعداد خطط المحتوى المتوافقة مع مراحل قمع الشراء لجذب العملاء تلقائياً.', 199, 'one-time', 'مرة واحدة', 'Content planning, writing, SEO optimization, and distribution.', 'أبحاث المحتوى، صياغة مقالات وأفكار تفاعلية، وخطط النشر والترويج المتكاملة.', '', '', 0, 'BookOpen', 1, 120, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.134', 'analyticsgrow19', '2026-07-19 11:19:04.512', 'Analytics & Growth Strategy', 'إحصائيات وإستراتيجيات النمو', 'Set up Google Analytics 4 (GA4) and track customer conversion behaviors.', 'تثبيت وإعداد تحليلات جوجل الجيل الرابع GA4 وتتبع سلوك العملاء ونقاط التحويل.', 199, 'one-time', 'مرة واحدة', 'Google Analytics 4 setup, dashboard configuration, and actionable growth plan.', 'إعداد منصة تحليلات جوجل، تهيئة الأهداف، وصياغة خطة نمو واضحة للشركة.', '', '', 0, 'BarChart2', 1, 100, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.141', 'brandingpkg499o', '2026-07-19 11:19:04.336', 'Branding Package', 'باقة الهوية البصرية المتكاملة', 'Complete brand identity design including logo, colors, fonts, and guidelines.', 'تصميم متكامل للهوية البصرية يشمل الشعار، الألوان، الخطوط، واستخداماتها.', 299, 'one-time', 'مرة واحدة', 'Logo, color palette, typography guidelines, and social media templates.', 'الشعار، دليل استخدام الألوان والخطوط، وقوالب النشر على وسائل التواصل.', '', '', 0, 'Palette', 1, 71, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.147', 'logodesign99one', '2026-07-19 11:19:04.327', 'Logo Design', 'تصميم الشعار', 'Get a custom professional logo designed for your company.', 'احصل على تصميم شعار مبتكر واحترافي يمثل هويتك التجارية.', 99, 'one-time', 'مرة واحدة', 'Multiple initial concepts, revisions, and all source/vector file formats.', 'نماذج شعارات مبدئية، تعديلات مستمرة، وتسليم الملفات المصدرية المفتوحة.', 'Popular', 'شائع', 0, 'Paintbrush', 1, 70, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.154', 'graphicdesign49', '2026-07-19 11:19:04.371', 'Graphic Design', 'تصاميم الجرافيك المتنوعة', 'Custom designs for social media posts, ads, banners, or brochures.', 'تصاميم مخصصة للمنشورات الإعلانية، البنرات والمطويات الترويجية.', 79, 'one-time', 'مرة واحدة', 'Flyers, banners, brochures, or social posts tailored to your assets.', 'بروشورات، لوحات إعلانية، وتصاميم السوشيال ميديا المتوافقة مع باقتك.', '', '', 0, 'Image', 1, 77, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.160', 'motiongraphics1', '2026-07-19 11:19:04.576', 'Motion Graphics', 'فيديو الموشن جرافيك', 'Create explainer animations or animated assets for your social campaigns.', 'تصميم فيديوهات موشن جرافيك توضيحية لمنتجاتك وحملاتك التسويقية.', 199, 'one-time', 'مرة واحدة', 'Scriptwriting, voiceover integration, custom animations, and export.', 'كتابة السيناريو، تسجيل التعليق الصوتي، تصاميم مخصصة والتحريك بجودة عالية.', '', '', 0, 'Activity', 1, 118, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.166', 'videoediting79o', '2026-07-19 11:19:04.570', 'Video Editing', 'مونتاج الفيديو الاحترافي', 'Professional video editing for promo clips, product ads, or YouTube.', 'مونتاج وتحرير الفيديو لقصص النجاح، الإعلانات الترويجية، أو قنوات اليوتيوب.', 99, 'one-time', 'مرة واحدة', 'Color correction, sound design, transitions, and text overlays.', 'تعديل الألوان، هندسة الصوت، إضافة الانتقالات والنصوص التوضيحية الاحترافية.', '', '', 0, 'Film', 1, 117, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.172', 'busanalysis149o', '2026-07-19 11:19:04.745', 'Business Analysis', 'تحليل ودراسة الأعمال', 'Analyze operations to identify inefficiencies and structure a performance roadmap.', 'تحليل وتدقيق العمليات الحالية للشركة لاكتشاف نقاط الخلل وتصميم خارطة تحسين الأداء.', 149, 'one-time', 'مرة واحدة', 'Identifying bottlenecks, mapping operations, and proposing solutions.', 'تحديد العقبات، مراجعة تدفقات العمل، وتقديم حلول وخيارات كفاءة العمل.', '', '', 0, 'LineChart', 1, 170, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.179', 'marketresearch2', '2026-07-19 11:19:04.750', 'Market Research', 'دراسات وأبحاث السوق', 'Deep-dive analysis of your industry target audience and segment behaviors.', 'دراسة وتحليل مفصلين للسوق المستهدف، وتصنيف سلوكيات العملاء وحجم الطلب.', 199, 'one-time', 'مرة واحدة', 'Target audience analysis, competitor teardowns, and market opportunity mapping.', 'تقييم رغبات الجمهور، وتحليل حجم العرض والطلب لتحديد الفرص التسويقية.', '', '', 0, 'Search', 1, 171, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.185', 'busstrategy499o', '2026-07-19 11:19:04.780', 'Business Strategy', 'إستراتيجية تأسيس وتطوير الأعمال', 'Develop high-level scaling strategies, pricing models and expansion plans.', 'بناء وتطوير إستراتيجيات التوسع طويلة المدى ونماذج التسعير وخطط الانتشار.', 249, 'one-time', 'مرة واحدة', 'Defining long-term objectives, pricing models, and go-to-market plan.', 'صياغة الأهداف طويلة المدى، ومقترح خطط الدخول والتغلغل في السوق المستهدف.', '', '', 0, 'Compass', 1, 176, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.198', 'growthconsult99', '2026-07-19 11:19:04.788', 'Growth Consulting', 'استشارات النمو والمبيعات', '1-on-1 session to audit customer acquisition funnels and optimize sales.', 'جلسة استشارية خاصة لتحسين مسارات البيع وزيادة معدل إغلاق الصفقات والانتشار.', 199, 'one-time', 'مرة واحدة', 'One-on-one call to review challenges, optimize sales, and strategize scaling.', 'اتصال مرئي مباشر لبحث المشاكل والتحديات ووضع خطة التحسين المباشرة للنمو.', '', '', 0, 'TrendingUp', 1, 177, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.212', 'legaldocuments1', '2026-07-19 11:19:04.828', 'Legal Document Templates', 'قوالب المستندات القانونية', 'Pre-drafted contracts, terms of service, and NDAs ready to adapt.', 'صيغ ونماذج عقود جاهزة تشمل حفظ السرية، شروط الخدمة والاتفاقيات.', 49, 'one-time', 'مرة واحدة', 'NDAs, service agreements, privacy policies, and terms of service templates.', 'اتفاقيات عدم الإفصاح، عقود تقديم الخدمات وسياسات الخصوصية الجاهزة للتعديل.', '', '', 0, 'FileText', 1, 193, 'addon', '', '', '', 'Education', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.219', 'businessguides9', '2026-07-19 11:19:04.836', 'E-Books & Guides', 'الكتب والأدلة الإرشادية', 'In-depth manuals on international taxes, business banking and compliance.', 'كتب تفصيلية لشرح الضرائب الدولية، وتأسيس الحسابات البنكية وإدارتها.', 29, 'one-time', 'مرة واحدة', 'In-depth manuals on taxes, banking, legal compliance, and customer acquisition.', 'شرح مبسط لقوانين الضرائب للشركات، طرق تفعيل البوابات، وإستراتيجيات الجذب.', '', '', 0, 'BookOpen', 1, 194, 'addon', '', '', '', 'Education', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.224', 'onlinecourses49', '2026-07-19 11:19:04.843', 'Video Guides', 'الأدلة والدروس المرئية', 'Video courses showing exactly how to file taxes and manage bank accounts.', 'شروحات مسجلة خطوة بخطوة للتعامل مع الضرائب وتقديم الإقرارات وإدارة حسابات البنوك.', 49, 'one-time', 'مرة واحدة', 'Detailed video guides on taxes, corporate structures, and scaling strategies.', 'دورات قصيرة في الهياكل القانونية، التعامل مع الضرائب الخارجية، وطرق التسويق.', '', '', 0, 'Video', 1, 195, 'addon', '', '', '', 'Education', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.230', 'downloadableres', '2026-07-19 11:19:04.849', 'Resources Bundle', 'حزمة الموارد الشاملة لرواد الأعمال', 'Full access to all templates, guides, checklists and video resources.', 'احصل على وصول كامل لكل القوالب، الكتب، الكشوفات، والأدلة المرئية بمكان واحد.', 99, 'one-time', 'مرة واحدة', 'Checklists, cheat-sheets, templates, and video toolkits bundle.', 'الحقيبة الشاملة التي تضم كل نماذج التشغيل والتحليلات وقوائم المهام للشركة.', '', '', 0, 'Layers', 1, 196, 'addon', '', '', '', 'Education', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.236', 'statefee_delaw1', '2026-07-19 11:19:04.855', 'Delaware State Fee', 'رسوم ولاية ديلاوير', 'State filing fee for Delaware LLC formation.', 'رسوم تسجيل ولاية ديلاوير الرسمية لتأسيس الشركة.', 90, 'one-time', 'مرة واحدة', '', '', '', '', 0, 'Building', 1, 910, 'addon', '', '', '', 'State Fees', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-18 10:41:07.242', 'statefee_wyomin', '2026-07-19 11:19:04.861', 'Wyoming State Fee', 'رسوم ولاية وايومنغ', 'State filing fee for Wyoming LLC formation.', 'رسوم تسجيل ولاية وايومنغ الرسمية لتأسيس الشركة.', 50, 'one-time', 'مرة واحدة', '', '', '', '', 0, 'Building', 1, 920, 'addon', '', '', '', 'State Fees', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.116', 'offshoreformatn', '2026-07-19 11:19:03.985', 'Offshore Company Formation', 'تأسيس الشركات أوفشور', 'Form a company in tax-neutral jurisdictions like BVI, Cayman, or Seychelles.', 'تأسيس شركة في ولايات قضائية معفاة من الضرائب مثل جزر العذراء أو كايمان أو سيشيل.', 1299, 'one-time', 'مرة واحدة', 'Includes registered office, local agent, offshore bank introductions, and articles of association.', 'تشمل عنوان المكتب المسجل، الوكيل المحلي، وفتح الحسابات البنكية الخارجية.', 'New', 'جديد', 0, 'Globe', 1, 5, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.130', 'nonprofitformat', '2026-07-19 11:19:03.994', 'Non-Profit Formation', 'تأسيس الجمعيات غير الربحية', 'Register a 501(c)(3) or charitable organization in the US or UK.', 'تسجيل مؤسسة خيرية أو منظمة معفاة من الضرائب 501(c)(3) في أمريكا أو بريطانيا.', 799, 'one-time', 'مرة واحدة', 'Drafting of custom non-profit bylaws and tax-exemption applications.', 'صياغة اللوائح الداخلية غير الربحية المخصصة وطلبات الإعفاء الضريبي.', 'New', 'جديد', 0, 'Heart', 1, 6, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.136', 'shelfcompanies1', '2026-07-19 11:19:04.001', 'Shelf Companies', 'الشركات الجاهزة (الأقدمية)', 'Acquire a pre-registered corporate entity with established history.', 'شراء شركة مسجلة مسبقاً وتملك تاريخاً وتأسيساً قديماً.', 999, 'one-time', 'مرة واحدة', 'Clean history transfer of ownership, share transfer filings, and registration history certificates.', 'نقل ملكية كامل لشركة نظيفة السجل التجاري والضريبي مع نقل الحصص والأسهم.', 'New', 'جديد', 0, 'History', 1, 7, 'addon', '', '', '', 'Business Formation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.150', 'registeredoffuk', '2026-07-19 11:19:04.020', 'UK Registered Office Address', 'عنوان المكتب المسجل في بريطانيا', 'Official London registered office address to meet UK Companies House requirements.', 'عنوان مكتب رسمي مسجل في لندن للوفاء بمتطلبات مسجل الشركات البريطاني.', 89, 'yearly', 'سنوياً', 'Official address for statutory letters, digital scan and upload of government mail.', 'عنوان معتمد للرسائل الرسمية وتصوير وتنزيل البريد الحكومي فور صدوره.', 'New', 'جديد', 1, 'MapPin', 1, 11, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.171', 'annualconfirm12', '2026-07-19 11:19:04.044', 'Annual Confirmation Statement', 'تقرير التأكيد السنوي البريطاني', 'File your CS01 confirmation statement to keep your UK company active.', 'تقديم بيان التأكيد السنوي CS01 للحفاظ على نشاط شركتك قانونياً في بريطانيا.', 99, 'one-time', 'مرة واحدة', 'Includes Companies House filing fees and share/director details updates.', 'يشمل الرسوم الحكومية وتحديث بيانات أعضاء مجلس الإدارة والمساهمين.', 'New', 'جديد', 1, 'FileCheck', 1, 14, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.178', 'annualreturnsuk', '2026-07-19 11:19:04.050', 'Annual Returns Filing', 'تقديم الحسابات السنوية (بريطانيا)', 'File annual accounts (dormant or micro-entity) with HMRC & Companies House.', 'إعداد وتقديم الحسابات السنوية للشركات الخاملة أو الصغيرة لمصلحة الضرائب ومسجل الشركات.', 199, 'one-time', 'مرة واحدة', 'HMRC CT600 return drafting and dormant balance sheet coordination.', 'صياغة نموذج الإقرار الضريبي البريطاني وتجهيز الميزانية العمومية الخاملة.', 'New', 'جديد', 1, 'Calendar', 1, 15, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.194', 'boifilingreport', '2026-07-19 11:19:04.065', 'Beneficial Ownership Filing (BOI)', 'إقرار ملكية المستفيد الحقيقي (BOI)', 'File mandatory BOI report under US Corporate Transparency Act to FinCEN.', 'تقديم إقرار مالكي الشركة الفعليين لشبكة مكافحة الجرائم المالية FinCEN التزاماً بالقانون الأمريكي.', 99, 'one-time', 'مرة واحدة', 'FinCEN portal submission, verification of member details, and filing receipt delivery.', 'إرسال التقرير لولاية FinCEN والتحقق من هويات الشركاء وتسليم إشعار القبول.', 'Required', 'إلزامي', 1, 'CheckSquare', 1, 17, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.218', 'vatregistration', '2026-07-19 11:19:04.089', 'VAT Registration', 'التسجيل في ضريبة القيمة المضافة (VAT)', 'Register your UK or EU company for Value Added Tax with tax authorities.', 'تسجيل شركتك البريطانية أو الأوروبية في ضريبة القيمة المضافة والحصول على الرقم الضريبي.', 249, 'one-time', 'مرة واحدة', 'Submission of VAT application to HMRC/EU, including EORI registration.', 'تقديم طلب التسجيل الضريبي لـ HMRC أو الضرائب الأوروبية، شاملاً رقم EORI الجمركي.', 'New', 'جديد', 1, 'Percent', 1, 20, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.225', 'salestaxregistr', '2026-07-19 11:19:04.096', 'Sales Tax Registration', 'التسجيل في ضريبة المبيعات الأمريكية', 'Apply for sales tax permits in US states where you have nexus.', 'التقديم والحصول على ترخيص ضريبة المبيعات في الولايات الأمريكية التي تتجاوز فيها حد البيع.', 199, 'one-time', 'مرة واحدة', 'State tax permit registration, tax portal configurations, and resale certificate setups.', 'تسجيل ترخيص ضريبة المبيعات وإعداد بوابات الضرائب وشهادة الإعفاء التجاري.', 'New', 'جديد', 1, 'Percent', 1, 21, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.232', 'uaetaxidregistr', '2026-07-19 11:19:04.104', 'Tax ID Registration (UAE/Oman)', 'التسجيل الضريبي (الإمارات وسلطنة عمان)', 'Register for Corporate Tax or VAT with Federal Tax Authority (FTA) or Oman tax portal.', 'الحصول على الرقم الضريبي وتفعيل حساب ضريبة الشركات أو القيمة المضافة في دول الخليج.', 299, 'one-time', 'مرة واحدة', 'Tax Registration Number (TRN) application, portal activations, and tax setup consultancy.', 'التقديم على رقم السجل الضريبي TRN، تنشيط الحسابات، والاستشارات الضريبية الخليجية.', 'New', 'جديد', 1, 'FileText', 1, 22, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.238', 'companydissolut', '2026-07-19 11:19:04.109', 'Company Dissolution', 'تصفية وإغلاق الشركة', 'Legally close and dissolve your US LLC or UK LTD company.', 'إغلاق وحل وتصفية شركتك الأمريكية أو البريطانية بطريقة قانونية ورسمية.', 299, 'one-time', 'مرة واحدة', 'Filing Articles of Dissolution, closing tax accounts, and registered agent cancelation.', 'تقديم وثائق التصفية، وإلغاء حسابات الضرائب، وإيقاف الخدمات المرتبطة بالشركة.', 'New', 'جديد', 1, 'Trash2', 1, 23, 'addon', '', '', '', 'Government & Compliance', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.283', 'mercurybanksetu', '2026-07-19 11:19:04.144', 'Mercury Bank Setup', 'فتح حساب بنك ميركوري (Mercury)', 'Assistance with opening a US business bank account with Mercury.', 'المساعدة والتوجيه لفتح حساب بنكي تجاري أمريكي مع بنك ميركوري.', 149, 'one-time', 'مرة واحدة', 'Includes documentation alignment, business description writing, and priority application support.', 'تشمل تنظيم الأوراق، صياغة وصف نشاط الشركة، ومتابعة الطلب مع إدارة البنك.', 'Popular', 'شائع', 1, 'Landmark', 1, 30, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.289', 'relaybanksetup1', '2026-07-19 11:19:04.151', 'Relay Financial Setup', 'فتح حساب بنك ريلي (Relay)', 'Open a US business checking account with Relay Financial remotely.', 'فتح حساب جاري تجاري أمريكي عن بُعد مع بنك ريلي لإدارة فريق العمل.', 149, 'one-time', 'مرة واحدة', 'Document preparation, business structure verification, and team permissions setup.', 'إعداد الوثائق اللازمة، والتحقق من الهيكل القانوني ومتابعة مراجعة الطلب.', 'New', 'جديد', 1, 'CreditCard', 1, 31, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.296', 'wisebussetup123', '2026-07-19 11:19:04.162', 'Wise Business Setup', 'تفعيل حساب وايز للأعمال (Wise)', 'Get assistance in setting up a verified Wise Business multi-currency account.', 'المساعدة في إعداد وتفعيل حساب وايز التجاري متعدد العملات (USD/GBP/EUR).', 199, 'one-time', 'مرة واحدة', 'Wise application coordination, resolution of directors drafting, and verification advice.', 'تنسيق متطلبات التقديم وتجهيز قرار مجلس الإدارة واستشارات اجتياز الفحص المالي.', 'New', 'جديد', 1, 'Globe', 1, 32, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.302', 'airwallexsetup1', '2026-07-19 11:19:04.174', 'Airwallex Setup', 'فتح حساب بنكي إيروالكس (Airwallex)', 'Assistance with opening a global payment account with Airwallex.', 'تسهيل فتح حساب تحويلات ودفعات عالمية للشركات مع Airwallex.', 199, 'one-time', 'مرة واحدة', 'KYC check alignment, business description writing, and API portal setup.', 'تجهيز أوراق المالك والشركة وصياغة الملف الوظيفي ومتابعة التفعيل المالي.', 'New', 'جديد', 1, 'CornerUpRight', 1, 33, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.307', 'stripesetup1234', '2026-07-19 11:19:04.179', 'Stripe Setup', 'إنشاء وتفعيل حساب Stripe', 'Set up your US/UK Stripe account for accepting credit card payments.', 'إعداد وربط حساب سترايب بالشركة وتفعيله لاستقبال المدفوعات بالفيزا والماستركارد.', 149, 'one-time', 'مرة واحدة', 'Merchant account link, compliance audit on your site, and checkout integrations.', 'ربط الحساب البنكي، مراجعة سياسات الموقع تماشياً مع سترايب، وإعداد روابط الدفع.', 'Popular', 'شائع', 1, 'CreditCard', 1, 34, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.314', 'stripeverificat', '2026-07-19 11:19:04.192', 'Stripe Verification Support', 'حل مشاكل التحقق في Stripe', 'Overcome identity, address, or document verification requests on Stripe.', 'اجتياز طلبات إثبات العنوان والهوية ومستندات التشغيل المطلوبة من سترايب.', 199, 'one-time', 'مرة واحدة', 'Validation of tax files, utility proof consults, and senior agent support queue routing.', 'تدقيق المستندات الضريبية ومطابقتها وتقديم فواتير الخدمات وإعادة توجيه الطلب للمراجعة.', 'New', 'جديد', 1, 'Key', 1, 35, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.320', 'stripeappeal123', '2026-07-19 11:19:04.198', 'Stripe Suspension Appeal', 'استئناف وإلغاء حظر حساب Stripe', 'Draft a professional legal/risk appeal to recover closed Stripe accounts.', 'إعداد خطة استئناف وخفض المخاطر لاستعادة حسابات سترايب المحظورة أو المقيدة.', 299, 'one-time', 'مرة واحدة', 'Detailed risk analysis, chargeback prevention plan drafting, and legal appeal submission.', 'تحليل أسباب الإيقاف وصياغة خطة العمل للتصدي للاسترداد المالي وإرسال طلب رسمي.', 'New', 'جديد', 1, 'AlertTriangle', 1, 36, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.327', 'paypalbusiness1', '2026-07-19 11:19:04.204', 'PayPal Business Setup', 'إعداد حساب PayPal التجاري', 'Configure a fully functional PayPal Business account linked to your US/UK company.', 'إنشاء حساب باي بال تجاري معتمد وربطه بالبنك والبطاقة لشركتك الأمريكية أو البريطانية.', 149, 'one-time', 'مرة واحدة', 'Business profile creation, banking linking, and verification limits removal support.', 'إنشاء الملف التعريفي التجاري، ربط الحساب، ومساعدة رفع قيود المعاملات المالية.', 'New', 'جديد', 1, 'Briefcase', 1, 37, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.334', 'revolutbusiness', '2026-07-19 11:19:04.210', 'Revolut Business Setup', 'فتح حساب ريفولوت بزنس', 'Assistance with opening a Revolut Business multi-currency account.', 'المساعدة في فتح حساب ريفولوت تجاري متعدد العملات لشركتك البريطانية أو الأوروبية.', 149, 'one-time', 'مرة واحدة', 'KYC check coordination, utility bills consults, and bank routing configuration.', 'تنظيم المستندات وإثباتات العنوان ومتابعة تفعيل حساب ريفولوت التجاري.', 'New', 'جديد', 1, 'CornerUpRight', 1, 38, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.340', 'payoneersetup12', '2026-07-19 11:19:04.216', 'Payoneer Setup', 'إعداد حساب Payoneer التجاري', 'Setup and verify a Payoneer business account for international payouts.', 'إنشاء وتفعيل حساب بايونير تجاري لاستقبال المدفوعات العالمية والتحويل للبنك المحلي.', 129, 'one-time', 'مرة واحدة', 'Account creation, global payment services configuration, and validation support.', 'تفعيل استقبال العملات المختلفة وربط الحسابات وسحب الأرصدة.', 'New', 'جديد', 1, 'Briefcase', 1, 39, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.347', 'squarebusiness1', '2026-07-19 11:19:04.222', 'Square Setup', 'إعداد حساب سكوير (Square)', 'Configure a Square merchant account for POS and online card payments.', 'إعداد حساب سكوير لاستقبال المدفوعات الإلكترونية ونقاط البيع لشركتك.', 149, 'one-time', 'مرة واحدة', 'Merchant account registration, bank linking, and checkout terminal config.', 'تسجيل الحساب التجاري وربط البنك وإعداد واجهة الدفع الافتراضية.', 'New', 'جديد', 1, 'CreditCard', 1, 40, 'addon', '', '', '', 'Banking & Payments', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.405', 'notaryservices1', '2026-07-19 11:19:04.273', 'Notary Services', 'خدمات كاتب العدل الرقمية', 'Get your legal forms and signatures notarized online instantly.', 'توثيق التواقيع والمستندات القانونية عبر كاتب عدل مرخص على الإنترنت.', 49, 'one-time', 'مرة واحدة', 'Online video session with a certified US notary public, stamping, and secure delivery.', 'جلسة فيديو حية لتأكيد الهوية وتوقيع المستند ووضع ختم كاتب العدل الأمريكي.', 'New', 'جديد', 0, 'CheckSquare', 1, 54, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.412', 'sharecertificat', '2026-07-19 11:19:04.279', 'Share Certificates', 'إصدار شهادات الأسهم', 'Draft and issue official share certificates and stock ledgers for your members.', 'تصميم وإصدار شهادات الأسهم الرسمية وسجل توزيع الحصص للمساهمين بالشركة.', 79, 'one-time', 'مرة واحدة', 'Bespoke corporate share allocation, digital seal integration, and ledger templates.', 'تحديد نسب وتخصيص أسهم المساهمين، إعداد السجل وإصدار الشهادات بتصميم رسمي.', 'New', 'جديد', 1, 'FileText', 1, 55, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.424', 'articlesofassoc', '2026-07-19 11:19:04.291', 'Articles of Association', 'صياغة عقد التأسيس الداخلي', 'Draft bespoke Articles of Association for UK LTD company structure.', 'صياغة بنود وعقد التأسيس والنظام الأساسي للشركة البريطانية بما يحمي حقوق المساهمين.', 149, 'one-time', 'مرة واحدة', 'Articles customizing share transfer rules, pre-emption rights, and director powers.', 'تحديد صلاحيات المدراء وقواعد نقل الملكية والشفعة والتصويت بالشركة.', 'New', 'جديد', 1, 'FileText', 1, 57, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.430', 'companyresolutn', '2026-07-19 11:19:04.297', 'Company Resolution Drafting', 'صياغة قرارات مجلس الإدارة', 'Draft official board or shareholder resolutions for bank openings or structure changes.', 'صياغة قرارات مجلس الإدارة أو الشركاء الرسمية المطلوبة للبنوك أو تعديلات السجل.', 69, 'one-time', 'مرة واحدة', 'Includes meeting minutes, corporate sign-off, and authority certification.', 'تشمل محاضر الاجتماعات الرسمية، تفويض التوقيع البنكي، والشهادات المؤسسية.', 'New', 'جديد', 1, 'FileText', 1, 58, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.435', 'ndadrafting1234', '2026-07-19 11:19:04.302', 'NDA Drafting', 'صياغة اتفاقية عدم الإفصاح (NDA)', 'Draft custom non-disclosure agreements to protect intellectual property.', 'صياغة اتفاقيات حفظ السرية وعدم الإفصاح لحماية الملكية الفكرية والأسرار التجارية.', 99, 'one-time', 'مرة واحدة', 'One-way or Mutual NDA drafting, tailored for your specific country/state jurisdiction.', 'صياغة اتفاقية أحادية أو ثنائية لحماية السرية طبقاً للولاية القانونية المناسبة.', 'New', 'جديد', 0, 'Lock', 1, 59, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.447', 'contractdraft12', '2026-07-19 11:19:04.320', 'Custom Contracts Drafting', 'صياغة العقود التجارية الخاصة', 'Draft specialized business agreements, service contracts, and partnerships.', 'صياغة وتدقيق العقود والاتفاقيات التجارية والشراكات وفق الأطر القانونية.', 199, 'one-time', 'مرة واحدة', 'Tailored business contracts, liability limitation drafting, and legal review.', 'صياغة عقود تقديم الخدمات، البيع، والشراكة لضمان الحماية وتلافي الثغرات.', 'New', 'جديد', 0, 'FileText', 1, 61, 'addon', '', '', '', 'Legal Documents', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.469', 'brandguidelines', '2026-07-19 11:19:04.343', 'Brand Guidelines', 'دليل استخدام العلامة التجارية', 'Create a comprehensive brand book outlining rules for your identity.', 'تصميم كتاب الإرشادات الكامل لاستخدامات علامتك البصرية وقواعد الهوية.', 149, 'one-time', 'مرة واحدة', 'Detailed guidelines on spacing, color codes, disallowed use cases, and tone of voice.', 'شرح مفصل للمسافات الآمنة، أكواد الألوان للطباعة والويب، وإرشادات نبرة الخطاب.', 'New', 'جديد', 0, 'BookOpen', 1, 72, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.474', 'businesscard123', '2026-07-19 11:19:04.349', 'Business Card Design', 'تصميم بطاقة العمل', 'Professional double-sided business card layout ready for printing.', 'تصميم كارت العمل بوجهين بشكل عصري وجاهز للطباعة الفورية.', 49, 'one-time', 'مرة واحدة', 'Print-ready PDF with bleed margins, source files, and QR code integration.', 'ملف PDF عالي الدقة للطباعة مع هوامش القص، ومسودة مفتوحة وربط كود الـ QR.', 'New', 'جديد', 0, 'CreditCard', 1, 73, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.480', 'letterhead12345', '2026-07-19 11:19:04.355', 'Letterhead Design', 'تصميم الخطابات الرسمية (Letterhead)', 'Design professional branded paper templates for official letters.', 'تصميم الخطابات الرسمية والأوراق المروّسة التي تحمل شعار وبيانات شركتك.', 49, 'one-time', 'مرة واحدة', 'Word/Google Docs template, print-ready PDF, and editable source files.', 'قوالب جاهزة لبرنامج Word ومستندات Google، وملفات التصميم الأصلية.', 'New', 'جديد', 0, 'FileText', 1, 74, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.485', 'emailsignature1', '2026-07-19 11:19:04.360', 'Email Signature Design', 'تصميم التوقيع الإلكتروني', 'Custom HTML email signature with clickable links for your team.', 'تصميم توقيع البريد الإلكتروني بنظام HTML متجاوب ومزود بأزرار وروابط حية.', 49, 'one-time', 'مرة واحدة', 'HTML code file, setup guides for Outlook/Gmail, and social links linking.', 'كود HTML التوقيع ودليل التثبيت للبريد الإلكتروني وأزرار تواصل نشطة.', 'New', 'جديد', 0, 'Mail', 1, 75, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.491', 'socialmediakit1', '2026-07-19 11:19:04.365', 'Social Media Kit', 'حقيبة تصاميم التواصل الاجتماعي', 'Cohesive banners and templates for your business social profiles.', 'تصاميم أغلفة وخلفيات موحدة متناسقة مع الهوية لحساباتك الاجتماعية المختلفة.', 99, 'one-time', 'مرة واحدة', 'Banners for Facebook, LinkedIn, X, and customizable Canva post templates.', 'أغلفة للمنصات وقوالب منشورات Canva قابلة للتعديل والكتابة عليها بسهولة.', 'New', 'جديد', 0, 'Share2', 1, 76, 'addon', '', '', '', 'Branding', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.523', 'corpwebsite1234', '2026-07-19 11:19:04.388', 'Corporate Website', 'مواقع الشركات الكبرى', 'Premium multi-page corporate website with high security and custom CMS.', 'تطوير موقع مؤسسي متميز متعدد الصفحات مزود بحماية عالية وإدارة محتوى متقدمة.', 999, 'one-time', 'مرة واحدة', 'Includes custom pages, careers/press boards, CMS integration, and SSL security.', 'يشمل صفحات مخصصة، لوحة وظائف وأخبار، لوحة تحكم متطورة، وتأمين وحماية SSL.', 'New', 'جديد', 0, 'Building', 1, 82, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.536', 'woocommercedev1', '2026-07-19 11:19:04.405', 'WooCommerce Store Dev', 'إنشاء متجر ووكومرس (WooCommerce)', 'Build a flexible WordPress e-commerce store with WooCommerce.', 'تطوير متجر إلكتروني متكامل وقابل للتوسع باستخدام ووردبريس وووكومرس.', 549, 'one-time', 'مرة واحدة', 'WooCommerce setup, payment gateway link, tax configuration, and speed tweaks.', 'تنصيب وتكوين المتجر، ربط بوابات الدفع، ضبط إعدادات الشحن وتحسين سرعة التصفح.', 'New', 'جديد', 0, 'Store', 1, 84, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.542', 'saaswebsite1234', '2026-07-19 11:19:04.409', 'SaaS Website Design', 'مواقع برمجيات الساس (SaaS)', 'High-converting modern marketing website tailored for software platforms.', 'تصميم موقع تسويقي مخصص للمنصات والبرامج السحابية لزيادة الاشتراكات.', 799, 'one-time', 'مرة واحدة', 'Pricing grids, feature breakdowns, user registration portal link, and billing integrate.', 'جداول تسعير ديناميكية، شرح للمميزات، وربط بوابة الفواتير والاشتراكات سترايب.', 'New', 'جديد', 0, 'Layers', 1, 85, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.547', 'webappdev123456', '2026-07-19 11:19:04.414', 'Web Application Dev', 'تطوير تطبيقات الويب المخصصة', 'Custom full-stack web applications using React, Next.js, and APIs.', 'برمجة وتطوير تطبيقات ويب خاصة متكاملة باستخدام أحدث أطر العمل وقواعد البيانات.', 1999, 'one-time', 'مرة واحدة', 'Custom frontend-backend setup, user auth, database linkage, and API integrations.', 'بناء الواجهات واللوحات الخلفية بالكامل وتأمين تسجيل الدخول وربط قواعد البيانات.', 'Enterprise', 'شركات', 0, 'Code', 1, 86, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.551', 'clientportal123', '2026-07-19 11:19:04.433', 'Client Portal Development', 'تطوير بوابات العملاء الخاصة', 'Secure login portals for clients to upload documents, review orders, and pay.', 'بناء بوابات دخول مشفرة ومخصصة لعملائك لرفع الملفات ومتابعة الطلبات والفواتير.', 999, 'one-time', 'مرة واحدة', 'Auth setup, file sharing boards, customer invoicing, and custom branding.', 'بوابة تسجيل آمنة، تبادل ملفات مشفر، تتبع الفواتير والربط بالهوية التجارية.', 'New', 'جديد', 0, 'Users', 1, 87, 'addon', '', '', '', 'Websites', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.574', 'localseo1234567', '2026-07-19 11:19:04.457', 'Local SEO', 'تهيئة البحث المحلي (خرائط جوجل)', 'Optimize your Google Business Profile to dominate local search results.', 'تحسين ظهور شركتك وموقعك بخرائط جوجل للوصول للعملاء في نطاقك الجغرافي.', 149, 'monthly', 'شهرياً', 'Google Business profile setup, local citation submissions, and review automation setups.', 'تعديل السجل الجغرافي، وإيداع الإشارات المحلية، وأدوات حث العملاء على التقييم.', 'New', 'جديد', 0, 'MapPin', 1, 91, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.579', 'techseo12345678', '2026-07-19 11:19:04.462', 'Technical SEO', 'السيو التقني وأرشفة المواقع', 'Fix crawl errors, increase load speeds, and integrate rich structured schema markup.', 'معالجة أخطاء الأرشفة وتحسين سرعة التصفح وإضافة أكواد السكيما لتهيئة محركات البحث.', 199, 'one-time', 'مرة واحدة', 'Speed audit, robots/sitemap config, and schema.org integration.', 'تدقيق الأداء، مراجعة ملفات التوجيه والأرشفة، وإدراج أكواد Schema.org المتقدمة.', 'New', 'جديد', 0, 'Sliders', 1, 92, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.595', 'tiktokads123456', '2026-07-19 11:19:04.480', 'TikTok Ads Management', 'إدارة إعلانات تيك توك', 'Capture young audiences with high-converting TikTok video campaigns.', 'الوصول إلى الجمهور الفتي وزيادة المبيعات بحملات فيديو إبداعية على تيك توك.', 399, 'monthly', 'شهرياً', 'Ad account setup, TikTok Pixel placement, custom audience building, and optimizations.', 'إعداد الحساب الإعلاني، وتركيب بيكسل تيك توك، واستيراد الجماهير المخصصة والتحسين.', 'New', 'جديد', 0, 'Video', 1, 95, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.599', 'linkedinads1234', '2026-07-19 11:19:04.486', 'LinkedIn Ads Management', 'إدارة إعلانات لينكد إن', 'Target B2B professionals and decision makers with premium LinkedIn ads.', 'استهداف المهنيين وصناع القرار في قطاع B2B بحملات إعلانية متطورة على لينكد إن.', 499, 'monthly', 'شهرياً', 'Insight tag config, audience mapping, lead forms setups, and conversion reports.', 'تركيب كود التتبع، فلترة المسميات الوظيفية المستهدفة، وتجهيز نماذج ليد ونسب العائد.', 'New', 'جديد', 0, 'CornerUpRight', 1, 96, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.604', 'emailmarketing1', '2026-07-19 11:19:04.494', 'Email Marketing Setup', 'إعداد وإدارة إعلانات الإيميل', 'Configure Klaviyo or Mailchimp to build automated email sales flows.', 'إعداد وتصميم التدفقات البريدية المؤتمتة ومتابعة سلات الشراء المتروكة.', 249, 'monthly', 'شهرياً', 'List segmentation, template designs, welcome sequence flows, and weekly campaigns.', 'تقسيم قوائم المشتركين، تصميم القوالب، تفعيل رسائل الترحيب والرسائل الترويجية.', 'New', 'جديد', 0, 'Mail', 1, 97, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.608', 'smsmarketing123', '2026-07-19 11:19:04.501', 'SMS Marketing Setup', 'التسويق عبر الرسائل النصية SMS', 'Set up SMS automation to recover abandoned carts and send updates.', 'تفعيل إرسال إشعارات وعروض الرسائل القصيرة التلقائية للعملاء لزيادة نسب إتمام الشراء.', 199, 'monthly', 'شهرياً', 'Twilio/Attentive gateway setups, compliance checking, and welcome flow setup.', 'ربط مزودي الرسائل النصية، الامتثال للقوانين، وتدشين رسائل الترحيب والخصومات.', 'New', 'جديد', 0, 'MessageSquare', 1, 98, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.761', 'crooptimization', '2026-07-19 11:19:04.507', 'Conversion Optimization (CRO)', 'تحسين معدلات التحويل (CRO)', 'Audit your store user flow and set up A/B testing to increase profit margins.', 'تدقيق وتحليل سلوك زوار موقعك وإجراء اختبارات A/B لزيادة نسب إتمام الشراء.', 499, 'one-time', 'مرة واحدة', 'Heatmaps install, checkout funnel audit, A/B test setup, and performance reports.', 'تتبع حركة الماوس، تحليل سلة الشراء، إعداد اختبارات مقارنة وتعديل العناصر.', 'New', 'جديد', 0, 'Sliders', 1, 99, 'addon', '', '', '', 'Marketing', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.777', 'copywriting1234', '2026-07-19 11:19:04.520', 'Copywriting', 'كتابة النصوص الإعلانية', 'Get persuasive sales copywriting for your landing pages, emails, or ads.', 'كتابة محتوى إعلاني مقنع لصفحات البيع ورسائل البريد الإلكتروني والإعلانات.', 99, 'one-time', 'مرة واحدة', 'Sales copy drafting, headline generation, and conversion-focused structures.', 'صياغة العناوين الجاذبة، كتابة نصوص البيع، وتنظيم المحتوى للتحويل المباشر.', 'New', 'جديد', 0, 'FileText', 1, 110, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.782', 'blogwriting1234', '2026-07-19 11:19:04.525', 'Blog Writing', 'كتابة المقالات والتدوين', 'Regular high-quality, SEO-optimized articles to position your brand as a leader.', 'مقالات شهرية عالية الجودة ومتوافقة مع الـ SEO لبناء مرجعية لعلامتك في تخصصك.', 199, 'monthly', 'شهرياً', 'Includes keyword research, content planning, and internal linking layout.', 'تشمل دراسة الكلمات الرئيسية، وضع خطة المقالات، والتنسيق الداخلي للمدونة.', 'New', 'جديد', 0, 'BookOpen', 1, 111, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.787', 'proddescript123', '2026-07-19 11:19:04.530', 'Product Descriptions', 'كتابة وصف المنتجات', 'Write SEO product descriptions that highlight features and benefits.', 'صياغة نصوص وصف مبيعات فريدة وجذابة للمنتجات تساعد في إقناع الزوار بالشراء.', 79, 'one-time', 'مرة واحدة', 'E-commerce listings copywriting, bullet benefits formatting, and keyword matching.', 'كتابة ميزات المنتج ونقاط القوة وإضافة كلمات البحث وتنسيقها للمتاجر.', 'New', 'جديد', 0, 'ShoppingBag', 1, 112, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.799', 'aicontentcreate', '2026-07-19 11:19:04.535', 'AI Content Systems', 'أتمتة صناعة المحتوى بالذكاء الاصطناعي', 'Build automated AI content generation pipelines for blogs and social posts.', 'تأسيس وبناء أنظمة لتوليد المحتوى والمقالات تلقائياً باستخدام الذكاء الاصطناعي.', 99, 'one-time', 'مرة واحدة', 'AI template creations, prompt configurations, and API integration options.', 'إنشاء قوالب التوليد، وإعداد الأوامر، وتثبيت سكربتات النشر التلقائي بموقعك.', 'New', 'جديد', 0, 'Bot', 1, 113, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.807', 'reelsediting123', '2026-07-19 11:19:04.547', 'Reels & Shorts Video Editing', 'مونتاج فيديوهات الريلز والشورتس', 'Turn raw footage into highly engaging vertical videos for TikTok and Instagram.', 'تحويل لقطاتك الخام إلى فيديوهات رأسية جذابة ومثيرة للمنصات الاجتماعية.', 199, 'monthly', 'شهرياً', 'Dynamic captions, transitions, sound effects (SFX), and title design templates.', 'إضافة الترجمات الديناميكية التلقائية، المؤثرات الصوتية والموسيقى المناسبة.', 'New', 'جديد', 0, 'Video', 1, 114, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.812', 'shortsediting12', '2026-07-19 11:19:04.557', 'YouTube Shorts Editing', 'مونتاج فيديوهات اليوتيوب شورتس', 'Create high engagement YouTube short video clips to boost subscribers.', 'مونتاج فيديوهات قصيرة مخصصة لمنصة يوتيوب لزيادة المشاهدات وتكبير القناة.', 199, 'monthly', 'شهرياً', 'Vertical video formatting, speed ramping, subtitles, and channel optimization.', 'تعديل القياس، تسريع اللقطات، دمج الكتابات وشرح الكلمات الدلالية لليوتيوب.', 'New', 'جديد', 0, 'Film', 1, 115, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.818', 'aivideocreate12', '2026-07-19 11:19:04.563', 'AI Video Generation', 'إنتاج فيديوهات الذكاء الاصطناعي', 'Create professional explainer videos with realistic AI avatars.', 'إنتاج مقاطع فيديو توضيحية باستخدام مذيعين رمزيات ذكاء اصطناعي (HeyGen).', 149, 'one-time', 'مرة واحدة', 'AI scriptwriting, avatar selection, voiceovers configuration, and transitions.', 'صياغة النص، واختيار المذيع، وتوليد نطق صوتي متناسق وإخراج المقطع.', 'New', 'جديد', 0, 'Bot', 1, 116, 'addon', '', '', '', 'Content', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.856', 'aiwhatsappagent', '2026-07-19 11:19:04.604', 'AI WhatsApp Agent', 'مساعد واتساب بالذكاء الاصطناعي', 'Official WhatsApp API integration with AI responding, lead qualification, and bookings.', 'ربط واتساب بزنس وتدريب عميل ذكاء اصطناعي للرد وتأهيل العملاء وحجز المواعيد.', 399, 'one-time', 'مرة واحدة', 'Official WhatsApp cloud API connection, Q&A training, and human takeover setup.', 'ربط API واتساب الرسمي، تدريب النموذج، وإعداد خيار التدخل البشري والتحويل لوكيل.', 'AI Powered', 'ذكاء اصطناعي', 0, 'MessageSquare', 1, 131, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.862', 'aivoiceagent123', '2026-07-19 11:19:04.614', 'AI Voice Call Agent', 'مساعد الاتصال الصوتي بالذكاء الاصطناعي', 'Build custom AI agents that answer phone calls and schedule client bookings.', 'تأسيس عميل صوتي ذكي يستقبل المكالمات الهاتفية، ويحجز المواعيد للعملاء تلقائياً.', 599, 'one-time', 'مرة واحدة', 'AI phone line setup, voice cloning setup, calendar linking, and webhook syncs.', 'شراء وتفعيل خط هاتفي، اختيار نبرة الصوت وتدريبه، وربط التقويم والمواعيد.', 'AI Powered', 'ذكاء اصطناعي', 0, 'PhoneCall', 1, 132, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.868', 'aisalesagent123', '2026-07-19 11:19:04.621', 'AI Sales Agent', 'مساعد المبيعات بالذكاء الاصطناعي', 'Deploy an AI sales rep that captures leads and qualifies prospects dynamically.', 'تنصيب عميل ذكاء اصطناعي مخصص للمبيعات وجذب العملاء وتأهيلهم تلقائياً.', 399, 'one-time', 'مرة واحدة', 'Lead capturing widgets, product catalog training, and automated routing parameters.', 'تصميم نوافذ جمع البيانات وتدريب العميل على كتالوجات المنتجات والتوصية.', 'New', 'جديد', 0, 'Bot', 1, 133, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.873', 'aireceptionist1', '2026-07-19 11:19:04.629', 'AI Receptionist', 'موظف الاستقبال الذكي', 'Setup an AI chatbot receptionist that manages bookings and directs queries.', 'إنشاء مساعد استقبال ذكي يقوم بتنسيق الحجوزات وتوجيه الاستفسارات للقسم المعني.', 249, 'one-time', 'مرة واحدة', 'Booking tools integration, multilingual greeting systems, and calendar linking.', 'ربط أدوات الجدولة، أنظمة الترحيب متعددة اللغات، ومتابعة الحجوزات.', 'New', 'جديد', 0, 'Bot', 1, 134, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.879', 'aihrassistant12', '2026-07-19 11:19:04.637', 'AI HR Assistant', 'مساعد الموارد البشرية الذكي', 'Automate CV screenings, candidate messaging, and internal HR policy queries.', 'أتمتة مراجعة السير الذاتية ومراسلة المتقدمين للوظائف وتسهيل لوائح الموارد البشرية.', 249, 'one-time', 'مرة واحدة', 'CV screening bot, applicant tracker linking, and custom HR policy training.', 'برمجة روبوت فحص السير الذاتية وتنسيق المقابلات وحفظ بيانات الموظفين.', 'New', 'جديد', 0, 'Bot', 1, 135, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.890', 'aimarketing1234', '2026-07-19 11:19:04.649', 'AI Marketing Assistant', 'مساعد التسويق بالذكاء الاصطناعي', 'Generate automated social captions, marketing graphics prompts, and analytics summaries.', 'توليد نصوص بوستات ترويجية وأفكار إبداعية وملخصات إحصائية ذكية تلقائياً.', 299, 'one-time', 'مرة واحدة', 'Copywriting setups, image generation prompts templates, and reporting summaries.', 'أتمتة كتابة الكابشن، وتوليد أفكار التصاميم، وتلخيص الأداء الإعلاني.', 'New', 'جديد', 0, 'Bot', 1, 136, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.897', 'aiemailagent123', '2026-07-19 11:19:04.656', 'AI Email Assistant', 'مساعد البريد الإلكتروني الذكي', 'Integrate smart email responders that draft context-aware answers to incoming mail.', 'دمج عميل بريدي ذكي يقوم بصياغة مسودات ردود متوافقة مع سياق الإيميلات الواردة.', 149, 'one-time', 'مرة واحدة', 'Auto-draft integrations, spam filtering rules, and customer support FAQ alignment.', 'إعداد المسودات التلقائية وفلاتر البريد والربط بنظام الدعم الفني.', 'New', 'جديد', 0, 'Bot', 1, 137, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.903', 'aiworkflowagent', '2026-07-19 11:19:04.662', 'AI Workflow Automation', 'أتمتة تدفقات العمل بالذكاء الاصطناعي', 'Connect apps and APIs to automate internal office and business operations.', 'ربط الأنظمة وتدفقات العمل في الشركة للعمل بشكل تلقائي دون تدخل يدوي.', 399, 'one-time', 'مرة واحدة', 'Multi-app sync setups, error checking systems, and custom database integrations.', 'إعداد الربط المتعدد ونقل البيانات تلقائياً وتلافي أخطاء التشغيل اليدوية.', 'New', 'جديد', 0, 'Bot', 1, 138, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.909', 'crmautomation12', '2026-07-19 11:19:04.668', 'CRM Automation', 'أتمتة نظام الـ CRM', 'Set up sales deal stage triggers, task assignments, and automatic invoicing.', 'أتمتة الانتقال بين مراحل صفقات المبيعات وإصدار الفواتير وتنبيه الموظفين.', 249, 'one-time', 'مرة واحدة', 'Lead score tracking, automated stage transitions, and payment status syncs.', 'تهيئة تدفق المبيعات وإرسال التنبيهات مع فواتير سترايب المكتملة.', 'New', 'جديد', 0, 'Bot', 1, 139, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.916', 'bizprocessagent', '2026-07-19 11:19:04.672', 'Business Process Automation', 'أتمتة العمليات التشغيلية للمشاريع', 'Overhaul business operations with custom automation roadmaps and scripts.', 'إعادة تصميم وتنفيذ الحلول الرقمية وأتمتة الجوانب الإدارية والمالية بالكامل.', 599, 'one-time', 'مرة واحدة', 'Full department process audit, customized apier/Make setups, and team tutorials.', 'مراجعة إجراءات الأقسام وتطوير سكربتات الربط ونقل وتخزين البيانات.', 'New', 'جديد', 0, 'Bot', 1, 140, 'addon', '', '', '', 'AI Automation', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.922', 'crmsetup1234567', '2026-07-19 11:19:04.683', 'CRM Setup & Integration', 'تجهيز وبرمجة أنظمة الـ CRM', 'Configure HubSpot, ActiveCampaign, or oho CRM to automate your sales pipeline.', 'إعداد وتدشين نظام مبيعات وعلاقات عملاء (CRM) مخصص لمتابعة صفقاتك وعملائك.', 249, 'one-time', 'مرة واحدة', 'Deal pipelines setup, custom fields configuration, and automated email workflows.', 'بناء مسار الصفقات، تخصيص الخانات، وإعداد تدفقات إيميلات المتابعة التلقائية.', 'New', 'جديد', 0, 'Users', 1, 150, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.928', 'erpplanning1234', '2026-07-19 11:19:04.688', 'ERP Deployment', 'تنصيب وتجهيز أنظمة ERP', 'Deploy Odoo or ERPNext software to manage corporate finances, stock, and HR.', 'تنصيب وضبط أنظمة التخطيط المؤسسي ERP لإدارة المبيعات والمخازن والمحاسبة.', 1499, 'one-time', 'مرة واحدة', 'Server installations, modules setups (accounting, invoicing), and staff roles setup.', 'تنصيب النظام على السيرفر، تفعيل الأقسام المحاسبية والربط بإدارة المشتريات والمبيعات.', 'New', 'جديد', 0, 'Server', 1, 151, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.934', 'inventorysystem', '2026-07-19 11:19:04.694', 'Inventory System Setup', 'نظام إدارة المستودعات والمخازن', 'Implement stock management software with low inventory alerts.', 'تأسيس نظام متكامل لجرد البضائع وتتبع المخزون وتنبيهات نفاد الكميات.', 799, 'one-time', 'مرة واحدة', 'Product database import, multi-location mapping, and barcode hardware linking.', 'استيراد السلع، وإعداد الأماكن والربط بجداول طلبات الشراء والمبيعات.', 'New', 'جديد', 0, 'Database', 1, 152, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.939', 'bookingsystem12', '2026-07-19 11:19:04.702', 'Booking System Setup', 'نظام حجز المواعيد والجدولة', 'Integrate appointment booking widgets with automated SMS/email reminders.', 'ربط وبرمجة نظام متطور لجدولة المواعيد مع إرسال رسائل تذكير تلقائية.', 249, 'one-time', 'مرة واحدة', 'Calendly/Acuity widget customizations, intake forms, and billing gateway links.', 'تخصيص نوافذ الحجز، وتجهيز استمارات البيانات والربط ببنك سترايب لإيداع رسوم الحجز.', 'New', 'جديد', 0, 'Calendar', 1, 153, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.946', 'possystem123456', '2026-07-19 11:19:04.713', 'POS System Integration', 'أنظمة كاشير ونقاط البيع POS', 'Set up hardware and software for retail points of sale.', 'إعداد وربط أجهزة ونظام الكاشير واستقبال الدفع داخل المحل لشركتك.', 499, 'one-time', 'مرة واحدة', 'Terminal station configs, product database upload, and receipt format matching.', 'ضبط الأجهزة والمستشعرات وربط المخزون وتنسيق طباعة الفواتير.', 'New', 'جديد', 0, 'CreditCard', 1, 154, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.952', 'customdashboard', '2026-07-19 11:19:04.721', 'Custom Analytics Dashboard', 'لوحات بيانات تفاعلية مخصصة', 'Connect databases and APIs to track key metrics and sales performance in real-time.', 'ربط قواعد البيانات والـ APIs لتتبع المؤشرات المالية وأداء المبيعات مباشرة.', 499, 'one-time', 'مرة واحدة', 'Includes Looker/PowerBI design or custom React dashboards, with multi-data source setups.', 'لوحات تفاعلية ببرامج الإحصاء أو برمجة React لجمع وعرض البيانات من مصادر متعددة.', 'New', 'جديد', 0, 'BarChart2', 1, 155, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.956', 'saasdevelopment', '2026-07-19 11:19:04.727', 'SaaS Software Development', 'برمجة وتطوير برمجيات الساس (SaaS)', 'Full-cycle development of multi-tenant cloud software platforms.', 'تطوير وبرمجة البرمجيات السحابية والمنصات متعددة الاشتراكات بشكل كامل.', 2999, 'one-time', 'مرة واحدة', 'DB schema setup, user signup configurations, Stripe billing links, and admin control panels.', 'بناء قواعد البيانات وربط الاشتراكات وبوابة الدفع وواجهة التحكم الرئيسية.', 'New', 'جديد', 0, 'Layers', 1, 156, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.962', 'mobileappdev123', '2026-07-19 11:19:04.734', 'Mobile App Development', 'تطوير تطبيقات الجوال', 'Build cross-platform iOS & Android mobile apps using React Native / Flutter.', 'برمجة وتصميم تطبيقات الهواتف الذكية لنظامي أندرويد وiOS بكفاءة عالية.', 2499, 'one-time', 'مرة واحدة', 'App Store submission guides, API connection configs, push alert systems, and payment links.', 'رفع التطبيق للمتاجر وربط الـ APIs وإرسال الإشعارات وبوابات الدفع الداخلي.', 'New', 'جديد', 0, 'Smartphone', 1, 157, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.967', 'internaltools12', '2026-07-19 11:19:04.739', 'Internal Tools Setup', 'برمجة أدوات الإدارة الداخلية', 'Develop custom admin portals using Retool or Appsmith to streamline company ops.', 'تصميم وبناء لوحات تحكم وإدارة داخلية للموظفين لربط وإدخال البيانات بسهولة.', 799, 'one-time', 'مرة واحدة', 'Database connection, table/form interface setups, and role permission settings.', 'ربط قواعد البيانات، بناء الجداول والاستمارات وتحديد صلاحيات رؤية البيانات.', 'New', 'جديد', 0, 'Sliders', 1, 158, 'addon', '', '', '', 'Software', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.986', 'competitoranal1', '2026-07-19 11:19:04.757', 'Competitor Analysis', 'تحليل المنافسين المفصل', 'Analyze competitors keywords, pricing models, and marketing channels.', 'تحليل نقاط القوة والضعف للمنافسين وتتبع كلماتهم المفتاحية وأسعارهم التسويقية.', 199, 'one-time', 'مرة واحدة', 'SWOT matrices, marketing channel audits, and feature-gap opportunity maps.', 'مصفوفات SWOT، أبحاث القنوات التسويقية للمنافس، وتحديد ثغرات التميز والفرص.', 'New', 'جديد', 0, 'Target', 1, 172, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:44.992', 'pitchdeckdesign', '2026-07-19 11:19:04.763', 'Pitch Deck Design', 'تصميم العروض الاستثمارية (Pitch Deck)', 'Design high-converting pitch presentations to secure startup funding.', 'تصميم وصياغة عروض المشاريع الموجهة لجذب التمويلات وإقناع المستثمرين بالدعم.', 499, 'one-time', 'مرة واحدة', 'Custom PowerPoint slides, copywriting enhancement, and financial summaries graphics.', 'تصاميم شرائح مخصصة، صياغة تسويقية للمشروع، ومخططات وعروض ملخصات مالية.', 'New', 'جديد', 0, 'Presentation', 1, 173, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:45.003', 'fundraising1234', '2026-07-19 11:19:04.769', 'Fundraising Support', 'دعم الحصول على تمويلات', 'Structure fundraising plans, compile matching investor lists, and draft pitches.', 'تنظيم خطط التمويل وإعداد قوائم المستثمرين الملائمين وصياغة خطابات التواصل.', 799, 'one-time', 'مرة واحدة', 'Investor match targeting, cold outreach templates, and pitch deck rehearsal coaching.', 'تحديد وتوجيه أهداف التمويل، إعداد نماذج البريد الترويجي وتجربة الإلقاء.', 'New', 'جديد', 0, 'Compass', 1, 174, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:45.009', 'startupmentor12', '2026-07-19 11:19:04.774', 'Startup Mentorship', 'برامج التوجيه لرواد الأعمال', '1-on-1 monthly mentorship calls with experienced startup founders.', 'جلسات تواصل إرشادي شهري خاص 1-على-1 مع رواد أعمال ومستشارين ذوي خبرة.', 199, 'monthly', 'شهرياً', 'Goal setting reviews, Slack communications channel, and pitch deck reviews updates.', 'مراجعة الأهداف الدورية، وتوفير قناة تواصل للمتابعة وتصحيح مسار المشروع.', 'New', 'جديد', 0, 'Users', 1, 175, 'addon', '', '', '', 'Business Consulting', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:45.037', 'soplibrary12345', '2026-07-19 11:19:04.810', 'SOP Library', 'مكتبة إجراءات العمل القياسية (SOPs)', 'Pre-written SOP templates for operations, customer support, sales, and hiring.', 'قوالب إجراءات عمل موثقة وجاهزة للتعديل في خدمة العملاء والمبيعات والتوظيف.', 49, 'one-time', 'مرة واحدة', 'Word/Notion templates, checklists, and clear workflows for team delegation.', 'نماذج Notion ومستندات Word، قوائم التدقيق، وتوزيع المهام داخل الشركة.', 'New', 'جديد', 0, 'BookOpen', 1, 191, 'addon', '', '', '', 'Education', '', '');
REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`, `stripe_product_id`, `stripe_price_id`) VALUES ('2026-07-19 11:13:45.049', 'aipromptpacks12', '2026-07-19 11:19:04.819', 'AI Prompt Packs', 'حقيبة أوامر الذكاء الاصطناعي المميزة', 'Curated prompts for ChatGPT and Claude to automate marketing and coding.', 'أوامر احترافية جاهزة لمنصات الذكاء الاصطناعي لأتمتة التسويق والبرمجة بالكامل.', 29, 'one-time', 'مرة واحدة', 'Advanced prompts library, agent setup parameters, and workflow blueprints.', 'مئات الأوامر المجربة، وهياكل وكلاء ذكاء اصطناعي، وخطوات تطبيق التدفقات.', 'New', 'جديد', 0, 'MessageSquareCode', 1, 192, 'addon', '', '', '', 'Education', '', '');

-- ============================================================
-- SECTION 5: BLOG POSTS (10 articles — EN + AR)
-- ============================================================

-- Clean Blogs SQL Seed (v3)
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_r35u84cp', '2026-07-18 18:48:28', 'Why Stripe Doesn''t Work in Your Country (And the One Fix)', 'why-stripe-doesnt-work-your-country', 'Stripe is blocked in 150+ countries. But thousands of entrepreneurs from those countries use Stripe every day. Here is how.', '''**If you are reading this, there is a good chance Stripe does not work in your country.**\n\nAnd that is not your fault. Stripe supports only 46 countries. The rest of the world — including Egypt, Saudi Arabia, Algeria, Iraq, and most of Africa and Asia — is excluded.\n\n## The Problem\n\nYour options are limited:\n- Third-party payment processors charge 5-8% fees\n- You use someone else''s account (risky and illegal)\n- You lose clients who want to pay with credit cards\n- You are stuck with local payment methods\n\nThis is the #1 bottleneck for founders outside the West.\n\n## The Fix\n\nA US LLC.\n\nWhen you form a US LLC, you become eligible for a Stripe account registered in the United States. Not your home country — the US.\n\n**This means:**\n- You use Stripe normally — no third parties\n- You accept Visa, Mastercard, Amex\n- Your fees drop to 2.9% + 30¢\n- Your account is 100% legal and compliant\n\n## But is This Legal?\n\nYes. US LLC formation is open to non-residents. The US government encourages foreign investment. You are forming a legal US business entity — and that entity qualifies for Stripe.\n\n## How Instant Grow Helps\n\nWe handle the entire process: LLC formation, EIN registration, bank account guidance, and Stripe onboarding support.\n\n**You stay in your country. Your business operates globally.**\n\nThousands of founders from the Middle East, Africa, and Asia are already doing this. The only difference between them and you is one step.', NULL, 'Instant Grow Team', '["Stripe","US LLC","Payments","Global Business"]', 1, 1, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_42fonp6k', '2026-07-18 18:48:28', 'How to Open a US LLC in 3 Steps (From Any Country)', 'how-to-open-us-llc-3-steps', 'A complete step-by-step guide to forming a US LLC from anywhere in the world. No visa. No travel. No US partner.', '''**Step 1: Choose Your State**\n\nThe two most popular states for non-residents are Wyoming and Delaware.\n\n## Wyoming\n\n- No state income tax\n- Low annual fees ($60/year)\n- Strong privacy (no public member names)\n- Best for most founders\n\n## Delaware\n\n- Well-established legal system\n- Preferred by venture capitalists\n- Higher franchise tax ($300+/year)\n- Best if you plan to raise funding\n\nWe recommend Wyoming for 90% of founders starting out.\n\n## Step 2: File Your Documents\n\nYou need three documents:\n\n**Articles of Organization** — The main formation document filed with the state. Contains your company name, address, and registered agent.\n\n**Operating Agreement** — Internal document outlining ownership and management structure. Not filed with the state but essential.\n\n**EIN from the IRS** — Your tax ID number. Required to open a bank account, file taxes, and hire employees. Free to obtain.\n\nInstant Grow prepares all three for you. You just approve and sign.\n\n## Step 3: Open a Bank Account and Start\n\nWith your LLC documents and EIN ready:\n\n- Apply to Mercury or Relay (both accept non-residents)\n- Connect Stripe to your new account\n- Start accepting payments globally\n\n**Total time: 3-5 business days.**\n**Total cost: Starting at $297.**\n\n## What You Get\n\n- A legal US company\n- A US bank account\n- Access to Stripe, PayPal, and 200+ business tools\n- The ability to invoice in USD\n- Global credibility\n\n**No visa. No travel. No US partner. Just a decision.**\n\nAnd Instant Grow makes that decision effortless.', NULL, 'Instant Grow Team', '["US LLC","LLC Formation","Step by Step","Entrepreneurship"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_8mev45cg', '2026-07-18 18:48:28', '5 Biggest Mistakes New LLC Owners Make', '5-biggest-mistakes-new-llc-owners', 'Avoid these common pitfalls that cost founders thousands of dollars and months of headaches.', '''**Mistake 1: Choosing Delaware Because Everyone Says So**\n\nDelaware is not the best choice for most founders. It has higher fees and more compliance requirements.\n\n**Pick Wyoming unless:**\n- You are raising venture capital\n- You plan to go public\n- You specifically need Delaware law\n\nOtherwise, save money and choose Wyoming.\n\n## Mistake 2: Forgetting to Open a US Bank Account\n\nMany founders form their LLC but never open a US bank account. Then they wonder why they cannot receive Stripe payouts.\n\n**You need a US bank account connected to your LLC.** Mercury and Relay make this easy for non-residents.\n\n## Mistake 3: Ignoring Compliance\n\nYour LLC needs:\n- Annual report filing (every state)\n- Registered agent service (ongoing)\n- Tax filings (Form 5472 if you are a single-member LLC owned by a foreign person)\n\n**Missing compliance = late fees, penalties, and possible dissolution.**\n\n## Mistake 4: Using the Wrong EIN\n\nThe EIN you receive from the IRS must match your LLC name exactly. Even one typo can delay bank account opening and tax filing.\n\nDouble-check every letter before using it.\n\n## Mistake 5: Giving Up Too Early\n\nThe first month after formation can be confusing. Bank verifications take time. Stripe reviews your documents. It is easy to feel overwhelmed.\n\n**But founders who push through the first 30 days never go back.**\n\nInstant Grow supports you through the entire journey — not just formation.', NULL, 'Instant Grow Team', '["LLC Mistakes","Compliance","US LLC","Tips"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_9pns6r1t', '2026-07-18 18:48:28', 'Best US Bank Accounts for Non-Residents (2026)', 'best-us-bank-accounts-non-residents', 'A detailed comparison of Mercury, Relay, Wise, and other banking options for international founders with a US LLC.', '''**Mercury — Best Overall for Startups**\n\nMercury is the #1 choice for non-resident founders. It is a US bank designed for startups.\n\n**Why Mercury wins:**\n- No minimum balance\n- No monthly fees\n- Remote verification with your passport\n- Built-in tech stack (API, integrations)\n- Debit cards for team members\n\n**Requirements:** US LLC, EIN, valid passport\n**Best for:** SaaS founders, tech startups\n\n## Relay — Best for Multi-User Needs\n\nRelay is Mercury''s strongest competitor with a few unique advantages.\n\n**Why Relay:**\n- Up to 5 checking accounts with no fees\n- 50 virtual debit cards\n- Team expense management\n- QuickBooks integration\n\n**Best for:** Ecommerce owners, agencies with multiple clients\n\n## Wise — Best for Multi-Currency\n\nWise (formerly TransferWise) offers business accounts with a US routing number.\n\n**Why Wise:**\n- Hold 50+ currencies\n- Convert at real exchange rates\n- Receive USD like a US bank account\n- Easy to connect to Stripe\n\n**Best for:** Freelancers who deal with multiple currencies\n\n## How to Choose\n\n**Start with Mercury.** It is the most startup-friendly and works well with Stripe.\n\nAdd **Relay** if you need multiple accounts and virtual cards.\n\nUse **Wise** as your secondary account for international transfers.\n\n## One Important Note\n\nAll of these banks allow remote onboarding. You do not need to visit the US. Your LLC documents + passport are enough.\n\nInstant Grow helps you set up your bank account as part of our formation package.', NULL, 'Instant Grow Team', '["US Bank","Mercury","Relay","Wise","Banking"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_0743hr27', '2026-07-18 18:48:28', 'How to Receive USD Payments Legally From Any Country', 'how-to-receive-usd-payments-legally', 'The complete guide to accepting US dollars legally as a non-resident entrepreneur. No loopholes. No risky workarounds.', '''**If you are a freelancer, SaaS founder, or ecommerce owner outside the US, receiving USD is probably your biggest frustration.**\n\nHere is the reality:\n\n## The Illegal Ways\n\n- Using a friend''s Stripe account (fraud — your friend is liable for taxes on your income)\n- Fake US address on a personal PayPal account (violates terms of service)\n- Converting crypto without reporting (tax evasion)\n\nThese work temporarily. They also put you at risk of account closure, frozen funds, and legal problems.\n\n## The Legal Way\n\n**Form a US LLC.**\n\nWhen you own a US LLC:\n- You receive USD as a legal US business\n- Stripe pays out to your US bank account\n- You pay US taxes on US income (and claim treaty benefits in your home country)\n- Everything is reported and compliant\n\n## How the Money Flows\n\nYour Client\n→ Pays via Stripe (or any US processor)\n→ Money goes to your US LLC bank account (Mercury/Relay/Wise)\n→ You transfer to your local bank account\n→ You report income on your US LLC tax return\n\n**Every step is legal. Every step is documented.**\n\n## Common Questions\n\n**Do I pay taxes twice?**\nNo. Most countries have tax treaties with the US. You get credit for US taxes paid in your home country.\n\n**Can my local bank receive USD?**\nYes, most international banks accept wire transfers in USD. Some charge fees.\n\n**How much can I receive?**\nThere is no limit. Your US LLC can receive unlimited USD.\n\n## The Bottom Line\n\nIf you earn USD — or want to — a US LLC is not optional. It is the standard way global entrepreneurs operate.\n\nInstant Grow makes it simple.', NULL, 'Instant Grow Team', '["USD","Payments","US LLC","Legal"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_vk0nvmm8', '2026-07-18 18:48:28', 'Why Global Founders Win Bigger (And How You Can Too)', 'why-global-founders-win-bigger', 'Local founders compete locally. Global founders compete globally. The difference is one document: a US company.', '''**Here is a truth most founders do not want to hear:**\n\nIf you only operate in your local market, you are competing with everyone in that market. If you operate globally, you compete with everyone — but you also sell to everyone.\n\n## The Numbers\n\n- Local freelancer: earns in local currency, limited to local clients\n- Global freelancer with US LLC: earns in USD, works with US and EU clients\n- Local SaaS: restricted to local payment methods\n- Global SaaS with US LLC: Stripe, PayPal, 200+ integrations\n\n**The difference is not talent. It is infrastructure.**\n\n## Why Global Founders Win\n\n**1. Higher rates**\nUS and EU clients pay 3-10x more than local clients for the same work.\n\n**2. More clients**\nYou are not limited by geography. Your market is the world.\n\n**3. Better tools**\nStripe, Mercury, HubSpot, AWS credits — many tools are US-only.\n\n**4. Credibility**\nA US company signals trust. Clients feel safer paying a US entity.\n\n## How to Make the Shift\n\nThe shift from local to global is one step: form a US LLC.\n\nDo not wait until you are ready. You will never feel ready. Just take the step.\n\nInstant Grow exists to make that step as simple as ordering food online.', NULL, 'Instant Grow Team', '["Global Business","US LLC","Founder Mindset","Scaling"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_ekg4i783', '2026-07-18 18:48:28', 'Why Freelancers Stay Stuck (And How to Escape)', 'why-freelancers-stay-stuck', 'Most freelancers hit a ceiling at $2,000-3,000/month. Here is why — and exactly what to do about it.', '''**The $2,000 ceiling is real.**\n\nMost freelancers from Egypt, Morocco, Algeria, and across the Middle East hit the same wall:\n\n- They cannot raise rates because local clients cannot pay more\n- They cannot attract US clients because they lack a US payment method\n- They cannot scale because they are stuck trading time for money\n\n## The Real Problem\n\nIt is not your skills. It is your setup.\n\nYou are competing as a local provider in a global market.\n\n## The Escape Plan\n\n**Step 1: Form a US LLC**\nThis is your passport to the global economy. With a US company, you instantly have credibility.\n\n**Step 2: Open a US Bank Account**\nMercury or Relay. Receive payments in USD. Stop losing money on conversion fees.\n\n**Step 3: Set Your Rates in USD**\nCharge $50-100/hour instead of the local equivalent of $10-20/hour. Same work. Different currency.\n\n**Step 4: Reinvest in Your Business**\nUse your higher earnings to invest in tools, training, and team.\n\n## The Mindset Shift\n\nYou are not a freelancer. You are a global service provider.\n\nThe only thing holding you back is the belief that your current situation is permanent. It is not.\n\nInstant Grow helps you make the shift in 3-5 days.', NULL, 'Instant Grow Team', '["Freelancer","US LLC","Escape","Global"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_8kzmls4c', '2026-07-18 18:48:28', '10 US LLC Myths Debunked (What Arabs Need to Know)', '10-us-llc-myths-debunked', 'From "I need a US visa" to "it is too expensive" — we debunk the 10 most common myths about US LLC formation for Arab entrepreneurs.', '''**Myth 1: I Need a US Visa or Green Card**\n\n**Fact:** US LLC formation is open to any non-resident. No visa. No citizenship. No US presence required.\n\n## Myth 2: I Need a US Partner\n\n**Fact:** You can be the 100% owner of your US LLC as a foreign national. No US partner required.\n\n## Myth 3: It Is Too Expensive\n\n**Fact:** Formation starts at $297 with Instant Grow. That is less than many smartphones.\n\n## Myth 4: I Need a Physical US Address\n\n**Fact:** You use a registered agent service. They provide a legal address and forward your mail.\n\n## Myth 5: I Will Pay Double Tax\n\n**Fact:** Most countries have tax treaties with the US. You get credit for US taxes paid. No double taxation.\n\n## Myth 6: I Cannot Open a Bank Account\n\n**Fact:** Mercury, Relay, and Wise all let non-residents open accounts remotely with LLC documents.\n\n## Myth 7: Only Tech People Can Do This\n\n**Fact:** Ecommerce owners, freelancers, creators, coaches, consultants — everyone uses US LLCs.\n\n## Myth 8: It Takes Months\n\n**Fact:** Formation takes 3-5 business days. Bank account setup takes 1-3 days.\n\n## Myth 9: It Is Illegal for Non-Residents\n\n**Fact:** The US government explicitly allows non-residents to form LLCs. It is 100% legal.\n\n## Myth 10: I Can Do It Later\n\n**Fact:** Every month you wait is a month of lost revenue, missed clients, and higher fees.\n\nInstant Grow is here to turn myths into action.', NULL, 'Instant Grow Team', '["LLC Myths","US LLC","Arab Entrepreneurs","Facts"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_0gsa07py', '2026-07-18 18:48:28', 'How to Scale Your Business From $1K to $10K/Month With a US LLC', 'scale-business-1k-to-10k', 'A practical roadmap for taking your online business from four figures to five figures monthly using the infrastructure of a US company.', '''**Every scaling business hits the same transition point.**\n\nYou are earning $1,000-3,000/month. You know you can earn more. But something is blocking you.\n\nThat something is infrastructure.\n\n## The $1K to $5K Stage\n\n**What changes:**\n- Move from local clients to US/EU clients\n- Raise your rates by 3x\n- Set up systems for recurring revenue\n\n**How a US LLC helps:**\n- US clients trust a US company\n- Stripe enables recurring billing\n- US bank account means instant settlement\n\n## The $5K to $10K Stage\n\n**What changes:**\n- Hire your first VA or contractor\n- Automate delivery\n- Build a sales funnel\n\n**How a US LLC helps:**\n- Hire contractors using your EIN\n- Open a business credit card for expenses\n- Access US tools and software unavailable in your country\n\n## The Infrastructure Stack\n\nEvery $10K/month founder needs:\n- A US LLC (your legal entity)\n- Mercury bank account (your USD hub)\n- Stripe (your payment processor)\n- QuickBooks or Xero (your accounting)\n\n**Instant Grow sets up the first two. You bring the ambition.**\n\n## The Timeline\n\n- Week 1: Form LLC + get EIN\n- Week 2: Open bank account + Stripe\n- Week 3: Start pitching US clients\n- Month 2: First US client at higher rates\n- Month 6: $5K/month\n- Month 12: $10K/month\n\n**The only variable is your action. We handle the rest.**', NULL, 'Instant Grow Team', '["Scaling","US LLC","Revenue","Growth"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');
REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`, `created_by`) VALUES ('2026-07-18 18:48:28', 'blog_cfqyd7ga', '2026-07-18 18:48:28', 'The Freedom Equation: How a US LLC Changes Your Life', 'freedom-equation-us-llc-changes-your-life', 'More than a business structure — a US LLC is a key to a different way of living and working. This is what freedom actually looks like.', '''**Freedom is not a philosophy. It is a setup.**\n\nThe ability to:\n- Work with anyone in the world\n- Get paid without obstacles\n- Travel without worrying about income\n- Build without permission\n\nThis is what a US LLC gives you.\n\n## Before the LLC\n\n- Limited to local clients\n- Struggling with payment processors\n- Losing money on currency conversion\n- Feeling stuck in your current market\n\n## After the LLC\n\n- Clients from 50+ countries\n- Stripe payments arriving daily\n- USD bank account growing\n- The world as your market\n\n## What Founders Tell Us\n\n**Ahmed from Cairo:**\n"Before my LLC, I was stuck on freelance platforms competing with hundreds of people for $20 jobs. After, I got my first US client at $75/hour within two weeks."\n\n**Lina from Dubai:**\n"I used to pay 6% to payment intermediaries. Now I pay 2.9% with Stripe. That difference alone pays for my LLC every month."\n\n## The Real ROI\n\nA US LLC costs $297+ with Instant Grow.\n\n**What it returns:**\n- Access to the US economy\n- Higher rates for your work\n- Lower payment processing fees\n- Tax optimization\n- Global credibility\n- Peace of mind\n\n**The ROI is not measured in months. It is measured in weeks.**\n\n## Your Move\n\nFreedom is not something you find. It is something you build.\n\nInstant Grow helps you build it. One LLC at a time.', NULL, 'Instant Grow Team', '["Freedom","US LLC","Lifestyle","Remote Work"]', 1, 0, 'en', NULL, NULL, NULL, NULL, '');

-- ============================================================
-- SECTION 6: SEO COUNTRY PAGES (Egypt, Saudi Arabia, UAE, + more)
-- ============================================================


REPLACE INTO `countries_seo_pages` (`id`, `slug`, `country_name`, `country_code`, `meta_title`, `meta_description`, `hero_title`, `hero_description`, `main_keyword`, `secondary_keywords`, `pain_points`, `benefits`, `best_bank`, `bank_notes`, `tax_notes`, `faq_json`, `cta_text`, `published`, `created`, `updated`) VALUES
('seoegypt000001', 'egypt', 'Egypt', 'EG',
 'US LLC Formation for Egyptian Entrepreneurs | Instant Grow',
 'Complete guide to forming a US LLC from Egypt. Banking options, US-Egypt tax treaties, and how to run your US company remotely.',
 'Form Your US LLC from Egypt',
 'Launch your US company from Egypt with zero US presence required. Open a US bank account remotely, benefit from the US-Egypt tax treaty, and accept payments globally.',
 'US LLC Egypt',
 '["LLC for Egyptians","US company from Egypt","Egyptian entrepreneurs US LLC","US bank account Egypt"]',
 '["Confusing US incorporation process from Egypt","High US banking minimums for non-residents","Unclear US-Egypt tax obligations","Limited payment processing options"]',
 '[{"title":"Zero US Presence Required","desc":"Form your LLC completely online from Egypt — no visa, address, or residency needed."},{"title":"Remote US Bank Account","desc":"Open Mercury or Relay from Egypt without visiting the US."},{"title":"US-Egypt Tax Treaty","desc":"Leverage the tax treaty to avoid double taxation on business income."},{"title":"Global Payment Processing","desc":"Accept payments via Stripe and PayPal unavailable to Egyptian residents directly."}]',
 'Mercury',
 'Mercury is the top choice for Egyptian founders — no minimum balance, no monthly fees, remote verification with Egyptian passport.',
 'Egypt has a tax treaty with the US. LLC profits are generally not taxed in Egypt unless remitted. Consult a local tax advisor.',
 '[{"question":"Can I form a US LLC from Egypt?","answer":"Yes — the US allows any individual, regardless of citizenship, to own a US LLC."},{"question":"Do I need a US visa?","answer":"No. The entire process is done remotely online."},{"question":"Can I open a US bank account from Egypt?","answer":"Yes. Mercury and Relay both accept Egyptian founders remotely with a valid passport."}]',
 'Form My US LLC from Egypt',
 1, NOW(3), NOW(3));

REPLACE INTO `countries_seo_pages` (`id`, `slug`, `country_name`, `country_code`, `meta_title`, `meta_description`, `hero_title`, `hero_description`, `main_keyword`, `secondary_keywords`, `pain_points`, `benefits`, `best_bank`, `bank_notes`, `tax_notes`, `faq_json`, `cta_text`, `published`, `created`, `updated`) VALUES
('seosaudi000001', 'saudi-arabia', 'Saudi Arabia', 'SA',
 'US LLC Formation for Saudi Entrepreneurs | Instant Grow',
 'Form a US LLC from Saudi Arabia. Get Stripe, Mercury bank, and global payments — all done remotely without leaving Saudi Arabia.',
 'Form Your US LLC from Saudi Arabia',
 'Saudi entrepreneurs can own a US LLC and access Stripe, Mercury, and global payment tools — all from Saudi Arabia, no US trip needed.',
 'US LLC Saudi Arabia',
 '["LLC for Saudis","US company from Saudi Arabia","Saudi entrepreneurs US LLC","Stripe for Saudi Arabia"]',
 '["Stripe is unavailable in Saudi Arabia","Limited global payment options","Complex international banking requirements","Difficulty accepting payments from US clients"]',
 '[{"title":"Zero US Presence Required","desc":"Form your LLC entirely online from Saudi Arabia."},{"title":"Stripe Access","desc":"Accept Stripe payments legally via your US LLC."},{"title":"Mercury Bank Account","desc":"Open a remote US bank account."},{"title":"Global Business Credibility","desc":"A US LLC gives you credibility with international clients."}]',
 'Mercury',
 'Mercury accepts Saudi founders with valid Saudi passports for remote verification.',
 'Saudi Arabia does not tax US LLC pass-through income at source. Consult a local tax advisor.',
 '[{"question":"Can I use Stripe in Saudi Arabia via a US LLC?","answer":"Yes. Your US LLC qualifies for a US Stripe account."},{"question":"How long does formation take?","answer":"3-5 business days with Instant Grow."}]',
 'Form My US LLC from Saudi Arabia',
 1, NOW(3), NOW(3));

REPLACE INTO `countries_seo_pages` (`id`, `slug`, `country_name`, `country_code`, `meta_title`, `meta_description`, `hero_title`, `hero_description`, `main_keyword`, `secondary_keywords`, `pain_points`, `benefits`, `best_bank`, `bank_notes`, `tax_notes`, `faq_json`, `cta_text`, `published`, `created`, `updated`) VALUES
('seouae00000001', 'uae', 'UAE', 'AE',
 'US LLC or UAE Company Formation | Instant Grow',
 'Compare US LLC vs UAE Freezone formation. Get the best setup for banking, Stripe, and global payments from UAE.',
 'Form Your Company from the UAE',
 'UAE residents can form a US LLC or a UAE Freezone company. Get global payment access, banking, and full compliance support.',
 'company formation UAE',
 '["US LLC from UAE","UAE Freezone company","Stripe for UAE","company formation Dubai"]',
 '["High UAE freezone costs","Complex banking requirements","Limited global payment processors","High annual renewal fees"]',
 '[{"title":"US LLC from UAE","desc":"Form a Wyoming LLC in 3-5 days for global Stripe access."},{"title":"UAE Freezone Company","desc":"100% foreign ownership, no corporate tax for most freezones."},{"title":"Banking Access","desc":"Mercury for US LLC or Wise/Mashreq for UAE companies."},{"title":"Stripe & PayPal","desc":"Access global payment processors via your US LLC."}]',
 'Mercury or Wise',
 'Mercury is best for US LLC holders. Wise and Mashreq are popular for UAE Freezone companies.',
 'UAE has 9% corporate tax above AED 375K profit. US LLCs owned by UAE residents may have US filing obligations. Consult a tax advisor.',
 '[{"question":"Should I form a US LLC or UAE Freezone company?","answer":"US LLC is better for global payments and Stripe. UAE Freezone is better for UAE local presence."},{"question":"Can I have both?","answer":"Yes. Many founders maintain both structures."}]',
 'Get Started Today',
 1, NOW(3), NOW(3));

-- MySQL SEO Countries Seed Data

-- Seed data: Programmatic SEO country pages
REPLACE INTO `countries_seo_pages` (slug, country_name, country_code, meta_title, meta_description, hero_title, hero_description, main_keyword, secondary_keywords, pain_points, benefits, best_bank, bank_notes, tax_notes, faq_json, cta_text, published) values
(
  'egypt',
  'Egypt',
  'EG',
  'US LLC Formation for Egyptian Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Egypt. Learn about banking options, US-Egypt tax treaties, compliance, and how to run your US company remotely from Cairo or anywhere in Egypt.',
  'Form Your US LLC from Egypt',
  'Launch your US company from Egypt with zero US presence required. Open a US bank account remotely, benefit from the US-Egypt tax treaty, and accept payments globally — all while living in Egypt.',
  'US LLC Egypt',
  '["LLC for Egyptians","US company from Egypt","Egyptian entrepreneurs US LLC","US bank account Egypt"]',
  '["Confusing US incorporation process from Egypt", "High US banking minimums for non-residents", "Unclear US-Egypt tax obligations", "Limited payment processing options for Egyptian founders"]',
  '[{"title": "Zero US Presence Required", "desc": "Form your LLC completely online from Egypt. No US visa, address, or residency needed."}, {"title": "Remote US Bank Account", "desc": "Open a Mercury or Relay bank account from Egypt without visiting the US. Receive a US routing number."}, {"title": "US-Egypt Tax Treaty Benefits", "desc": "Leverage the tax treaty between the US and Egypt to avoid double taxation on your business income."}, {"title": "Global Payment Processing", "desc": "Accept payments via Stripe, PayPal, and other US-based processors unavailable to Egyptian residents."}]',
  'Mercury',
  'Mercury is the top choice for Egyptian founders — no minimum balance, no monthly fees, remote verification with Egyptian passport.',
  'Egypt has a tax treaty with the US. LLC profits are generally not taxed in Egypt unless remitted. Consult a local tax advisor for your specific situation.',
  '[{"question": "Can an Egyptian citizen form a US LLC?", "answer": "Yes, absolutely. US LLC formation does not require US citizenship or residency. You can form one entirely online from Egypt using a registered agent service."}, {"question": "Do I need a US visa to form an LLC?", "answer": "No, you do not need any US visa or physical presence. The entire process can be completed remotely from Egypt."}, {"question": "Which US state is best for Egyptian founders?", "answer": "Wyoming and Delaware are the most popular choices. Wyoming has lower annual fees and no state income tax, while Delaware has a well-established legal system."}, {"question": "Can I open a US bank account from Egypt?", "answer": "Yes, online banks like Mercury and Relay allow Egyptian founders to open accounts remotely with their Egyptian passport and LLC documents."}, {"question": "How are LLC profits taxed in Egypt?", "answer": "Under the US-Egypt tax treaty, LLC profits may be exempt from Egyptian taxation if the business has no permanent establishment in Egypt. However, consult a tax professional for your specific case."}, {"question": "How much does it cost to form a US LLC from Egypt?", "answer": "The total cost ranges from $300-$800 depending on the state and registered agent. Instant Grow offers LLC formation starting at $297."}]',
  'Start Your US LLC from Egypt', 1),
(
  'saudi-arabia',
  'Saudi Arabia',
  'SA',
  'US LLC Formation for Saudi Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Saudi Arabia. Learn about banking, US-Saudi tax considerations, compliance, and running your US company from Riyadh or Jeddah.',
  'Form Your US LLC from Saudi Arabia',
  'Launch your US company from Saudi Arabia without leaving the Kingdom. Open a US bank account remotely, navigate US-Saudi tax rules, and scale globally.',
  'US LLC Saudi Arabia',
  '["LLC for Saudis","US company from Saudi Arabia","Saudi entrepreneurs US LLC","US bank account Saudi Arabia"]',
  '["Complex US company registration for Saudi nationals", "Limited US banking access from Saudi Arabia", "Uncertain tax implications under Saudi law", "Difficulty accepting international payments as Saudi resident"]',
  '[{"title": "100% Remote Formation", "desc": "Form your LLC entirely online from Saudi Arabia. No US travel, visa, or in-person requirements."}, {"title": "US Bank Account from KSA", "desc": "Open a US bank account remotely. Mercury and Relay support Saudi passports and proof of address."}, {"title": "Saudi Tax Compliance", "desc": "Understand how your US LLC interacts with Zakat, VAT, and Saudi income tax regulations."}, {"title": "Access US Payment Gateways", "desc": "Accept payments through Stripe, PayPal, and other US processors to serve global clients."}]',
  'Mercury',
  'Mercury works well for Saudi founders. Use your Saudi passport for identity verification. Relay is a good alternative.',
  'Saudi Arabia does not have a formal income tax treaty with the US. LLC income may be subject to Zakat or other Saudi taxes. Always consult a Saudi tax advisor.',
  '[{"question": "Can a Saudi national form a US LLC?", "answer": "Yes, Saudi nationals can form a US LLC entirely online. No US residency or citizenship is required."}, {"question": "What US bank can I use from Saudi Arabia?", "answer": "Mercury and Relay are the most accessible. Both support remote onboarding with a Saudi passport and LLC formation documents."}, {"question": "Does Saudi Arabia tax US LLC income?", "answer": "Saudi tax treatment depends on your residency status and business activities. Consult a Saudi tax advisor, especially regarding Zakat obligations."}, {"question": "Which US state is best?", "answer": "Wyoming is popular for Saudi founders due to no state income tax and strong privacy protections."}, {"question": "Can I use Saudi ID documents for verification?", "answer": "Yes, your Saudi passport is sufficient for US LLC formation and most online bank verifications."}]',
  'Start Your US LLC from Saudi Arabia', 1),
(
  'uae',
  'United Arab Emirates',
  'AE',
  'US LLC Formation for UAE Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from the UAE. Learn about banking, US-UAE tax treaty benefits, free zone considerations, and running your US company from Dubai or Abu Dhabi.',
  'Form Your US LLC from the UAE',
  'Launch your US company from Dubai, Abu Dhabi, or anywhere in the UAE. Leverage the US-UAE tax treaty, open a US bank account remotely, and grow your global business.',
  'US LLC UAE',
  '["LLC for UAE residents","US company from Dubai","UAE entrepreneurs US LLC","Dubai US LLC formation"]',
  '["Confusing US vs UAE company structure options", "Banking hurdles for UAE residents opening US accounts", "Understanding US-UAE tax treaty application", "Choosing between Dubai free zone and US LLC"]',
  '[{"title": "Seamless Remote Formation", "desc": "Form your LLC online from Dubai or Abu Dhabi. No US presence or travel needed."}, {"title": "US-UAE Tax Treaty Advantage", "desc": "The US-UAE tax treaty provides strong protection against double taxation for UAE residents."}, {"title": "Remote US Banking", "desc": "Open Mercury or Relay accounts from the UAE using your Emirates ID or passport."}, {"title": "Free Zone vs LLC Clarity", "desc": "Understand when a US LLC makes more sense than a Dubai free zone company for your business."}]',
  'Mercury',
  'Mercury is the top choice for UAE founders. They accept UAE residency proof and passports. Wise multi-currency accounts also pair well.',
  'The US-UAE tax treaty generally prevents double taxation. LLC income is typically not taxed in the UAE (no corporate income tax for most activities).',
  '[{"question": "Can I form a US LLC while living in Dubai?", "answer": "Yes, absolutely. Many UAE entrepreneurs form US LLCs to access US payment gateways and serve American clients."}, {"question": "US LLC or Dubai Free Zone?", "answer": "A US LLC is better if your customers are primarily in the US. Free zones are better for UAE-local operations. Some entrepreneurs use both structures."}, {"question": "Can I open a US bank account from the UAE?", "answer": "Yes. Mercury and Relay both accept UAE residents. You need your LLC documents and valid passport/Emirates ID."}, {"question": "Does the UAE tax US LLC income?", "answer": "The UAE has no corporate income tax for most mainland businesses. Under the US-UAE tax treaty, LLC income should not be double-taxed."}, {"question": "What is the total cost?", "answer": "US LLC formation costs $300-$800. Instant Grow offers packages starting at $297 + state fees."}]',
  'Start Your US LLC from the UAE', 1),
(
  'morocco',
  'Morocco',
  'MA',
  'US LLC Formation for Moroccan Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Morocco. Learn about banking, US-Morocco tax treaty benefits, compliance, and running your US company from Casablanca or Marrakech.',
  'Form Your US LLC from Morocco',
  'Launch your US company from Morocco with zero US presence. Open a US bank account remotely, benefit from the US-Morocco tax treaty, and access global payments.',
  'US LLC Morocco',
  '["LLC for Moroccans","US company from Morocco","Moroccan entrepreneurs US LLC","US bank account Morocco"]',
  '["Limited US banking options for Moroccan residents", "Complex US-Morocco tax compliance", "Payment processing restrictions for Moroccan businesses", "Language barriers in legal processes"]',
  '[{"title": "Fully Remote Formation", "desc": "Form your LLC online from Morocco. French and Arabic support available through our platform."}, {"title": "US Bank Account from Morocco", "desc": "Open a Mercury or Relay bank account remotely using your Moroccan passport."}, {"title": "US-Morocco Tax Treaty", "desc": "The US-Morocco tax treaty helps avoid double taxation on your LLC income."}, {"title": "Global Payment Access", "desc": "Accept payments via US-based processors like Stripe to serve international clients."}]',
  'Mercury',
  'Mercury supports Moroccan residents. Use your passport for verification. Wise is a good alternative for multi-currency needs.',
  'Morocco has a tax treaty with the US. LLC income is generally taxable only in the US unless you have a permanent establishment in Morocco. Consult a Moroccan tax expert.',
  '[{"question": "Can a Moroccan citizen form a US LLC?", "answer": "Yes, Moroccan citizens can form a US LLC entirely online. The process does not require US residency or citizenship."}, {"question": "What bank can I use from Morocco?", "answer": "Mercury is the most accessible for Moroccan founders. Wise Business also works well for multi-currency accounts."}, {"question": "How does the US-Morocco tax treaty affect my LLC?", "answer": "Under the treaty, business profits are generally taxed only in the US unless you have a permanent establishment in Morocco. This can significantly reduce your tax burden."}, {"question": "Is the process available in French or Arabic?", "answer": "Our platform supports both English and Arabic. We also provide French-language support for Moroccan clients."}, {"question": "Which US state is best?", "answer": "Wyoming is recommended for Moroccan founders — no state income tax, low annual fees, and strong privacy protections."}]',
  'Start Your US LLC from Morocco', 1) ;



-- Seed data: Additional programmatic SEO country pages (MENA + Africa focus)
REPLACE INTO `countries_seo_pages` (slug, country_name, country_code, meta_title, meta_description, hero_title, hero_description, main_keyword, secondary_keywords, pain_points, benefits, best_bank, bank_notes, tax_notes, faq_json, cta_text, published) values
(
  'algeria',
  'Algeria',
  'DZ',
  'US LLC Formation for Algerian Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Algeria. Learn about banking, US-Algeria tax treaty, compliance, and running your US company from Algiers.',
  'Form Your US LLC from Algeria',
  'Launch your US company from Algeria with zero US presence. Open a US bank account remotely, benefit from trade agreements, and accept payments globally.',
  'US LLC Algeria',
  '["LLC for Algerians","US company from Algeria","Algerian entrepreneurs US LLC","US bank account Algeria"]',
  '["Limited USD payment options for Algerian founders", "Complex US company formation process from Algeria", "Unclear tax obligations between US and Algeria", "Restricted international banking access"]',
  '[{"title": "100% Remote Formation", "desc": "Form your LLC entirely online from Algeria. No US visa or travel needed."}, {"title": "US Bank Account from Algeria", "desc": "Open a Mercury or Wise account remotely using your Algerian passport."}, {"title": "Global Payment Access", "desc": "Accept payments via Stripe and US processors unavailable to Algerian residents."}, {"title": "USD Revenue in Dinar Economy", "desc": "Earn in USD while living in Algeria. Protect your income from local currency fluctuations."}]',
  'Mercury',
  'Mercury supports Algerian residents. Use your passport for identity verification. Wise Business is a good backup.',
  'Algeria has limited tax treaty provisions with the US. Consult a local tax advisor for your specific situation regarding US LLC income.',
  '[{"question": "Can an Algerian citizen form a US LLC?", "answer": "Yes, absolutely. US LLC formation is open to all non-residents, including Algerian citizens. No US visa or residency required."}, {"question": "What US bank works for Algerians?", "answer": "Mercury and Wise Business are the most accessible. Both support remote onboarding with an Algerian passport."}, {"question": "How do I receive USD payments?", "answer": "Your US LLC can open a Stripe account to accept credit card payments. Funds settle in your US bank account, then you transfer to Algeria."}, {"question": "Which US state is best for Algerians?", "answer": "Wyoming is recommended — no state income tax, low fees, and strong privacy protections."}, {"question": "Is this legal in Algeria?", "answer": "Yes. You are forming a legal US business entity. Algerian law does not prohibit citizens from owning foreign companies."}]',
  'Start Your US LLC from Algeria', 1),
(
  'iraq',
  'Iraq',
  'IQ',
  'US LLC Formation for Iraqi Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Iraq. Learn about banking options, tax considerations, and running your US company from Baghdad or Erbil.',
  'Form Your US LLC from Iraq',
  'Launch your US company from Iraq without leaving the country. Open a US bank account remotely, access global payment systems, and scale your business.',
  'US LLC Iraq',
  '["LLC for Iraqis","US company from Iraq","Iraqi entrepreneurs US LLC","US bank account Iraq"]',
  '["Very limited international payment options from Iraq", "US banking access nearly impossible as Iraqi resident", "Currency instability and transfer restrictions", "Limited credibility with international clients"]',
  '[{"title": "Remote US Company Formation", "desc": "Form your LLC from anywhere in Iraq. No US presence or travel required."}, {"title": "US Bank Account Access", "desc": "Open a US bank account remotely. Mercury and Wise accept Iraqi passport holders."}, {"title": "Global Credibility", "desc": "A US company signals trust and professionalism to international clients and partners."}, {"title": "USD Income Protection", "desc": "Earn and hold USD in your US account, protecting your revenue from IQD fluctuations."}]',
  'Mercury',
  'Mercury and Wise Business are the best options for Iraqi residents. Verification may require additional documentation.',
  'Iraq does not have a formal tax treaty with the US. Consult a tax advisor about US LLC income reporting requirements.',
  '[{"question": "Can an Iraqi citizen form a US LLC?", "answer": "Yes, Iraqi citizens can form a US LLC entirely online. No US citizenship, visa, or residency is required."}, {"question": "What bank can I use from Iraq?", "answer": "Mercury and Wise Business accept Iraqi passport holders. Some additional verification may be requested."}, {"question": "How do clients pay me?", "answer": "Your LLC can use Stripe, PayPal, or other US processors. Clients pay in USD to your US company."}, {"question": "Which state is best?", "answer": "Wyoming is the top choice for Iraqi founders — no state income tax and strong privacy."}, {"question": "What about US taxes?", "answer": "Your LLC will need to file US taxes annually. A CPA familiar with foreign-owned LLCs can handle this."}]',
  'Start Your US LLC from Iraq', 1),
(
  'jordan',
  'Jordan',
  'JO',
  'US LLC Formation for Jordanian Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Jordan. Learn about banking, US-Jordan tax treaty, and running your US company from Amman.',
  'Form Your US LLC from Jordan',
  'Launch your US company from Jordan with zero US presence. Open a US bank account remotely, benefit from the US-Jordan FTA, and accept global payments.',
  'US LLC Jordan',
  '["LLC for Jordanians","US company from Jordan","Jordanian entrepreneurs US LLC","US bank account Jordan"]',
  '["Limited payment processing for Jordanian businesses", "High fees on international transfers", "Complex US company registration process", "Currency conversion losses on USD earnings"]',
  '[{"title": "100% Remote Setup", "desc": "Form your LLC from Amman or anywhere in Jordan. No US travel required."}, {"title": "US Bank Account Remotely", "desc": "Open Mercury or Relay accounts from Jordan using your passport and LLC documents."}, {"title": "US-Jordan Trade Benefits", "desc": "Leverage the US-Jordan Free Trade Agreement framework for your business operations."}, {"title": "Global Payment Processing", "desc": "Accept payments via Stripe and other US processors to serve international clients."}]',
  'Mercury',
  'Mercury is the best choice for Jordanian founders. They accept Jordanian passports and proof of address.',
  'Jordan has a Free Trade Agreement with the US. Consult a tax professional about the implications for your LLC income.',
  '[{"question": "Can a Jordanian form a US LLC?", "answer": "Yes, Jordanian citizens can form a US LLC entirely online. No US residency required."}, {"question": "Which US bank works for Jordanians?", "answer": "Mercury is the top choice. Relay and Wise Business are good alternatives."}, {"question": "Do I need to visit the US?", "answer": "No. The entire process is remote — from formation to bank account opening."}, {"question": "How much does it cost?", "answer": "US LLC formation starts at $297 with Instant Grow. State fees are additional ($100-200)."}, {"question": "Can I use Stripe?", "answer": "Yes! A US LLC qualifies for a US Stripe account, even if you live in Jordan."}]',
  'Start Your US LLC from Jordan', 1),
(
  'kuwait',
  'Kuwait',
  'KW',
  'US LLC Formation for Kuwaiti Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Kuwait. Learn about banking, tax-free considerations, and running your US company from Kuwait City.',
  'Form Your US LLC from Kuwait',
  'Launch your US company from Kuwait without leaving the country. Open a US bank account remotely and access global payment systems.',
  'US LLC Kuwait',
  '["LLC for Kuwaitis","US company from Kuwait","Kuwaiti entrepreneurs US LLC","US bank account Kuwait"]',
  '["Limited US banking options for Kuwaiti residents", "Stripe and PayPal not available locally", "High currency conversion costs", "Difficulty attracting international clients without US entity"]',
  '[{"title": "Zero US Presence Needed", "desc": "Form your LLC from Kuwait City completely online. No US visa or travel."}, {"title": "Remote US Banking", "desc": "Open Mercury or Relay accounts from Kuwait using your civil ID and passport."}, {"title": "KWD to USD Optimization", "desc": "Earn in USD and benefit from the stable KWD peg. Minimize conversion losses."}, {"title": "Access US Payment Gateways", "desc": "Use Stripe, PayPal, and other US-only processors with your US LLC."}]',
  'Mercury',
  'Mercury accepts Kuwaiti residents. Your civil ID and passport are sufficient for verification.',
  'Kuwait has no personal income tax. US LLC income may have different treatment. Consult a Kuwaiti tax advisor.',
  '[{"question": "Can a Kuwaiti form a US LLC?", "answer": "Yes, Kuwaiti citizens can form a US LLC entirely online. No US residency or citizenship required."}, {"question": "What bank is best from Kuwait?", "answer": "Mercury is the most popular. Relay and Wise Business also work well for Kuwaiti residents."}, {"question": "Do I pay Kuwaiti taxes?", "answer": "Kuwait has no personal income tax. However, consult a tax professional about your specific situation."}, {"question": "Which US state?", "answer": "Wyoming is recommended for Kuwaiti founders — no state income tax and low annual fees."}, {"question": "How fast can I start?", "answer": "LLC formation takes 3-5 business days. Bank account opens in 1-3 days after that."}]',
  'Start Your US LLC from Kuwait', 1),
(
  'lebanon',
  'Lebanon',
  'LB',
  'US LLC Formation for Lebanese Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Lebanon. Learn about banking amid the crisis, USD income strategies, and running your US company from Beirut.',
  'Form Your US LLC from Lebanon',
  'Launch your US company from Lebanon and escape the local economic challenges. Earn in USD, open a US bank account remotely, and build global income.',
  'US LLC Lebanon',
  '["LLC for Lebanese","US company from Lebanon","Lebanese entrepreneurs US LLC","US bank account Lebanon"]',
  '["Banking crisis makes international payments nearly impossible", "LBP devaluation erodes local earnings", "Stripe and PayPal blocked for Lebanon", "No reliable way to receive USD legally"]',
  '[{"title": "Escape the Banking Crisis", "desc": "Form a US LLC and earn in USD directly. No need to rely on the local banking system."}, {"title": "US Bank Account from Lebanon", "desc": "Open Mercury or Wise accounts remotely. Receive USD directly from clients worldwide."}, {"title": "Currency Stability", "desc": "Hold your earnings in USD, protected from LBP devaluation and inflation."}, {"title": "Global Client Access", "desc": "Accept credit card payments via Stripe. Your US company can serve clients anywhere."}]',
  'Mercury',
  'Mercury and Wise Business accept Lebanese passport holders. Digital verification makes it possible even amid the banking crisis.',
  'Lebanon has complex tax situation. US LLC income may have different treatment under Lebanese law. Consult a professional.',
  '[{"question": "Can a Lebanese citizen form a US LLC?", "answer": "Yes, Lebanese citizens can form a US LLC entirely online. It is a popular solution for escaping local banking limitations."}, {"question": "How do I get paid in USD?", "answer": "Your US LLC opens a US bank account (Mercury/Wise) and a Stripe account. Clients pay in USD directly."}, {"question": "Is this legal during the crisis?", "answer": "Yes, owning a foreign company is legal for Lebanese citizens. You are forming a legitimate US business."}, {"question": "What about transferring money to Lebanon?", "answer": "You can transfer USD from your US account to your Lebanese bank account or use Wise for better rates."}, {"question": "What is the cost?", "answer": "Formation starts at $297 with Instant Grow. Many Lebanese founders recover this cost in their first week."}]',
  'Start Your US LLC from Lebanon', 1),
(
  'oman',
  'Oman',
  'OM',
  'US LLC Formation for Omani Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Oman. Learn about banking, US-Oman FTA benefits, and running your US company from Muscat.',
  'Form Your US LLC from Oman',
  'Launch your US company from Oman without leaving the country. Benefit from the US-Oman FTA, open a US bank account remotely, and scale globally.',
  'US LLC Oman',
  '["LLC for Omanis","US company from Oman","Omani entrepreneurs US LLC","US bank account Oman"]',
  '["Limited international payment processing in Oman", "Stripe not available for Omani residents", "High fees on cross-border transactions", "Difficulty competing for US clients without US entity"]',
  '[{"title": "Remote Formation", "desc": "Form your US LLC entirely from Muscat. No US travel or visa needed."}, {"title": "US Banking Access", "desc": "Open Mercury or Relay accounts remotely with your Omani passport."}, {"title": "US-Oman FTA Leverage", "desc": "Build on the strong US-Oman trade relationship. Your US LLC can trade under favorable terms."}, {"title": "Stripe & Global Payments", "desc": "Accept credit card payments via Stripe and other US processors unavailable in Oman."}]',
  'Mercury',
  'Mercury is the top choice for Omani founders. They accept Omani passports for remote verification.',
  'Oman has a Free Trade Agreement with the US. Consult a tax advisor about your LLC income treatment.',
  '[{"question": "Can an Omani citizen form a US LLC?", "answer": "Yes, Omani citizens can form a US LLC entirely online. No US residency or citizenship required."}, {"question": "What US bank works from Oman?", "answer": "Mercury is the best option. Relay and Wise Business are good alternatives."}, {"question": "How does the US-Oman FTA help?", "answer": "The FTA provides a strong framework for US-Oman business relations, though tax treatment should be verified with a professional."}, {"question": "Which US state is best?", "answer": "Wyoming for most founders. Delaware if you plan to raise venture capital."}, {"question": "How fast can I start accepting payments?", "answer": "Formation takes 3-5 days. Bank and Stripe setup takes another 2-3 days."}]',
  'Start Your US LLC from Oman', 1),
(
  'qatar',
  'Qatar',
  'QA',
  'US LLC Formation for Qatari Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Qatar. Learn about banking, tax-free environment, and running your US company from Doha.',
  'Form Your US LLC from Qatar',
  'Launch your US company from Doha with zero US presence required. Open a US bank account remotely and access global payment systems.',
  'US LLC Qatar',
  '["LLC for Qataris","US company from Qatar","Qatari entrepreneurs US LLC","US bank account Qatar"]',
  '["Limited access to US payment processors from Qatar", "Stripe and PayPal alternatives are expensive", "Currency conversion costs eating into profits", "Local credibility gap with international clients"]',
  '[{"title": "100% Remote from Doha", "desc": "Form your LLC from Qatar without any US presence. Entirely online process."}, {"title": "Premium US Banking", "desc": "Open Mercury accounts remotely. Qatari passports and ID are accepted for verification."}, {"title": "Tax-Efficient Structure", "desc": "Qatar has no income tax. Combined with Wyoming LLC, you can achieve a highly tax-efficient structure."}, {"title": "US Payment Gateways", "desc": "Access Stripe, PayPal, and 200+ US business tools that are unavailable in Qatar."}]',
  'Mercury',
  'Mercury is the top choice for Qatari founders. Use your Qatari passport for remote verification.',
  'Qatar has no personal income tax. Consult a tax advisor about how your US LLC income is treated.',
  '[{"question": "Can a Qatari citizen form a US LLC?", "answer": "Yes, Qatari citizens can form a US LLC entirely online. It is a straightforward process."}, {"question": "Which bank is best from Qatar?", "answer": "Mercury is the most popular. Wise Business and Relay are good alternatives."}, {"question": "Do I pay taxes in Qatar?", "answer": "Qatar has no personal income tax. Your US LLC pays US taxes on US-source income."}, {"question": "Which US state?", "answer": "Wyoming is ideal for Qatari founders — no state income tax and low annual fees ($60/year)."}, {"question": "What about visa options?", "answer": "While not required for LLC formation, owning a US company can support US visa applications if needed."}]',
  'Start Your US LLC from Qatar', 1),
(
  'tunisia',
  'Tunisia',
  'TN',
  'US LLC Formation for Tunisian Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Tunisia. Learn about banking, US-Tunisia tax treaty, and running your US company from Tunis.',
  'Form Your US LLC from Tunisia',
  'Launch your US company from Tunisia with zero US presence. Open a US bank account remotely, benefit from the tax treaty, and accept global payments.',
  'US LLC Tunisia',
  '["LLC for Tunisians","US company from Tunisia","Tunisian entrepreneurs US LLC","US bank account Tunisia"]',
  '["Stripe not available in Tunisia", "Limited USD payment options for Tunisian freelancers", "Complex currency control regulations", "High fees on international transfers"]',
  '[{"title": "Fully Remote Formation", "desc": "Form your LLC from Tunis entirely online. No US travel or visa required."}, {"title": "US Bank Account Remote", "desc": "Open Mercury or Wise accounts from Tunisia with your passport and LLC documents."}, {"title": "US-Tunisia Tax Treaty", "desc": "Benefit from the tax treaty between the US and Tunisia to avoid double taxation."}, {"title": "Global Payment Processing", "desc": "Access Stripe and US payment processors to serve international clients."}]',
  'Mercury',
  'Mercury accepts Tunisian residents. Use your passport for verification. Wise Business is a strong alternative.',
  'Tunisia has a tax treaty with the US. LLC income is generally taxable only in the US unless you have a PE in Tunisia.',
  '[{"question": "Can a Tunisian citizen form a US LLC?", "answer": "Yes, Tunisian citizens can form a US LLC entirely online. No US residency required."}, {"question": "What US bank works from Tunisia?", "answer": "Mercury is the best option. Wise Business also works well for Tunisian residents."}, {"question": "How does the tax treaty help?", "answer": "The US-Tunisia tax treaty prevents double taxation. You get credit in Tunisia for US taxes paid."}, {"question": "What about Tunisian currency controls?", "answer": "Consult a local expert about reporting requirements for foreign company ownership under Tunisian law."}, {"question": "Which state is best?", "answer": "Wyoming is recommended — no state income tax, low fees, and strong privacy."}]',
  'Start Your US LLC from Tunisia', 1),
(
  'turkey',
  'Turkey',
  'TR',
  'US LLC Formation for Turkish Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Turkey. Learn about banking, US-Turkey tax treaty, and running your US company from Istanbul or Ankara.',
  'Form Your US LLC from Turkey',
  'Launch your US company from Turkey with zero US presence. Open a US bank account remotely, benefit from the tax treaty, and accept global payments.',
  'US LLC Turkey',
  '["LLC for Turks","US company from Turkey","Turkish entrepreneurs US LLC","US bank account Turkey"]',
  '["TRY volatility erodes freelance income", "Stripe limited for Turkish residents", "High inflation makes USD earnings essential", "Complex international payment setup"]',
  '[{"title": "Remote from Istanbul", "desc": "Form your LLC from Turkey without any US presence. Complete the process online."}, {"title": "US Bank Account Access", "desc": "Open Mercury or Relay accounts from Turkey using your Turkish passport."}, {"title": "Protect Against TRY Inflation", "desc": "Earn and hold USD in your US account. Shield your income from Turkish lira volatility."}, {"title": "US-Turkey Tax Treaty", "desc": "Leverage the tax treaty to avoid double taxation on your US LLC income."}]',
  'Mercury',
  'Mercury is the best choice for Turkish founders. Turkish passports are accepted for remote verification.',
  'Turkey has a tax treaty with the US. LLC profits are generally taxed in the US. Consult a Turkish tax advisor about your obligations.',
  '[{"question": "Can a Turkish citizen form a US LLC?", "answer": "Yes, Turkish citizens can form a US LLC entirely online. It is a common choice for Turkish freelancers and SaaS founders."}, {"question": "What US bank is best from Turkey?", "answer": "Mercury is the top choice. Wise Business and Relay are good alternatives."}, {"question": "How does the US-Turkey tax treaty work?", "answer": "The treaty prevents double taxation. You generally pay US taxes and claim foreign tax credit in Turkey."}, {"question": "Can I avoid TRY depreciation?", "answer": "Yes, by earning in USD through your LLC and keeping funds in your US bank account."}, {"question": "What is the total cost?", "answer": "LLC formation starts at $297. Annual costs include state fees ($60-300) and registered agent ($100-200)."}]',
  'Start Your US LLC from Turkey', 1),
(
  'nigeria',
  'Nigeria',
  'NG',
  'US LLC Formation for Nigerian Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Nigeria. Learn about banking, USD access, and running your US company from Lagos or Abuja.',
  'Form Your US LLC from Nigeria',
  'Launch your US company from Nigeria with zero US presence. Open a US bank account remotely, escape NGN devaluation, and accept global payments.',
  'US LLC Nigeria',
  '["LLC for Nigerians","US company from Nigeria","Nigerian entrepreneurs US LLC","US bank account Nigeria"]',
  '["Severe USD shortage in Nigeria", "Stripe and PayPal blocked for Nigerian accounts", "NGN devaluation erodes business income", "High payment processing fees for Nigerian businesses"]',
  '[{"title": "Earn USD Directly", "desc": "Form a US LLC and receive payments in USD. No need to rely on the Nigerian banking system for USD."}, {"title": "US Bank Account Remotely", "desc": "Open Mercury or Wise accounts from Nigeria. Bypass local USD scarcity."}, {"title": "Escape NGN Devaluation", "desc": "Hold your earnings in USD. Protect your income from the ongoing Naira depreciation."}, {"title": "Global Client Access", "desc": "Accept credit card payments via Stripe. Serve US and European clients with confidence."}]',
  'Mercury',
  'Mercury is the most accessible for Nigerian founders. Wise Business is a strong backup for multi-currency needs.',
  'Nigeria does not have a comprehensive tax treaty with the US. Consult a Nigerian tax professional about your LLC income.',
  '[{"question": "Can a Nigerian form a US LLC?", "answer": "Yes, Nigerian citizens can form a US LLC entirely online. It is one of the most popular solutions for Nigerian founders."}, {"question": "What bank works from Nigeria?", "answer": "Mercury is the best option. Wise Business also works for Nigerian residents."}, {"question": "How do I get USD in Nigeria?", "answer": "Your US LLC earns USD via Stripe. Funds sit in your US bank account. Transfer via Wise when needed."}, {"question": "Is this legal?", "answer": "Yes, Nigerian law permits citizens to own foreign companies. Your US LLC is a legal US business entity."}, {"question": "What about Naira devaluation?", "answer": "By earning and holding USD, you completely avoid NGN depreciation risk on your business income."}]',
  'Start Your US LLC from Nigeria', 1),
(
  'kenya',
  'Kenya',
  'KE',
  'US LLC Formation for Kenyan Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from Kenya. Learn about banking, USD income, and running your US company from Nairobi.',
  'Form Your US LLC from Kenya',
  'Launch your US company from Kenya with zero US presence. Open a US bank account remotely, access global payments, and scale your business.',
  'US LLC Kenya',
  '["LLC for Kenyans","US company from Kenya","Kenyan entrepreneurs US LLC","US bank account Kenya"]',
  '["Stripe not available for Kenyan residents", "Limited USD payment processing options", "High M-Pesa and mobile money fees on international transfers", "Currency volatility affecting business income"]',
  '[{"title": "100% Remote Formation", "desc": "Form your LLC from Nairobi or anywhere in Kenya. No US presence needed."}, {"title": "US Bank Account Remotely", "desc": "Open Mercury or Wise accounts using your Kenyan passport."}, {"title": "USD Income Strategy", "desc": "Earn in USD through your US LLC. Protect your income from KES fluctuations."}, {"title": "Stripe & Global Payments", "desc": "Access Stripe and US payment processors to serve clients worldwide."}]',
  'Mercury',
  'Mercury accepts Kenyan residents. Use your passport for verification. Wise Business is a good alternative.',
  'Kenya does not have a comprehensive tax treaty with the US. Consult a Kenyan tax advisor about your LLC income.',
  '[{"question": "Can a Kenyan form a US LLC?", "answer": "Yes, Kenyan citizens can form a US LLC entirely online. No US residency required."}, {"question": "What bank works from Kenya?", "answer": "Mercury is the top choice. Wise Business is excellent for multi-currency needs."}, {"question": "How do clients pay me?", "answer": "Your LLC uses Stripe or PayPal. Clients pay in USD. Funds go to your US bank account."}, {"question": "What about Kenyan taxes?", "answer": "Consult a Kenyan tax professional. Your LLC may have reporting obligations in Kenya."}, {"question": "Which US state?", "answer": "Wyoming is recommended for Kenyan founders — no state income tax and low fees."}]',
  'Start Your US LLC from Kenya', 1),
(
  'south-africa',
  'South Africa',
  'ZA',
  'US LLC Formation for South African Entrepreneurs | Instant Grow',
  'Complete guide to forming a US LLC from South Africa. Learn about banking, US-SA tax treaty, and running your US company from Cape Town or Johannesburg.',
  'Form Your US LLC from South Africa',
  'Launch your US company from South Africa with zero US presence. Open a US bank account remotely, benefit from the tax treaty, and accept global payments.',
  'US LLC South Africa',
  '["LLC for South Africans","US company from South Africa","SA entrepreneurs US LLC","US bank account South Africa"]',
  '["ZAR volatility impacts freelance and business income", "Limited US payment processing from SA", "High international transaction fees", "Complex SARS reporting for foreign income"]',
  '[{"title": "Remote from Cape Town", "desc": "Form your LLC from anywhere in South Africa. Entirely online, no US travel."}, {"title": "US Bank Account Access", "desc": "Open Mercury or Relay accounts remotely with your SA passport."}, {"title": "US-SA Tax Treaty", "desc": "Benefit from the comprehensive tax treaty between the US and South Africa."}, {"title": "Global Payment Processing", "desc": "Access Stripe and US payment processors to serve international clients."}]',
  'Mercury',
  'Mercury is the best option for South African founders. They accept SA passports and proof of address.',
  'The US and South Africa have a comprehensive tax treaty. LLC income is generally taxed in the US with credit in SA.',
  '[{"question": "Can a South African form a US LLC?", "answer": "Yes, South African citizens can form a US LLC entirely online. No US residency required."}, {"question": "What US bank works from SA?", "answer": "Mercury is the top choice. Relay and Wise Business are good alternatives."}, {"question": "How does SARS treat my LLC?", "answer": "Under the US-SA tax treaty, you get credit for US taxes paid. Consult a SA tax professional for your filing requirements."}, {"question": "Can I avoid ZAR volatility?", "answer": "Yes, earn and hold USD in your US account. Transfer to SA only when the exchange rate is favorable."}, {"question": "What is the cost?", "answer": "LLC formation starts at $297 with Instant Grow. Annual costs are minimal ($100-300/year)."}]',
  'Start Your US LLC from South Africa', 1);



-- ============================================================
-- SECTION 7: ADMIN USER SETUP
-- ============================================================
-- After signing up at https://instantgrow.net/auth/signup,
-- run this UPDATE replacing YOUR_EMAIL with your actual email:
--
--   UPDATE `users`
--   SET `role` = 'admin', `verified` = 1
--   WHERE `email` = 'YOUR_EMAIL@HERE.COM';
--
-- Or for the default admin account:
--   UPDATE `users`
--   SET `role` = 'admin', `verified` = 1
--   WHERE `email` = 'admin@instantgrow.net';
--
-- NOTE: The default admin password is set when you first sign up.
-- If you need a fresh admin, sign up first then run the UPDATE above.
-- ============================================================


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICATION — Run these queries to confirm successful import:
-- ============================================================
-- SELECT 'pricing_config'     AS tbl, COUNT(*) AS rows FROM pricing_config
-- UNION SELECT 'services',            COUNT(*) FROM services
-- UNION SELECT 'blogs',               COUNT(*) FROM blogs
-- UNION SELECT 'countries_seo_pages', COUNT(*) FROM countries_seo_pages;
--
-- Expected results:
--   pricing_config     = 8
--   services           = 131+ (132 target)
--   blogs              = 10
--   countries_seo_pages = 5
-- ============================================================
