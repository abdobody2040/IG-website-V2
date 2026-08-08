-- ============================================================
-- INSTANT GROW LLC — MASTER SEED FILE FOR HOSTINGER MYSQL
-- ============================================================
-- Run this ONCE in phpMyAdmin:
--   Database: u238131962_instantgrowllc  →  SQL tab  →  Paste & Go
-- Uses REPLACE INTO — safe to re-run without duplicates.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================================
-- SECTION 1: PRICING CONFIG (8 rows: us/uk/uae/oman × basic/premium)
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
-- SECTION 2: CORE SERVICES (12 essential services)
-- For full 132 services, also run seed_services_clean.sql
-- ============================================================

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.825', 'formationlandin', NOW(3), 'Company Formation', 'تأسيس الشركات', 'Form your US LLC, UK LTD & more in 50+ countries.', 'أسس شركتك الأمريكية أو البريطانية وأكثر.', 149, 'one-time', 'مرة واحدة', '', '', '', '', 0, 'Building2', 1, 10, 'landing', '#2563EB', '#EFF6FF', '/order', 'Business Formation');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.868', 'bankinglanding1', NOW(3), 'Business Banking', 'الحساب البنكي التجاري', 'Open US business bank accounts remotely.', 'افتح حساباً بنكياً أمريكياً عن بُعد.', 0, 'included', 'مشمول', '', '', '', '', 0, 'Landmark', 1, 20, 'landing', '#7C3AED', '#F5F3FF', '/#pricing', 'Banking & Payments');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.877', 'paymentlanding1', NOW(3), 'Payment Solutions', 'حلول الدفع', 'Stripe, PayPal & merchant account setup.', 'إعداد Stripe وPayPal والحسابات التجارية.', 0, 'included', 'مشمول', '', '', '', '', 0, 'CreditCard', 1, 30, 'landing', '#059669', '#ECFDF5', '/#pricing', 'Banking & Payments');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.900', 'usllc149onetime', NOW(3), 'US LLC Formation', 'تأسيس شركة ذات مسؤولية محدودة أمريكية (LLC)', 'Incorporate your business in Wyoming, Delaware, or Florida.', 'تأسيس شركتك في ولايات وايومنغ، ديلاوير، أو فلوريدا.', 149, 'one-time', 'مرة واحدة', 'Includes name verification, drafting articles, state filing, and certificate delivery.', 'تشمل فحص توفر الاسم، صياغة عقد التأسيس، التقديم للولاية، وتسليم الشهادة.', 'Most Popular', 'الأكثر شعبية', 0, 'Building2', 1, 1, 'addon', '', '', '', 'Business Formation');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.907', 'ukltd149onetime', NOW(3), 'UK LTD Formation', 'تأسيس شركة مساهمة بريطانية (LTD)', 'Register your company in the UK with Companies House.', 'سجل شركتك في المملكة المتحدة لدى مسجل الشركات الرسمي.', 149, 'one-time', 'مرة واحدة', 'Includes incorporation fees, registered address, share certificates, and digital pack.', 'تشمل رسوم التأسيس، عنوان المكتب المسجل، شهادات الأسهم، والحقيبة الرقمية.', '', '', 0, 'Building', 1, 2, 'addon', '', '', '', 'Business Formation');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.923', 'uaecompany999ot', NOW(3), 'UAE Company Formation', 'تأسيس شركة في الإمارات', 'Establish a business in UAE Free zones or Mainland.', 'تأسيس عملك التجاري في المناطق الحرة أو داخل دولة الإمارات.', 999, 'one-time', 'مرة واحدة', 'Full license processing, local sponsor assistance if needed, and visa guidance.', 'معالجة الرخصة بالكامل، توفير الشريك المحلي عند الحاجة، وتسهيل إجراءات التأشيرة.', 'Recommended', 'موصى به', 0, 'Briefcase', 1, 3, 'addon', '', '', '', 'Business Formation');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.942', 'einapplication7', NOW(3), 'EIN Application', 'التقديم على الرقم الضريبي EIN', 'Get your Employer Identification Number from the IRS.', 'احصل على الرقم الضريبي لشركتك من مصلحة الضرائب الأمريكية.', 79, 'one-time', 'مرة واحدة', 'Preparation of Form SS-4, fax submission to IRS, and retrieval of official letter.', 'تجهيز نموذج SS-4، إرساله بالفاكس للضرائب، واستلام الخطاب الرسمي.', '', '', 1, 'Hash', 1, 10, 'addon', '', '', '', 'Government & Compliance');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.951', 'operatingagree4', NOW(3), 'Operating Agreement', 'اتفاقية التشغيل للشركة (LLC)', 'Draft a customized operating agreement to establish LLC ownership and rules.', 'صياغة اتفاقية التشغيل القانونية المخصصة.', 99, 'one-time', 'مرة واحدة', 'Customized operating agreement detailing ownership split and corporate governance rules.', 'صياغة كاملة تضمن حقوق الشركاء وتوضح نسب توزيع الأرباح والمسؤوليات.', '', '', 1, 'FileText', 1, 56, 'addon', '', '', '', 'Legal Documents');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.957', 'businessbank149', NOW(3), 'Business Banking Setup', 'توجيه الحساب البنكي للأعمال', 'Get guidance for opening accounts in major fintech business platforms.', 'الحصول على الدعم الكامل للتقديم وفتح الحسابات في البنوك الرقمية الرائدة.', 199, 'one-time', 'مرة واحدة', 'Assistance with documentation, application review, and bank approval process.', 'مراجعة الأوراق القانونية والمساعدة في التقديم والتواصل لتسريع موافقة البنك.', '', '', 1, 'Landmark', 1, 41, 'addon', '', '', '', 'Banking & Payments');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.963', 'paymentgate249o', NOW(3), 'Payment Gateway Setup', 'إعداد بوابات الدفع الإلكتروني', 'Connect payment processors to your website to accept credit cards globally.', 'ربط ودمج معالجات الدفع بموقعك الإلكتروني.', 249, 'one-time', 'مرة واحدة', 'Includes gateway application, document upload, verification assistance, and API integration.', 'تشمل طلبات بوابات الدفع، رفع الوثائق، المساعدة في التفعيل، والربط التقني بالموقع.', '', '', 1, 'CreditCard', 1, 42, 'addon', '', '', '', 'Banking & Payments');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.977', 'agentrenewaladd', NOW(3), 'Registered Agent Renewal', 'تجديد الوكيل المسجل', 'Renew your registered agent representation for 12 more months.', 'تجديد خدمة الوكيل المسجل المعتمد لشركتك لعام إضافي.', 99, 'yearly', 'سنوياً', 'Renews your registered agent subscription for another 12 months.', 'تجديد التمثيل القانوني لـ12 شهراً، وتلقي وتوجيه الخطابات والمراسلات الرسمية.', '', '', 1, 'RotateCw', 1, 25, 'addon', '', '', '', 'Government & Compliance');

REPLACE INTO `services` (`created`, `id`, `updated`, `title_en`, `title_ar`, `description_en`, `description_ar`, `price`, `period_en`, `period_ar`, `detail_en`, `detail_ar`, `badge_en`, `badge_ar`, `requires_company`, `icon`, `active`, `sort_order`, `type`, `color`, `bg_color`, `href`, `category`) VALUES
('2026-07-18 10:41:06.984', 'annualreportadd', NOW(3), 'Annual Report Filing', 'تقديم التقارير السنوية', 'File annual reports with the US state registry to avoid penalties.', 'تقديم التقارير السنوية الرسمية للولاية لتجنب فرض غرامات أو شطب الشركة.', 129, 'one-time', 'مرة واحدة', 'We prepare and file your LLC annual report with the state to keep your business in good standing.', 'نقوم بتجهيز وتقديم التقرير السنوي للولاية للحفاظ على استمرارية شركتك القانونية.', '', '', 1, 'ClipboardList', 1, 16, 'addon', '', '', '', 'Government & Compliance');

-- ============================================================
-- SECTION 3: BLOGS (3 featured posts — quick start)
-- For full 20 posts, also run seed_blogs_clean.sql
-- ============================================================

REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`) VALUES
('2026-07-18 18:48:28.940', '6prjapmja32gdd0', NOW(3),
 'Why Stripe Does Not Work in Your Country (And the One Fix)',
 'why-stripe-doesnt-work-your-country',
 'Stripe powers the global economy, but its 46-country limit excludes 150+ nations. Thousands of entrepreneurs from blocked countries use Stripe daily — legally.',
 '## The Problem\n\nIf you are from Egypt, Saudi Arabia, Algeria, Nigeria, or any of the 150+ countries Stripe does not support, you know the frustration.\n\n## The Fix: A US LLC\n\nWhen you form a US LLC, you create a legal US business entity eligible for Stripe in the United States.\n\n**This means:** Stripe processes your payments at 2.9% + $0.30 per transaction — 100% legal and compliant with Stripe terms.\n\n## How It Works\n\n1. Form your US LLC (Instant Grow, 3-5 days)\n2. Get your EIN from the IRS (free, included)\n3. Open a US bank account — Mercury or Relay (remote)\n4. Apply for Stripe using your US LLC\n5. Start accepting payments globally',
 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
 'Instant Grow Team',
 '["stripe","us llc","payment gateway"]',
 1, 1, 'en',
 'لماذا لا يعمل سترايب في بلدك (والحل الوحيد)',
 'why-stripe-doesnt-work-your-country-ar',
 'يدير سترايب الاقتصاد العالمي، ولكن حدوده المقتصرة على 46 دولة تستثني أكثر من 150 دولة. إليك الحل القانوني.',
 'الحل هو تأسيس شركة أمريكية (US LLC) للحصول على حساب سترايب قانوني. Instant Grow يساعدك في التأسيس خلال 3-5 أيام عمل.');

REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`) VALUES
('2026-07-18 18:48:28.953', 'nir4cd01gvtlovl', NOW(3),
 'How to Open a US LLC in 3 Steps (From Any Country)',
 'how-to-open-us-llc-3-steps',
 'You can form a legal US company from anywhere in the world in 3 business days. No visa. No travel. No US partner.',
 '## Step 1: Choose Wyoming\n\nNo state income tax. $60 annual fee. Strong privacy. Best for 90% of founders.\n\n## Step 2: File Your Documents\n\n- Articles of Organization (main formation document)\n- Operating Agreement (internal ownership document)\n- EIN from the IRS (free, required for banking)\n\n## Step 3: Open a Bank Account\n\nMercury or Relay both accept non-residents remotely. No US visit needed.\n\nInstant Grow handles everything: formation, EIN, bank setup, and Stripe onboarding.',
 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80',
 'Instant Grow Team',
 '["us llc","company formation","how to"]',
 1, 1, 'en',
 'كيفية تأسيس شركة أمريكية في 3 خطوات',
 'how-to-open-us-llc-3-steps-ar',
 'يمكنك تأسيس شركة أمريكية قانونية من أي مكان في العالم في 3 أيام عمل فقط.',
 'الخطوة 1: وايومنغ (بدون ضريبة دخل). الخطوة 2: المستندات (عقد التأسيس، EIN). الخطوة 3: حساب بنكي عبر Mercury أو Relay.');

REPLACE INTO `blogs` (`created`, `id`, `updated`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `author`, `tags`, `published`, `featured`, `language`, `title_ar`, `slug_ar`, `excerpt_ar`, `content_ar`) VALUES
('2026-07-18 18:48:28.971', 'z8wwppnq908f0bv', NOW(3),
 '5 Biggest Mistakes New LLC Owners Make',
 '5-biggest-mistakes-new-llc-owners',
 'New LLC owners make predictable mistakes that cost thousands of dollars. Here are the five most common and how to avoid them.',
 '## Mistake 1: Choosing Delaware Unnecessarily\n\nDelaware costs $300+ annually. Choose Wyoming unless you need VC funding.\n\n## Mistake 2: No US Bank Account\n\nWithout a US bank account, you cannot receive Stripe payouts. Apply for Mercury or Relay immediately after getting your EIN.\n\n## Mistake 3: Skipping Annual Compliance\n\nEvery LLC needs: annual state report ($60/year), registered agent renewal ($99/year), IRS Form 5472 (for foreign-owned LLCs).\n\n## Mistake 4: EIN Typos\n\nOne wrong character causes bank rejections and weeks of delays. Double-check everything.\n\n## Mistake 5: Giving Up Early\n\nVerifications take time. Push through the first 30 days. Instant Grow supports you throughout.',
 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80',
 'Instant Grow Team',
 '["us llc","mistakes","compliance"]',
 1, 1, 'en',
 'أكبر 5 أخطاء يقع فيها أصحاب الشركات الأمريكية الجدد',
 '5-biggest-mistakes-new-llc-owners-ar',
 'تجنب هذه الأخطاء الشائعة التي تكلف رواد الأعمال آلاف الدولارات.',
 'الخطأ 1: ديلاوير بدون سبب. الخطأ 2: عدم فتح حساب بنكي. الخطأ 3: تجاهل الامتثال السنوي. الخطأ 4: أخطاء EIN. الخطأ 5: الاستسلام المبكر.');

-- ============================================================
-- SECTION 4: SEO COUNTRY PAGES (3 key countries — quick start)
-- For all countries, run seed_seo_countries_clean_mysql.sql
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

-- ============================================================
-- SECTION 5: ADMIN ROLE — SET YOUR ACCOUNT AS ADMIN
-- UNCOMMENT and replace with your actual email, then run.
-- ============================================================

-- UPDATE `users` SET `role` = 'admin', `verified` = 1
-- WHERE `email` = 'YOUR_EMAIL@EXAMPLE.COM';

-- ============================================================
-- SECTION 6: TRACKING & ANALYTICS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS `tracking_integrations` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `provider` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'disconnected',
  `enabled` TINYINT(1) DEFAULT 1,
  `config` JSON,
  `lastSync` VARCHAR(100),
  `verificationStatus` VARCHAR(50) DEFAULT 'unverified',
  `created` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tracking_events` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `trigger` VARCHAR(50) NOT NULL,
  `selector` VARCHAR(255),
  `platform` VARCHAR(50) DEFAULT 'all',
  `enabled` TINYINT(1) DEFAULT 1,
  `value` DECIMAL(10,2),
  `currency` VARCHAR(10) DEFAULT 'USD',
  `created` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tracking_domains` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `domain` VARCHAR(255) NOT NULL,
  `isPrimary` TINYINT(1) DEFAULT 0,
  `trackingId` VARCHAR(100),
  `status` VARCHAR(50) DEFAULT 'active',
  `created` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  `updated` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICATION — run these SELECT queries to confirm:
-- SELECT 'pricing_config' AS tbl, COUNT(*) AS rows FROM pricing_config
-- UNION SELECT 'services', COUNT(*) FROM services
-- UNION SELECT 'blogs', COUNT(*) FROM blogs
-- UNION SELECT 'countries_seo_pages', COUNT(*) FROM countries_seo_pages;
--
-- Expected: pricing_config=8, services=12+, blogs=3+, countries_seo_pages=3+
-- ============================================================
