import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { ShieldCheck, Users, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, injectJsonLd, injectBreadcrumb, getCanonical, generateOrganizationSchema } from '../lib/seo'

interface TeamMember {
  name: string
  role: string
  bioEn: string
  bioAr: string
  linkedinUrl: string
  imagePlaceholder: string
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: '[FOUNDER_NAME]',
    role: 'Founder & Managing Director',
    bioEn: 'Leads strategic growth, global partnerships, and corporate compliance infrastructure.',
    bioAr: 'يقود النمو الاستراتيجي، الشراكات العالمية، وبنية الامتثال المؤسسي.',
    linkedinUrl: '[FOUNDER_LINKEDIN_URL]',
    imagePlaceholder: 'FN',
  },
  {
    name: '[COMPLIANCE_LEAD_NAME]',
    role: 'Head of Legal Compliance & State Filings',
    bioEn: 'Oversees state SOS document filings, registered agent network, and regulatory adherence.',
    bioAr: 'يشرف على إيداع وثائق الشركات لدى الولايات وشبكة الوكلاء المسجلين والامتثال التنظيمي.',
    linkedinUrl: '[COMPLIANCE_LEAD_LINKEDIN_URL]',
    imagePlaceholder: 'CL',
  },
  {
    name: '[FORMATION_SPECIALIST_NAME]',
    role: 'Senior Formation & Tax Specialist',
    bioEn: 'Specializes in non-resident IRS Form SS-4 EIN processing, Operating Agreements, and banking compliance.',
    bioAr: 'متخصص في استخراج الرقم الضريبي الفيدرالي لغير المقيمين وصياغة الاتفاقيات التشغيلية ومتطلبات البنوك.',
    linkedinUrl: '[FORMATION_SPECIALIST_LINKEDIN_URL]',
    imagePlaceholder: 'FS',
  },
  {
    name: '[SUPPORT_MANAGER_NAME]',
    role: 'Client Success & Onboarding Lead',
    bioEn: 'Ensures smooth post-formation handoffs, document delivery, and verified client assistance.',
    bioAr: 'يضمن تسليم الوثائق بسلاسة وإرشاد العملاء بعد التأسيس والدعم المستمر.',
    linkedinUrl: '[SUPPORT_MANAGER_LINKEDIN_URL]',
    imagePlaceholder: 'SM',
  },
]

export default function TeamPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => {
    setPageMeta({
      title: isAr
        ? 'فريق العمل | Instant Grow LLC'
        : 'Our Team | Leadership & Formation Specialists | Instant Grow LLC',
      description: isAr
        ? 'تعرف على فريق Instant Grow المتخصص في تأسيس الشركات الأمريكية والبريطانية والامتثال الدولي.'
        : 'Meet the leadership and compliance team at Instant Grow LLC. Experienced formation specialists supporting cross-border founders.',
      canonical: getCanonical('/team'),
      lang,
    })

    injectJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        {
          '@type': 'AboutPage',
          '@id': 'https://instantgrow.net/team#webpage',
          'url': 'https://instantgrow.net/team',
          'name': isAr ? 'فريق Instant Grow' : 'Instant Grow Team',
          'description': 'Meet the team behind Instant Grow LLC.',
        },
      ],
    })

    injectBreadcrumb([
      { name: isAr ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isAr ? 'من نحن' : 'About', url: getCanonical('/about') },
      { name: isAr ? 'فريق العمل' : 'Our Team', url: getCanonical('/team') },
    ])
  }, [lang, isAr])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <main className="flex-1 pt-24 pb-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0B1536] to-slate-900 rounded-3xl p-8 md:p-14 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30 uppercase tracking-wider">
              <Users size={14} />
              {isAr ? 'الشفافية والمصداقية' : 'Transparency & Leadership'}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {isAr
                ? 'فريق العمل المتخصص في تأسيس الشركات الدولية'
                : 'The Team Behind Instant Grow LLC'}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {isAr
                ? 'فريق من المتخصصين في تأسيس الشركات، الامتثال الضريبي لغير المقيمين، والتأهيل المصرفي لدعم رواد الأعمال حول العالم.'
                : 'Our dedicated team operates across corporate filings, IRS tax documentation, and client success to empower founders worldwide.'}
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                {/* Avatar Placeholder */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  {member.imagePlaceholder}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">{member.name}</h2>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">{member.role}</p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isAr ? member.bioAr : member.bioEn}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={member.linkedinUrl.startsWith('http') ? member.linkedinUrl : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                  title="LinkedIn Profile"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                  Verified Team
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* How We Operate & Partner Notice */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isAr ? 'كيف نعمل ونقدم خدماتنا' : 'Operational Transparency & Partner Network'}
              </h2>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'معايير عمل واضحة لضمان الدقة والسرعة القانونية'
                  : 'Clear operational separation between in-house preparation and authorized statutory filings'}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {isAr
              ? 'تتولى Instant Grow LLC إعداد المستندات والتحقق من الهوية وصياغة الاتفاقيات التشغيلية والتواصل مع مصلحة الضرائب الأمريكية (IRS). لإيداع المستندات لدى جهات الدولة الرسمية (Secretary of State) وتوفير الوكيل المسجل (Registered Agent)، نتعاون مع وكلاء مسجلين مرخصين ومكاتب معتمدة في ولايات وايومنغ، ديلاوير، ونيومكسيكو.'
              : 'Instant Grow LLC handles onboarding, identity verification, operating agreement customization, and direct IRS SS-4 filing preparation in-house. For state Secretary of State statutory submissions and physical commercial registered office addresses, we collaborate directly with licensed, certified registered agent partners in Wyoming, Delaware, and New Mexico.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <Link
              to="/how-we-work"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <span>{isAr ? 'قراءة تفاصيل دورة العمل' : 'Read Our Full Filing Workflow'}</span>
              <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-800 text-xs font-semibold px-5 py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <span>{isAr ? 'تواصل مع الفريق' : 'Contact Support'}</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
