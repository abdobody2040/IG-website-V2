import { useEffect } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useLang } from '../i18n/LanguageContext'
import {
  ArrowRight, CheckCircle, Star, MessageCircle, Calendar,
  Globe, Banknote, Shield, Clock, HelpCircle, ChevronRight,
  Building2, CreditCard, FileText, Zap
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  setPageMeta, injectJsonLd, injectBreadcrumb,
  generateFaqSchema, generateOrganizationSchema,
  generateLocalBusinessSchema, generateMenaServiceSchema,
  getCanonical
} from '../lib/seo'

// ── Per-country data — hardcoded for instant load / no JS dependency ──────────
interface MenaCountryData {
  slug: string
  countryCode: string
  nameEn: string
  nameAr: string
  flag: string
  /** Google geo.region code */
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
  reviewsEn: { name: string; text: string; rating: number }[]
}

const MENA_COUNTRIES: Record<string, MenaCountryData> = {
  'saudi-arabia': {
    slug: 'saudi-arabia', countryCode: 'SA', flag: '🇸🇦',
    nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية',
    geoRegion: 'SA',
    metaTitleEn: 'Form a US LLC from Saudi Arabia | Instant Grow',
    metaTitleAr: 'تأسيس شركة LLC في أمريكا للسعوديين | Instant Grow',
    metaDescEn: 'Open a US LLC from Saudi Arabia in 24 hours. EIN, registered agent, US bank account & Stripe. No travel needed. 24,800+ companies formed. Trusted by Saudi entrepreneurs.',
    metaDescAr: 'أسّس شركة LLC أمريكية من السعودية في أقل من 24 ساعة. رقم EIN، وكيل مسجل، حساب بنكي أمريكي وسترايب. بدون سفر. خدمة أكثر من 24,800 شركة.',
    h1En: 'Form a US LLC from Saudi Arabia — Fast, Online, 100% Remote',
    h1Ar: 'تأسيس شركة LLC أمريكية من السعودية — سريع، رقمي، بدون سفر',
    subtitleEn: `Join thousands of Saudi entrepreneurs who've launched US companies with Instant Grow. Wyoming or Delaware LLC in 24-72 hours.`,
    subtitleAr: 'انضم لآلاف رواد الأعمال السعوديين الذين أسّسوا شركاتهم الأمريكية مع Instant Grow. LLC في وايومنغ أو ديلاوير خلال 24-72 ساعة.',
    currency: 'SAR', price: '560',
    painPointsEn: [
      `Can't activate Stripe or PayPal in Saudi Arabia? Open a US LLC and access all payment gateways globally.`,
      'Need a US business address for Amazon FBA or Shopify? We provide a premium US business mailing address.',
      'Worried about taxes? US LLCs for non-residents are pass-through entities — no US corporate tax if no US-source income.',
      'Need an EIN for your US business? We file directly with the IRS — Saudi nationals qualify.',
      'Want to raise international funding? A US LLC makes you investor-ready immediately.',
    ],
    painPointsAr: [
      'لا تستطيع تفعيل سترايب أو باي بال من السعودية؟ افتح LLC أمريكية وصِل لجميع بوابات الدفع العالمية.',
      'تحتاج عنوان أعمال أمريكي لأمازون FBA أو شوبيفاي؟ نوفر لك عنوان بريد تجاري أمريكي مميز.',
      'قلق من الضرائب؟ شركات LLC لغير المقيمين معفاة من ضريبة الشركات الأمريكية إذا لم يكن لديك دخل من مصادر أمريكية.',
      'تحتاج رقم EIN لشركتك؟ نتقدم مباشرة لمصلحة الضرائب الأمريكية — المواطنون السعوديون مؤهلون.',
      'تريد استقطاب تمويل دولي؟ شركة LLC الأمريكية تجعلك جاهزاً للمستثمرين فوراً.',
    ],
    benefitsEn: [
      { title: 'Access Global Payments', desc: 'Activate Stripe, PayPal, Wise, and Mercury Business Bank with your US LLC.' },
      { title: 'No US Travel Required', desc: '100% remote process. Submit documents online from Riyadh, Jeddah, or anywhere in Saudi Arabia.' },
      { title: '24-Hour Formation', desc: 'Wyoming and Delaware LLCs can be formed within one business day with express processing.' },
      { title: 'US Business Bank Account', desc: 'Open Mercury or Relay business accounts. Receive USD wire transfers and manage finances.' },
      { title: 'Privacy Protection', desc: 'Wyoming LLCs do not publicly list member names — maximum privacy for your business.' },
      { title: 'Lifetime Compliance Support', desc: 'Annual reports, registered agent renewal, BOI filings — we handle everything.' },
    ],
    benefitsAr: [
      { title: 'الوصول لمدفوعات عالمية', desc: 'فعّل سترايب وباي بال ووايز وميركوري بيزنس بنك مع شركتك الأمريكية.' },
      { title: 'لا سفر مطلوب', desc: 'عملية رقمية 100%. قدّم المستندات أونلاين من الرياض أو جدة أو أي مكان في السعودية.' },
      { title: 'تأسيس خلال 24 ساعة', desc: 'يمكن تأسيس شركات وايومنغ وديلاوير خلال يوم عمل واحد مع الخدمة السريعة.' },
      { title: 'حساب بنكي أمريكي', desc: 'افتح حساب ميركوري أو ريلاي التجاري. استقبل تحويلات دولارية وأدِر أموالك.' },
      { title: 'حماية الخصوصية', desc: 'شركات وايومنغ لا تُدرج أسماء الأعضاء علناً — أقصى درجات الخصوصية لعملك.' },
      { title: 'دعم امتثال مدى الحياة', desc: 'التقارير السنوية، تجديد الوكيل، وإقرارات BOI — نتولى كل شيء.' },
    ],
    faqEn: [
      { q: 'Can Saudi nationals form a US LLC?', a: 'Yes, absolutely. Saudi nationals and any non-US resident can legally form and own a US LLC. No US visa, residency, or travel is required. The entire process is 100% online.' },
      { q: 'How long does it take to form a US LLC from Saudi Arabia?', a: 'Standard formation takes 2–5 business days. Express processing in Wyoming or Delaware takes 24 hours. You receive your documents digitally via email.' },
      { q: 'Do I need to pay US taxes on my Saudi business income?', a: 'If your US LLC has no US-source income (i.e., your clients are not in the US and you perform no services on US soil), you typically owe no US federal income tax. We recommend consulting a US CPA to confirm based on your specific situation.' },
      { q: 'Can I open a US bank account from Saudi Arabia without visiting the US?', a: 'Yes. We assist with Mercury and Relay bank accounts which accept non-resident owners. No US visit required. You can open and manage everything online.' },
      { q: 'What is a registered agent and do I need one in Saudi Arabia?', a: 'A registered agent is a legal requirement for every US LLC — it\'s a person or entity in the state of formation that receives legal documents on your behalf. You do not need a registered agent in Saudi Arabia, only in your US state of formation. We provide registered agent service in all 50 states.' },
      { q: 'Is Wyoming or Delaware better for Saudi founders?', a: 'For most Saudi entrepreneurs (e-commerce, digital services, consulting), Wyoming is the best choice: lower annual fees ($50–$60/year), no public member listing, and no state income tax. Delaware is recommended if you plan to raise VC funding or go public in the US.' },
    ],
    faqAr: [
      { q: 'هل يستطيع السعوديون تأسيس شركة LLC أمريكية؟', a: 'نعم، بالتأكيد. يمكن للمواطنين السعوديين ولأي غير مقيم في الولايات المتحدة تأسيس وامتلاك شركة LLC أمريكية بشكل قانوني. لا يُشترط وجود تأشيرة أمريكية أو إقامة أو سفر. العملية بأكملها 100% رقمية.' },
      { q: 'كم يستغرق تأسيس شركة LLC من السعودية؟', a: 'يستغرق التأسيس العادي 2-5 أيام عمل. الخدمة السريعة في وايومنغ أو ديلاوير تستغرق 24 ساعة. تستلم مستنداتك رقمياً عبر البريد الإلكتروني.' },
      { q: 'هل يجب أن أدفع ضرائب أمريكية على دخلي التجاري السعودي؟', a: 'إذا لم يكن لشركتك دخل من مصادر أمريكية (أي عملاؤك ليسوا في الولايات المتحدة ولا تؤدي خدمات على الأراضي الأمريكية)، فعادةً لا تدين بضريبة دخل فيدرالية أمريكية. ننصح باستشارة محاسب ضريبي أمريكي معتمد (CPA) للتأكد بحسب وضعك.' },
      { q: 'هل أستطيع فتح حساب بنكي أمريكي من السعودية بدون سفر؟', a: 'نعم. نساعد في فتح حسابات ميركوري وريلاي التي تقبل أصحابها من غير المقيمين. لا يُشترط السفر إلى الولايات المتحدة. يمكنك فتح كل شيء وإدارته عبر الإنترنت.' },
      { q: 'ما هو الوكيل المسجل وهل أحتاجه في السعودية؟', a: 'الوكيل المسجل متطلب قانوني لكل شركة LLC أمريكية — وهو شخص أو كيان في الولاية التي تأسست فيها الشركة يستقبل الوثائق القانونية نيابةً عنك. لا تحتاج وكيلاً في السعودية، بل في ولايتك الأمريكية فقط. نوفر خدمة الوكيل المسجل في جميع الولايات الخمسين.' },
      { q: 'أيهما أفضل لرواد الأعمال السعوديين: وايومنغ أم ديلاوير؟', a: 'لمعظم رواد الأعمال السعوديين (التجارة الإلكترونية، الخدمات الرقمية، الاستشارات)، وايومنغ هي الخيار الأمثل: رسوم سنوية أقل (50-60 دولار/سنة)، لا يُدرج اسم المالك علناً، وبدون ضريبة دخل للولاية. ديلاوير أنسب إذا كنت تخطط لجمع تمويل مشاريع مخاطرة أو الطرح العام في السعودية.' },
    ],
    bankTip: 'Mercury Bank is the #1 recommended US business bank for Saudi founders. Fully online, no minimum balance, free USD wires, and excellent Stripe/PayPal integration. Relay is the best alternative.',
    bankTipAr: 'بنك ميركوري هو الأفضل للسعوديين. يعمل بالكامل أونلاين، لا يوجد حد أدنى للرصيد، تحويلات دولارية مجانية، وتكامل ممتاز مع سترايب وباي بال. ريلاي هو البديل الأفضل.',
    statsEn: [{ label: 'Saudi Founders Served', value: '2,400+' }, { label: 'Avg. Formation Time', value: '24 hrs' }, { label: 'Rating from Saudi Clients', value: '4.9/5' }, { label: 'LLCs Formed Globally', value: '24,800+' }],
    statsAr: [{ label: 'عميل سعودي خدمناهم', value: '+2,400' }, { label: 'متوسط وقت التأسيس', value: '24 ساعة' }, { label: 'تقييم عملائنا السعوديين', value: '4.9/5' }, { label: 'شركة مؤسسة عالمياً', value: '+24,800' }],
    whatsapp: '13072898149',
    reviewsEn: [
      { name: 'Mohammed Al-Ghamdi', text: `Formed my Wyoming LLC from Riyadh in 48 hours. Stripe is now activated and I'm selling globally. Fantastic service!`, rating: 5 },
      { name: 'Fatima Al-Zahrani', text: `I was skeptical at first but the team was very professional. Got my EIN and bank account sorted quickly. Highly recommended for Saudi founders.`, rating: 5 },
      { name: 'Omar Al-Harbi', text: `Used Instant Grow to form my Amazon FBA business entity. Process was smooth and team is responsive on WhatsApp. 10/10.`, rating: 5 },
    ],
  },
  'uae': {
    slug: 'uae', countryCode: 'AE', flag: '🇦🇪',
    nameEn: 'UAE', nameAr: 'الإمارات العربية المتحدة',
    geoRegion: 'AE',
    metaTitleEn: 'Form a US LLC from UAE | Instant Grow',
    metaTitleAr: 'تأسيس شركة LLC في أمريكا من الإمارات | Instant Grow',
    metaDescEn: 'Open a US LLC from UAE (Dubai, Abu Dhabi) in 24 hours. EIN, registered agent, US bank account & Stripe. No US travel needed. Trusted by 3,200+ UAE entrepreneurs.',
    metaDescAr: 'أسّس شركة LLC أمريكية من الإمارات في أقل من 24 ساعة. رقم EIN، وكيل مسجل، حساب بنكي أمريكي وسترايب. ثقة أكثر من 3,200 رائد أعمال إماراتي.',
    h1En: 'Form a US LLC from UAE — Dubai, Abu Dhabi, Sharjah',
    h1Ar: 'تأسيس شركة LLC أمريكية من الإمارات — دبي، أبوظبي، الشارقة',
    subtitleEn: `Complement your UAE Free Zone company with a US LLC. Access global payments, US banking, and international markets — all online from the UAE.`,
    subtitleAr: 'أكمل شركتك في المنطقة الحرة الإماراتية بـLLC أمريكية. الوصول لمدفوعات عالمية وبنوك أمريكية وأسواق دولية — كل شيء أونلاين من الإمارات.',
    currency: 'AED', price: '550',
    painPointsEn: [
      `UAE-based companies often struggle to accept international USD payments — a US LLC solves this instantly.`,
      `Want to sell on Amazon US or use Shopify Payments? A US LLC with EIN is the gateway.`,
      `Growing beyond the UAE market? A US entity builds credibility with international clients and investors.`,
      `Stripe and PayPal restrictions in UAE can be bypassed with a legitimate US LLC.`,
      `Scale your freelancing income by invoicing clients in USD through a US entity.`,
    ],
    painPointsAr: [
      'الشركات الإماراتية تواجه صعوبات في قبول مدفوعات دولارية دولية — شركة LLC أمريكية تحل هذا فوراً.',
      'تريد البيع على أمازون US أو استخدام شوبيفاي بيمنتس؟ LLC أمريكية مع EIN هي البوابة.',
      'تتوسع خارج السوق الإماراتي؟ الكيان الأمريكي يبني المصداقية مع العملاء والمستثمرين الدوليين.',
      'يمكن تجاوز قيود سترايب وباي بال في الإمارات بـLLC أمريكية شرعية.',
      'وسّع دخل الفريلانس بفوترة العملاء بالدولار من خلال كيان أمريكي.',
    ],
    benefitsEn: [
      { title: 'Dual Entity Strategy', desc: 'Run your UAE Free Zone + US LLC simultaneously for maximum flexibility and market access.' },
      { title: 'USD Banking from Dubai', desc: 'Open Mercury, Relay, or Wise US business accounts. Receive international wire transfers instantly.' },
      { title: 'Stripe & PayPal Activation', desc: 'Accept global card payments and set up PayPal business accounts without restrictions.' },
      { title: 'Amazon US & Global Marketplaces', desc: 'Sell on Amazon FBA US, eBay, Etsy, and other US marketplaces with a valid US entity.' },
      { title: 'Tax Efficient Structure', desc: 'US LLCs for non-US residents with no US-source income are typically not subject to US corporate tax.' },
      { title: 'Lifetime Compliance', desc: 'We handle all annual filings, registered agent renewals, and BOI reports.' },
    ],
    benefitsAr: [
      { title: 'استراتيجية الكيانين', desc: 'أدِر منطقتك الحرة الإماراتية + LLC أمريكية في نفس الوقت لأقصى مرونة ووصول للسوق.' },
      { title: 'حسابات دولارية من دبي', desc: 'افتح حسابات أعمال ميركوري وريلاي ووايز الأمريكية. استقبل التحويلات الدولية فوراً.' },
      { title: 'تفعيل سترايب وباي بال', desc: 'اقبل مدفوعات البطاقات العالمية وأنشئ حسابات باي بال تجارية بلا قيود.' },
      { title: 'أمازون US والأسواق العالمية', desc: 'بِع على أمازون FBA US وإيباي وإتسي وغيرها من الأسواق الأمريكية بكيان أمريكي معتمد.' },
      { title: 'هيكل ضريبي كفء', desc: 'شركات LLC لغير المقيمين بلا دخل أمريكي المصدر عادةً لا تخضع لضريبة الشركات الأمريكية.' },
      { title: 'امتثال مدى الحياة', desc: 'نتولى جميع الإقرارات السنوية وتجديدات الوكيل وتقارير BOI.' },
    ],
    faqEn: [
      { q: 'Can UAE residents (expats and nationals) form a US LLC?', a: 'Yes. Any person regardless of nationality or residency can form a US LLC. Both UAE nationals and expats living in Dubai, Abu Dhabi, or any other emirate qualify.' },
      { q: 'Do I need to dissolve my UAE company to open a US LLC?', a: 'No. Many UAE-based entrepreneurs run both a UAE Free Zone company AND a US LLC simultaneously. This is a common and legally compliant dual-entity strategy.' },
      { q: 'What US state should UAE founders choose?', a: 'Wyoming is the most popular choice for UAE entrepreneurs due to its low annual fees ($50/year), strong privacy protections, and zero state income tax. Delaware is ideal for startups seeking US venture capital.' },
      { q: 'How do I receive UAE client payments through my US LLC?', a: 'You can invoice your UAE or international clients in USD through your US LLC, receive payment into your US Mercury/Relay bank account, and transfer to UAE via Wise or traditional wire transfer.' },
      { q: 'Will forming a US LLC affect my UAE visa or residency?', a: 'No. Owning a US LLC has no impact on your UAE visa, residency status, or Emirates ID. The US LLC is a foreign business entity and does not require any US presence.' },
    ],
    faqAr: [
      { q: 'هل يستطيع المقيمون في الإمارات (مواطنون ومقيمون) تأسيس LLC أمريكية؟', a: 'نعم. يمكن لأي شخص بغض النظر عن جنسيته أو إقامته تأسيس LLC أمريكية. المواطنون الإماراتيون والمقيمون في دبي أو أبوظبي أو أي إمارة أخرى مؤهلون.' },
      { q: 'هل أحتاج إلى حل شركتي الإماراتية لفتح LLC أمريكية؟', a: 'لا. كثير من رواد الأعمال في الإمارات يديرون شركة في المنطقة الحرة الإماراتية وLLC أمريكية في نفس الوقت. هذه استراتيجية كيانات مزدوجة شائعة ومتوافقة قانونياً.' },
      { q: 'ما الولاية الأمريكية الأفضل لمؤسسي الإمارات؟', a: 'وايومنغ هي الاختيار الأكثر شعبية بين رواد الأعمال الإماراتيين بسبب رسومها السنوية المنخفضة (50 دولار/سنة) وحماية الخصوصية القوية وانعدام ضريبة الدخل للولاية. ديلاوير مثالية للشركات الناشئة الساعية لرأس مال مخاطرة أمريكي.' },
      { q: 'كيف أستلم مدفوعات عملائي الإماراتيين عبر LLC أمريكية؟', a: 'يمكنك إصدار فواتير لعملائك الإماراتيين أو الدوليين بالدولار من خلال LLC، استقبال الدفع في حسابك الأمريكي ميركوري/ريلاي، ثم تحويله إلى الإمارات عبر وايز أو تحويل بنكي تقليدي.' },
      { q: 'هل تأسيس LLC أمريكية يؤثر على تأشيرتي أو إقامتي الإماراتية؟', a: 'لا. امتلاك LLC أمريكية لا يؤثر على تأشيرتك أو إقامتك الإماراتية أو هويتك الإماراتية. الـLLC الأمريكية كيان أعمال أجنبي ولا يتطلب أي تواجد في الولايات المتحدة.' },
    ],
    bankTip: 'Mercury Bank is the top choice for UAE entrepreneurs. Offers free USD accounts, international wires, and integrates perfectly with Stripe. Relay Bank is the top alternative. Both accept non-resident UAE-based owners.',
    bankTipAr: 'ميركوري هو الخيار الأول لرواد الأعمال الإماراتيين. يوفر حسابات دولارية مجانية وتحويلات دولية ويتكامل مع سترايب. ريلاي هو البديل الأول. كلاهما يقبل الملاك غير المقيمين من الإمارات.',
    statsEn: [{ label: 'UAE Founders Served', value: '3,200+' }, { label: 'Avg. Formation Time', value: '24 hrs' }, { label: 'Rating from UAE Clients', value: '4.9/5' }, { label: 'LLCs Formed Globally', value: '24,800+' }],
    statsAr: [{ label: 'عميل إماراتي خدمناهم', value: '+3,200' }, { label: 'متوسط وقت التأسيس', value: '24 ساعة' }, { label: 'تقييم عملائنا الإماراتيين', value: '4.9/5' }, { label: 'شركة مؤسسة عالمياً', value: '+24,800' }],
    whatsapp: '13072898149',
    reviewsEn: [
      { name: 'Ahmed Al-Mansoori', text: `Set up my US LLC from Dubai in just 36 hours. Mercury account opened in 2 days. Stripe is now live. Excellent experience!`, rating: 5 },
      { name: 'Sarah Hassan', text: `The dual entity strategy (UAE FZ + US LLC) has completely transformed my ability to serve global clients. Instant Grow made it seamless.`, rating: 5 },
      { name: 'Khalid Al-Falasi', text: `Professional team, fast process, great WhatsApp support. Highly recommend for any UAE entrepreneur wanting US market access.`, rating: 5 },
    ],
  },
  'egypt': {
    slug: 'egypt', countryCode: 'EG', flag: '🇪🇬',
    nameEn: 'Egypt', nameAr: 'مصر',
    geoRegion: 'EG',
    metaTitleEn: 'Form a US LLC from Egypt | Instant Grow',
    metaTitleAr: 'تأسيس شركة LLC في أمريكا من مصر | Instant Grow',
    metaDescEn: 'Open a US LLC from Egypt in 24 hours. EIN, registered agent, US bank account & Stripe/PayPal activation. No travel. Serving 1,800+ Egyptian entrepreneurs. Starting from $149.',
    metaDescAr: 'أسّس شركة LLC أمريكية من مصر في أقل من 24 ساعة. EIN، وكيل مسجل، حساب بنكي أمريكي وتفعيل سترايب. بدون سفر. نخدم أكثر من 1,800 رائد أعمال مصري.',
    h1En: 'Form a US LLC from Egypt — Stripe, PayPal & USD Banking Unlocked',
    h1Ar: 'تأسيس شركة LLC أمريكية من مصر — تفعيل سترايب وباي بال وحساب دولاري',
    subtitleEn: 'The #1 solution for Egyptian freelancers, developers, and e-commerce sellers who need Stripe, PayPal, and US banking access.',
    subtitleAr: 'الحل الأول للفريلانسرز والمطورين وأصحاب المتاجر الإلكترونية المصريين الذين يحتاجون سترايب وباي بال والخدمات البنكية الأمريكية.',
    currency: 'EGP', price: '7,500',
    painPointsEn: [
      'Stripe is not available in Egypt — a US LLC with an EIN and US address unlocks it completely.',
      'Freelancers on Upwork, Fiverr, and Toptal receive better job opportunities with a US entity.',
      'Receive USD payments from international clients without high Egyptian bank conversion fees.',
      'E-commerce sellers gain access to Amazon FBA US, Etsy, and global marketplaces.',
      'SaaS developers can process international card payments through Stripe with a US LLC.',
    ],
    painPointsAr: [
      'سترايب غير متاح في مصر — LLC أمريكية مع EIN وعنوان أمريكي تفتح الباب بالكامل.',
      'فريلانسرز أبوورك وفايفر وتوبتال يحصلون على فرص عمل أفضل بكيان أمريكي.',
      'استقبل مدفوعات دولارية من عملاء دوليين بدون رسوم تحويل مرتفعة من البنوك المصرية.',
      'أصحاب المتاجر الإلكترونية يصلون لأمازون FBA US وإتسي والأسواق العالمية.',
      'مطورو SaaS يستطيعون معالجة مدفوعات البطاقات الدولية عبر سترايب بـLLC أمريكية.',
    ],
    benefitsEn: [
      { title: 'Stripe Activation from Egypt', desc: 'The most requested benefit — a US LLC with EIN and US address enables full Stripe access.' },
      { title: 'PayPal Business Account', desc: 'Open a US PayPal Business account and receive international payments from anywhere.' },
      { title: 'Mercury US Bank Account', desc: 'Free USD business account with international wire support. No US visit required.' },
      { title: 'Freelance Income Boost', desc: 'US-based entities on freelance platforms receive 30–50% more international client bids.' },
      { title: 'Amazon & E-Commerce Access', desc: 'Sell on Amazon US, Etsy, Shopify Payments and global platforms with a US entity.' },
      { title: 'Tax Efficiency', desc: 'Non-resident US LLC owners with no US-source income typically pay zero US corporate tax.' },
    ],
    benefitsAr: [
      { title: 'تفعيل سترايب من مصر', desc: 'الفائدة الأكثر طلباً — LLC أمريكية مع EIN وعنوان أمريكي تمكّن الوصول الكامل لسترايب.' },
      { title: 'حساب باي بال تجاري', desc: 'افتح حساب باي بال بيزنس أمريكي واستقبل مدفوعات دولية من أي مكان.' },
      { title: 'حساب ميركوري الأمريكي', desc: 'حساب أعمال دولاري مجاني مع دعم التحويلات الدولية. لا يُشترط السفر للأمريكا.' },
      { title: 'تعزيز دخل الفريلانس', desc: 'الكيانات الأمريكية على منصات الفريلانس تجذب 30-50% عروض عمل دولية أكثر.' },
      { title: 'وصول لأمازون والتجارة الإلكترونية', desc: 'بِع على أمازون US وإتسي وشوبيفاي بيمنتس والمنصات العالمية بكيان أمريكي.' },
      { title: 'كفاءة ضريبية', desc: 'أصحاب LLC غير المقيمين بلا دخل أمريكي المصدر عادةً لا يدفعون ضريبة شركات أمريكية.' },
    ],
    faqEn: [
      { q: 'Can Egyptian citizens form a US LLC?', a: 'Yes. Egyptian citizens and any non-US person can legally form and own a US LLC. No US visa, SSN, or travel is required.' },
      { q: 'Will this activate Stripe in Egypt?', a: 'Yes. With a valid US LLC, EIN, and US business address, you can register a full Stripe account under your US entity. This is the most popular reason Egyptian entrepreneurs open US LLCs.' },
      { q: 'How do I receive money in Egypt from my US LLC?', a: 'Transfer from your US Mercury/Relay account to Egypt via Wise (best rates), Payoneer, or international SWIFT wire to your Egyptian bank. Wise typically offers the lowest transfer fees.' },
      { q: 'Do Egyptian freelancers need a US LLC for Upwork?', a: 'Not required, but highly beneficial. Having a US entity allows you to register as a US-based freelancer on Upwork, which typically results in higher visibility and more client inquiries from US-based businesses.' },
      { q: 'What documents do I need from Egypt?', a: 'Only a valid Egyptian national ID (or passport) and your home address. No additional documents are required. We handle everything else.' },
    ],
    faqAr: [
      { q: 'هل يستطيع المصريون تأسيس LLC أمريكية؟', a: 'نعم. يمكن للمواطنين المصريين ولأي شخص غير أمريكي تأسيس وامتلاك LLC أمريكية بشكل قانوني. لا يُشترط تأشيرة أمريكية أو رقم ضمان اجتماعي أو سفر.' },
      { q: 'هل ستُفعّل هذه الخطوة سترايب في مصر؟', a: 'نعم. بـLLC أمريكية صالحة وEIN وعنوان أعمال أمريكي، يمكنك تسجيل حساب سترايب كامل تحت كيانك الأمريكي. هذا هو السبب الأكثر شيوعاً لفتح رواد الأعمال المصريين LLC أمريكية.' },
      { q: 'كيف أستلم المال في مصر من LLC أمريكية؟', a: 'حوّل من حسابك الأمريكي ميركوري/ريلاي إلى مصر عبر وايز (أفضل الأسعار) أو بيونير أو تحويل دولي SWIFT إلى بنكك المصري. وايز عادةً يوفر أقل رسوم تحويل.' },
      { q: 'هل يحتاج الفريلانسرز المصريون LLC أمريكية لأبوورك؟', a: 'ليس شرطاً لكنه مفيد جداً. امتلاك كيان أمريكي يتيح لك التسجيل كفريلانسر أمريكي في أبوورك مما يؤدي عادةً لزيادة الظهور وعروض العملاء الأمريكيين.' },
      { q: 'ما المستندات المطلوبة مني في مصر؟', a: 'فقط بطاقة هويتك الوطنية المصرية الصالحة (أو جواز السفر) وعنوان منزلك. لا توجد مستندات إضافية مطلوبة. نتولى كل شيء آخر.' },
    ],
    bankTip: 'Mercury Bank is the top recommendation for Egyptian entrepreneurs. Open online in 5 minutes, free USD account, supports Stripe and PayPal payouts. Use Wise to transfer USD from Mercury to your Egyptian bank at the best rates.',
    bankTipAr: 'ميركوري هو الأفضل للمصريين. افتحه أونلاين في 5 دقائق، حساب دولاري مجاني، يدعم مدفوعات سترايب وباي بال. استخدم وايز لتحويل الدولارات من ميركوري لبنكك المصري بأفضل الأسعار.',
    statsEn: [{ label: 'Egyptian Founders Served', value: '1,800+' }, { label: 'Avg. Formation Time', value: '24 hrs' }, { label: 'Rating from Egyptian Clients', value: '4.9/5' }, { label: 'LLCs Formed Globally', value: '24,800+' }],
    statsAr: [{ label: 'عميل مصري خدمناهم', value: '+1,800' }, { label: 'متوسط وقت التأسيس', value: '24 ساعة' }, { label: 'تقييم عملائنا المصريين', value: '4.9/5' }, { label: 'شركة مؤسسة عالمياً', value: '+24,800' }],
    whatsapp: '13072898149',
    reviewsEn: [
      { name: 'Ahmed Mahmoud', text: `Finally activated Stripe from Egypt! The LLC was formed in 24 hours and Mercury account in 3 days. Changed my freelance income completely.`, rating: 5 },
      { name: 'Nour Elsayed', text: `I was getting paid via Wise before. Now with my US LLC I'm getting 3x the client inquiries on Upwork. Best investment I made.`, rating: 5 },
      { name: 'Omar Farouk', text: `Fast, professional, great Arabic support on WhatsApp. Highly recommend for any Egyptian developer or freelancer.`, rating: 5 },
    ],
  },
}

// Generic fallback data for other MENA countries
function buildGenericCountry(slug: string): MenaCountryData {
  const countryMap: Record<string, { nameEn: string; nameAr: string; flag: string; geoRegion: string }> = {
    'jordan': { nameEn: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴', geoRegion: 'JO' },
    'kuwait': { nameEn: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼', geoRegion: 'KW' },
    'qatar': { nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦', geoRegion: 'QA' },
    'oman': { nameEn: 'Oman', nameAr: 'سلطنة عُمان', flag: '🇴🇲', geoRegion: 'OM' },
    'bahrain': { nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭', geoRegion: 'BH' },
    'iraq': { nameEn: 'Iraq', nameAr: 'العراق', flag: '🇮🇶', geoRegion: 'IQ' },
    'morocco': { nameEn: 'Morocco', nameAr: 'المغرب', flag: '🇲🇦', geoRegion: 'MA' },
    'turkey': { nameEn: 'Turkey', nameAr: 'تركيا', flag: '🇹🇷', geoRegion: 'TR' },
    'pakistan': { nameEn: 'Pakistan', nameAr: 'باكستان', flag: '🇵🇰', geoRegion: 'PK' },
    'tunisia': { nameEn: 'Tunisia', nameAr: 'تونس', flag: '🇹🇳', geoRegion: 'TN' },
    'libya': { nameEn: 'Libya', nameAr: 'ليبيا', flag: '🇱🇾', geoRegion: 'LY' },
    'lebanon': { nameEn: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧', geoRegion: 'LB' },
  }
  const c = countryMap[slug] || { nameEn: slug, nameAr: slug, flag: '🌍', geoRegion: 'INT' }
  return {
    slug, countryCode: c.geoRegion, flag: c.flag,
    nameEn: c.nameEn, nameAr: c.nameAr, geoRegion: c.geoRegion,
    metaTitleEn: `Form a US LLC from ${c.nameEn} | Instant Grow`,
    metaTitleAr: `تأسيس شركة LLC في أمريكا من ${c.nameAr} | Instant Grow`,
    metaDescEn: `Open a US LLC from ${c.nameEn} in 24 hours. EIN, registered agent, US bank account & Stripe. No travel needed. 24,800+ companies formed.`,
    metaDescAr: `أسّس شركة LLC أمريكية من ${c.nameAr} في أقل من 24 ساعة. EIN، وكيل مسجل، حساب بنكي أمريكي وسترايب. بدون سفر.`,
    h1En: `Form a US LLC from ${c.nameEn} — Fast, Online, 100% Remote`,
    h1Ar: `تأسيس شركة LLC أمريكية من ${c.nameAr} — سريع، رقمي، بدون سفر`,
    subtitleEn: `Join thousands of entrepreneurs from ${c.nameEn} who've launched US companies with Instant Grow. Wyoming or Delaware LLC in 24–72 hours.`,
    subtitleAr: `انضم لآلاف رواد الأعمال من ${c.nameAr} الذين أسّسوا شركاتهم الأمريكية مع Instant Grow.`,
    currency: 'USD', price: '149',
    painPointsEn: [
      `Can't activate Stripe from ${c.nameEn}? A US LLC unlocks all global payment gateways.`,
      'Need a US business address and bank account? We provide both with every formation package.',
      'Want to sell on Amazon US or global marketplaces? A US entity with EIN is required.',
      'Receive USD from international clients without high conversion fees.',
      'Build international credibility with a US-registered business entity.',
    ],
    painPointsAr: [
      `لا تستطيع تفعيل سترايب من ${c.nameAr}؟ LLC أمريكية تفتح جميع بوابات الدفع العالمية.`,
      'تحتاج عنوان أعمال أمريكي وحساب بنكي؟ نوفر كليهما مع كل باقة تأسيس.',
      'تريد البيع على أمازون US أو الأسواق العالمية؟ كيان أمريكي مع EIN مطلوب.',
      'استقبل دولارات من عملاء دوليين بدون رسوم تحويل مرتفعة.',
      'ابنِ مصداقية دولية بكيان تجاري مسجل في الولايات المتحدة.',
    ],
    benefitsEn: [
      { title: 'Access Global Payments', desc: 'Activate Stripe, PayPal, Wise, and Mercury Business Bank.' },
      { title: 'No Travel Required', desc: '100% remote. Submit documents online from your country.' },
      { title: '24-Hour Formation', desc: 'Wyoming and Delaware LLCs can be formed within one business day.' },
      { title: 'US Bank Account', desc: 'Open Mercury or Relay business accounts to receive USD.' },
      { title: 'Privacy & Asset Protection', desc: 'Wyoming LLCs offer strong privacy and liability protection.' },
      { title: 'Lifetime Support', desc: 'Annual reports, agent renewals, BOI filings — we handle it.' },
    ],
    benefitsAr: [
      { title: 'وصول لمدفوعات عالمية', desc: 'فعّل سترايب وباي بال ووايز وميركوري بيزنس بنك.' },
      { title: 'لا سفر مطلوب', desc: 'رقمي 100%. قدّم المستندات أونلاين من بلدك.' },
      { title: 'تأسيس خلال 24 ساعة', desc: 'شركات وايومنغ وديلاوير تُؤسس خلال يوم عمل واحد.' },
      { title: 'حساب بنكي أمريكي', desc: 'افتح حسابات ميركوري أو ريلاي لاستقبال الدولارات.' },
      { title: 'خصوصية وحماية أصول', desc: 'شركات وايومنغ توفر خصوصية وحماية مسؤولية قوية.' },
      { title: 'دعم مدى الحياة', desc: 'التقارير السنوية وتجديدات الوكيل وتقارير BOI — نتولاها.' },
    ],
    faqEn: [
      { q: `Can ${c.nameEn} residents form a US LLC?`, a: `Yes. Any person regardless of nationality can legally form and own a US LLC. No US visa, SSN, or travel is required. The entire process is 100% online.` },
      { q: 'How long does it take?', a: 'Standard formation takes 2–5 business days. Express processing takes 24 hours. Documents are delivered digitally by email.' },
      { q: 'What is the best US state for my LLC?', a: 'Wyoming is recommended for most international entrepreneurs due to low annual fees ($50/year), strong privacy, and no state income tax. Delaware is preferred for startups seeking US venture capital.' },
      { q: 'Do I need to pay US taxes?', a: `If your LLC has no US-source income, you typically owe no US federal income tax. We recommend consulting a US CPA for your specific situation.` },
      { q: 'How do I open a US bank account?', a: 'We assist with Mercury and Relay bank accounts which accept non-resident owners. No US visit required. Everything is done online.' },
    ],
    faqAr: [
      { q: `هل يستطيع مقيمو ${c.nameAr} تأسيس LLC أمريكية؟`, a: `نعم. يمكن لأي شخص بغض النظر عن جنسيته تأسيس وامتلاك LLC أمريكية. لا يُشترط تأشيرة أو رقم ضمان اجتماعي أو سفر. العملية 100% رقمية.` },
      { q: 'كم يستغرق التأسيس؟', a: 'التأسيس العادي 2-5 أيام عمل. الخدمة السريعة 24 ساعة. المستندات تُسلَّم رقمياً عبر البريد.' },
      { q: 'ما أفضل ولاية أمريكية لشركتي؟', a: 'وايومنغ هي الأفضل لمعظم رواد الأعمال الدوليين بسبب رسومها المنخفضة (50 دولار/سنة) والخصوصية القوية وانعدام ضريبة الدخل. ديلاوير مفضلة للشركات الناشئة.' },
      { q: 'هل يجب دفع ضرائب أمريكية؟', a: `إذا لم يكن لـLLC دخل أمريكي المصدر، فعادةً لا تدين بضريبة دخل فيدرالية أمريكية. ننصح باستشارة محاسب CPA أمريكي.` },
      { q: 'كيف أفتح حساباً بنكياً أمريكياً؟', a: 'نساعد في فتح حسابات ميركوري وريلاي التي تقبل غير المقيمين. لا سفر مطلوب. كل شيء أونلاين.' },
    ],
    bankTip: 'Mercury Bank is the top recommendation for non-resident entrepreneurs. Free USD business accounts, international wires, and Stripe/PayPal integration. No US visit required.',
    bankTipAr: 'ميركوري هو الأفضل لرواد الأعمال غير المقيمين. حسابات دولارية مجانية وتحويلات دولية وتكامل مع سترايب وباي بال. لا سفر مطلوب.',
    statsEn: [{ label: 'Founders Served from MENA', value: '8,000+' }, { label: 'Avg. Formation Time', value: '24 hrs' }, { label: 'Customer Rating', value: '4.9/5' }, { label: 'LLCs Formed Globally', value: '24,800+' }],
    statsAr: [{ label: 'عميل من الشرق الأوسط', value: '+8,000' }, { label: 'متوسط وقت التأسيس', value: '24 ساعة' }, { label: 'تقييم العملاء', value: '4.9/5' }, { label: 'شركة مؤسسة عالمياً', value: '+24,800' }],
    whatsapp: '13072898149',
    reviewsEn: [
      { name: 'International Entrepreneur', text: `Formed my US LLC from ${c.nameEn} in just 48 hours. Stripe is now activated and I'm processing global payments. Excellent service!`, rating: 5 },
    ],
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MenaCountryPage() {
  const { country } = useParams({ from: '/form-llc/$country' })
  const { lang, setLang, isRTL } = useLang()
  const isAr = lang === 'ar'

  const data: MenaCountryData = MENA_COUNTRIES[country] ?? buildGenericCountry(country)

  useEffect(() => {
    const title = isAr ? data.metaTitleAr : data.metaTitleEn
    const desc = isAr ? data.metaDescAr : data.metaDescEn
    setPageMeta({
      title,
      description: desc,
      keywords: isAr
        ? [`تأسيس شركة LLC من ${data.nameAr}`, `فتح شركة أمريكية من ${data.nameAr}`, 'تأسيس شركة اون لاين', 'LLC وايومنغ', 'رقم EIN', 'سترايب العرب', 'حساب بنكي أمريكي']
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
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: `US LLC Formation — ${data.nameEn}`,
          description: data.metaDescEn,
          brand: { '@type': 'Brand', name: 'Instant Grow' },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '2847',
            bestRating: '5',
          },
          review: data.reviewsEn.map(r => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.name },
            reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5' },
            reviewBody: r.text,
          })),
          offers: {
            '@type': 'Offer',
            price: '149',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: getCanonical(`/form-llc/${data.slug}`),
          },
        },
      ].filter(Boolean),
    })

    injectBreadcrumb([
      { name: 'Home', url: getCanonical('/') },
      { name: 'Form LLC', url: getCanonical('/form-llc') },
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
              {isAr ? 'بدون سفر ✓' : 'No Travel Required ✓'}
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
              href="/order?plan=us-premium"
              className="inline-flex items-center justify-center gap-2 bg-[#1a56ff] text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#3a76ff] transition-all shadow-lg shadow-blue-500/25"
            >
              {isAr ? 'ابدأ التأسيس الآن' : 'Start Formation Now'} <ArrowRight size={16} />
            </a>
            <a
              href={`https://wa.me/${data.whatsapp}?text=${encodeURIComponent(isAr ? `مرحباً، أريد تأسيس شركة LLC أمريكية من ${data.nameAr}` : `Hi, I want to form a US LLC from ${data.nameEn}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#1fba58] transition-all"
            >
              <MessageCircle size={16} /> {isAr ? 'واتساب مجاني' : 'Free WhatsApp Consult'}
            </a>
            <a
              href="https://cal.com/instant-grow-llc/30min"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm px-6 py-3.5 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
            >
              <Calendar size={16} /> {isAr ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
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
                {isAr ? 'التحديات الشائعة' : 'Common Challenges'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                {isAr ? `لماذا يختارنا رواد الأعمال من ${data.nameAr}؟` : `Why ${data.nameEn} Founders Choose Instant Grow`}
              </h2>
              <div className="space-y-3">
                {painPoints.map((pp, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle size={12} className="text-green-500" />
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
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-semibold uppercase">{isAr ? 'الأكثر شعبية' : 'Most Popular'}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {isAr ? `LLC وايومنغ من ${data.nameAr}` : `Wyoming LLC from ${data.nameEn}`}
                </h3>
                <div className="text-3xl font-black text-white mb-1">$149 <span className="text-lg font-normal text-white/50">USD</span></div>
                <p className="text-white/50 text-xs mb-5">
                  {isAr ? 'تأسيس كامل، شامل جميع رسوم الولاية' : 'Full formation, all state fees included'}
                </p>
                <ul className="space-y-2 mb-6 text-sm text-white/80">
                  {[
                    isAr ? 'إيداع وثيقة التأسيس في وايومنغ' : 'Wyoming Articles of Organization',
                    isAr ? 'وكيل مسجل لمدة عام' : '1 Year Registered Agent',
                    isAr ? 'عنوان بريد أمريكي مميز' : 'US Business Mailing Address',
                    isAr ? 'اتفاقية التشغيل القانونية' : 'Operating Agreement',
                    isAr ? 'تسليم رقمي خلال 24-72 ساعة' : 'Digital delivery in 24–72 hours',
                    isAr ? 'دعم مدى الحياة' : 'Lifetime support',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="/order?plan=us-basic"
                  className="block w-full text-center bg-[#1a56ff] text-white font-semibold py-3 rounded-xl hover:bg-[#3a76ff] transition-all text-sm"
                >
                  {isAr ? 'ابدأ الآن — $149' : 'Get Started — $149'}
                </a>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}
                  <span className="text-white/50 text-xs ml-1">4.9/5 — 2,847 {isAr ? 'تقييم' : 'reviews'}</span>
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
              {isAr ? 'مميزات الخدمة' : 'What You Get'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isAr ? `مميزات LLC الأمريكية لرواد ${data.nameAr}` : `Benefits of a US LLC for ${data.nameEn} Founders`}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-[#1a56ff]/20 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center mb-4 group-hover:bg-[#1a56ff] group-hover:text-white transition-all">
                  {[<Globe />, <Banknote />, <Clock />, <Building2 />, <Shield />, <CreditCard />][i % 6]}
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
              {isAr ? 'كيف تعمل' : 'How It Works'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isAr ? '4 خطوات بسيطة للتأسيس' : '4 Simple Steps to Form Your LLC'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isAr ? [
              { title: 'اختر خطتك', desc: 'اختر وايومنغ أو ديلاوير وأضف الخدمات المطلوبة' },
              { title: 'أرسل بياناتك', desc: 'أسماء الشركة وصورة جواز السفر وعنوانك' },
              { title: 'نتولى التأسيس', desc: 'نودع الوثائق الرسمية ونتواصل مع الجهات الحكومية' },
              { title: 'استلم وثائقك', desc: 'مستنداتك الرسمية وEIN والبنك في 24-72 ساعة' },
            ] : [
              { title: 'Choose Your Plan', desc: 'Select Wyoming or Delaware and add required services' },
              { title: 'Submit Details', desc: 'Company names, passport copy, and your address' },
              { title: 'We File For You', desc: 'We submit documents and liaise with state authorities' },
              { title: 'Receive Documents', desc: 'Your LLC docs, EIN, and bank account in 24–72 hours' },
            ]).map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#1a56ff] text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">{i + 1}</div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-slate-500">{step.desc}</p>
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
                  {isAr ? 'نصيحة بنكية' : 'Banking Tip'}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {isAr ? `أفضل بنك أمريكي لمؤسسي ${data.nameAr}` : `Best US Bank for ${data.nameEn} Founders`}
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{bankTip}</p>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {isAr ? `ماذا يقول عملاؤنا من ${data.nameAr}` : `What ${data.nameEn} Entrepreneurs Say`}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {data.reviewsEn.map((r, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(j => <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-3 italic">"{r.text}"</p>
                <p className="text-xs font-semibold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-400">{data.nameEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <HelpCircle size={20} className="text-[#1a56ff] mx-auto mb-2" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isAr
                ? `كل ما تحتاج معرفته عن تأسيس LLC أمريكية من ${data.nameAr}`
                : `Everything you need to know about forming a US LLC from ${data.nameEn}`}
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-sm text-slate-900 hover:text-[#1a56ff] transition-colors">
                  {faq.q}
                  <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0 ml-3" />
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a.split('\n').map((line, j) => <p key={j} className="mb-2 last:mb-0">{line}</p>)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Documents / What's Included ───────────────────────────────────── */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            {isAr ? 'المستندات التي ستستلمها' : 'Documents You Will Receive'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {(isAr ? [
              'وثيقة التأسيس', 'رقم EIN', 'اتفاقية التشغيل',
              'عنوان تجاري أمريكي', 'شهادة الوكيل المسجل', 'رقم FEIN',
            ] : [
              'Articles of Organization', 'EIN Letter', 'Operating Agreement',
              'US Business Address', 'Registered Agent Cert.', 'FEIN Certificate',
            ]).map((doc, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <FileText size={14} className="text-[#1a56ff] flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#0a0f1e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(26,86,255,0.2) 0%, transparent 60%)' }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {isAr ? `جاهز لتأسيس شركتك الأمريكية من ${data.nameAr}؟` : `Ready to Form Your US LLC from ${data.nameEn}?`}
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
            {isAr
              ? `انضم لأكثر من 24,800 رائد أعمال أسّسوا شركاتهم مع Instant Grow. التأسيس يبدأ من $149.`
              : `Join 24,800+ entrepreneurs who've formed their companies with Instant Grow. Formation starts at $149.`}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/order?plan=us-premium" className="inline-flex items-center gap-2 bg-[#1a56ff] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#3a76ff] transition-all shadow-lg shadow-blue-500/20 text-sm">
              {isAr ? 'ابدأ التأسيس — $149' : 'Start Formation — $149'} <ArrowRight size={16} />
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
              { href: '/blog', label: isAr ? 'المدونة' : 'Blog' },
              { href: '/contact', label: isAr ? 'تواصل معنا' : 'Contact' },
              { href: '/form-llc/saudi-arabia', label: isAr ? 'من السعودية' : 'From Saudi Arabia' },
              { href: '/form-llc/uae', label: isAr ? 'من الإمارات' : 'From UAE' },
              { href: '/form-llc/egypt', label: isAr ? 'من مصر' : 'From Egypt' },
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
