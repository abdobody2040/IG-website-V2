import { useEffect } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useLang } from '../i18n/LanguageContext'
import {
  ArrowRight, CheckCircle, Star, MessageCircle,
  Globe, Banknote, Shield, Clock, HelpCircle, ChevronRight,
  Building2, CreditCard, Zap, ExternalLink
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  setPageMeta, injectJsonLd, injectBreadcrumb,
  generateFaqSchema, generateOrganizationSchema,
  generateLocalBusinessSchema, generateMenaServiceSchema,
  getCanonical
} from '../lib/seo'

interface MenaCountryData {
  slug: string
  countryCode: string
  nameEn: string
  nameAr: string
  flag: string
  geoRegion: string
  metaTitleEn: string
  metaTitleAr: string
  metaDescEn: string
  metaDescAr: string
  h1En: string
  h1Ar: string
  subtitleEn: string
  subtitleAr: string
  currency: string
  price: string
  painPointsEn: string[]
  painPointsAr: string[]
  benefitsEn: { title: string; desc: string }[]
  benefitsAr: { title: string; desc: string }[]
  faqEn: { q: string; a: string }[]
  faqAr: { q: string; a: string }[]
  bankTip: string
  bankTipAr: string
  statsEn: { label: string; value: string }[]
  statsAr: { label: string; value: string }[]
  whatsapp: string
}

const MENA_COUNTRIES: Record<string, MenaCountryData> = {
  'egypt': {
    slug: 'egypt', countryCode: 'EG', flag: '🇪🇬',
    nameEn: 'Egypt', nameAr: 'جمهورية مصر العربية',
    geoRegion: 'EG',
    metaTitleEn: 'Form a US LLC from Egypt | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من مصر | تفعيل سترايب وباي بال | Instant Grow',
    metaDescEn: 'Form a US LLC from Egypt 100% remotely. Obtain federal EIN, registered agent, digital US banking & Stripe activation. Transparent pricing with no hidden fees.',
    metaDescAr: 'أسّس شركة LLC أمريكية من مصر بالكامل عن بُعد. استخرج الرقم الضريبي الفيدرالي EIN، وكيل مسجل، وتفعيل سترايب وباي بال واستقبال أموالك بالدولار.',
    h1En: 'Form a US LLC from Egypt — Unlock Global Stripe, PayPal & USD Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من مصر — تفعيل سترايب وباي بال وحساب بنكي دولاري',
    subtitleEn: 'Overcome local card limits and currency restrictions. Invoicing global clients and running e-commerce stores with a compliant US business entity.',
    subtitleAr: 'تجاوز قيود الدفع بالجنيه وبطاقات السحب المحلية. استقبل مدفوعات عملائك الدوليين بالدولار عبر شركة أمريكية رسمية وحساب بنكي دولي.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Local Egyptian debit cards cannot process international USD SaaS tools or ad spend.',
      'Stripe does not support local Egyptian merchant accounts directly.',
      'Receiving USD freelance payments via local banks often triggers high conversion loss into EGP.',
      'Upwork and Fiverr top-tier clients frequently require or prefer US billing entities.',
      'Shopify and dropshipping stores face checkout abandonment without global credit card acquiring.',
    ],
    painPointsAr: [
      'بطاقات الخصم المباشر المصرية مقيدة في الدفع الدولي بالدولار ولا تدعم اشتراكات البرمجيات والإعلانات العالمية.',
      'بوابة الدفع سترايب (Stripe) غير متاحة للحسابات المصرفية المحلية داخل مصر.',
      'استقبال أموال الفريلانس والخدمات بالدولار على البنوك المصرية قد يعرضك لرسوم تحويل مرتفعة.',
      'العملاء الكبار على منصات العمل الحر يفضلون التعامل مع شركات مسجلة في الولايات المتحدة.',
      'متاجر شوبيفاي والدروب شيبينج تفقد مبيعات حيوية بدون بوابات دفع بالبطاقات الائتمانية الدولية.',
    ],
    benefitsEn: [
      { title: 'Full Stripe & PayPal Activation', desc: 'Activate legitimate US Stripe and PayPal Business accounts backed by your verified US LLC and federal EIN.' },
      { title: 'Digital USD Business Banking', desc: 'Apply remotely for FDIC-insured digital accounts (Mercury, Relay) to hold and transfer USD directly.' },
      { title: '100% Remote Process', desc: 'No US visa, residency, or physical travel required. We handle state filing and IRS communication from Cairo or Alexandria.' },
      { title: 'Low-Fee Wire Transfers', desc: 'Withdraw funds to Egypt using Wise Business at mid-market rates or wire funds directly via SWIFT.' },
      { title: 'Wyoming Member Privacy', desc: 'Wyoming does not publish member or manager names on the state public registry, protecting privacy.' },
      { title: 'IRS Form 5472 Guidance', desc: 'Clear guidelines on annual mandatory non-resident filings to prevent IRS penalties.' },
    ],
    benefitsAr: [
      { title: 'تفعيل رسمي لسترايب وباي بال', desc: 'افتح حسابات سترايب وباي بال تجارية معتمدة بشركتك الأمريكية ورقم EIN الفيدرالي.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'قدّم عن بُعد على حسابات مؤمنة بـ FDIC (مثل ميركوري وريلاي) لحفظ وتحويل الدولار مباشرة.' },
      { title: 'تأسيس إلكتروني 100%', desc: 'بدون فيزا أو سفر للولايات المتحدة. نتولى إيداع مستندات الولاية والتواصل مع مصلحة الضرائب IRS.' },
      { title: 'تحويلات سلسة لمصر', desc: 'حوّل أرباحك إلى بنكك المصري عبر وايز بيزنس (Wise) بأسعار الصرف الرسمية الشفافة.' },
      { title: 'خصوصية ولاية وايومنغ', desc: 'لا تُدرج أسماء الملاك في السجل العام لولاية وايومنغ، مما يوفر خصوصية كاملة للمؤسسين.' },
      { title: 'إرشاد الامتثال لنموذج 5472', desc: 'تعليمات واضحة حول الإقرار السنوي الإلزامي لغير المقيمين لتجنب أي غرامات ضريبية.' },
    ],
    faqEn: [
      { q: 'Can Egyptian passport holders legally own a US LLC?', a: 'Yes, 100%. US corporate law permits foreign non-residents to fully own and operate a US LLC. No US green card, visa, or Social Security Number (SSN) is required.' },
      { q: 'How long does the process take from Egypt?', a: 'State LLC approval in Wyoming or Delaware typically takes 2 to 5 business days. Once approved, the IRS EIN application for non-residents without an SSN takes 3 to 6 weeks via manual IRS Form SS-4 fax processing.' },
      { q: 'How do I transfer USD from my US account to Egypt?', a: 'You can link your US Mercury or Relay account to Wise Business, transferring funds directly to your Egyptian bank account in USD or EGP at verified market exchange rates.' },
      { q: 'What post-formation taxes apply to Egyptian LLC owners?', a: 'If your LLC has no US physical office, employees, or US-connected trade/business, profits pass through without federal corporate income tax. However, you MUST file annual informational IRS Form 5472 and pro-forma 1120 (with a $25,000 penalty for non-filing).' },
    ],
    faqAr: [
      { q: 'هل يحق لحاملي الجواز المصري امتلاك شركة LLC أمريكية قانونياً؟', a: 'نعم بنسبة 100%. يتيح القانون الأمريكي لغير المقيمين تأسيس وامتلاك شركات LLC دون الحاجة لإقامة أو تأشيرة أو رقم تأمين اجتماعي أمريكي (SSN).' },
      { q: 'كم يستغرق التأسيس واستخراج الرقم الضريبي من مصر؟', a: 'يستغرق اعتماد عقد تأسيس الشركة لدى الولاية (مثل وايومنغ) من يومين إلى 5 أيام عمل. بعد ذلك، يستغرق استخراج رقم EIN لغير الحاملين لرقم SSN من 3 إلى 6 أسابيع نظراً لمعالجة نموذج SS-4 يدوياً لدى مصلحة الضرائب الأمريكية IRS.' },
      { q: 'كيف أحول أموالي من الحساب الأمريكي إلى مصر؟', a: 'يمكنك ربط حسابك الأمريكي في Mercury أو Relay مع حساب Wise Business، وتحويل الأموال مباشرة لحسابك في البنوك المصرية بالدولار أو بالجنيه بسعر الصرف الرسمي الشفاف.' },
      { q: 'ما هي الضرائب والإقرارات المفروضة على مالك الشركة المصري؟', a: 'إذا لم يكن لشركتك تواجد فعلي أو موظفون داخل أمريكا، فالشركة معفاة من ضريبة الدخل الفيدرالية ككيان شفاف (Pass-Through). ولكن يتعين عليك تقديم إقرار المعلومات السنوي الإلزامي IRS Form 5472 مع نموذج 1120 تجنباً لغرامة التأخير البالغة 25,000 دولار.' },
    ],
    bankTip: 'Mercury and Relay are the top remote-friendly digital business accounts for Egyptian founders. Ensure your passport is valid and your company Articles of Organization match your application details.',
    bankTipAr: 'بنكا ميركوري وريلاي هما الخيار الأفضل للمؤسسين المصريين للتقديم عن بُعد. تأكد من سريان جواز السفر ومطابقة بيانات التقديم مع وثائق التأسيس ورقم EIN.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'IRS SS-4 Filing', value: 'Direct Fax' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'تقديم مصلحة IRS', value: 'متابعة رسمية' }],
    whatsapp: '13072898149',
  },

  'saudi-arabia': {
    slug: 'saudi-arabia', countryCode: 'SA', flag: '🇸🇦',
    nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية',
    geoRegion: 'SA',
    metaTitleEn: 'Form a US LLC from Saudi Arabia | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC في أمريكا للسعوديين | Instant Grow LLC',
    metaDescEn: 'Launch a US LLC from Saudi Arabia 100% online. Articles of organization, IRS EIN, registered agent & US business banking guidance for Saudi founders.',
    metaDescAr: 'أسّس شركة LLC أمريكية من المملكة العربية السعودية بالكامل عبر الإنترنت. عقد التأسيس، الرقم الضريبي EIN، والوكيل المسجل والتأهيل البنكي.',
    h1En: 'Form a US LLC from Saudi Arabia — Expand Globally & Access US Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من السعودية — توسّع عالمياً وافتح حساباً بنكياً أمريكياً',
    subtitleEn: 'Complement your Saudi commercial registration (CR) with a US corporate entity for international contracts, SaaS subscriptions, and Amazon US FBA expansion.',
    subtitleAr: 'ادعم أعمالك وسجلك التجاري في المملكة بكيان أمريكي رسمي يتيح لك توقيع العقود الدولية، التوسع في أمازون أمريكا، وتلقي استثمارات رأس المال الجريء.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Saudi commercial registrations (CR) face complex barriers when signing US software enterprise vendor contracts.',
      'Selling on Amazon US FBA with a local Saudi entity incurs cross-border merchant friction and withholding hurdles.',
      'International SaaS subscriptions and API infrastructures frequently require a verified US billing profile.',
      'Regional payment gateways impose restrictive merchant underwriting on international cross-border checkouts.',
    ],
    painPointsAr: [
      'تواجه المنشآت المحلية صعوبة أحياناً في التعاقد المباشر مع مزودي الخدمات البرمجية والمنصات التقنية في الولايات المتحدة.',
      'البيع على أمازون أمريكا (Amazon US FBA) من خلال كيان أمريكي يمنحك سرعة قبول وتسهيلات بنكية وضريبية متكاملة.',
      'بعض منصات الاستثمار والتسريع العالمية تشترط وجود كيان مسجل في ديلاوير أو وايومنغ للاستثمار.',
      'الحاجة إلى إدارة التدفقات النقدية بالدولار الأمريكي وتفادي رسوم التحويل الدولي المتكررة.',
    ],
    benefitsEn: [
      { title: 'Global Contracting Authority', desc: 'Sign enterprise agreements with US and European partners as a recognized US business.' },
      { title: 'Wyoming vs Delaware Flexibility', desc: 'Choose Wyoming for zero state tax and member privacy, or Delaware if planning US institutional funding.' },
      { title: 'Remote Digital Banking', desc: 'Apply online for Mercury or Relay accounts to hold USD and transfer via SWIFT to Al Rajhi, SNB, or Riyad Bank.' },
      { title: 'Zero US State Corporate Tax', desc: 'Wyoming has no state corporate or personal income tax, and transparent $60 annual report fees.' },
      { title: 'Stripe Global Card Processing', desc: 'Accept credit card payments worldwide in USD without regional merchant holds.' },
      { title: 'Post-Formation Compliance Support', desc: 'Annual reminders for Wyoming SOS filings and mandatory IRS Form 5472 submission.' },
    ],
    benefitsAr: [
      { title: 'مصداقية التعاقد الدولي', desc: 'وقّع عقودك وشراكاتك التقنية مع الشركات العالمية ككيان تجاري أمريكي معتمد.' },
      { title: 'مرونة الاختيار بين وايومنغ وديلاوير', desc: 'اختر وايومنغ للتكلفة المنخفضة والخصوصية، أو ديلاوير إذا كنت تستهدف مستثمرين ورأس مال جريء.' },
      { title: 'حسابات بنكية أمريكية عن بُعد', desc: 'قدّم إلكترونياً على بنوك مثل ميركوري وريلاي واستقبل الدولار مع إمكانية التحويل للراجحي أو الأهلي.' },
      { title: 'انعدام ضريبة الدخل في وايومنغ', desc: 'لا تفرض ولاية وايومنغ أي ضريبة دخل للشركات، ورسوم تقريرها السنوي واضحة تبدأ من 60 دولاراً.' },
      { title: 'بوابات دفع سترايب العالمية', desc: 'استقبل مدفوعات البطاقات من كافة دول العالم بالدولار دون قيود محلية.' },
      { title: 'متابعة الامتثال السنوي', desc: 'تذكير بمواعيد تجديد سكرتير الولاية ونموذج الإفصاح الفيدرالي الإلزامي IRS Form 5472.' },
    ],
    faqEn: [
      { q: 'Can Saudi citizens form a US LLC without traveling?', a: 'Yes. Non-US residents can form a US LLC completely online. No travel, visa, or US social security number is required.' },
      { q: 'Which US state is best for Saudi entrepreneurs?', a: 'For online stores, consulting, and SaaS without US venture capital, Wyoming is ideal due to low annual fees ($60) and privacy. If seeking US venture funding, Delaware is standard.' },
      { q: 'How does US taxation work for Saudi resident owners?', a: 'Single-member US LLCs owned by non-residents are pass-through entities. If you have no US real estate, physical office, or US employees, you are not subject to US corporate income tax, but Form 5472 must be filed annually.' },
      { q: 'What is the realistic timeline for my EIN?', a: 'The state approves your LLC in 2-5 business days. Because non-residents lack an SSN, the IRS requires Form SS-4 filing via fax, which currently takes 3 to 6 weeks for IRS manual issuance.' },
    ],
    faqAr: [
      { q: 'هل يستطيع المواطن السعودي تأسيس شركة أمريكية دون سفر؟', a: 'نعم بالتأكيد. تأسيس الـ LLC متاح بالكامل عن بُعد للمواطنين والمقيمين في المملكة دون الحاجة لأي تأشيرة أو رقم تأمين أمريكي.' },
      { q: 'ما هي أفضل ولاية لرواد الأعمال في السعودية: وايومنغ أم ديلاوير؟', a: 'للتجارة الإلكترونية والخدمات الرقمية، ولاية وايومنغ هي الخيار الأمثل لرسومها السنوية المنخفضة (60$) وحماية الخصوصية. أما إذا كنت تسعى لجولات استثمارية من صناديق أمريكية فديلاوير هي الأنسب.' },
      { q: 'كيف تتعامل الشركة مع الضرائب الأمريكية ومصلحة IRS؟', a: 'تعتبر الشركة الأمريكية لغير المقيمين كياناً ضريبياً شفافاً (Pass-Through). إذا لم يكن لشركتك عمالة أو أصول على الأراضي الأمريكية، فلا تخضع لأرباح الشركات، ولكن يجب تقديم إقرار Form 5472 السنوي لتفادي الغرامات.' },
      { q: 'ما هو الجدول الزمني الفعلي لاستخراج رقم EIN؟', a: 'يتم اعتماد الشركة في الولاية خلال 2 إلى 5 أيام عمل. ونظراً لعدم وجود رقم SSN، يتطلب استخراج EIN من 3 إلى 6 أسابيع عبر الفاكس الرسمي مع مصلحة الضرائب الأمريكية IRS.' },
    ],
    bankTip: 'When applying for Mercury from Saudi Arabia, provide your verified Saudi national address, commercial purpose, and your official Wyoming/Delaware formation certificate.',
    bankTipAr: 'عند التقديم على بنك ميركوري من السعودية، جهّز إثبات عنوانك الوطني المسجل، وصف نشاطك التجاري، وشهادة التأسيس الرسمية مع رقم EIN.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Formation', value: '2-5 Days' }, { label: 'Remote Access', value: '100% Online' }, { label: 'Compliance Tracking', value: 'Ongoing' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'إجراءات رقمية', value: '100% أونلاين' }, { label: 'متابعة الامتثال', value: 'مستمرة' }],
    whatsapp: '13072898149',
  },

  'uae': {
    slug: 'uae', countryCode: 'AE', flag: '🇦🇪',
    nameEn: 'UAE', nameAr: 'دولة الإمارات العربية المتحدة',
    geoRegion: 'AE',
    metaTitleEn: 'Form a US LLC from UAE | Dual-Entity Strategy | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من الإمارات | استراتيجية الكيانين | Instant Grow',
    metaDescEn: 'Incorporate a US LLC from UAE (Dubai & Abu Dhabi). Ideal dual-entity strategy for Free Zone businesses, US Stripe checkout, and international USD banking.',
    metaDescAr: 'أسّس شركة LLC أمريكية من دبي وأبوظبي. استراتيجية الكيان المزدوج لشركات المناطق الحرة، بوابات سترايب الأمريكية، والحسابات البنكية الدولية.',
    h1En: 'Form a US LLC from UAE — Power Your Global Business & US Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من الإمارات — عزّز أعمالك العالمية وتوسّع مصرفياً',
    subtitleEn: 'Pair your UAE Free Zone or mainland company with a US LLC to expand global payment acceptance, lower transaction friction, and access US digital banking.',
    subtitleAr: 'ادمج شركتك في المنطقة الحرة أو البر الرئيسي الإماراتي مع شركة LLC أمريكية لتسهيل قبول المدفوعات العالمية بالدولار وفتح حسابات أمريكية معتمدة.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'UAE Free Zone corporate bank accounts require substantial minimum balance thresholds and lengthy onboarding.',
      'Payment gateways in the UAE often charge high merchant acquiring fees for international USD card payments.',
      'Operating with US enterprise clients or platforms like Shopify Payments requires a verified US tax identification number.',
      'Understanding the interaction between the UAE 9% federal corporate tax and foreign pass-through entities.',
    ],
    painPointsAr: [
      'تشترط البنوك المحلية في الإمارات أحياناً حد أدنى مرتفع للرصيد وإجراءات فتح حساب قد تمتد لأسابيع.',
      'تفرض بعض بوابات الدفع في المنطقة رسوماً مرتفعة على معالجة البطاقات الأجنبية والمدفوعات بالدولار.',
      'التعامل مع عملاء في السوق الأمريكي ومنصات مثل Stripe وShopify Payments يتطلب كياناً أمريكياً ورقماً ضريبياً رسمياً.',
      'الحاجة إلى وضوح تام بشأن ضريبة الشركات الاتحادية في الإمارات بنسبة 9% وكيفية التعامل مع الكيانات الخارجية.',
    ],
    benefitsEn: [
      { title: 'Dual-Entity Strategic Advantage', desc: 'Hold UAE local presence while billing international clients via a transparent US LLC structure.' },
      { title: 'Accurate Tax Structuring', desc: 'Compliant with UAE 9% federal corporate tax rules (0% strictly for Qualifying Free Zone Persons on Qualifying Income).' },
      { title: 'US Digital Banking Access', desc: 'Onboard with FDIC-insured fintech business accounts like Mercury and Relay without traveling.' },
      { title: 'Lower International Checkout Fees', desc: 'Process global credit and debit cards via Stripe US at competitive standard domestic rates.' },
      { title: 'Wyoming & Delaware Options', desc: 'Choose Wyoming for asset privacy and low overhead, or Delaware for institutional VC capitalization.' },
      { title: 'Annual IRS Compliance Oversight', desc: 'Guidance on Form 5472 + pro-forma 1120 filing to maintain clean federal standing.' },
    ],
    benefitsAr: [
      { title: 'ميزة استراتيجية الكيان المزدوج', desc: 'احتفظ بتواجدك في الإمارات مع فوترة عملائك الدوليين عبر كيان تجاري أمريكي مرموق.' },
      { title: 'امتثال ضريبي دقيق', desc: 'توافق كامل مع متطلبات ضريبة الشركات الاتحادية بنسبة 9% (حيث تطبق 0% فقط للمناطق الحرة المؤهلة على الدخل المؤهل).' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'افتح حسابات في بنوك تكنولوجيا مالية مؤمنة في أمريكا (مثل ميركوري وريلاي) بالكامل عن بُعد.' },
      { title: 'رسوم معالجة مدفوعات تنافسية', desc: 'استفد من بوابات الدفع الأمريكية بأسعار تنافسية عالمية لمتاجرك وعملائك.' },
      { title: 'خيارات وايومنغ وديلاوير', desc: 'اختر وايومنغ للرسوم الاقتصادية والخصوصية، أو ديلاوير لجولات التمويل المؤسسية.' },
      { title: 'إرشاد الامتثال لنموذج IRS 5472', desc: 'متابعة سنوية لإيداعات مصلحة الضرائب الأمريكية لتفادي الغرامات المالية.' },
    ],
    faqEn: [
      { q: 'How does the UAE 9% corporate tax affect my US LLC?', a: 'The UAE levies a 9% federal corporate tax on taxable profits exceeding AED 375,000. 0% applies only to Qualifying Free Zone Persons on Qualifying Income. If you are UAE tax resident, your worldwide profits may fall under UAE corporate tax scope. Consult a licensed tax consultant.' },
      { q: 'Can Dubai and Abu Dhabi residents establish a US LLC remotely?', a: 'Yes. UAE nationals and expatriates with UAE residency visas can form a US LLC 100% remotely. No US visa or physical visit is required.' },
      { q: 'Can I transfer funds between my US business account and UAE bank?', a: 'Yes. You can wire USD directly via SWIFT to your UAE bank (e.g., Emirates NBD, Wio, Mashreq) or use Wise Business for currency exchange.' },
      { q: 'What is the realistic timeline for obtaining an EIN without an SSN?', a: 'State formation takes 2-5 business days. The IRS EIN issuance for non-residents takes 3 to 6 weeks via Form SS-4 fax processing. Claims of 24-72 hours are inaccurate.' },
    ],
    faqAr: [
      { q: 'كيف تؤثر ضريبة الشركات الإماراتية (9%) على شركتي الأمريكية؟', a: 'تطبق الإمارات ضريبة بنسبة 9% على الأرباح التي تتجاوز 375,000 درهم، بينما تطبق نسبة 0% فقط على الدخل المؤهل في المناطق الحرة المؤهلة. إذا كنت مقيماً ضريبياً في الإمارات، ننصح باستشارة محاسب قانوني لتحديد نطاق خضوع أرباحك للضريبة.' },
      { q: 'هل يستطيع المقيم في دبي وأبوظبي تأسيس شركة أمريكية دون سفر؟', a: 'نعم. يستطيع المواطنون والمقيمون من كافة الجنسيات داخل الإمارات تأسيس شركة LLC أمريكية عن بُعد دون الحاجة للسفر أو الحصول على تأشيرة أمريكية.' },
      { q: 'هل يمكن تحويل الأموال بسهولة بين الحساب الأمريكي وحسابي في الإمارات؟', a: 'نعم. يمكنك إجراء تحويلات SWIFT مباشرة إلى بنكك في الإمارات (مثل Emirates NBD أو Wio أو المشرق)، أو استخدام Wise Business لتحويل العملات.' },
      { q: 'ما هو الوقت الفعلي للحصول على الرقم الضريبي EIN لغير حاملي SSN؟', a: 'تستغرق الموافقة في الولاية من 2 إلى 5 أيام عمل، بينما يستغرق إصدار EIN لغير المقيمين من 3 إلى 6 أسابيع عبر الفاكس مع IRS. الوعود بصدوره خلال 24-72 ساعة غير واقعية.' },
    ],
    bankTip: 'Wio and Emirates NBD pair seamlessly with Mercury accounts for seamless cross-border corporate treasury management.',
    bankTipAr: 'بنوك مثل Wio وبنك الإمارات دبي الوطني تتكامل بكفاءة عالية مع حسابات ميركوري لإدارة التدفقات النقدية الدولية بسلاسة.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Formation', value: '100% Online' }, { label: 'Corporate Guidance', value: 'Full Support' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس رقمي', value: '100% أونلاين' }, { label: 'إرشاد مؤسسي', value: 'دعم شامل' }],
    whatsapp: '13072898149',
  },

  'jordan': {
    slug: 'jordan', countryCode: 'JO', flag: '🇯🇴',
    nameEn: 'Jordan', nameAr: 'المملكة الأردنية الهاشمية',
    geoRegion: 'JO',
    metaTitleEn: 'Form a US LLC from Jordan | Tech & Software Founders | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من الأردن | لمطوري البرمجيات والشركات الناشئة | Instant Grow',
    metaDescEn: 'Incorporate a US LLC from Amman, Jordan. Activate Stripe, open digital USD bank accounts, and invoice global software clients without currency barriers.',
    metaDescAr: 'أسّس شركة LLC أمريكية من عمّان والأردن. فعّل سترايب، وافتح حساباً بنكياً دولياً بالدولار، وأصدر فواتيرك لعملائك التقنيين حول العالم.',
    h1En: 'Form a US LLC from Jordan — Global Stripe & USD Banking for Tech Founders',
    h1Ar: 'تأسيس شركة LLC أمريكية من الأردن — تفعيل سترايب والخدمات المصرفية لمؤسسي التكنولوجيا',
    subtitleEn: 'Unlock global payment gateways for Amman software engineers, agencies, and cross-border startups. 100% remote formation with federal compliance.',
    subtitleAr: 'افتح بوابات الدفع العالمية لمهندسي البرمجيات والشركات التقنية الناشئة في عمّان. تأسيس قانوني كامل عن بُعد مع الامتثال الفيدرالي.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Stripe does not operate locally in Jordan, preventing direct international subscription billing.',
      'Local payment acquiring solutions charge high setup and transaction fees for international cards.',
      'Jordanian software dev shops struggle to land large US enterprise contracts without a US legal entity.',
      'Withholding taxes and international wire fees cut heavily into freelance margins.',
    ],
    painPointsAr: [
      'سترايب غير متاح للحسابات البنكية داخل الأردن، مما يعيق إطلاق منصات البرمجيات كخدمة (SaaS) والاشتراكات الشهرية.',
      'بوابات الدفع المحلية تفرض رسوم إعداد وعمولات مرتفعة على معالجة البطاقات الدولية.',
      'شركات البرمجة وتطوير التطبيقات في عمّان تحتاج كياناً أمريكياً موثوقاً للتعاقد مع الشركات العالمية.',
      'تكاليف ورسوم التحويلات البنكية الدولية تقتطع مبالغ كبيرة من أرباح مقدمي الخدمات المستقلين.',
    ],
    benefitsEn: [
      { title: 'Global Subscription Billing', desc: 'Integrate Stripe Billing and Stripe Checkout seamlessly into your SaaS or mobile application.' },
      { title: 'FDIC-Insured US Banking', desc: 'Apply online for Mercury or Relay business checking accounts to collect client wires in USD.' },
      { title: 'Low-Cost Remittance to Jordan', desc: 'Transfer funds back to Bank al Etihad, Arab Bank, or Jordan Kuwait Bank via Wise Business.' },
      { title: 'Wyoming Corporate Privacy', desc: 'Keep personal member information off public state registry databases.' },
      { title: 'Transparent Annual Costs', desc: 'Wyoming annual report is only $60 with no state corporate franchise income tax.' },
      { title: 'Post-Formation Tax Guidance', desc: 'Step-by-step guidance for mandatory IRS Form 5472 filing to protect against $25k penalties.' },
    ],
    benefitsAr: [
      { title: 'نظام اشتراكات برمجية عالمي', desc: 'اربط Stripe Billing مع تطبيقك أو منصتك لتحصيل الاشتراكات من عملائك الدوليين تلقائياً.' },
      { title: 'حسابات بنكية أمريكية مؤمنة', desc: 'قدّم أونلاين على حسابات مثل Mercury لتحصيل مستحقاتك بالدولار الأمريكي.' },
      { title: 'تحويلات اقتصادية للأردن', desc: 'حوّل أموالك بسهولة إلى بنك الاتحاد أو البنك العربي عبر Wise بيزنس بأفضل أسعار الصرف.' },
      { title: 'حماية خصوصية الملاك', desc: 'تتيح ولاية وايومنغ عدم إدراج أسماء الملاك في السجلات العامة المتاحة للجمهور.' },
      { title: 'تكاليف صيانة سنوية منخفضة', desc: 'رسوم التقرير السنوي في وايومنغ تبدأ من 60 دولاراً فقط وبدون ضريبة دخل للولاية.' },
      { title: 'إرشادات الامتثال لنموذج 5472', desc: 'دليل واضح لإعداد وتقديم إقرار IRS Form 5472 السنوي الإلزامي لتفادي الغرامات.' },
    ],
    faqEn: [
      { q: 'Can Jordanian citizens open a US LLC from Amman?', a: 'Yes. Jordanian citizens can form and own a US LLC entirely from home. No US visit, visa, or American partner is needed.' },
      { q: 'How can I activate Stripe in Jordan using this LLC?', a: 'With your approved LLC documents, federal EIN, and US commercial business address, you can open a verified Stripe US account and receive payouts into your US bank account.' },
      { q: 'How long does the formation take?', a: 'State formation takes 2-5 business days. The IRS EIN issuance for non-residents takes 3 to 6 weeks via Form SS-4 fax processing.' },
      { q: 'Do I owe taxes in the United States?', a: 'As a non-resident single-member LLC without US physical operations, your business is treated as a pass-through entity with no federal income tax, but Form 5472 + pro-forma 1120 is strictly required.' },
    ],
    faqAr: [
      { q: 'هل يستطيع المواطن الأردني تأسيس شركة أمريكية من عمّان؟', a: 'نعم. يستطيع الأردنيون تأسيس وامتلاك شركة LLC أمريكية بالكامل من الأردن دون الحاجة لشريك أمريكي أو تأشيرة سفر.' },
      { q: 'كيف أفعّل سترايب في الأردن من خلال الشركة؟', a: 'من خلال وثائق التأسيس ورقم EIN والعنوان التجاري والحساب البنكي الأمريكي، يمكنك تفعيل حساب Stripe أمريكي نظامي واستقبال الأرباح عليه.' },
      { q: 'كم تستغرق إجراءات التأسيس؟', a: 'يستغرق اعتماد الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج الرقم الضريبي الفيدرالي EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب الأمريكية.' },
      { q: 'هل علي دفع ضرائب داخل الولايات المتحدة؟', a: 'إذا لم يكن لشركتك تواجد وموظفون داخل أمريكا، فالشركة لا تخضع لضريبة الدخل الفيدرالية، ولكن يتعين تقديم إقرار Form 5472 السنوي الإلزامي.' },
    ],
    bankTip: 'Bank al Etihad accounts in Jordan receive SWIFT and Wise transfers from US Mercury accounts smoothly without excessive holds.',
    bankTipAr: 'حسابات بنك الاتحاد في الأردن تستقبل التحويلات القادمة من بنك ميركوري ووايز بسلاسة ودون تعقيدات في مطابقة البيانات.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'EIN Processing', value: 'Official IRS Fax' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'إجراءات EIN', value: 'متابعة رسمية' }],
    whatsapp: '13072898149',
  },

  'kuwait': {
    slug: 'kuwait', countryCode: 'KW', flag: '🇰🇼',
    nameEn: 'Kuwait', nameAr: 'دولة الكويت',
    geoRegion: 'KW',
    metaTitleEn: 'Form a US LLC from Kuwait | E-Commerce & Asset Protection | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من الكويت | للتجارة والاستثمار الدولي | Instant Grow',
    metaDescEn: 'Form a US LLC from Kuwait 100% online. Articles of organization, federal EIN, registered agent, and digital US banking guidance for Kuwaiti founders.',
    metaDescAr: 'أسّس شركة LLC أمريكية من الكويت بالكامل عبر الإنترنت. عقد التأسيس، الرقم الضريبي EIN، والوكيل المسجل والتأهيل البنكي الرقمي.',
    h1En: 'Form a US LLC from Kuwait — International E-Commerce & Asset Protection',
    h1Ar: 'تأسيس شركة LLC أمريكية من الكويت — تجارة إلكترونية عالمية وحماية أصول',
    subtitleEn: 'Empower your global business ventures with a robust Wyoming or Delaware LLC. Access US banking, Stripe, and international commercial platforms.',
    subtitleAr: 'عزّز استثماراتك ومشاريعك التجارية العالمية بكيان أمريكي رسمي في وايومنغ أو ديلاوير يتيح لك فتح الحسابات الأمريكية وتفعيل بوابات الدفع الدولية.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Local KNET payment infrastructure is domestic only and cannot acquire international recurring credit card sales.',
      'Selling on Amazon US FBA or global marketplaces is difficult without a registered US entity and EIN.',
      'Kuwaiti entrepreneurs investing in US digital assets or real estate require clear corporate liability separation.',
      'International venture capital and SaaS platforms demand standard Delaware or Wyoming entity structures.',
    ],
    painPointsAr: [
      'شبكة كي نت (KNET) مخصصة للسوق المحلي ولا تمكّنك من تحصيل الاشتراكات والبطاقات الائتمانية الدولية تلقائياً.',
      'البيع والتوسع على أمازون أمريكا ومتاجر التجزئة العالمية يتطلب كياناً قانونياً مسجلاً في الولايات المتحدة.',
      'الحاجة إلى فصل المسؤولية القانونية وحماية الأصول الاستثمارية عبر كيان مؤسسي معترف به دولياً.',
      'منصات التمويل والاستثمار العالمية تشترط هياكل مؤسسية معتمدة في ولايات مثل ديلاوير أو وايومنغ.',
    ],
    benefitsEn: [
      { title: 'Global Card Processing', desc: 'Accept Visa, Mastercard, and Amex from clients worldwide using Stripe US.' },
      { title: 'Wyoming Asset Protection', desc: 'Benefit from robust charging order protection laws that safeguard your business assets.' },
      { title: 'Digital USD Banking Access', desc: 'Open accounts with digital banks like Mercury and Relay to manage corporate funds.' },
      { title: 'Zero State Income Tax', desc: 'Wyoming charges 0% state corporate income tax with minimal annual maintenance costs ($60).' },
      { title: 'Seamless Transfers to Kuwait', desc: 'Wire funds directly to NBK, Boubyan, or Gulf Bank via SWIFT or Wise Business.' },
      { title: 'IRS Compliance Oversight', desc: 'Annual guidance for non-resident Form 5472 filings to maintain clean IRS records.' },
    ],
    benefitsAr: [
      { title: 'قبول البطاقات العالمية', desc: 'استقبل مدفوعات فيزا وماستركارد وأمريكان إكسبريس من عملائك حول العالم عبر سترايب.' },
      { title: 'حماية قوية للأصول في وايومنغ', desc: 'استفد من قوانين ولاية وايومنغ المتقدمة في حماية الشركات وفصل الذمة المالية للمالك.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'افتح حسابات تجارية في بنوك رقمية مثل ميركوري لإدارة أموال شركتك بالدولار.' },
      { title: 'انعدام ضريبة الدخل في وايومنغ', desc: 'لا تفرض وايومنغ ضريبة دخل على الشركات، ورسوم تجديد تقريرها السنوي 60 دولاراً فقط.' },
      { title: 'تحويلات ميسرة للكويت', desc: 'حوّل أرباحك مباشرة إلى بنك الكويت الوطني (NBK) أو بنك بوبيان عبر SWIFT أو وايز.' },
      { title: 'إرشاد الامتثال لنموذج 5472', desc: 'متابعة سنوية لإيداع إقرار مصلحة الضرائب الفيدرالية IRS Form 5472 الإلزامي.' },
    ],
    faqEn: [
      { q: 'Can Kuwaiti citizens form a US LLC without a US visa?', a: 'Yes. Any Kuwaiti citizen or resident can legally form and own a US LLC 100% online without setting foot in the United States.' },
      { q: 'Why is Wyoming preferred by Kuwaiti investors?', a: 'Wyoming offers top-tier member privacy (names are not public record), zero state corporate tax, and low annual report fees ($60).' },
      { q: 'What is the realistic timeline for an EIN?', a: 'State formation takes 2-5 business days. Non-resident IRS EIN issuance takes 3 to 6 weeks via Form SS-4 fax processing.' },
      { q: 'Do I need to report my LLC to US tax authorities?', a: 'Yes. Non-resident single-member LLCs must file an annual information return via IRS Form 5472 and pro-forma 1120 to prevent statutory penalties.' },
    ],
    faqAr: [
      { q: 'هل يستطيع الكويتيون تأسيس شركة أمريكية دون الحاجة لفيزا؟', a: 'نعم. يستطيع المواطنون والمقيمون في الكويت تأسيس وامتلاك شركة LLC أمريكية بالكامل أونلاين دون الحاجة لزيارة أمريكا.' },
      { q: 'لماذا يفضل المستثمر الكويتي ولاية وايومنغ؟', a: 'تتميز وايومنغ بخصوصية عالية لأسماء الملاك، وانعدام ضريبة الدخل للولاية، ورسوم تجديد سنوية منخفضة (60 دولاراً).' },
      { q: 'ما هو الوقت المتوقع لاستلام الرقم الضريبي EIN؟', a: 'تستغرق موافقة الولاية من 2 إلى 5 أيام عمل، بينما يستغرق إصدار EIN لغير حاملي SSN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'هل يجب تقديم تقارير سنوية لمصلحة الضرائب الأمريكية؟', a: 'نعم، يتعين على مالك الشركة غير المقيم تقديم إقرار المعلومات السنوي IRS Form 5472 لتجنب الغرامة الفيدرالية البالغة 25,000 دولار.' },
    ],
    bankTip: 'National Bank of Kuwait (NBK) and Boubyan Bank handle incoming wires from US Mercury business accounts efficiently.',
    bankTipAr: 'حسابات بنك الكويت الوطني (NBK) وبنك بوبيان تستقبل الحوالات القادمة من بنك ميركوري الأمريكي بسلاسة عند تقديم عقد التأسيس.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Formation', value: '100% Online' }, { label: 'Annual Tracking', value: 'Included' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس رقمي', value: '100% أونلاين' }, { label: 'متابعة سنوية', value: 'مشمولة' }],
    whatsapp: '13072898149',
  },

  'qatar': {
    slug: 'qatar', countryCode: 'QA', flag: '🇶🇦',
    nameEn: 'Qatar', nameAr: 'دولة قطر',
    geoRegion: 'QA',
    metaTitleEn: 'Form a US LLC from Qatar | International Expansion | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من قطر | للتوسع الدولي والمدفوعات | Instant Grow',
    metaDescEn: 'Incorporate a US LLC from Doha, Qatar. Establish global payment acceptance via Stripe, open US bank accounts, and invoice international clients remotely.',
    metaDescAr: 'أسّس شركة LLC أمريكية من الدوحة وقطر. تفعيل بوابات سترايب العالمية، فتح حسابات بنكية أمريكية، وفوترة العملاء الدوليين بالكامل عن بُعد.',
    h1En: 'Form a US LLC from Qatar — Expand Globally with Stripe & US Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من قطر — انطلق عالمياً مع سترايب والخدمات المصرفية الأمريكية',
    subtitleEn: 'Fast, compliant US company formation for Qatari founders, consultancies, and digital agencies expanding into international markets.',
    subtitleAr: 'تأسيس موثوق وسريع لشركات LLC في أمريكا للمؤسسين والشركات الاستشارية والتقنية في قطر للتوسع في الأسواق العالمية.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Establishing local entities in Qatar for purely cross-border digital operations involves high initial paid-up capital.',
      'International card acceptance through local gateways incurs steep processing fees on foreign currencies.',
      'Global corporate clients expect contractual agreements with recognized US business entities.',
      'Direct integration with Stripe and US fintech banking requires a registered US corporate presence.',
    ],
    painPointsAr: [
      'تأسيس كيانات محلية في قطر لخدمة عملاء خارج الدولة قد يتطلب متطلبات رأس مال وإجراءات إدارية مكلفة.',
      'بوابات الدفع المحلية تفرض عمولات مرتفعة على معالجة العملات الأجنبية وبطاقات الائتمان الدولية.',
      'العملاء والشركات الدولية يفضلون إبرام العقود مع كيانات مسجلة في الولايات المتحدة لسهولة التعامل القانوني.',
      'التكامل المباشر مع سترايب والبنوك الرقمية الأمريكية يشترط وجود كيان تجاري مسجل ورقم ضريبي فيدرالي EIN.',
    ],
    benefitsEn: [
      { title: 'Global Payment Processing', desc: 'Accept international cards via Stripe with transparent fee structures in USD.' },
      { title: 'Digital Business Accounts', desc: 'Apply online for Mercury or Relay business accounts without traveling to the US.' },
      { title: 'Wyoming Low Overhead', desc: 'Benefit from 0% state corporate tax and low $60 annual report fees in Wyoming.' },
      { title: 'Complete Privacy Protection', desc: 'Wyoming keeps shareholder and manager identities completely confidential.' },
      { title: 'Easy Repatriation to Doha', desc: 'Transfer funds back to QNB or Commercial Bank of Qatar via wire or Wise Business.' },
      { title: 'IRS Compliance Guidance', desc: 'Structured guidance on filing annual IRS Form 5472 to maintain federal standing.' },
    ],
    benefitsAr: [
      { title: 'معالجة مدفوعات دولية', desc: 'اقبل مدفوعات البطاقات حول العالم عبر سترايب برسوم معالجة تنافسية بالدولار.' },
      { title: 'حسابات أعمال رقمية', desc: 'قدّم إلكترونياً على حسابات ميركوري وريلاي دون الحاجة للسفر إلى أمريكا.' },
      { title: 'تكاليف تشغيل اقتصادية', desc: 'استفد من انعدام ضريبة الدخل في وايومنغ ورسوم التقرير السنوي المنخفضة (60 دولاراً).' },
      { title: 'حماية كاملة للخصوصية', desc: 'تضمن ولاية وايومنغ سرية بيانات الملاك وعدم نشرها في السجلات العامة.' },
      { title: 'تحويلات سلسة إلى الدوحة', desc: 'حوّل أرباحك مباشرة إلى بنك قطر الوطني (QNB) أو البنك التجاري عبر وايز أو SWIFT.' },
      { title: 'إرشاد الامتثال لنموذج 5472', desc: 'دليل عملي لإعداد وتقديم إقرار مصلحة الضرائب الفيدرالية IRS Form 5472 الإلزامي.' },
    ],
    faqEn: [
      { q: 'Can Qatari citizens legally own a US LLC?', a: 'Yes. Qatari nationals and residents can own 100% of a US LLC. No US green card, visa, or local US director is required.' },
      { q: 'How long does the incorporation take?', a: 'State formation takes 2-5 business days. IRS EIN issuance takes 3 to 6 weeks for non-residents via Form SS-4 fax processing.' },
      { q: 'Can I connect Stripe to my Qatari bank account?', a: 'No, Stripe US requires a US bank account. Your US LLC opens a US digital account (Mercury/Relay), which receives Stripe payouts, and you then transfer funds to Qatar.' },
      { q: 'What are the annual filing obligations?', a: 'Wyoming requires an Annual Report starting at $60. The IRS strictly mandates Form 5472 + pro-forma 1120 for non-resident single-member LLCs.' },
    ],
    faqAr: [
      { q: 'هل يحق للمواطنين في قطر تملك شركة أمريكية قانونياً؟', a: 'نعم. يحق للمواطنين والمقيمين في دولة قطر تملك شركة LLC أمريكية بنسبة 100% دون الحاجة لشريك أمريكي أو إقامة.' },
      { q: 'كم تستغرق إجراءات التأسيس؟', a: 'يستغرق اعتماد الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج الرقم الضريبي الفيدرالي EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'هل يمكن ربط سترايب مباشرة بحساب بنكي في قطر؟', a: 'كلا، يتطلب سترايب الأمريكي حساباً بنكياً أمريكياً. يتم فتح حساب في Mercury أو Relay لاستقبال أرباح سترايب ثم تحويلها لحسابك في قطر.' },
      { q: 'ما هي الالتزامات السنوية المفروضة على الشركة؟', a: 'تتطلب ولاية وايومنغ تقريراً سنوياً يبدأ من 60 دولاراً، وتلزم مصلحة الضرائب الأمريكية بتقديم إقرار Form 5472 السنوي لغير المقيمين.' },
    ],
    bankTip: 'Qatar National Bank (QNB) accounts receive foreign USD remittances from Mercury smoothly when backed by corporate formation documents.',
    bankTipAr: 'حسابات بنك قطر الوطني (QNB) تستقبل الحوالات بالدولار من بنك ميركوري الأمريكي بسلاسة مع إرفاق مستندات الشركة.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Process', value: '100% Online' }, { label: 'Filing Guidance', value: 'Full Support' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'إجراءات رقمية', value: '100% أونلاين' }, { label: 'دعم الامتثال', value: 'شامل' }],
    whatsapp: '13072898149',
  },

  'oman': {
    slug: 'oman', countryCode: 'OM', flag: '🇴🇲',
    nameEn: 'Oman', nameAr: 'سلطنة عُمان',
    geoRegion: 'OM',
    metaTitleEn: 'Form a US LLC from Oman | Global Payments & Banking | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من سلطنة عُمان | بوابات دفع وحسابات دولارية | Instant Grow',
    metaDescEn: 'Incorporate a US LLC from Muscat, Oman. Open US bank accounts, activate global Stripe & PayPal, and sell to international customers remotely.',
    metaDescAr: 'أسّس شركة LLC أمريكية من مسقط وعُمان بالكامل عبر الإنترنت. افتح حسابات بنكية أمريكية، وفعّل سترايب وباي بال لبيع خدماتك ومنتجاتك عالمياً.',
    h1En: 'Form a US LLC from Oman — Unlock Global Stripe & US Business Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من سلطنة عُمان — تفعيل سترايب والخدمات المصرفية الأمريكية',
    subtitleEn: 'Support your Oman Vision 2040 digital enterprise. 100% remote formation with registered agent, EIN, and US banking guidance.',
    subtitleAr: 'ادعم مشروعك الرقمي ورؤية عُمان 2040. تأسيس كامل عن بُعد مع وكيل مسجل، رقم ضريبي EIN، وتأهيل مصرفي أمريكي شامل.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Local payment gateways in Oman do not provide seamless global credit card checkout.',
      'Omani freelancers and agencies struggle to invoice European and US clients directly in USD.',
      'Selling on Amazon US or expanding international dropshipping requires a US tax ID.',
      'High conversion markups on traditional incoming cross-border bank wires.',
    ],
    painPointsAr: [
      'بوابات الدفع المحلية في سلطنة عُمان لا توفر انتشاراً واسعاً لقبول المدفوعات بالبطاقات الدولية من كافة الدول.',
      'يواجه أصحاب الأعمال المستقلة والوكالات الرقمية صعوبة في تحصيل فواتير العملاء بالدولار الأمريكي مباشرة.',
      'البيع على أمازون أمريكا والتجارة الإلكترونية الدولية يتطلب رقماً ضريبياً فيدرالياً EIN وكياناً معتمداً.',
      'فروق أسعار الصرف ورسوم التحويلات التقليدية تقتطع جزءاً كبيراً من عوائد الأعمال.',
    ],
    benefitsEn: [
      { title: 'Global Payment Gateway Access', desc: 'Activate verified Stripe and PayPal business accounts to accept credit card payments globally.' },
      { title: 'Digital Business Accounts', desc: 'Open FDIC-insured US accounts with Mercury or Relay to hold and manage USD.' },
      { title: 'Affordable Wyoming Maintenance', desc: 'Wyoming charges 0% state income tax and a transparent $60 annual report fee.' },
      { title: 'No US Travel Required', desc: 'Submit passport and company details online; we manage filings from Muscat remotely.' },
      { title: 'Simple Transfers to Oman', desc: 'Send funds back to Bank Muscat or Bank Dhofar via SWIFT or Wise Business.' },
      { title: 'Annual IRS Compliance Support', desc: 'Clear guidelines on Form 5472 filing to avoid US federal non-compliance penalties.' },
    ],
    benefitsAr: [
      { title: 'تفعيل بوابات الدفع العالمية', desc: 'فعّل حسابات سترايب وباي بال تجارية معتمدة لقبول مدفوعات البطاقات حول العالم.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'افتح حسابات في بنوك تكنولوجيا مالية أمريكية مثل ميركوري لإدارة أموالك بالدولار.' },
      { title: 'تكاليف تشغيلية منخفضة', desc: 'تتميز ولاية وايومنغ بانعدام ضريبة الدخل ورسوم تقرير سنوي تبدأ من 60 دولاراً فقط.' },
      { title: 'لا يتطلب أي سفر', desc: 'قدّم مستنداتك وجواز سفرك عبر الإنترنت، ونتولى كافة الإجراءات عن بُعد من مسقط.' },
      { title: 'تحويلات سهلة إلى عُمان', desc: 'حوّل أرباحك مباشرة إلى بنك مسقط أو بنك ظفار عبر وايز أو التحويلات الدولية.' },
      { title: 'إرشاد الامتثال لنموذج 5472', desc: 'توجيه دقيق لإعداد إقرار IRS Form 5472 السنوي لتفادي الغرامات الفيدرالية.' },
    ],
    faqEn: [
      { q: 'Can Omani citizens form a US company remotely?', a: 'Yes. Omani citizens and residents can legally establish and own a US LLC entirely online without traveling.' },
      { q: 'How long does formation take from Oman?', a: 'State formation takes 2-5 business days. The IRS EIN issuance takes 3 to 6 weeks via Form SS-4 fax processing.' },
      { q: 'What US state is best for Omani founders?', a: 'Wyoming is recommended for digital businesses and consulting due to privacy and low annual costs ($60/yr).' },
      { q: 'Do I pay taxes in the US?', a: 'Non-resident single-member LLCs without US physical presence or employees are pass-through entities with no US corporate tax, but Form 5472 must be filed.' },
    ],
    faqAr: [
      { q: 'هل يستطيع المواطن العُماني تأسيس شركة أمريكية عن بُعد؟', a: 'نعم. يستطيع المواطنون والمقيمون في سلطنة عُمان تأسيس وامتلاك شركة LLC أمريكية بالكامل أونلاين دون الحاجة للسفر.' },
      { q: 'كم يستغرق التأسيس من سلطنة عُمان؟', a: 'يستغرق اعتماد الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج رقم EIN من 3 إلى 6 أسابيع عبر الفاكس مع IRS.' },
      { q: 'ما هي أفضل ولاية لرواد الأعمال في عُمان؟', a: 'ولاية وايومنغ هي الأنسب للمشاريع الرقمية والاستشارات للخصوصية العالية ورسومها السنوية الرمزية (60 دولاراً).' },
      { q: 'هل توجد ضرائب مفروضة في أمريكا؟', a: 'الشركة الشفافة لغير المقيمين معفاة من ضريبة الدخل إذا لم يكن لها مقر فعلي أو عمالة داخل أمريكا، مع وجوب تقديم إقرار Form 5472 السنوي.' },
    ],
    bankTip: 'Bank Muscat handles incoming international wires from Mercury smoothly when supported by your US Articles of Organization.',
    bankTipAr: 'حسابات بنك مسقط تستقبل التحويلات الدولية القادمة من بنك ميركوري الأمريكي بسلاسة عند تقديم وثائق التأسيس ورقم EIN.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'IRS SS-4 Filing', value: 'Direct Fax' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'تقديم مصلحة IRS', value: 'متابعة رسمية' }],
    whatsapp: '13072898149',
  },

  'bahrain': {
    slug: 'bahrain', countryCode: 'BH', flag: '🇧🇭',
    nameEn: 'Bahrain', nameAr: 'مملكة البحرين',
    geoRegion: 'BH',
    metaTitleEn: 'Form a US LLC from Bahrain | Fintech & E-Commerce | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من البحرين | لرواد الأعمال والتكنولوجيا المالية | Instant Grow',
    metaDescEn: 'Launch a US LLC from Manama, Bahrain. Access US banking, activate global Stripe checkout, and expand into international markets 100% remotely.',
    metaDescAr: 'أسّس شركة LLC أمريكية من المنامة والبحرين بالكامل عن بُعد. افتح حسابات بنكية أمريكية، وفعّل سترايب، وانطلق في الأسواق العالمية.',
    h1En: 'Form a US LLC from Bahrain — Global Stripe & US Business Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من البحرين — تفعيل سترايب والخدمات المصرفية الأمريكية',
    subtitleEn: 'Scale your fintech, software, or e-commerce venture globally with a compliant US business entity registered in Wyoming or Delaware.',
    subtitleAr: 'وسّع نطاق أعمالك التقنية والتجارية عالمياً مع شركة أمريكية مسجلة رسمياً في وايومنغ أو ديلاوير مع كامل الامتثال الفيدرالي.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Local payment acquiring options have limited global reach for cross-border software sales.',
      'Selling on Amazon US or contracting with global tech giants requires a US EIN and business presence.',
      'Cross-border payment friction when receiving USD from North American clients.',
      'High setup costs when attempting international corporate structuring through traditional law firms.',
    ],
    painPointsAr: [
      'بوابات الدفع المحلية تفرض قيوداً على المبيعات الدولية لمنتجات البرمجيات والخدمات الرقمية.',
      'البيع على منصات مثل أمازون والتعاقد مع الشركات الكبرى يتطلب رقماً ضريبياً أمريكياً وكياناً قانونياً معتمداً.',
      'صعوبات في تحصيل المدفوعات بالدولار من العملاء في أمريكا الشمالية وأوروبا.',
      'ارتفاع التكاليف القانونية عند محاولة تأسيس كيانات دولية عبر مكاتب المحاماة التقليدية.',
    ],
    benefitsEn: [
      { title: 'Global Card Processing', desc: 'Accept Visa, Mastercard, and Apple Pay worldwide using Stripe US with your LLC.' },
      { title: 'US Digital Banking', desc: 'Open FDIC-insured corporate accounts with Mercury or Relay without traveling to the US.' },
      { title: 'Wyoming Privacy Protection', desc: 'Keep ownership details confidential with Wyoming’s strict privacy statutes.' },
      { title: 'Zero State Income Tax', desc: 'Wyoming levies no corporate or personal state income tax, with an annual report fee of $60.' },
      { title: 'Direct Transfers to Bahrain', desc: 'Wire funds easily to NBB, Ila Bank, or BBK via SWIFT or Wise Business.' },
      { title: 'IRS Compliance Oversight', desc: 'Structured guidance on mandatory Form 5472 filing to prevent federal penalties.' },
    ],
    benefitsAr: [
      { title: 'معالجة مدفوعات عالمية', desc: 'اقبل مدفوعات فيزا وماستركارد وأبل باي حول العالم عبر سترايب الأمريكي.' },
      { title: 'حسابات بنكية أمريكية', desc: 'افتح حسابات تجارية مؤمنة في بنوك مثل ميركوري وريلاي دون الحاجة للسفر.' },
      { title: 'خصوصية كاملة في وايومنغ', desc: 'حافظ على سرية بيانات الملاك بفضل قوانين الخصوصية المتقدمة في ولاية وايومنغ.' },
      { title: 'انعدام ضريبة الدخل في الولاية', desc: 'لا تفرض وايومنغ ضريبة دخل على الشركات، ورسوم التقرير السنوي 60 دولاراً فقط.' },
      { title: 'تحويلات سلسة للبحرين', desc: 'حوّل أموالك إلى بنك البحرين الوطني (NBB) أو بنك إشهار (Ila Bank) أو BBK بسهولة.' },
      { title: 'إرشاد الامتثال لنموذج 5472', desc: 'متابعة سنوية لإيداع إقرار مصلحة الضرائب الفيدرالية IRS Form 5472 الإلزامي.' },
    ],
    faqEn: [
      { q: 'Can Bahraini citizens form a US LLC without a US visa?', a: 'Yes. Any Bahraini citizen or resident can legally own a US LLC 100% online without traveling to the US.' },
      { q: 'How long does the formation process take?', a: 'State formation takes 2-5 business days. The IRS EIN issuance for non-residents takes 3 to 6 weeks via Form SS-4 fax processing.' },
      { q: 'Which US state is recommended?', a: 'Wyoming is recommended for most digital businesses due to zero state tax and $60 annual fees. Delaware is best if raising institutional US capital.' },
      { q: 'What taxes must I file after formation?', a: 'Foreign-owned single-member LLCs must submit annual informational IRS Form 5472 and pro-forma 1120. Failing to file carries a $25,000 fine.' },
    ],
    faqAr: [
      { q: 'هل يستطيع المواطن البحريني تأسيس شركة أمريكية دون فيزا؟', a: 'نعم. يستطيع المواطنون والمقيمون في مملكة البحرين تأسيس وامتلاك شركة LLC أمريكية بالكامل أونلاين دون سفر.' },
      { q: 'كم تستغرق عملية التأسيس؟', a: 'يستغرق اعتماد الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج رقم EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'ما هي الولاية الموصى بها؟', a: 'وايومنغ هي الأنسب لمعظم الأنشطة الرقمية لرسومها السنوية الرمزية (60$) وخصوصيتها. وتفضل ديلاوير لجولات التمويل الكبرى.' },
      { q: 'ما هي الإقرارات الضريبية الواجبة بعد التأسيس؟', a: 'يتعين تقديم إقرار المعلومات السنوي IRS Form 5472 مع نموذج 1120، علماً بأن غرامة التأخر في التقديم تبلغ 25,000 دولار.' },
    ],
    bankTip: 'Ila Bank and National Bank of Bahrain (NBB) accept incoming SWIFT transfers from Mercury with minimal documentation.',
    bankTipAr: 'حسابات بنك إشهار (Ila Bank) وبنك البحرين الوطني (NBB) تستقبل الحوالات بالدولار من بنك ميركوري بسلاسة.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Formation', value: '100% Online' }, { label: 'Compliance Tracking', value: 'Included' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس رقمي', value: '100% أونلاين' }, { label: 'متابعة الامتثال', value: 'مشمولة' }],
    whatsapp: '13072898149',
  },

  'iraq': {
    slug: 'iraq', countryCode: 'IQ', flag: '🇮🇶',
    nameEn: 'Iraq', nameAr: 'جمهورية العراق',
    geoRegion: 'IQ',
    metaTitleEn: 'Form a US LLC from Iraq | Global Financial Inclusion | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من العراق | حلول الدفع الدولي والبنوك | Instant Grow',
    metaDescEn: 'Legally incorporate a US LLC from Baghdad, Erbil, and across Iraq. Overcome payment isolation, activate international banking, and receive client wires in USD.',
    metaDescAr: 'أسّس شركة LLC أمريكية قانونياً من بغداد وأربيل وكافة مدن العراق. تجاوز قيود الدفع واستقبل أموالك بالدولار عبر بنوك دولية موثوقة.',
    h1En: 'Form a US LLC from Iraq — Overcome Payment Isolation & Access Global Markets',
    h1Ar: 'تأسيس شركة LLC أمريكية من العراق — تجاوز عزلة بوابات الدفع وانطلق عالمياً',
    subtitleEn: 'Legally empower Iraqi developers, translators, and entrepreneurs to bill international clients, activate verified payment processing, and access compliant banking.',
    subtitleAr: 'مكّن أعمالك في البرمجة والخدمات والتجارة من استقبال مدفوعات العملاء الدوليين عبر كيان تجاري أمريكي وحسابات بنكية رقمية متوافقة.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Iraqi bank cards and payment systems are severely restricted for international SaaS and card acquiring.',
      'Stripe and PayPal do not operate locally in Iraq, blocking software creators and freelancers.',
      'International corporate clients are frequently restricted from wiring payments directly into Iraqi banks.',
      'Strict international sanctions compliance screening requires clear, legitimate corporate legal standing.',
    ],
    painPointsAr: [
      'البطاقات المصرفية وأنظمة الدفع المحلية في العراق مقيدة جداً في عمليات الشراء والتحصيل الدولي.',
      'بوابات الدفع العالمية مثل سترايب وباي بال لا تعمل داخل العراق، مما يحرم المطورين وأصحاب الخدمات من التحصيل.',
      'الشركات العالمية تواجه صعوبات امتثال في إرسال الحوالات المالية المباشرة إلى داخل العراق.',
      'الحاجة إلى كيان قانوني معترف به دولياً للعمل بشفافية والامتثال لقوانين مكافحة غسيل الأموال والفحص الأمني.',
    ],
    benefitsEn: [
      { title: '100% Legal Non-Resident Ownership', desc: 'Iraqi passport holders not on OFAC sanctions lists can fully own a compliant US LLC.' },
      { title: 'Global Card Payment Processing', desc: 'Accept credit card payments worldwide using Stripe with your verified US corporate credentials.' },
      { title: 'US Digital Business Banking', desc: 'Apply online for non-resident friendly accounts (Mercury, Relay) to receive client USD wires.' },
      { title: 'Safe Multi-Currency Retention', desc: 'Retain corporate earnings in USD without forced local currency conversion or confiscatory rates.' },
      { title: 'Wyoming Corporate Confidentiality', desc: 'Wyoming statutes do not disclose shareholder or director names on public state databases.' },
      { title: 'Federal Tax Filing Guidance', desc: 'Complete instructions on mandatory IRS Form 5472 filing to maintain legal standing.' },
    ],
    benefitsAr: [
      { title: 'ملكية قانونية 100% لغير المقيمين', desc: 'يحق لحاملي الجواز العراقي (غير المدرجين في قوائم العقوبات) تملك شركة أمريكية قانونياً بالكامل.' },
      { title: 'معالجة مدفوعات بالبطاقات العالمية', desc: 'اقبل مدفوعات البطاقات حول العالم عبر سترايب الأمريكي ببيانات شركتك الرسمية.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'قدّم أونلاين على حسابات مثل ميركوري لاستقبال مستحقاتك بالدولار من عملائك الدوليين.' },
      { title: 'حفظ الأموال بالدولار بأمان', desc: 'احتفظ بأرباحك بالدولار الأمريكي وتفادَ التذبذبات النقدية وصعوبات التحويل التقليدي.' },
      { title: 'خصوصية ولاية وايومنغ', desc: 'تحمي ولاية وايومنغ خصوصية الملاك بعدم نشر أسمائهم في السجلات العامة المتاحة للجميع.' },
      { title: 'إرشاد الامتثال لنموذج 5472', desc: 'تعليمات شاملة لإعداد وتقديم إقرار IRS Form 5472 السنوي الإلزامي لتفادي الغرامات.' },
    ],
    faqEn: [
      { q: 'Can Iraqi citizens legally own a US LLC?', a: 'Yes. US law allows foreign nationals, including Iraqi citizens, to own an LLC provided they are not listed on the US Treasury OFAC Specially Designated Nationals (SDN) sanctions lists.' },
      { q: 'What documents are required from Iraq?', a: 'You need a valid Iraqi passport and proof of your residential address. No US travel or visa is required.' },
      { q: 'How long does the formation take?', a: 'State registration takes 2-5 business days. The IRS EIN issuance takes 3 to 6 weeks via Form SS-4 fax processing.' },
      { q: 'How do I withdraw funds to Iraq?', a: 'You can withdraw funds from your US digital bank account via Wise Business, international SWIFT wire, or through compliant digital payment channels.' },
    ],
    faqAr: [
      { q: 'هل يحق للمواطن العراقي امتلاك شركة LLC أمريكية بشكل قانوني؟', a: 'نعم. يسمح القانون الأمريكي للأفراد من كافة الجنسيات بما فيها العراق بامتلاك شركات LLC، بشرط عدم إدراج الشخص في قوائم العقوبات الأمريكية (OFAC SDN).' },
      { q: 'ما هي المستندات المطلوبة من داخل العراق؟', a: 'فقط جواز سفر عراقي ساري المفعول وإثبات عنوان إقامتك الحالي. لا يُشترط أي سفر أو تأشيرة أمريكية.' },
      { q: 'كم تستغرق إجراءات التأسيس؟', a: 'يستغرق اعتماد الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج رقم EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'كيف أسحب أرباحي من الحساب الأمريكي إلى العراق؟', a: 'يمكنك تحويل الأموال عبر Wise Business، أو عبر حوالات SWIFT دولية للبنوك المعتمدة، أو عبر بطاقات السحب المرتبطة بحسابك التجاري.' },
    ],
    bankTip: 'Ensure your passport is clear and high-resolution, and clearly explain your digital software or freelance service activities during bank review.',
    bankTipAr: 'تأكد من تقديم صورة واضحة وعالية الدقة لجواز السفر العراقي، مع تقديم وصف دقيق لنشاطك البرمجي أو الخدمي أثناء مراجعة البنك.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'Sanctions Check', value: 'OFAC Compliant' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'فحص الامتثال', value: 'متوافق مع المعايير' }],
    whatsapp: '13072898149',
  },

  'morocco': {
    slug: 'morocco', countryCode: 'MA', flag: '🇲🇦',
    nameEn: 'Morocco', nameAr: 'المملكة المغربية',
    geoRegion: 'MA',
    metaTitleEn: 'Form a US LLC from Morocco | E-Commerce & Freelancers | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من المغرب | للدروب شيبينج والعمل الحر | Instant Grow',
    metaDescEn: 'Incorporate a US LLC from Casablanca, Rabat, and across Morocco. Overcome Office des Changes e-commerce limits, activate Stripe, and access US digital banking.',
    metaDescAr: 'أسّس شركة LLC أمريكية من المغرب. تجاوز قيود مكتب الصرف وبطاقات التجارة الإلكترونية، وفعّل سترايب وباي بال واستقبل أموالك بالدولار بالكامل عن بُعد.',
    h1En: 'Form a US LLC from Morocco — Overcome Card Caps, Activate Stripe & USD Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من المغرب — تفعيل سترايب وباي بال وتجاوز قيود سقف البطاقات',
    subtitleEn: 'The compliant solution for Moroccan dropshippers, developers, and digital marketers to scale internationally and invoice global clients in USD.',
    subtitleAr: 'الحل النظامي لرواد التجارة الإلكترونية والمطورين والمسوقين في المغرب للتوسع دولياً وتلقي مدفوعات العملاء بالدولار دون قيود محلية.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Morocco’s Office des Changes imposes strict annual e-commerce dotation caps on international card spending.',
      'Stripe does not support local Moroccan bank accounts, preventing direct Shopify Payments checkout.',
      'Moroccan e-commerce entrepreneurs face checkout abandonment without verified credit card gateways.',
      'International SaaS and freelance payments often face severe bureaucratic currency conversion scrutiny.',
    ],
    painPointsAr: [
      'يفرض مكتب الصرف المغربي سقفاً سنوياً محدوداً (Dotation e-commerce) على المعاملات الدولية بالبطاقات البنكية.',
      'بوابة سترايب (Stripe) لا تدعم الحسابات البنكية المغربية بالدرهم بشكل مباشر.',
      'متاجر الدروب شيبينج والتجارة الإلكترونية تفقد مبيعات حيوية لعدم توفر بوابات دفع بالبطاقات الائتمانية الدولية.',
      'صعوبة فوترة العملاء الدوليين في أوروبا وأمريكا وتلقي المستحقات بالدولار مباشرة.',
    ],
    benefitsEn: [
      { title: 'Full Stripe & PayPal Activation', desc: 'Operate legitimate US Stripe and PayPal accounts to accept credit card payments worldwide.' },
      { title: 'US Digital Business Accounts', desc: 'Apply online for Mercury or Relay business accounts to hold USD and pay for digital ads.' },
      { title: 'No Local Dotation Limits', desc: 'Pay for Facebook, Google, and TikTok ads directly from your US debit card with no annual spend cap.' },
      { title: 'Transparent Remittances to Morocco', desc: 'Transfer funds legally to Attijariwafa Bank, BCP, or CIH Bank via Wise Business at official rates.' },
      { title: 'Wyoming Corporate Privacy', desc: 'Wyoming keeps member and manager names confidential off public registry databases.' },
      { title: 'Mandatory IRS Form 5472 Support', desc: 'Clear guidelines on annual non-resident filings to prevent IRS penalties.' },
    ],
    benefitsAr: [
      { title: 'تفعيل كامل لسترايب وباي بال', desc: 'شغّل حسابات سترايب وباي بال تجارية معتمدة لقبول مدفوعات البطاقات من كافة أنحاء العالم.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'قدّم إلكترونياً على حسابات مثل ميركوري لحفظ الدولار ودفع تكاليف الإعلانات الرقمية.' },
      { title: 'تجاوز سقف بطاقات التجارة الإلكترونية', desc: 'ادفع لإعلانات فيسبوك وتيك توك وجوجل مباشرة ببطاقة شركتك الأمريكية دون سقف محلي.' },
      { title: 'تحويلات نظامية إلى المغرب', desc: 'حوّل أموالك إلى التجاري وفا بنك أو بنك إفريقيا أو CIH عبر وايز بيزنس بأسعار الصرف الرسمية.' },
      { title: 'حماية الخصوصية في وايومنغ', desc: 'لا تُدرج أسماء الملاك في السجلات العامة المتاحة للجمهور في ولاية وايومنغ.' },
      { title: 'دعم الامتثال لنموذج IRS 5472', desc: 'إرشادات واضحة لتقديم إقرار مصلحة الضرائب الفيدرالية السنوي لتفادي الغرامات المالية.' },
    ],
    faqEn: [
      { q: 'Can Moroccan citizens legally open a US LLC?', a: 'Yes. Moroccan citizens and residents can legally establish and own a US LLC entirely from Morocco. No US visa, SSN, or travel is required.' },
      { q: 'Will a US LLC resolve my Stripe issue in Morocco?', a: 'Yes. With your official US LLC, federal EIN, and US commercial address, you can register a verified Stripe US account to receive customer card payments.' },
      { q: 'How long does the formation take?', a: 'State formation takes 2-5 business days. The IRS EIN issuance for non-residents takes 3 to 6 weeks via Form SS-4 fax processing.' },
      { q: 'How do I withdraw funds to my Moroccan bank?', a: 'You can transfer USD from your US Mercury/Relay account into your Moroccan account (Attijariwafa, BCP, CIH) using Wise Business or standard SWIFT wire.' },
    ],
    faqAr: [
      { q: 'هل يحق للمواطن المغربي تأسيس شركة LLC أمريكية قانونياً؟', a: 'نعم. يحق للمواطنين والمقيمين في المغرب تأسيس وامتلاك شركة LLC أمريكية بالكامل من المغرب دون الحاجة لفيزا أو سفر.' },
      { q: 'هل تحل الشركة الأمريكية مشكلة سترايب في المغرب؟', a: 'نعم. من خلال وثائق الشركة ورقم EIN والعنوان التجاري، يمكنك فتح حساب Stripe أمريكي نظامي لمعالجة مدفوعات عملائك.' },
      { q: 'كم تستغرق إجراءات التأسيس؟', a: 'يستغرق إيداع الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج رقم EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'كيف أحول أرباحي إلى حسابي البنكي في المغرب؟', a: 'يمكنك تحويل الأموال من حسابك الأمريكي (Mercury/Relay) إلى حسابك في المغرب (التجاري وفا بنك، البنك الشعبي، CIH) عبر Wise أو تحويل SWIFT.' },
    ],
    bankTip: 'CIH Bank and Attijariwafa Bank handle incoming international wire transfers from Wise Business and Mercury smoothly.',
    bankTipAr: 'تستقبل حسابات بنك CIH والتجاري وفا بنك الحوالات الدولية القادمة من Wise وميركوري بسلاسة عند تقديم مستندات التأسيس.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'EIN Processing', value: 'Direct IRS Fax' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'إجراءات EIN', value: 'متابعة رسمية' }],
    whatsapp: '13072898149',
  },

  'turkey': {
    slug: 'turkey', countryCode: 'TR', flag: '🇹🇷',
    nameEn: 'Turkey', nameAr: 'تركيا',
    geoRegion: 'TR',
    metaTitleEn: 'Form a US LLC from Turkey | PayPal & Stripe Unlocked | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من تركيا | تفعيل باي بال وسترايب | Instant Grow',
    metaDescEn: 'Incorporate a US LLC from Istanbul, Ankara, or anywhere in Turkey. Overcome the PayPal ban, activate Stripe, and open digital US business bank accounts.',
    metaDescAr: 'أسّس شركة LLC أمريكية من إسطنبول وأنقرة وجميع أنحاء تركيا. تجاوز حظر باي بال، فعّل سترايب، وافتح حسابات بنكية أمريكية رقمية بالكامل عن بُعد.',
    h1En: 'Form a US LLC from Turkey — Unlock PayPal, Stripe & Global USD Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من تركيا — تفعيل باي بال وسترايب وحساب بنكي بالدولار',
    subtitleEn: 'The premier solution for Turkish Amazon sellers, Etsy artisans, software houses, and Shopify merchants operating in international markets.',
    subtitleAr: 'الحل الرائد للبائعين على أمازون وإتسي، وشركات البرمجيات والمتاجر الإلكترونية في تركيا للعمل في الأسواق العالمية بالدولار الأمريكي.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'PayPal has been completely blocked and banned in Turkey since 2016, cutting off millions of global buyers.',
      'Stripe does not support Turkish domestic bank accounts for merchant card acquiring.',
      'Turkish Lira currency volatility makes holding sales reserves in USD a strategic necessity.',
      'Local Turkish payment gateways (e.g. Iyzico) lack universal conversion optimization for US/EU buyers.',
    ],
    painPointsAr: [
      'حظر وتوقف خدمات باي بال (PayPal) في تركيا منذ عام 2016، مما يحرم التجار من ملايين المشترين حول العالم.',
      'عدم توفر بوابة سترايب (Stripe) للحسابات المصرفية المحلية داخل تركيا.',
      'تقلبات سعر صرف الليرة التركية تجعل الاحتفاظ بالأرباح التشغيلية بالدولار ضرورة استراتيجية.',
      'بوابات الدفع المحلية تفتقر إلى التغطية الدولية الشاملة لمعالجة البطاقات من المشترين في أمريكا وأوروبا.',
    ],
    benefitsEn: [
      { title: 'Full PayPal Business Activation', desc: 'Operate a verified US PayPal account legitimately backed by your US LLC and federal EIN.' },
      { title: 'Stripe International Card Acquiring', desc: 'Accept credit card payments worldwide on Shopify, WooCommerce, or custom websites.' },
      { title: 'USD Digital Banking Access', desc: 'Apply online for Mercury or Relay business accounts to hold USD and receive marketplace payouts.' },
      { title: 'Amazon US & Etsy Integration', desc: 'Sell on Amazon FBA US and Etsy with verified US commercial banking credentials.' },
      { title: 'Wyoming Cost Efficiency', desc: 'Wyoming charges 0% state corporate income tax with minimal annual maintenance costs ($60).' },
      { title: 'IRS Compliance Tracking', desc: 'Guidance on mandatory annual Form 5472 filings to maintain clean US legal standing.' },
    ],
    benefitsAr: [
      { title: 'تفعيل كامل لباي بال التجاري', desc: 'شغّل حساب PayPal بيزنس نظامي في أمريكا مدعوماً بشركتك ورقم EIN الفيدرالي.' },
      { title: 'معالجة مدفوعات سترايب الدولية', desc: 'اقبل مدفوعات البطاقات الائتمانية حول العالم على شوبيفاي وووكومرس وموقعك الخاص.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'قدّم أونلاين على حسابات مثل ميركوري لحفظ أرباحك بالدولار واستقبال عوائد المتاجر.' },
      { title: 'ربط مباشر مع أمازون وإتسي', desc: 'بِع على أمازون FBA وإتسي بحساب بنكي تجاري أمريكي معتمد وبدون عقبات.' },
      { title: 'تكاليف تشغيل منخفضة في وايومنغ', desc: 'لا تفرض ولاية وايومنغ ضريبة دخل للشركات، ورسوم تقريرها السنوي 60 دولاراً فقط.' },
      { title: 'متابعة الامتثال لنموذج 5472', desc: 'إرشادات واضحة لإعداد وتقديم إقرار مصلحة الضرائب الفيدرالية السنوي لتفادي الغرامات.' },
    ],
    faqEn: [
      { q: 'Can Turkish citizens legally own a US LLC?', a: 'Yes. Turkish citizens and residents can form and own 100% of a US LLC remotely without a US visa or residency.' },
      { q: 'Does this allow me to use PayPal from Turkey?', a: 'Yes. By forming a US LLC with a federal EIN and US bank account, your PayPal account is established under your legal US entity, completely independent of Turkish banking.' },
      { q: 'How long does the incorporation take?', a: 'State formation takes 2-5 business days. IRS EIN issuance takes 3 to 6 weeks for non-residents via Form SS-4 fax processing.' },
      { q: 'How do I transfer funds from my US LLC to Turkey?', a: 'You can transfer funds from your Mercury or Relay account to your Turkish bank account (İşbank, Garanti BBVA, Akbank) via Wise Business or standard SWIFT wire.' },
    ],
    faqAr: [
      { q: 'هل يحق للمواطنين في تركيا تأسيس شركة أمريكية قانونياً؟', a: 'نعم. يحق للمواطنين والمقيمين في تركيا تأسيس وامتلاك شركة LLC أمريكية بالكامل عن بُعد دون الحاجة لفيزا أو سفر.' },
      { q: 'هل يمكنني استخدام باي بال من تركيا عبر هذه الشركة؟', a: 'نعم. من خلال تأسيس شركة أمريكية ورقم EIN وحساب بنكي أمريكي، يتم إنشاء حساب PayPal تحت الكيان الأمريكي وبشكل مستقل تماماً عن البنوك التركية.' },
      { q: 'كم تستغرق إجراءات التأسيس؟', a: 'يستغرق إيداع الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج رقم EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'كيف أحول أموالي من الشركة الأمريكية إلى تركيا؟', a: 'يمكنك تحويل أموالك من بنك ميركوري أو ريلاي إلى حسابك في تركيا (İşbank، Garanti BBVA، Akbank) عبر Wise أو تحويل SWIFT.' },
    ],
    bankTip: 'İşbank and Garanti BBVA accept incoming corporate wire transfers from Mercury and Wise Business smoothly.',
    bankTipAr: 'تستقبل بنوك مثل إش بنك (İşbank) وجارانتي (Garanti BBVA) الحوالات القادمة من بنك ميركوري ووايز بسلاسة مع إبراز مستندات الشركة.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'EIN Processing', value: 'Direct IRS Fax' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'إجراءات EIN', value: 'متابعة رسمية' }],
    whatsapp: '13072898149',
  },

  'pakistan': {
    slug: 'pakistan', countryCode: 'PK', flag: '🇵🇰',
    nameEn: 'Pakistan', nameAr: 'باكستان',
    geoRegion: 'PK',
    metaTitleEn: 'Form a US LLC from Pakistan | Amazon FBA & Freelancers | Instant Grow LLC',
    metaTitleAr: 'تأسيس شركة LLC أمريكية من باكستان | لأمازون والعمل الحر | Instant Grow',
    metaDescEn: 'Form a US LLC from Lahore, Karachi, or Islamabad. Overcome the lack of PayPal and Stripe, access US business banking, and scale on Amazon FBA US.',
    metaDescAr: 'أسّس شركة LLC أمريكية من كراتشي ولاهور وإسلام آباد. تجاوز غياب باي بال وسترايب محلياً، وافتح حسابات بنكية أمريكية للتوسع في أمازون FBA.',
    h1En: 'Form a US LLC from Pakistan — Access Stripe, PayPal & USD Banking',
    h1Ar: 'تأسيس شركة LLC أمريكية من باكستان — تفعيل سترايب وباي بال وحسابات بنكية دولارية',
    subtitleEn: 'The proven legal pathway for Pakistani Amazon FBA private label sellers, IT exporters, and Upwork freelancers to process global payments.',
    subtitleAr: 'المسار القانوني المعتمد للبائعين على أمازون FBA ومصدري خدمات تكنولوجيا المعلومات والمستقلين في باكستان لتلقي المدفوعات العالمية.',
    currency: 'USD', price: '149',
    painPointsEn: [
      'Neither Stripe nor PayPal operates locally in Pakistan, hindering millions of IT exporters.',
      'Amazon US FBA sellers face high suspension risk and limited scaling options without a legitimate US entity.',
      'Pakistani IT exporters face heavy currency conversion cuts and delays on incoming international payments.',
      'Top-tier US and UK enterprise clients prefer contracting with registered US business entities.',
    ],
    painPointsAr: [
      'غياب بوابات الدفع العالمية سترايب وباي بال عن السوق المحلي في باكستان، مما يعيق مصدري البرمجيات والخدمات.',
      'بائعو أمازون FBA يحتاجون كياناً أمريكياً رسمياً لتفادي قيود الحسابات الفردية وبناء علامة تجارية خاصة موثوقة.',
      'مصدرو التكنولوجيا يواجهون خسائر في أسعار الصرف وتأخيرات في استلام الحوالات الدولية التقليدية.',
      'العملاء الكبار في أمريكا وأوروبا يفضلون التعاقد الرسمي مع شركات مسجلة في الولايات المتحدة.',
    ],
    benefitsEn: [
      { title: 'Full Stripe & PayPal Activation', desc: 'Accept international payments across all global currencies via US Stripe and PayPal Business.' },
      { title: 'Amazon FBA US Verification', desc: 'Register and scale your Amazon US storefront under a legitimate US LLC with federal EIN.' },
      { title: 'US Digital Business Accounts', desc: 'Apply online for Mercury or Relay accounts to receive payouts and hold funds in USD.' },
      { title: 'Direct Remittances to Pakistan', desc: 'Transfer earnings to your Pakistani bank account (HBL, Meezan, MCB) via Wise Business at official interbank rates.' },
      { title: 'Wyoming Privacy Protection', desc: 'Wyoming state law does not publicly list company members or directors on public registries.' },
      { title: 'Federal IRS Compliance Support', desc: 'Clear guidelines on annual Form 5472 filing to maintain legal standing and avoid penalties.' },
    ],
    benefitsAr: [
      { title: 'تفعيل كامل لسترايب وباي بال', desc: 'استقبل المدفوعات العالمية بكافة العملات عبر حسابات سترايب وباي بال بيزنس أمريكية.' },
      { title: 'توثيق حسابات أمازون FBA', desc: 'سجّل ووسّع متجرك على أمازون أمريكا تحت مظلة شركة LLC ورقم EIN فيدرالي رسمي.' },
      { title: 'حسابات بنكية أمريكية رقمية', desc: 'قدّم أونلاين على حسابات مثل ميركوري لاستقبال الأرباح والاحتفاظ بأموالك بالدولار.' },
      { title: 'تحويلات سلسة لباكستان', desc: 'حوّل أموالك إلى بنكك في باكستان (HBL أو ميزان بنك) عبر Wise بيزنس بأسعار الصرف الرسمية.' },
      { title: 'حماية الخصوصية في وايومنغ', desc: 'تحمي ولاية وايومنغ سرية بيانات الملاك بعدم نشر أسمائهم في السجلات العامة.' },
      { title: 'دعم الامتثال لنموذج IRS 5472', desc: 'إرشادات واضحة لإعداد وتقديم إقرار مصلحة الضرائب الفيدرالية السنوي لتفادي الغرامات.' },
    ],
    faqEn: [
      { q: 'Can Pakistani passport holders legally establish a US LLC?', a: 'Yes, 100%. Pakistani nationals can legally form and own a US LLC without visiting the United States or having a US visa.' },
      { q: 'Can I open a US bank account from Pakistan?', a: 'Yes. Non-resident digital banks such as Mercury and Relay accept Pakistani owners of US LLCs. Applications are completed online.' },
      { q: 'How long does the process take from Pakistan?', a: 'State registration takes 2-5 business days. The IRS EIN issuance takes 3 to 6 weeks for non-residents via Form SS-4 fax processing.' },
      { q: 'What taxes must I file annually?', a: 'Foreign-owned single-member LLCs must submit annual informational IRS Form 5472 and pro-forma 1120. Failing to file carries a $25,000 fine.' },
    ],
    faqAr: [
      { q: 'هل يحق للمواطنين في باكستان تأسيس شركة أمريكية قانونياً؟', a: 'نعم بنسبة 100%. يحق لحاملي الجواز الباكستاني تأسيس وامتلاك شركة LLC أمريكية بالكامل عن بُعد دون الحاجة لفيزا أو سفر.' },
      { q: 'هل أستطيع فتح حساب بنكي أمريكي من باكستان؟', a: 'نعم. تقبل بنوك التكنولوجيا المالية مثل ميركوري وريلاي ملاك الشركات الأمريكية من غير المقيمين. يتم التقديم بالكامل عبر الإنترنت.' },
      { q: 'كم يستغرق التأسيس من باكستان؟', a: 'يستغرق اعتماد الولاية من يومين إلى 5 أيام عمل، بينما يستغرق استخراج رقم EIN من 3 إلى 6 أسابيع عبر الفاكس مع مصلحة الضرائب IRS.' },
      { q: 'ما هي الإقرارات الضريبية السنوية المطلوبة؟', a: 'يتعين تقديم إقرار المعلومات السنوي IRS Form 5472 مع نموذج 1120 تجنباً لغرامة التأخير الفيدرالية البالغة 25,000 دولار.' },
    ],
    bankTip: 'Meezan Bank and Habib Bank Limited (HBL) handle inward international remittances from Wise and Mercury efficiently for IT exporters.',
    bankTipAr: 'تستقبل حسابات ميزان بنك وHBL التحويلات القادمة من Wise وميركوري بسلاسة لمصدري خدمات تكنولوجيا المعلومات.',
    statsEn: [{ label: 'Trustpilot Rating', value: '5.0 / 5.0' }, { label: 'State Filing', value: '2-5 Days' }, { label: 'Remote Onboarding', value: '100% Online' }, { label: 'EIN Processing', value: 'Direct IRS Fax' }],
    statsAr: [{ label: 'تقييم Trustpilot', value: '5.0 / 5.0' }, { label: 'إيداع الولاية', value: '2-5 أيام' }, { label: 'تأسيس عن بُعد', value: '100% أونلاين' }, { label: 'إجراءات EIN', value: 'متابعة رسمية' }],
    whatsapp: '13072898149',
  },
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MenaCountryPage() {
  const { country } = useParams({ from: '/form-llc/$country' })
  const { lang, setLang, isRTL } = useLang()
  const isAr = lang === 'ar'

  const data: MenaCountryData = (MENA_COUNTRIES[country] ?? MENA_COUNTRIES['egypt'])!

  useEffect(() => {
    const title = isAr ? data.metaTitleAr : data.metaTitleEn
    const desc = isAr ? data.metaDescAr : data.metaDescEn
    setPageMeta({
      title,
      description: desc,
      keywords: isAr
        ? [`تأسيس شركة LLC من ${data.nameAr}`, `فتح شركة أمريكية من ${data.nameAr}`, 'تأسيس شركة اون لاين', 'LLC وايومنغ', 'رقم EIN', 'سترايب', 'حساب بنكي أمريكي']
        : [`US LLC from ${data.nameEn}`, `form LLC ${data.nameEn}`, 'Wyoming LLC', 'Delaware LLC', 'EIN number', 'US bank account non-resident', 'Stripe non-US'],
      canonical: getCanonical(`/form-llc/${data.slug}`),
      lang: isAr ? 'ar' : 'en',
      geoRegion: data.geoRegion,
      speakable: true,
    })

    const faqs = isAr
      ? data.faqAr.map(f => ({ question: f.q, answer: f.a }))
      : data.faqEn.map(f => ({ question: f.q, answer: f.a }))

    injectJsonLd({
      '@graph': [
        generateOrganizationSchema(),
        generateFaqSchema(faqs),
        generateLocalBusinessSchema({ region: data.nameEn, countryCode: data.geoRegion, city: data.nameEn }),
        generateMenaServiceSchema({
          serviceName: `US LLC Formation for ${data.nameEn} Entrepreneurs`,
          serviceNameAr: `تأسيس شركة LLC أمريكية لرواد الأعمال من ${data.nameAr}`,
          description: data.metaDescEn,
          descriptionAr: data.metaDescAr,
          price: 149,
          url: getCanonical(`/form-llc/${data.slug}`),
          country: data.nameEn,
          countryCode: data.geoRegion,
        }),
      ].filter(Boolean),
    })

    injectBreadcrumb([
      { name: isAr ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isAr ? 'تأسيس شركة أمريكية' : 'Form LLC', url: getCanonical('/form-llc') },
      { name: isAr ? `من ${data.nameAr}` : `From ${data.nameEn}`, url: getCanonical(`/form-llc/${data.slug}`) },
    ])
  }, [data, isAr])

  const painPoints = isAr ? data.painPointsAr : data.painPointsEn
  const benefits = isAr ? data.benefitsAr : data.benefitsEn
  const faqs = isAr ? data.faqAr : data.faqEn
  const stats = isAr ? data.statsAr : data.statsEn
  const bankTip = isAr ? data.bankTipAr : data.bankTip

  return (
    <div className={`min-h-screen bg-white font-sans ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Language toggle — synced with global LanguageContext */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${!isAr ? 'bg-[#1a56ff] text-white border-[#1a56ff]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a56ff]'}`}
        >EN</button>
        <button
          onClick={() => setLang('ar')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${isAr ? 'bg-[#1a56ff] text-white border-[#1a56ff]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a56ff]'}`}
        >عربي</button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0a0f1e] via-[#0f1729] to-[#1a1f35] pt-24 pb-16 sm:pt-28 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(26,86,255,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 50%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-sm font-bold">{data.flag}</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1 border border-emerald-500/20">{data.countryCode}</span>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 rounded-full px-3 py-1 border border-blue-500/20">US LLC Formation</span>
            <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 rounded-full px-3 py-1 border border-purple-500/20">
              {isAr ? 'تأسيس 100% عن بُعد ✓' : '100% Remote Process ✓'}
            </span>
          </div>

          {/* H1 — single, critical for SEO */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 max-w-4xl speakable">
            {isAr ? data.h1Ar : data.h1En}
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed speakable">
            {isAr ? data.subtitleAr : data.subtitleEn}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="/order"
              className="inline-flex items-center justify-center gap-2 bg-[#1a56ff] text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#3a76ff] transition-all shadow-lg shadow-blue-500/25"
            >
              {isAr ? 'ابدأ التأسيس الآن' : 'Start Formation Now'} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </a>
            <a
              href={`https://wa.me/${data.whatsapp}?text=${encodeURIComponent(isAr ? `مرحباً، أريد تأسيس شركة LLC أمريكية من ${data.nameAr}` : `Hi, I want to form a US LLC from ${data.nameEn}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#1fba58] transition-all"
            >
              <MessageCircle size={16} /> {isAr ? 'استشارة واتساب مباشرة' : 'Free WhatsApp Consult'}
            </a>
            <Link
              to="/how-we-work"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
            >
              <Building2 size={16} /> {isAr ? 'كيف نعمل' : 'How We Work'}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain Points → Solutions ──────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#1a56ff] text-sm font-semibold uppercase tracking-wider mb-2">
                {isAr ? 'الواقع والتحديات المحلية' : 'Local Realities & Challenges'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                {isAr ? `لماذا تؤسس شركة LLC أمريكية من ${data.nameAr}؟` : `Why Form a US LLC from ${data.nameEn}?`}
              </h2>
              <div className="space-y-3">
                {painPoints.map((pp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={12} className="text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{pp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing card */}
            <div className="bg-gradient-to-br from-[#0a0f1e] to-[#1a1f35] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a56ff]/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={16} className="text-amber-400" />
                  <span className="text-xs text-amber-400 font-semibold uppercase">{isAr ? 'الباقة الموصى بها' : 'Recommended Package'}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {isAr ? `تأسيس LLC لرواد الأعمال في ${data.nameAr}` : `US LLC Formation for ${data.nameEn}`}
                </h3>
                <div className="text-3xl font-black text-white mb-1">$149 <span className="text-lg font-normal text-white/50">+ رسوم الولاية الرسمية</span></div>
                <p className="text-white/50 text-xs mb-5">
                  {isAr ? 'رسوم خدمة شفافة: وايومنغ 102$ | ديلاوير 140$ | نيومكسيكو 50$' : 'Transparent State Fees: WY $102 | DE $140 | NM $50'}
                </p>
                <ul className="space-y-2 mb-6 text-sm text-white/80">
                  {[
                    isAr ? 'إعداد وإيداع عقد التأسيس (Articles of Organization)' : 'Articles of Organization Prepared & Filed',
                    isAr ? 'خدمة وكيل مسجل معتمد لمدة عام كامل' : '1 Full Year Licensed Registered Agent Service',
                    isAr ? 'عنوان تجاري أمريكي معتمد للمراسلات الرسمية' : 'Commercial US Business Mailing Address',
                    isAr ? 'صياغة اتفاقية التشغيل القانونية (Operating Agreement)' : 'Custom Operating Agreement & Banking Resolution',
                    isAr ? 'إعداد ملف الرقم الضريبي الفيدرالي (IRS Form SS-4)' : 'Federal EIN Preparation & Filing Assistance',
                    isAr ? 'إرشاد كامل لفتح الحسابات البنكية الرقمية' : 'Digital Business Banking Onboarding Assistance',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                      <span className="text-xs leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/order"
                  className="block w-full text-center bg-[#1a56ff] text-white font-semibold py-3 rounded-xl hover:bg-[#3a76ff] transition-all text-sm shadow-md"
                >
                  {isAr ? 'ابدأ طلبك الآن' : 'Start Your Application'}
                </a>
                <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
                  <a href="https://www.trustpilot.com/review/instantgrow.net" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">5.0 / 5.0</span>
                    <span>على Trustpilot (5 تقييمات موثقة)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits Grid ────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[#1a56ff] text-sm font-semibold uppercase tracking-wider mb-2">
              {isAr ? 'مميزات التأسيس' : 'Key Advantages'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isAr ? `مزايا تأسيس شركة أمريكية لرواد الأعمال في ${data.nameAr}` : `Benefits of a US LLC for ${data.nameEn} Founders`}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-[#1a56ff]/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center mb-4 group-hover:bg-[#1a56ff] group-hover:text-white transition-all">
                  {[<Globe key={0} />, <Banknote key={1} />, <Clock key={2} />, <Building2 key={3} />, <Shield key={4} />, <CreditCard key={5} />][i % 6]}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{b.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process Steps ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[#1a56ff] text-sm font-semibold uppercase tracking-wider mb-2">
              {isAr ? 'خطوات التأسيس' : 'How It Works'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isAr ? '4 خطوات لإطلاق شركتك الأمريكية' : '4 Simple Steps to Form Your LLC'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isAr ? [
              { title: 'تقديم البيانات', desc: 'أدخل الاسم المقترح للشركة، بيانات المالك، وصورة جواز السفر' },
              { title: 'إيداع الولاية', desc: 'نراجع المستندات ونودعها رسمياً لدى سكرتير الولاية (SOS) خلال 2-5 أيام عمل' },
              { title: 'الرقم الضريبي EIN', desc: 'نقدم نموذج SS-4 لمصلحة الضرائب IRS لغير المقيمين لمتابعة صدور الرقم الضريبي' },
              { title: 'التأهيل البنكي', desc: 'تسليم الوثائق الرسمية والبدء في التقديم على الحساب البنكي الرقمي وسترايب' },
            ] : [
              { title: 'Submit Details', desc: 'Choose state, provide proposed company names, owner info & passport copy' },
              { title: 'State Registration', desc: 'We file Articles of Organization with Secretary of State (2–5 business days)' },
              { title: 'IRS EIN Filing', desc: 'Form SS-4 prepared and faxed directly to IRS non-resident processing unit' },
              { title: 'Banking Handoff', desc: 'Receive official state documents and initiate digital banking & Stripe setup' },
            ]).map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1a56ff] text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">{i + 1}</div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Banking Tips ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200 p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Banknote size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  {isAr ? 'التأهيل المصرفي' : 'Banking Reality & Guidance'}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {isAr ? `توصيات الحساب البنكي الأمريكي لرواد الأعمال في ${data.nameAr}` : `US Business Banking Advice for ${data.nameEn} Founders`}
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{bankTip}</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <HelpCircle size={20} className="text-[#1a56ff] mx-auto mb-2" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isAr ? 'الأسئلة الشائعة والامتثال' : 'Frequently Asked Questions & Compliance'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isAr
                ? `معلومات تفصيلية ودقيقة حول تأسيس LLC أمريكية من ${data.nameAr}`
                : `Detailed questions and answers on forming a US LLC from ${data.nameEn}`}
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-slate-50 rounded-xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-sm text-slate-900 hover:text-[#1a56ff] transition-colors">
                  {faq.q}
                  <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trustpilot Verified Reviews Section ───────────────────────────── */}
      <section className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Star size={13} className="fill-emerald-600 text-emerald-600" />
            <span>5.0 / 5.0 Rating on Trustpilot</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isAr ? 'آراء موثقة من عملاء حقيقيين' : 'Verified Reviews from Real Founders'}
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            {isAr
              ? 'تلتزم Instant Grow بالشفافية الكاملة وتعتمد على التقييمات الحقيقية الموثقة على منصة Trustpilot الرسمية.'
              : 'Instant Grow operates with complete transparency. Check our live, verified customer ratings directly on Trustpilot.'}
          </p>
          <div className="pt-2">
            <a
              href="https://www.trustpilot.com/review/instantgrow.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#00B67A] text-white font-semibold text-xs px-6 py-3 rounded-full hover:bg-[#009b68] transition-colors shadow-sm"
            >
              <span>{isAr ? 'عرض تقييمات العملاء على Trustpilot' : 'View Verified Trustpilot Reviews'}</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#0a0f1e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(26,86,255,0.2) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {isAr ? `جاهز لتأسيس شركتك الأمريكية من ${data.nameAr}؟` : `Ready to Form Your US LLC from ${data.nameEn}?`}
          </h2>
          <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed">
            {isAr
              ? 'إجراءات تسجيل إلكترونية بالكامل مع فحص الأسماء وإعداد وثائق التأسيس والمتابعة المستمرة.'
              : 'Complete online registration with name availability checks, registered agent, and ongoing compliance.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a href="/order" className="inline-flex items-center gap-2 bg-[#1a56ff] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#3a76ff] transition-all shadow-lg shadow-blue-500/20 text-sm">
              {isAr ? 'ابدأ طلب التأسيس' : 'Start Formation Application'} <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </a>
            <a
              href={`https://wa.me/${data.whatsapp}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#1fba58] transition-all text-sm"
            >
              <MessageCircle size={16} /> {isAr ? 'تواصل معنا على واتساب' : 'WhatsApp Us Now'}
            </a>
          </div>
        </div>
      </section>

      {/* ── Related Links (internal linking for SEO) ─────────────────────── */}
      <section className="py-10 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {isAr ? 'روابط ذات صلة' : 'Related Pages'}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/us-company/wyoming', label: isAr ? 'LLC وايومنغ' : 'Wyoming LLC' },
              { href: '/us-company/delaware', label: isAr ? 'LLC ديلاوير' : 'Delaware LLC' },
              { href: '/services', label: isAr ? 'جميع الخدمات' : 'All Services' },
              { href: '/how-we-work', label: isAr ? 'كيف نعمل' : 'How We Work' },
              { href: '/team', label: isAr ? 'فريق العمل' : 'Our Team' },
              { href: '/contact', label: isAr ? 'تواصل معنا' : 'Contact' },
              { href: '/form-llc/egypt', label: isAr ? 'من مصر' : 'From Egypt' },
              { href: '/form-llc/saudi-arabia', label: isAr ? 'من السعودية' : 'From Saudi Arabia' },
              { href: '/form-llc/uae', label: isAr ? 'من الإمارات' : 'From UAE' },
              { href: '/form-llc/jordan', label: isAr ? 'من الأردن' : 'From Jordan' },
              { href: '/form-llc/morocco', label: isAr ? 'من المغرب' : 'From Morocco' },
              { href: '/form-llc/turkey', label: isAr ? 'من تركيا' : 'From Turkey' },
              { href: '/form-llc/pakistan', label: isAr ? 'من باكستان' : 'From Pakistan' },
            ].filter(l => l.href !== `/form-llc/${country}`).map((link, i) => (
              <Link key={i} to={link.href as any} className="text-xs text-[#1a56ff] hover:underline bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
