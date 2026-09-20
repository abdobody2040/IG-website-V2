import { useEffect } from 'react'
import { ShieldAlert, ExternalLink, Building } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, injectJsonLd, injectBreadcrumb, getCanonical, generateOrganizationSchema } from '../lib/seo'

export default function HowWeWorkPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => {
    setPageMeta({
      title: isAr
        ? 'كيف نعمل | من يقوم بالتأسيس والامتثال | Instant Grow LLC'
        : 'How We Work | Formation Workflow & In-House vs Partner Filings | Instant Grow LLC',
      description: isAr
        ? 'تعرف على آلية عمل Instant Grow في تأسيس الشركات الأمريكية والبريطانية، دور الفريق الداخلي، وشبكة الوكلاء المسجلين المعتمدين.'
        : 'Transparent overview of how Instant Grow LLC operates: in-house document preparation, licensed state registered agent filings, and IRS EIN procedures.',
      canonical: getCanonical('/how-we-work'),
      lang,
    })

    injectJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        {
          '@type': 'AboutPage',
          '@id': 'https://instantgrow.net/how-we-work#webpage',
          'url': 'https://instantgrow.net/how-we-work',
          'name': isAr ? 'كيف نعمل - آلية التأسيس' : 'How We Work - Instant Grow LLC',
          'description': 'Operational workflow of business formation, filings, and compliance support.',
        },
      ],
    })

    injectBreadcrumb([
      { name: isAr ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isAr ? 'من نحن' : 'About', url: getCanonical('/about') },
      { name: isAr ? 'كيف نعمل' : 'How We Work', url: getCanonical('/how-we-work') },
    ])
  }, [lang, isAr])

  const steps = [
    {
      step: '01',
      titleEn: 'Application Review & KYC Verification',
      titleAr: 'مراجعة الطلب والتحقق من الهوية (KYC)',
      handlerEn: 'Conducted 100% In-House by Instant Grow',
      handlerAr: 'يتم بالكامل داخلياً بواسطة فريق Instant Grow',
      descEn:
        'Our in-house compliance team verifies your proposed company name across state databases, screens required passport/ID documentation under international AML guidelines, and formats your legal filing data.',
      descAr:
        'يقوم فريق الامتثال الداخلي لدينا بالتحقق من توفر اسم شركتك في سجلات الولاية، ومراجعة وثائق الهوية طبقاً لمعايير مكافحة غسيل الأموال الدولية، وتجهيز ملف التأسيس القانوني.',
    },
    {
      step: '02',
      titleEn: 'Articles of Organization & State Filing',
      titleAr: 'إيداع عقد التأسيس لدى الولاية (SOS)',
      handlerEn: 'In-House & Authorized Licensed Registered Agent Partners',
      handlerAr: 'فريقنا بالتعاون مع وكلاء مسجلين مرخصين ومكاتب معتمدة',
      descEn:
        'Filings are lodged directly with the state division of corporations (e.g., Wyoming Secretary of State or Delaware Division of Corporations). We coordinate with licensed commercial Registered Agents residing in the state to provide physical address statutory compliance.',
      descAr:
        'يتم إيداع وثائق التأسيس رسمياً لدى سكرتير الولاية (مثل Wyoming SOS أو Delaware Division of Corporations). نتعاون مع وكلاء مسجلين معتمدين داخل الولاية لتوفير العنوان القانوني المعتمد واستلام الإخطارات الحكومية.',
    },
    {
      step: '03',
      titleEn: 'IRS Form SS-4 & Federal EIN Acquisition',
      titleAr: 'تقديم نموذج SS-4 واستخراج الرقم الضريبي الفيدرالي EIN',
      handlerEn: 'Prepared & Managed In-House via Direct IRS Communication',
      handlerAr: 'إعداد ومتابعة مباشرة داخلياً عبر الفاكس والاتصال مع مصلحة الضرائب الأمريكية (IRS)',
      descEn:
        'For non-US residents without a Social Security Number (SSN), we prepare IRS Form SS-4 with Third Party Designee authorization and transmit it to the IRS non-resident processing unit via dedicated secure fax lines, tracking progress until the official CP 575 Notice is issued.',
      descAr:
        'بالنسبة لغير المقيمين الذين لا يحملون رقماً تأمينياً (SSN)، نقوم بصياغة نموذج SS-4 مع تفويض رسمي وإرساله لوحدة معالجة غير المقيمين في مصلحة الضرائب الأمريكية عبر خطوط الفاكس المعتمدة، مع المتابعة حتى صدور إشعار CP 575.',
    },
    {
      step: '04',
      titleEn: 'Operating Agreement & Banking Onboarding',
      titleAr: 'صياغة اتفاقية التشغيل والتأهيل المصرفي',
      handlerEn: 'Custom Templates Provided + Direct Partner Handoff',
      handlerAr: 'نماذج مخصصة وتسليم مباشر للشركاء المصرفيين',
      descEn:
        'We supply state-tailored Operating Agreements and Banking Resolutions. We provide direct onboarding links and preparation checklists for our fintech banking partners (such as Mercury, Relay, and Wise Business) where account approval rests with each regulated financial institution.',
      descAr:
        'نزودك باتفاقية تشغيل مخصصة وقرار بنكي معتمد. نوفر روابط تقديم مباشرة وقوائم تدقيق لشركائنا في البنوك الرقمية (مثل Mercury و Relay و Wise) علماً بأن قرار فتح الحساب يخضع للوائح المؤسسة المالية نفسها.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="flex-1 pt-24 pb-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0a1435] to-slate-900 rounded-3xl p-8 md:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/30 uppercase tracking-wider">
              <Building size={14} />
              {isAr ? 'الشفافية الكاملة في التأسيس' : '100% Operational Transparency'}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {isAr
                ? 'كيف نعمل: من يقوم بالتأسيس والامتثال؟'
                : 'How We Work: Who Files Your Documents'}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {isAr
                ? 'نوضح لك بالتفصيل خطوة بخطوة ما يتم تنفيذه داخلياً في Instant Grow LLC وما يتم بالتعاون مع الوكلاء المسجلين والجهات الحكومية الرسمية.'
                : 'A transparent breakdown of our in-house capabilities, our licensed registered agent network, and our direct filing procedures with state and federal authorities.'}
            </p>
          </div>
        </div>

        {/* Beware of Similar Names Security Notice */}
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-6 md:p-8 flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-amber-900">
              {isAr ? 'تنبيه أمني: احذر من المواقع ذات الأسماء المشابهة' : 'Security Alert: Beware of Similar Domain Names'}
            </h2>
            <p className="text-sm text-amber-950 leading-relaxed">
              {isAr
                ? 'يرجى العلم بأن موقعنا الرسمي والوحيد هو instantgrow.net. توجد نطاقات ومواقع أخرى غير مرتبطة بنا إطلاقاً مثل instantgrow.org أو instantgrow.cc. تتم جميع معاملاتنا الرسمية وفواتيرنا وتأكيدات الطلبات حصرياً عبر نطاق instantgrow.net وعبر بريدنا الرسمي support@instantgrow.net.'
                : 'Our official domain and platform is instantgrow.net. Unrelated third-party websites with similar names exist on the web (such as instantgrow.org or instantgrow.cc) that have NO affiliation with Instant Grow LLC. All authentic customer communications, invoices, and filing updates are issued solely from @instantgrow.net and support@instantgrow.net.'}
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {isAr ? 'مراحل التأسيس والمسؤوليات' : 'The 4-Stage Filing Process'}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {isAr
                ? 'فصل واضح ودقيق بين العمل الداخلي والشراكات المعتمدة'
                : 'Clear delineation of what happens in-house vs. through licensed registered agent partners'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((st, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-blue-600/30 font-mono">{st.step}</span>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {isAr ? st.handlerAr : st.handlerEn}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isAr ? st.titleAr : st.titleEn}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isAr ? st.descAr : st.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Authority Links & Non-Legal Advice Disclaimer */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">
              {isAr ? 'روابط الجهات الرسمية والتنويه القانوني' : 'Official Government Sources & Legal Disclaimer'}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'Instant Grow LLC شركة خدمات تأسيس وإيداع إدارية، وليست مكتب محاماة أو محاسبة قانونية.'
                : 'Instant Grow LLC is a corporate formation filing service, not a law firm or CPA. Information provided is for informational purposes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <a
              href="https://www.irs.gov/businesses/small-businesses-self-employed/how-to-apply-for-an-ein"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-white">IRS.gov</p>
                <p className="text-slate-400 text-[11px] mt-0.5">EIN Application Rules</p>
              </div>
              <ExternalLink size={14} className="text-slate-400" />
            </a>

            <a
              href="https://sos.wyo.gov/Business/Business.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-white">Wyoming SOS</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Business Division</p>
              </div>
              <ExternalLink size={14} className="text-slate-400" />
            </a>

            <a
              href="https://corp.delaware.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-white">Delaware Div. of Corp</p>
                <p className="text-slate-400 text-[11px] mt-0.5">State SOS Portal</p>
              </div>
              <ExternalLink size={14} className="text-slate-400" />
            </a>

            <a
              href="https://www.gov.uk/government/organisations/companies-house"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-semibold text-white">Companies House UK</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Official Registrar</p>
              </div>
              <ExternalLink size={14} className="text-slate-400" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
