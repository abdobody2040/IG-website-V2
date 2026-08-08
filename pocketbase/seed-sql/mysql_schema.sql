-- ============================================================
-- Instant Grow LLC - MySQL Schema (Full Field Parity)
-- Run this in phpMyAdmin BEFORE seed_data.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `created` DATETIME(3) DEFAULT NULL,
  `email` TEXT DEFAULT NULL,
  `emailVisibility` TEXT DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `lastLoginAlertSentAt` TEXT DEFAULT NULL,
  `lastResetSentAt` TEXT DEFAULT NULL,
  `lastVerificationSentAt` TEXT DEFAULT NULL,
  `passwordHash` TEXT DEFAULT NULL,
  `tokenKey` TEXT DEFAULT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `username` TEXT DEFAULT NULL,
  `verified` TINYINT(1) DEFAULT 0,
  `display_name` TEXT DEFAULT NULL,
  `role` TEXT DEFAULT NULL,
  `phone` TEXT DEFAULT NULL,
  `country` TEXT DEFAULT NULL,
  `address` LONGTEXT,
  `metadata` LONGTEXT,
  `last_sign_in` DATETIME(3) DEFAULT NULL,
  `name` TEXT DEFAULT NULL,
  `avatar` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `user` TEXT DEFAULT NULL,
  `order_number` TEXT DEFAULT NULL,
  `package_name` TEXT DEFAULT NULL,
  `company_name` TEXT DEFAULT NULL,
  `company_state` TEXT DEFAULT NULL,
  `company_type` TEXT DEFAULT NULL,
  `status` TEXT DEFAULT NULL,
  `amount` DECIMAL(10,2) DEFAULT 0.00,
  `currency` TEXT DEFAULT NULL,
  `notes` LONGTEXT,
  `customer_name` TEXT DEFAULT NULL,
  `customer_email` TEXT DEFAULT NULL,
  `customer_phone` TEXT DEFAULT NULL,
  `customer_country` TEXT DEFAULT NULL,
  `customer_address` LONGTEXT,
  `business_activity` LONGTEXT,
  `stripe_session_id` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `companies`;
CREATE TABLE IF NOT EXISTS `companies` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `user` TEXT DEFAULT NULL,
  `order` TEXT DEFAULT NULL,
  `company_name` TEXT DEFAULT NULL,
  `company_type` TEXT DEFAULT NULL,
  `state` TEXT DEFAULT NULL,
  `ein_number` TEXT DEFAULT NULL,
  `formation_date` DATETIME(3) DEFAULT NULL,
  `registered_agent` TEXT DEFAULT NULL,
  `renewal_due_date` DATETIME(3) DEFAULT NULL,
  `annual_report_due_date` DATETIME(3) DEFAULT NULL,
  `tax_filing_due_date` DATETIME(3) DEFAULT NULL,
  `registered_agent_renewal_date` DATETIME(3) DEFAULT NULL,
  `compliance_status` TEXT DEFAULT NULL,
  `compliance_notes` LONGTEXT,
  `status` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `documents`;
CREATE TABLE IF NOT EXISTS `documents` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `user` TEXT DEFAULT NULL,
  `order` TEXT DEFAULT NULL,
  `company` TEXT DEFAULT NULL,
  `name` TEXT DEFAULT NULL,
  `doc_type` TEXT DEFAULT NULL,
  `file_url` TEXT DEFAULT NULL,
  `file_name` TEXT DEFAULT NULL,
  `status` TEXT DEFAULT NULL,
  `notes` LONGTEXT,
  `file` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `user` TEXT DEFAULT NULL,
  `type` TEXT DEFAULT NULL,
  `title` TEXT DEFAULT NULL,
  `message` LONGTEXT,
  `data` LONGTEXT,
  `link` TEXT DEFAULT NULL,
  `read` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `user` TEXT DEFAULT NULL,
  `order` TEXT DEFAULT NULL,
  `service` TEXT DEFAULT NULL,
  `invoice_id` TEXT DEFAULT NULL,
  `amount` DECIMAL(10,2) DEFAULT 0.00,
  `currency` TEXT DEFAULT NULL,
  `status` TEXT DEFAULT NULL,
  `stripe_payment_id` TEXT DEFAULT NULL,
  `notes` LONGTEXT,
  `stripe_session_id` TEXT DEFAULT NULL,
  `stripe_payment_intent_id` TEXT DEFAULT NULL,
  `stripe_charge_id` TEXT DEFAULT NULL,
  `stripe_customer_id` TEXT DEFAULT NULL,
  `stripe_invoice_id` TEXT DEFAULT NULL,
  `stripe_price_id` TEXT DEFAULT NULL,
  `stripe_product_id` TEXT DEFAULT NULL,
  `customer_name` TEXT DEFAULT NULL,
  `customer_email` TEXT DEFAULT NULL,
  `company_name` TEXT DEFAULT NULL,
  `customer_country` TEXT DEFAULT NULL,
  `invoice_url` TEXT DEFAULT NULL,
  `receipt_url` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `blogs`;
CREATE TABLE IF NOT EXISTS `blogs` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `title` TEXT DEFAULT NULL,
  `slug` TEXT DEFAULT NULL,
  `excerpt` TEXT DEFAULT NULL,
  `content` LONGTEXT,
  `cover_image` TEXT DEFAULT NULL,
  `author` TEXT DEFAULT NULL,
  `tags` LONGTEXT,
  `published` TINYINT(1) DEFAULT 0,
  `featured` TINYINT(1) DEFAULT 0,
  `language` TEXT DEFAULT NULL,
  `title_ar` TEXT DEFAULT NULL,
  `slug_ar` TEXT DEFAULT NULL,
  `excerpt_ar` TEXT DEFAULT NULL,
  `content_ar` LONGTEXT,
  `created_by` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `countries_seo_pages`;
CREATE TABLE IF NOT EXISTS `countries_seo_pages` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `slug` TEXT DEFAULT NULL,
  `country_name` TEXT DEFAULT NULL,
  `country_code` TEXT DEFAULT NULL,
  `meta_title` TEXT DEFAULT NULL,
  `meta_description` LONGTEXT,
  `hero_title` TEXT DEFAULT NULL,
  `hero_description` LONGTEXT,
  `main_keyword` TEXT DEFAULT NULL,
  `secondary_keywords` LONGTEXT,
  `pain_points` LONGTEXT,
  `benefits` LONGTEXT,
  `best_bank` TEXT DEFAULT NULL,
  `bank_notes` LONGTEXT,
  `tax_notes` LONGTEXT,
  `faq_json` LONGTEXT,
  `cta_text` TEXT DEFAULT NULL,
  `featured_image` TEXT DEFAULT NULL,
  `schema_json` LONGTEXT,
  `published` TINYINT(1) DEFAULT 0,
  `created_by` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `invitations`;
CREATE TABLE IF NOT EXISTS `invitations` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `email` TEXT DEFAULT NULL,
  `company_name` TEXT DEFAULT NULL,
  `role` TEXT DEFAULT NULL,
  `invited_by` TEXT DEFAULT NULL,
  `status` TEXT DEFAULT NULL,
  `expires_at` DATETIME(3) DEFAULT NULL,
  `accepted` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `name` TEXT DEFAULT NULL,
  `email` TEXT DEFAULT NULL,
  `subject` TEXT DEFAULT NULL,
  `message` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `admin_audit_log`;
CREATE TABLE IF NOT EXISTS `admin_audit_log` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `admin` TEXT DEFAULT NULL,
  `action` TEXT DEFAULT NULL,
  `table_name` TEXT DEFAULT NULL,
  `record_id` TEXT DEFAULT NULL,
  `details` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pages`;
CREATE TABLE IF NOT EXISTS `pages` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `slug` TEXT DEFAULT NULL,
  `title_en` TEXT DEFAULT NULL,
  `title_ar` TEXT DEFAULT NULL,
  `content_en` TEXT DEFAULT NULL,
  `content_ar` LONGTEXT,
  `active` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `created` DATETIME(3) DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `title_en` TEXT DEFAULT NULL,
  `title_ar` TEXT DEFAULT NULL,
  `description_en` LONGTEXT,
  `description_ar` LONGTEXT,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `period_en` TEXT DEFAULT NULL,
  `period_ar` TEXT DEFAULT NULL,
  `detail_en` TEXT DEFAULT NULL,
  `detail_ar` TEXT DEFAULT NULL,
  `badge_en` TEXT DEFAULT NULL,
  `badge_ar` TEXT DEFAULT NULL,
  `requires_company` TINYINT(1) DEFAULT 0,
  `icon` TEXT DEFAULT NULL,
  `active` TINYINT(1) DEFAULT 0,
  `sort_order` DECIMAL(10,2) DEFAULT 0.00,
  `type` TEXT DEFAULT NULL,
  `color` TEXT DEFAULT NULL,
  `bg_color` TEXT DEFAULT NULL,
  `href` TEXT DEFAULT NULL,
  `category` TEXT DEFAULT NULL,
  `stripe_product_id` TEXT DEFAULT NULL,
  `stripe_price_id` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `order_updates`;
CREATE TABLE IF NOT EXISTS `order_updates` (
  `created` DATETIME(3) DEFAULT NULL,
  `created_by` TEXT DEFAULT NULL,
  `id` VARCHAR(50) NOT NULL,
  `message` LONGTEXT,
  `order_id` TEXT DEFAULT NULL,
  `status` TEXT DEFAULT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `admin_new_order` TEXT DEFAULT NULL,
  `admin_payment_failed` TEXT DEFAULT NULL,
  `admin_status_changed` TEXT DEFAULT NULL,
  `created` DATETIME(3) DEFAULT NULL,
  `document_ready` TEXT DEFAULT NULL,
  `document_updates` TEXT DEFAULT NULL,
  `email_enabled` TEXT DEFAULT NULL,
  `email_notifications` TINYINT(1) DEFAULT 0,
  `id` VARCHAR(50) NOT NULL,
  `marketing_emails` TINYINT(1) DEFAULT 0,
  `order_placed` TEXT DEFAULT NULL,
  `order_status_changed` TEXT DEFAULT NULL,
  `order_updates` TINYINT(1) DEFAULT 0,
  `payment_received` TEXT DEFAULT NULL,
  `payment_updates` TEXT DEFAULT NULL,
  `role` TEXT DEFAULT NULL,
  `updated` DATETIME(3) DEFAULT NULL,
  `user` TEXT DEFAULT NULL,
  `weekly_summary` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
