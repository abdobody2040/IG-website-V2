-- ============================================================
-- QUICK FIX for existing Hostinger database
-- Run this if you already have data you want to keep.
-- This patches the `users` table without dropping it.
-- ============================================================

-- Step 1: Rename old PocketBase columns to PHP API names
ALTER TABLE `users`
  CHANGE COLUMN `passwordHash` `password_hash`  TEXT DEFAULT NULL,
  CHANGE COLUMN `avatar`       `avatar_url`      TEXT DEFAULT NULL;

-- Step 2: Add missing columns the PHP API expects
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `name`                      TEXT          DEFAULT NULL  AFTER `email`,
  ADD COLUMN IF NOT EXISTS `display_name`              TEXT          DEFAULT NULL  AFTER `name`,
  ADD COLUMN IF NOT EXISTS `role`                      VARCHAR(20)   DEFAULT 'client' AFTER `display_name`,
  ADD COLUMN IF NOT EXISTS `phone`                     TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `country`                   TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `address`                   LONGTEXT,
  ADD COLUMN IF NOT EXISTS `metadata`                  LONGTEXT,
  ADD COLUMN IF NOT EXISTS `last_sign_in`              DATETIME(3)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `verification_token`        TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `verification_token_expiry` DATETIME(3)   DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `reset_token`               TEXT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `reset_token_expiry`        DATETIME(3)   DEFAULT NULL;

-- Step 3: Fix services sort_order column type (was DECIMAL, needs to be INT)
ALTER TABLE `services`
  MODIFY COLUMN `sort_order` INT DEFAULT 10;

-- Step 4: Add any missing services columns
ALTER TABLE `services`
  ADD COLUMN IF NOT EXISTS `features`       LONGTEXT AFTER `stripe_price_id`,
  ADD COLUMN IF NOT EXISTS `benefits`       LONGTEXT AFTER `features`,
  ADD COLUMN IF NOT EXISTS `process_steps`  LONGTEXT AFTER `benefits`,
  ADD COLUMN IF NOT EXISTS `faq`            LONGTEXT AFTER `process_steps`,
  ADD COLUMN IF NOT EXISTS `testimonials`   LONGTEXT AFTER `faq`;

-- ============================================================
-- After running this, go to Hostinger hPanel → File Manager
-- and upload the updated api/index.php
-- ============================================================
