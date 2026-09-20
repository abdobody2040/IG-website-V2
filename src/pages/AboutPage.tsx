import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, ShieldCheck, Globe, Award, CheckCircle2, ArrowRight, ShieldAlert, ExternalLink, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, injectJsonLd, injectBreadcrumb, getCanonical, generateOrganizationSchema } from '../lib/seo'

export default function AboutPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => {
    setPageMeta({
      title: isAr
        ? 'عن Instant Grow LLC | منصة تأسيس الشركات العالمية والامتثال'
        : 'About Instant Grow LLC | Global Business Formation & Compliance',
      description: isAr
        ? 'تعرف على Instant Grow LLC. نساعد رواد الأعمال حول العالم في تأسيس شركاتهم في أمريكا وبريطانيا مع الامتثال الضريبي والقانوني الكامل.'
        : 'Learn about Instant Grow LLC. We empower global founders and non-US residents to incorporate US LLCs and UK LTDs remotely with full compliance.',
      canonical: getCanonical('/about'),
      lang,
    })

    injectJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        {
          '@type': 'AboutPage',
          '@id': 'https://instantgrow.net/about#webpage',
          'url': 'https://instantgrow.net/about',
          'name': isAr ? 'من نحن - Instant Grow' : 'About Instant Grow LLC',
          'description': 'Global corporate filing platform helping non-resident founders incorporate US LLC and UK LTD companies remotely.',
        },
      ],
    })

    injectBreadcrumb([
      { name: isAr ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isAr ? 'من نحن' : 'About Us', url: getCanonical('/about') },
    ])
  }, [lang, isAr])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="flex-1 pt-24 pb-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30 uppercase tracking-wider">
              {isAr ? 'من نحن' : 'About Instant Grow LLC'}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {isAr
                ? 'تمكين رواد الأعمال عالمياً من تأسيس الشركات الأمريكية والبريطانية عن بُعد'
                : 'Empowering Global Founders to Form US & UK Companies Remotely'}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {isAr
                ? 'تساعد Instant Grow رواد الأعمال والمستقلين وأصحاب التجارة الإلكترونية غير المقيمين في أمريكا على تأسيس شركاتهم، الحصول على الرقم الضريبي الفيدرالي EIN، وفتح الحسابات البنكية الرقمية.'
                : 'Instant Grow simplifies business incorporation for international founders and remote operators. From state registry filing to IRS EIN tax numbers, registered agent compliance, and digital banking onboarding.'}
            </p>
          </div>
        </div>

        {/* Verified Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: isAr ? 'تقييم Trustpilot' : 'Trustpilot Rating',
              value: '5.0 / 5.0',
              sub: isAr ? '5 تقييمات موثقة' : '5 Verified Reviews',
              icon: Award,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              label: isAr ? 'الولايات المدعومة' : 'Core US Jurisdictions',
              value: 'WY, DE, NM, FL',
              sub: isAr ? 'بالإضافة لـ UK LTD' : '+ UK LTD Companies',
              icon: Building2,
              color: 'text-blue-600 bg-blue-50',
            },
            {
              label: isAr ? 'العملاء المستهدفون' : 'Client Focus',
              value: 'Global Non-Residents',
              sub: isAr ? 'تأسيس 100% عن بُعد' : '100% Remote Incorporation',
              icon: Globe,
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              label: isAr ? 'شبكة الوكلاء المسجلين' : 'Registered Agent Network',
              value: 'Licensed Local Agents',
              sub: isAr ? 'عناوين رسمية معتمدة' : 'Official Statutory Addresses',
              icon: ShieldCheck,
              color: 'text-amber-600 bg-amber-50',
            },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-xl md:text-2xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-700">{stat.label}</div>
                <div className="text-[11px] text-slate-500">{stat.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Beware of Similar Names Alert */}
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6 flex flex-col sm:flex-row gap-4 items-start">
          <ShieldAlert className="text-amber-700 flex-shrink-0 mt-0.5" size={24} />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-amber-900 text-sm">
              {isAr ? 'تنبيه هام: احذر المواقع ذات الأسماء المشابهة' : 'Security Advisory: Beware of Similar Domain Names'}
            </h3>
            <p className="text-amber-800 leading-relaxed">
              {isAr
                ? 'نود التنبيه بأن موقعنا الرسمي والوحيد هو instantgrow.net. توجد نطاقات غير تابعة لنا مثل instantgrow.org أو instantgrow.cc. تتم جميع الاتصالات الرسمية حصرياً عبر support@instantgrow.net.'
                : 'Please be aware that our only official platform is instantgrow.net. Unrelated sites with similar names exist (such as instantgrow.org or instantgrow.cc). All official communications and payment invoices are issued strictly from support@instantgrow.net.'}
            </p>
          </div>
        </div>

        {/* Mandatory Post-Formation Compliance: Form 5472 & State Reports */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 border border-slate-800 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              {isAr ? 'الامتثال القانوني والضريبي السنوي' : 'Mandatory Post-Formation Compliance'}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold">
              {isAr ? 'ما يجب عليك تقديمه سنوياً بعد التأسيس' : 'What You Must File After Formation'}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isAr
                ? 'تخضع الشركات الأمريكية الفردية المملوكة لأجانب غير مقيمين لمتطلبات إفصاح سنوية إلزامية بموجب المادة 6038A من قانون الضرائب الأمريكي (IRC). إليك أهم الالتزامات السنوية:'
                : 'Foreign-owned single-member US LLCs are classified as disregarded entities for tax purposes. Under IRS Code Section 6038A, you must maintain annual good standing and file required informational returns.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
              <h3 className="font-bold text-base text-amber-400">
                {isAr ? 'نموذج IRS Form 5472 + 1120' : 'IRS Form 5472 + Pro-Forma 1120'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'إقرار إفصاح سنوي إلزامي للشركات الأمريكية المملوكة لغير المقيمين بنسبة 25% فما فوق. غرامة التأخير أو عدم التقديم تصل إلى 25,000 دولار لكل نموذج.'
                  : 'Mandatory annual informational return for 25%+ foreign-owned US LLCs. Failure to file or late filing carries a statutory IRS penalty of up to $25,000 per year.'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
              <h3 className="font-bold text-base text-emerald-400">
                {isAr ? 'التقرير السنوي لولاية وايومنغ' : 'Wyoming Annual Report'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'رسم ترخيص سنوي قدره 60 دولاراً يستحق في أول يوم من شهر ذكرى التأسيس للحفاظ على الوضع القانوني السليم للشركة.'
                  : 'Minimum $60 annual report license tax due on the first day of your formation anniversary month to maintain active good standing.'}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
              <h3 className="font-bold text-base text-blue-400">
                {isAr ? 'ضريبة الامتياز لولاية ديلاوير' : 'Delaware Annual Franchise Tax'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'ضريبة امتياز سنوية موحدة قدرها 300 دولار تستحق سنوياً في أو قبل 1 يونيو لجميع شركات LLC المسجلة في ديلاوير.'
                  : 'Flat $300 annual franchise tax due on or before June 1st each year for all Delaware LLC entities regardless of revenue.'}
              </p>
            </div>
          </div>
        </div>

        {/* Why Founders Choose Instant Grow */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">
              {isAr ? 'لماذا يختار المؤسسون Instant Grow؟' : 'Why Founders Choose Instant Grow'}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {isAr
                ? 'كان تأسيس شركة دولية يتطلب في السابق مبالغ طائلة للمحامين وإجراءات ورقية معقدة وسفرًا فعليًا. توفر Instant Grow حلاً إلكترونياً شفافاً بتكاليف واضحة بدون رسوم خفية.'
                : 'Incorporating a company internationally used to require expensive attorneys, complex paperwork, and physical travel. Instant Grow eliminates these barriers by offering transparent, fixed-fee company formation online.'}
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                {isAr ? 'إيداع رسمي لدى سكرتير الولاية (وايومنغ، ديلاوير، نيومكسيكو)' : 'Official Secretary of State filing (Wyoming, Delaware, New Mexico)'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                {isAr ? 'استخراج الرقم الضريبي الفيدرالي EIN لغير المقيمين بدون SSN' : 'Direct IRS Form SS-4 EIN processing for non-US residents'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                {isAr ? 'سنة وكيل مسجل وعنوان تجاري قانوني مشمول في باقاتنا' : '1-year licensed registered agent & commercial business address included'}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                {isAr ? 'إرشاد فتح الحسابات البنكية الرقمية (Mercury, Relay, Wise)' : 'Step-by-step digital business banking assistance (Mercury, Relay, Wise)'}
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/order"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a56ff] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                {isAr ? 'ابدأ تأسيس شركتك' : 'Form Your Company Now'} <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
              </Link>
              <Link
                to="/team"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                <Users size={14} />
                <span>{isAr ? 'تعرف على الفريق' : 'Meet Our Team'}</span>
              </Link>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isAr ? 'البيانات المؤسسية الرسمية' : 'Official Entity Details'}
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[11px]">{isAr ? 'الاسم القانوني للكيان' : 'Legal Entity Name'}</p>
                <p className="font-bold text-slate-900 mt-0.5">Instant Grow LLC</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[11px]">{isAr ? 'رقم التسجيل / الملف' : 'State Registration / File ID'}</p>
                <p className="font-bold text-slate-900 mt-0.5">[REGISTRATION_NUMBER]</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[11px]">{isAr ? 'العنوان المسجل الرسمي' : 'Official Registered Address'}</p>
                <p className="font-bold text-slate-900 mt-0.5">[REGISTERED_ADDRESS]</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-slate-400 text-[11px]">{isAr ? 'البريد الرسمي & الهاتف' : 'Contact & Support'}</p>
                <p className="font-bold text-slate-900 mt-0.5">support@instantgrow.net · [PHONE]</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Government Sources */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 text-xs text-slate-500 space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">
            {isAr ? 'تنويه قانوني وضريبي' : 'Regulatory Notice & Disclaimer'}
          </h4>
          <p className="leading-relaxed">
            {isAr
              ? 'Instant Grow LLC شركة تقدم خدمات إعداد وثائق وتأسيس إدارية بالتعاون مع وكلاء مسجلين مرخصين. لا تقدم الشركة استشارات قانونية أو محاسبية أو ضريبية معتمدة. للحصول على مشورة مخصصة، يرجى استشارة محامٍ أو محاسب قانوني معتمد (CPA).'
              : 'Instant Grow LLC is a corporate document preparation and formation filing service. We are not an attorney, law firm, CPA, or tax advisor and do not provide legal or tax advice. For specific tax structuring or legal counsel, please consult a qualified licensed professional.'}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-blue-600 font-semibold text-[11px]">
            <a href="https://www.irs.gov" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>IRS.gov</span> <ExternalLink size={10} />
            </a>
            <a href="https://sos.wyo.gov" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>Wyoming SOS</span> <ExternalLink size={10} />
            </a>
            <a href="https://corp.delaware.gov" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>Delaware Division of Corporations</span> <ExternalLink size={10} />
            </a>
            <a href="https://www.gov.uk/government/organisations/companies-house" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <span>Companies House UK</span> <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
