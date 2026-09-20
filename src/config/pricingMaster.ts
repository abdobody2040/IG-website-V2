// ─── src/config/pricingMaster.ts ──────────────────────────────────────────────
// Single Source of Truth for Instant Grow LLC packages, pricing, inclusions,
// state fees, renewal costs, and timelines.
// Used by: Homepage, /services, FAQ, ComparisonTable, and scripts/generate-llms-txt.mjs
// ─────────────────────────────────────────────────────────────────────────────

export interface PricingTier {
  id: string
  name: string
  nameAr: string
  serviceFee: number
  currency: 'USD' | 'GBP'
  badge?: string
  badgeAr?: string
  popular?: boolean
  description: string
  descriptionAr: string
  timeline: string
  timelineAr: string
  inclusions: string[]
  inclusionsAr: string[]
  exclusions: string[]
  exclusionsAr: string[]
  governmentFeesNote: string
  governmentFeesNoteAr: string
  renewalInfo: string
  renewalInfoAr: string
}

export interface RegionPricingConfig {
  regionId: 'us' | 'uk' | 'uae' | 'oman'
  regionName: string
  regionNameAr: string
  governmentFees: {
    name: string
    nameAr: string
    initialFee: string
    initialFeeAr: string
    annualRenewalFee: string
    annualRenewalFeeAr: string
    deadlineInfo: string
    deadlineInfoAr: string
    officialUrl: string
  }[]
  basic: PricingTier
  premium: PricingTier
}

export const MASTER_TIMELINES = {
  stateFiling: {
    en: 'State / government filing prepared and submitted within 1–2 business days.',
    ar: 'إعداد وتقديم ملف التأسيس للجهة الحكومية خلال 1–2 يوم عمل.',
  },
  stateApproval: {
    en: 'State approval typically 24–72 hours (expedited states like WY/DE) or 3–7 business days depending on Secretary of State workload.',
    ar: 'الموافقة الحكومية تستغرق عادة 24–72 ساعة (في الولايات السريعة مثل وايومنغ وديلاوير) أو 3–7 أيام عمل حسب ضغط الولاية.',
  },
  einNonResident: {
    en: 'IRS EIN for foreign non-US residents without SSN/ITIN takes approximately 3–6 weeks via IRS Form SS-4 fax processing.',
    ar: 'الرقم الضريبي الفيدرالي EIN لغير المقيمين بدون رقم ضمان اجتماعي SSN يستغرق حوالي 3–6 أسابيع عبر فاكس مصلحة الضرائب IRS.',
  },
  bankAccount: {
    en: 'Business bank account applications (Mercury, Relay, Wise) are submitted after EIN issuance. Approvals are subject to individual bank compliance and underwriting.',
    ar: 'التقديم للحسابات البنكية التجارية (ميركوري، ريلاي، وايز) يتم بعد صدور الـ EIN. الموافقة تخضع لسياسات الامتثال الخاصة بكل بنك.',
  },
} as const

export const MASTER_PRICING: Record<'us' | 'uk' | 'uae' | 'oman', RegionPricingConfig> = {
  us: {
    regionId: 'us',
    regionName: 'United States (LLC)',
    regionNameAr: 'الولايات المتحدة (شركة LLC)',
    governmentFees: [
      {
        name: 'Wyoming Secretary of State',
        nameAr: 'أمانة ولاية وايومنغ',
        initialFee: '$102 state filing fee ($100 state + $2 online processing)',
        initialFeeAr: '102 دولار رسوم تسجيل الولاية (100 رسوم + 2 دولار معالجة إلكترونية)',
        annualRenewalFee: '$60 minimum annual report license tax',
        annualRenewalFeeAr: '60 دولار كحد أدنى لضريبة التقرير السنوي',
        deadlineInfo: 'Due on the first day of the anniversary month of formation.',
        deadlineInfoAr: 'تستحق في اليوم الأول من شهر ذكرى التأسيس السنوية.',
        officialUrl: 'https://wyobiz.wyo.gov/',
      },
      {
        name: 'Delaware Division of Corporations',
        nameAr: 'إدارة الشركات في ولاية ديلاوير',
        initialFee: '$140 state filing fee (Certificate of Formation)',
        initialFeeAr: '140 دولار رسوم تقديم شهادة التأسيس للولاية',
        annualRenewalFee: '$300 mandatory annual franchise tax',
        annualRenewalFeeAr: '300 دولار ضريبة الامتياز السنوية الإلزامية',
        deadlineInfo: 'Mandatory annual franchise tax due every year on or before June 1st.',
        deadlineInfoAr: 'ضريبة الامتياز السنوية تستحق سنوياً قبل أو بحلول 1 يونيو.',
        officialUrl: 'https://corp.delaware.gov/',
      },
      {
        name: 'New Mexico Secretary of State',
        nameAr: 'أمانة ولاية نيو مكسيكو',
        initialFee: '$50 state filing fee',
        initialFeeAr: '50 دولار رسوم تسجيل الولاية',
        annualRenewalFee: '$0 (No annual report required for LLCs in NM)',
        annualRenewalFeeAr: '0 دولار (لا تطلب نيو مكسيكو تقريراً سنوياً لشركات LLC)',
        deadlineInfo: 'No annual state report required.',
        deadlineInfoAr: 'لا يوجد تقرير سنوي مطلوب للولاية.',
        officialUrl: 'https://www.sos.nm.gov/',
      },
    ],
    basic: {
      id: 'us-basic',
      name: 'US LLC Basic',
      nameAr: 'باقة US LLC الأساسية',
      serviceFee: 197,
      currency: 'USD',
      badge: 'Starter',
      badgeAr: 'للمبتدئين',
      popular: false,
      description: 'Everything essential to form a legally registered US LLC with registered agent and EIN.',
      descriptionAr: 'كل الأساسيات لتأسيس شركة LLC أمريكية رسمية مع وكيل مسجل ورقم ضريبي EIN.',
      timeline: 'Filing prepared in 1–2 days. EIN in 3–6 weeks for non-residents.',
      timelineAr: 'إعداد الملف في 1–2 يوم عمل. الرقم الضريبي في 3–6 أسابيع لغير المقيمين.',
      inclusions: [
        'Articles of Organization filing preparation',
        'Registered Agent service (1st year included)',
        'IRS EIN Tax ID filing (Form SS-4 for non-residents)',
        'Official formation documents & certificate',
        'Standard Operating Agreement template',
        'FinCEN BOI (Beneficial Ownership) filing guidance',
        'US business mailing address for legal mail',
        'Business banking application guidance (Mercury / Relay)',
        'Standard email & ticket support',
      ],
      inclusionsAr: [
        'إعداد وتقديم عقد التأسيس (Articles of Organization)',
        'خدمة الوكيل المسجل المعتمد (السنة الأولى مشمولة)',
        'التقديم على الرقم الضريبي الفيدرالي EIN من IRS (نموذج SS-4 لغير المقيمين)',
        'شهادة ومستندات التأسيس الرسمية المعتمدة',
        'نموذج اتفاقية التشغيل المعتمد (Operating Agreement)',
        'إرشاد تقديم تقرير ملكية المستفيد الفعلي FinCEN BOI',
        'عنوان بريد تجاري أمريكي للمراسلات الرسمية',
        'إرشادات فتح الحسابات البنكية التجارية (Mercury / Relay)',
        'دعم قياسي عبر البريد الإلكتروني ونظام التذاكر',
      ],
      exclusions: [
        'State government filing fees (billed at exact state cost: WY $102, DE $140, NM $50)',
        'Annual registered agent renewal after Year 1 ($99/yr)',
        'State annual reports / franchise tax ($60 WY / $300 DE)',
        'Dedicated telephone consultation or accounting advice',
      ],
      exclusionsAr: [
        'رسوم الولاية الحكومية (تُسدد بتكلفتها الحكومية الدقيقة: وايومنغ 102$، ديلاوير 140$، نيو مكسيكو 50$)',
        'تجديد الوكيل المسجل بعد السنة الأولى (99 دولار سنوياً)',
        'ضريبة الامتياز أو التقرير السنوي للولاية (60$ وايومنغ / 300$ ديلاوير)',
        'استشارات هاتفية مخصصة أو استشارات محاسبية وضريبية',
      ],
      governmentFeesNote: 'State filing fees are paid directly to the Secretary of State and vary by state (WY $102, DE $140, NM $50).',
      governmentFeesNoteAr: 'رسوم تسجيل الولاية الحكومية تُدفع لأمانة الولاية مباشرة وتختلف حسب الولاية (وايومنغ 102$، ديلاوير 140$، نيو مكسيكو 50$).',
      renewalInfo: 'Registered agent renews at $99/year after first year. State franchise tax/annual report due annually per state calendar.',
      renewalInfoAr: 'يتجدد الوكيل المسجل بقيمة 99 دولار سنوياً بعد العام الأول. ضريبة الولاية تُدفع سنوياً حسب جدول الولاية.',
    },
    premium: {
      id: 'us-premium',
      name: 'US LLC Premium',
      nameAr: 'باقة US LLC الشاملة (المميزة)',
      serviceFee: 397,
      currency: 'USD',
      badge: 'Most Popular',
      badgeAr: 'الأكثر طلباً',
      popular: true,
      description: 'Complete end-to-end setup with priority preparation, customized legal agreement, phone number, and hands-on banking onboarding.',
      descriptionAr: 'تأسيس كامل وشامل مع أولوية المعالجة، اتفاقية تشغيل مخصصة، رقم هاتف أمريكي، ومتابعة فتح الحساب البنكي.',
      timeline: 'Priority filing submission (same/next business day). EIN in 3–6 weeks for non-residents.',
      timelineAr: 'أولوية التقديم (نفس يوم العمل أو التالي). الرقم الضريبي في 3–6 أسابيع لغير المقيمين.',
      inclusions: [
        'Everything in Basic tier',
        'Priority same-day/next-day filing queue preparation',
        'Customized Operating Agreement with multi-member/ownership allocations',
        'US Virtual Phone Number (1 year included)',
        'Direct onboarding call (30 min) for formation & banking roadmap',
        'Hands-on Mercury & Relay application review & document prep',
        'Stripe & payment gateway readiness verification',
        'Direct priority WhatsApp & email support during formation',
      ],
      inclusionsAr: [
        'جميع مميزات الباقة الأساسية',
        'أولوية الإعداد والتقديم في نفس يوم العمل أو التالي',
        'اتفاقية تشغيل مخصصة لنسب الشركاء وحصص الملكية',
        'رقم هاتف أمريكي افتراضي (سنة كاملة مشمولة)',
        'مكالمة تأهيلية وتوجيهية مباشرة (30 دقيقة) لخريطة التأسيس والبنوك',
        'مراجعة وتجهيز مستندات التقديم لحسابات Mercury و Relay البنكية',
        'التحقق من جاهزية متطلبات تفعيل بوابة دفع Stripe',
        'دعم مخصص ذو أولوية عبر واتساب والبريد طوال فترة التأسيس',
      ],
      exclusions: [
        'State government filing fees (WY $102, DE $140, NM $50)',
        'Registered agent renewal after Year 1 ($99/yr)',
        'Phone number carrier renewal after Year 1 ($49/yr)',
        'State annual reports and IRS tax filing preparation',
      ],
      exclusionsAr: [
        'رسوم الولاية الحكومية (وايومنغ 102$، ديلاوير 140$، نيو مكسيكو 50$)',
        'تجديد الوكيل المسجل بعد السنة الأولى (99 دولار سنوياً)',
        'تجديد خط الهاتف الأمريكي بعد السنة الأولى (49 دولار سنوياً)',
        'تقديم الإقرارات الضريبية السنوية لمصلحة الضرائب IRS',
      ],
      governmentFeesNote: 'State filing fees vary by state (WY $102, DE $140, NM $50) and are added to order at checkout.',
      governmentFeesNoteAr: 'رسوم تسجيل الولاية تختلف حسب الولاية (وايومنغ 102$، ديلاوير 140$) وتُضاف للطلب بشفافية.',
      renewalInfo: 'Registered Agent renews at $99/yr. Virtual phone line renews at $49/yr. State franchise taxes due annually.',
      renewalInfoAr: 'يتجدد الوكيل المسجل بـ 99$/سنة، ورقم الهاتف بـ 49$/سنة. وتستحق ضريبة الولاية السنوية وفقاً لمواعيدها.',
    },
  },

  uk: {
    regionId: 'uk',
    regionName: 'United Kingdom (LTD)',
    regionNameAr: 'المملكة المتحدة (شركة LTD)',
    governmentFees: [
      {
        name: 'UK Companies House',
        nameAr: 'السجل التجاري البريطاني (Companies House)',
        initialFee: '£50 official statutory incorporation fee',
        initialFeeAr: '50 جنيه إسترليني رسوم التأسيس الرسمية',
        annualRenewalFee: '£34 annual Confirmation Statement filing fee',
        annualRenewalFeeAr: '34 جنيه إسترليني رسوم إقرار التأكيد السنوي',
        deadlineInfo: 'Confirmation statement must be filed annually within 14 days of due date.',
        deadlineInfoAr: 'يجب تقديم إقرار التأكيد سنوياً خلال 14 يوماً من تاريخ الاستحقاق.',
        officialUrl: 'https://www.gov.uk/government/organisations/companies-house',
      },
    ],
    basic: {
      id: 'uk-basic',
      name: 'UK LTD Basic',
      nameAr: 'باقة UK LTD الأساسية',
      serviceFee: 149,
      currency: 'USD',
      badge: 'Standard',
      badgeAr: 'أساسي',
      popular: false,
      description: 'Standard UK Private Limited Company formation registered with Companies House.',
      descriptionAr: 'تأسيس شركة بريطانية ذات مسؤولية محدودة مسجلة رسمياً لدى Companies House.',
      timeline: 'Submitted within 24 hours. Companies House approval in 1–3 business days.',
      timelineAr: 'يتم التقديم خلال 24 ساعة. الموافقة من Companies House خلال 1–3 أيام عمل.',
      inclusions: [
        'Companies House electronic incorporation filing',
        'Official Certificate of Incorporation',
        'Memorandum & Articles of Association',
        'UK Registered Office Address (1st year included)',
        'HMRC UTR (Unique Taxpayer Reference) registration guidance',
        'Companies House ID verification guidance for directors/PSCs',
        'Wise & Payoneer business account guidance',
        'Standard email support',
      ],
      inclusionsAr: [
        'تقديم التأسيس الإلكتروني لدى Companies House',
        'شهادة التأسيس البريطانية الرسمية (Certificate of Incorporation)',
        'النظام الأساسي وعقد التأسيس (Memorandum & Articles)',
        'عنوان مكتب مسجل في بريطانيا (السنة الأولى مشمولة)',
        'إرشادات استلام الرقم الضريبي البريطاني UTR من HMRC',
        'إرشادات توثيق هوية المديرين و PSC وفق القانون البريطاني الجديد',
        'إرشادات التقديم لحسابات Wise و Payoneer التجارية',
        'دعم فني عبر البريد الإلكتروني',
      ],
      exclusions: [
        'Companies House £50 statutory filing fee',
        'Annual registered office renewal after Year 1 (£89/yr)',
        'Annual Confirmation Statement filing fee (£34 to Companies House)',
        'Director service address privacy protection',
      ],
      exclusionsAr: [
        'رسوم Companies House الرسمية البالغة 50 جنيهاً إسترلينياً',
        'تجديد عنوان المكتب المسجل بعد العام الأول (89 جنيهاً سنوياً)',
        'رسوم إقرار التأكيد السنوي (34 جنيهاً لـ Companies House)',
        'عنوان حماية خصوصية المدير المخصص',
      ],
      governmentFeesNote: 'UK statutory fee is £50 paid to Companies House upon registration.',
      governmentFeesNoteAr: 'رسوم الحكومة البريطانية الرسمية 50 جنيهاً تُدفع لـ Companies House.',
      renewalInfo: 'Registered office address renews at £89/yr. Annual confirmation statement filing due every 12 months.',
      renewalInfoAr: 'عنوان المكتب المسجل يتجدد بـ 89 جنيهاً سنوياً. إقرار التأكيد السنوي يُقدم كل 12 شهراً.',
    },
    premium: {
      id: 'uk-premium',
      name: 'UK LTD Premium',
      nameAr: 'باقة UK LTD الشاملة (المميزة)',
      serviceFee: 297,
      currency: 'USD',
      badge: 'Recommended',
      badgeAr: 'موصى به',
      popular: true,
      description: 'Complete UK company setup with director privacy protection address, virtual UK phone, and first Confirmation Statement filing.',
      descriptionAr: 'تأسيس بريطاني كامل مع حماية خصوصية عنوان المدير، رقم هاتف بريطاني، وتقديم الإقرار السنوي الأول.',
      timeline: 'Priority filing submission within 12–24 hours. Approval in 1–2 business days.',
      timelineAr: 'تقديم ذو أولوية خلال 12–24 ساعة. الموافقة خلال 1–2 يوم عمل.',
      inclusions: [
        'Everything in UK Basic tier',
        "Director's Service Address (keeps home address off the public register)",
        'Virtual UK phone number (1 year included)',
        'First Annual Confirmation Statement filing preparation included',
        'Step-by-step Companies House ID verification assistance',
        'Wise Business & Stripe UK application review',
        '30-min onboarding consultation call',
        'Priority WhatsApp support',
      ],
      inclusionsAr: [
        'جميع مميزات باقة UK الأساسية',
        'عنوان خدمة المدير لحماية الخصوصية (يحجب عنوان منزلك عن السجل العام)',
        'رقم هاتف بريطاني افتراضي (سنة كاملة مشمولة)',
        'إعداد وتقديم إقرار التأكيد السنوي الأول مشمولاً بالكامل',
        'مساعدة خطوة بخطوة في توثيق هوية المديرين لدى Companies House',
        'مراجعة ملفات التقديم لـ Wise Business و Stripe UK',
        'مكالمة استشارية وتأهيلية (30 دقيقة)',
        'دعم ذو أولوية عبر واتساب',
      ],
      exclusions: [
        'Companies House £50 statutory initial fee',
        'Corporate Tax return preparation (CT600) / accounts filing to HMRC',
        'Service address renewal after Year 1',
      ],
      exclusionsAr: [
        'رسوم Companies House الرسمية الأولى (50 جنيهاً)',
        'إعداد الإقرار الضريبي للشركات CT600 وحسابات HMRC السنوية',
        'تجديد عنوان خدمة المدير بعد العام الأول',
      ],
      governmentFeesNote: 'Companies House £50 statutory fee is required.',
      governmentFeesNoteAr: 'رسوم التأسيس الحكومية لـ Companies House بقيمة 50 جنيهاً إسترلينياً.',
      renewalInfo: 'Registered office + director service address renews at £149/yr. Telephone line renews at £49/yr.',
      renewalInfoAr: 'تجديد المكتب المسجل وعنوان خدمة المدير بـ 149 جنيهاً سنوياً، ورقم الهاتف بـ 49 جنيهاً سنوياً.',
    },
  },

  uae: {
    regionId: 'uae',
    regionName: 'United Arab Emirates (Free Zone)',
    regionNameAr: 'الإمارات العربية المتحدة (منطقة حرة)',
    governmentFees: [
      {
        name: 'UAE Ministry of Economy & Free Zone Authority',
        nameAr: 'وزارة الاقتصاد وهيئة المنطقة الحرة',
        initialFee: 'Varies by Free Zone authority (typically $1,500 – $4,500 depending on activity & visas)',
        initialFeeAr: 'تختلف حسب المنطقة الحرة (عادة 1,500 – 4,500 دولار حسب النشاط والتأشيرات)',
        annualRenewalFee: 'Annual trade license renewal fee per Free Zone authority',
        annualRenewalFeeAr: 'رسوم تجديد الرخصة التجارية السنوية حسب المنطقة الحرة',
        deadlineInfo: 'Trade licenses must be renewed annually before expiration to avoid authority fines.',
        deadlineInfoAr: 'يجب تجديد الرخصة التجارية سنوياً قبل انتهائها لتفادي غرامات الهيئة.',
        officialUrl: 'https://mof.gov.ae/corporate-tax/',
      },
    ],
    basic: {
      id: 'uae-basic',
      name: 'UAE Free Zone Advisory & Formation',
      nameAr: 'تأسيس واستشارات المنطقة الحرة بالإمارات',
      serviceFee: 899,
      currency: 'USD',
      badge: 'Free Zone',
      badgeAr: 'منطقة حرة',
      popular: false,
      description: 'Professional setup assistance for a zero-visa commercial license in verified cost-effective Free Zones (IFZA, SPC, Meydan, SHAMS).',
      descriptionAr: 'مساعدة تأسيس مهنية لرخصة تجارية بدون تأشيرة في مناطق حرة موثوقة واقتصادية (IFZA, SPC, Meydan, SHAMS).',
      timeline: 'Free Zone authority approval typically takes 3–7 business days after document clearance.',
      timelineAr: 'الموافقة الرسمية للمنطقة الحرة تستغرق عادة 3–7 أيام عمل بعد اكتمال المستندات.',
      inclusions: [
        'Initial pre-approval and trade name reservation',
        'Selection of optimal cost-effective Free Zone jurisdiction',
        'Memorandum of Association (MoA) drafting',
        'Trade License issuance assistance (0 visa allocation)',
        'Virtual lease agreement / registered office address (1 year)',
        'UAE Corporate Tax registration guidance (Federal Decree-Law No. 47 of 2022)',
        'Corporate bank account introduction (Wio, Mashreq Neo, Emirates NBD)',
      ],
      inclusionsAr: [
        'الموافقة المبدئية وحجز الاسم التجاري',
        'اختيار أنسب وأوفر منطقة حرة لنشاطك التجاري',
        'صياغة عقد التأسيس والنظام الأساسي (MoA)',
        'إصدار الرخصة التجارية (باقة 0 تأشيرة)',
        'عقد إيجار افتراضي / مكتب مسجل لمدة عام',
        'إرشادات التسجيل لضريبة الشركات الإماراتية (المرسوم بقانون اتحادي رقم 47 لسنة 2022)',
        'تقديم الحسابات البنكية للشركات (Wio, Mashreq Neo, Emirates NBD)',
      ],
      exclusions: [
        'Official Free Zone Authority license fee (billed at exact authority cost, typically $1,500–$3,200)',
        'Investor / employee residency visas, medical testing, and Emirates ID fees',
        'Establishment card and immigration file fees',
      ],
      exclusionsAr: [
        'رسوم رخصة هيئة المنطقة الحرة الحكومية (تُسدد بتكلفتها المباشرة، حوالي 1500–3200 دولار)',
        'تأشيرات إقامة المستثمر / الموظفين والفحص الطبي ورسوم الهوية الإماراتية',
        'بطاقة المنشأة ورسوم ملف الهجرة والإقامة',
      ],
      governmentFeesNote: 'Free Zone license fees are paid to the specific Free Zone authority directly.',
      governmentFeesNoteAr: 'رسوم الرخصة تُدفع مباشرة لهيئة المنطقة الحرة المختارة.',
      renewalInfo: 'Trade license and lease renew annually according to Free Zone authority schedule.',
      renewalInfoAr: 'تتجدد الرخصة التجارية وعقد الإيجار سنوياً وفقاً لجدول هيئة المنطقة الحرة.',
    },
    premium: {
      id: 'uae-premium',
      name: 'UAE Free Zone + Investor Visa',
      nameAr: 'باقة المنطقة الحرة + تأشيرة المستثمر',
      serviceFee: 1899,
      currency: 'USD',
      badge: 'Full Residency',
      badgeAr: 'إقامة كاملة',
      popular: true,
      description: 'Comprehensive setup including 1 Investor Residency Visa, Emirates ID processing, medical VIP escort, and priority corporate banking.',
      descriptionAr: 'تأسيس شامل يتضمن تأشيرة إقامة مستثمر، إجراءات الهوية الإماراتية، الفحص الطبي VIP، والمتابعة البنكية.',
      timeline: 'License in 3–5 days. Visa, medical, and Emirates ID completed in 5–10 days post-arrival.',
      timelineAr: 'الرخصة في 3–5 أيام. التأشيرة والفحص والهوية تُنجز في 5–10 أيام بعد الوصول.',
      inclusions: [
        'Everything in Basic UAE package',
        'Establishment Card issuance',
        '1 Investor / Partner Residency Visa processing (2-year validity)',
        'Entry permit issuance & status change guidance',
        'VIP Medical fitness test & biometric Emirates ID appointment coordination',
        'Dedicated corporate banking assistance with UAE digital & tier-1 banks',
        'Tax residency certificate advisory',
      ],
      inclusionsAr: [
        'جميع مميزات باقة الإمارات الأساسية',
        'إصدار بطاقة المنشأة (Establishment Card)',
        'إجراءات تأشيرة إقامة مستثمر/شريك (صالحة لمدة سنتين)',
        'إصدار إذن الدخول وتعديل الوضع القانوني',
        'تنسيق الفحص الطبي VIP وموعد البصمة البيومترية للهوية الإماراتية',
        'متابعة حثيثة لفتح الحساب البنكي التجاري مع البنوك الإماراتية الرائدة',
        'استشارات شهادة الإقامة الضريبية',
      ],
      exclusions: [
        'Government Free Zone authority package & visa statutory fees',
        'Flight tickets and personal accommodation during residency processing',
        'Ongoing corporate tax bookkeeping / annual audit filings',
      ],
      exclusionsAr: [
        'الرسوم الحكومية لهيئة المنطقة الحرة ورسوم التأشيرة الرسمية',
        'تذاكر الطيران والإقامة الشخصية أثناء إجراءات الإقامة',
        'المسك الدفتري المستمر وتدقيق الحسابات السنوي لضريبة الشركات',
      ],
      governmentFeesNote: 'Free Zone authority & GDRFA immigration fees are itemized and billed transparently.',
      governmentFeesNoteAr: 'رسوم هيئة المنطقة الحرة والجوازات تُفصّل وتُسدد بشفافية تامة.',
      renewalInfo: 'Trade license renews annually. Investor visa renews every 2 years.',
      renewalInfoAr: 'تتجدد الرخصة التجارية سنوياً. تتجدد تأشيرة المستثمر كل سنتين.',
    },
  },

  oman: {
    regionId: 'oman',
    regionName: 'Sultanate of Oman (SPC / LLC)',
    regionNameAr: 'سلطنة عُمان (شركة الشخص الواحد / LLC)',
    governmentFees: [
      {
        name: 'Ministry of Commerce, Industry and Investment Promotion (MoCIIP)',
        nameAr: 'وزارة التجارة والصناعة وترويج الاستثمار',
        initialFee: 'Commercial Registration (CR) statutory fees apply per activity',
        initialFeeAr: 'رسوم السجل التجاري (CR) الرسمية حسب النشاط',
        annualRenewalFee: 'Chamber of Commerce & municipality renewal',
        annualRenewalFeeAr: 'تجديد غرفة التجارة ورسوم البلدية السنوية',
        deadlineInfo: 'Commercial registration and municipal licenses renew per government expiry dates.',
        deadlineInfoAr: 'السجل التجاري والترخيص البلدي يجددان حسب تواريخ الانتهاء المحددة.',
        officialUrl: 'https://tejarah.gov.om/',
      },
    ],
    basic: {
      id: 'oman-basic',
      name: 'Oman SPC Formation',
      nameAr: 'تأسيس شركة الشخص الواحد في عُمان (SPC)',
      serviceFee: 799,
      currency: 'USD',
      badge: '100% Foreign Ownership',
      badgeAr: 'تملك أجنبي 100%',
      popular: false,
      description: 'Single Person Company (SPC) under Foreign Capital Investment Law with 100% foreign ownership and commercial registration.',
      descriptionAr: 'شركة الشخص الواحد (SPC) وفق قانون استثمار رأس المال الأجنبي بتملك أجنبي 100% مع السجل التجاري.',
      timeline: 'Commercial registration approval typically in 5–10 business days.',
      timelineAr: 'الموافقة على السجل التجاري تستغرق عادة 5–10 أيام عمل.',
      inclusions: [
        'Commercial Registration (CR) filing with MoCIIP',
        'Trade name reservation and activity approvals',
        'Oman Chamber of Commerce and Industry (OCCI) registration',
        'Tax card registration with Oman Tax Authority',
        'Drafting standard Articles of Association (MoA)',
        'Corporate bank account introduction (Bank Muscat, Sohar International)',
      ],
      inclusionsAr: [
        'قيد السجل التجاري (CR) لدى وزارة التجارة والصناعة وترويج الاستثمار',
        'حجز الاسم التجاري والحصول على موافقات الأنشطة التجارية',
        'التسجيل في غرفة تجارة وصناعة عُمان (OCCI)',
        'استخراج البطاقة الضريبية من جهاز الضرائب العُماني',
        'صياغة عقد التأسيس والنظام الأساسي القياسي',
        'تقديم لفتح حساب بنكي تجاري (بنك مسقط، صحار الدولي)',
      ],
      exclusions: [
        'MoCIIP and Chamber statutory government fees',
        'Municipal license and physical lease / office rent',
        'Investor visa processing fees',
      ],
      exclusionsAr: [
        'رسوم وزارة التجارة والغرفة الحكومية الرسمية',
        'الترخيص البلدي وعقد الإيجار الفعلي للمكتب',
        'رسوم استخراج تأشيرة المستثمر والإقامة',
      ],
      governmentFeesNote: 'Statutory fees are paid directly to MoCIIP and Oman Chamber of Commerce.',
      governmentFeesNoteAr: 'الرسوم الرسمية تُسدد مباشرة للوزارة وغرفة التجارة العُمانية.',
      renewalInfo: 'Commercial registration and chamber membership renew according to Omani statutory regulations.',
      renewalInfoAr: 'يتجدد السجل التجاري وعضوية الغرفة سنوياً وفقاً للأنظمة العُمانية.',
    },
    premium: {
      id: 'oman-premium',
      name: 'Oman LLC + Investor Residency',
      nameAr: 'تأسيس شركة عمانية + إقامة مستثمر',
      serviceFee: 1699,
      currency: 'USD',
      badge: 'Comprehensive',
      badgeAr: 'شامل',
      popular: true,
      description: 'Full corporate setup with multiple shareholder flexibility, investor visa processing, and corporate bank opening coordination.',
      descriptionAr: 'تأسيس تجاري متكامل مع مرونة الشركاء المتعددين، إنجاز إقامة المستثمر، وتنسيق فتح الحساب البنكي.',
      timeline: 'CR issuance in 5–7 days. Investor residency completed upon entry in 7–14 days.',
      timelineAr: 'إصدار السجل في 5–7 أيام. إنجاز إقامة المستثمر بعد الوصول في 7–14 يوماً.',
      inclusions: [
        'Everything in Basic Oman package',
        'Multi-shareholder LLC structure preparation',
        'Investor visa application & Royal Oman Police (ROP) entry clearance',
        'Medical testing and resident card issuance coordination in Muscat',
        'Municipal license compliance assistance',
        'Direct bank relationship coordination for corporate account opening',
      ],
      inclusionsAr: [
        'جميع مميزات باقة عُمان الأساسية',
        'إعداد هيكل شركة ذات مسؤولية محدودة لعدة شركاء',
        'معاملة تأشيرة المستثمر والموافقة الأمنية من شرطة عُمان السلطانية',
        'تنسيق الفحص الطبي وإصدار بطاقة مقيم في مسقط',
        'المساعدة في متطلبات الترخيص البلدي',
        'تنسيق مصرفي مباشر لفتح الحساب التجاري',
      ],
      exclusions: [
        'Statutory ROP visa fees and municipal inspection fees',
        'Personal travel, flights, and accommodation expenses',
        'Ongoing corporate tax filing fees (15% standard Omani corporate tax)',
      ],
      exclusionsAr: [
        'رسوم شرطة عُمان السلطانية للتأشيرة ورسوم التفتيش البلدي',
        'نفقات السفر والإقامة الشخصية',
        'الإقرارات الضريبية السنوية المستمرة (ضريبة الشركات 15%)',
      ],
      governmentFeesNote: 'ROP visa fees and municipal charges are paid at cost.',
      governmentFeesNoteAr: 'رسوم التأشيرة والبلدية تُسدد بالتكلفة المباشرة للجهات المختصة.',
      renewalInfo: 'CR renews according to MoCIIP terms; investor residency card renews every 2 years.',
      renewalInfoAr: 'يتجدد السجل حسب فترته؛ وتتجدد بطاقة إقامة المستثمر كل عامين.',
    },
  },
}

export const ADDON_SERVICES_MASTER = [
  {
    id: 'ein-standalone',
    name: 'IRS EIN Tax ID (Standalone for existing company)',
    nameAr: 'الرقم الضريبي الفيدرالي EIN (منفصل لشركة قائمة)',
    price: 99,
    currency: 'USD',
    timeline: '3–6 weeks via IRS Form SS-4 fax (non-resident)',
    timelineAr: '3–6 أسابيع عبر فاكس نموذج SS-4 لمصلحة الضرائب لغير المقيمين',
    description: 'Direct IRS filing of Form SS-4 for existing US LLCs owned by non-residents without SSN.',
    descriptionAr: 'تقديم نموذج SS-4 مباشرة لمصلحة الضرائب الأمريكية لشركات LLC القائمة المملوكة لغير المقيمين.',
  },
  {
    id: 'registered-agent-renewal',
    name: 'Registered Agent Service (Annual Renewal)',
    nameAr: 'تجديد الوكيل المسجل المعتمد (سنوي)',
    price: 99,
    currency: 'USD',
    timeline: 'Immediate renewal on filing anniversary',
    timelineAr: 'تجديد فوري في تاريخ الذكرى السنوية',
    description: 'Mandatory statutory registered agent representation in Wyoming, Delaware, or New Mexico.',
    descriptionAr: 'التمثيل القانوني الإلزامي للوكيل المسجل في وايومنغ أو ديلاوير أو نيو مكسيكو.',
  },
  {
    id: 'boi-reporting',
    name: 'FinCEN BOI Reporting Filing',
    nameAr: 'تقديم إقرار ملكية المستفيد الفعلي FinCEN BOI',
    price: 49,
    currency: 'USD',
    timeline: 'Filed within 1–2 business days',
    timelineAr: 'يتم التقديم خلال 1–2 يوم عمل',
    description: 'Compliance reporting of Beneficial Ownership Information to the US Treasury Financial Crimes Enforcement Network.',
    descriptionAr: 'الإقرار القانوني لبيانات المستفيد الفعلي لدى شبكة مكافحة الجرائم المالية بالخزانة الأمريكية.',
  },
  {
    id: 'us-virtual-phone',
    name: 'US Virtual Business Phone Number (1 Year)',
    nameAr: 'رقم هاتف أعمال أمريكي افتراضي (سنة كاملة)',
    price: 49,
    currency: 'USD',
    timeline: 'Activated in 24 hours',
    timelineAr: 'تفعيل فوري خلال 24 ساعة',
    description: 'Dedicated US telephone number with SMS verification capability for Stripe, Mercury, and marketplaces.',
    descriptionAr: 'رقم هاتف أمريكي مخصص يدعم استقبال رسائل التحقق النصية SMS لـ Stripe والبنوك.',
  },
  {
    id: 'business-website',
    name: 'Professional Startup Landing Page',
    nameAr: 'صفحة هبوط احترافية للمشروع',
    price: 199,
    currency: 'USD',
    timeline: '3–5 business days',
    timelineAr: '3–5 أيام عمل',
    description: 'High-converting bilingual responsive landing page required for payment gateway verification approval.',
    descriptionAr: 'صفحة هبوط ثنائية اللغة متجاوبة وسريعة مطلوبة للموافقة على تفعيل بوابات الدفع الإلكتروني.',
  },
] as const
