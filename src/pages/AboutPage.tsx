import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Building2, ShieldCheck, Globe, Award, CheckCircle2, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, injectJsonLd, getCanonical, generateOrganizationSchema } from '../lib/seo'

export default function AboutPage() {
  const { lang } = useLang()

  useEffect(() => {
    setPageMeta({
      title: 'About Instant Grow | Global Business Formation & LLC Registration',
      description: 'Learn about Instant Grow. We help global entrepreneurs launch US LLC, UK LTD, and UAE business entities remotely with full compliance.',
      canonical: getCanonical('/about'),
      lang
    })

    injectJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        generateOrganizationSchema(),
        {
          '@type': 'AboutPage',
          '@id': 'https://instantgrow.net/about#webpage',
          'url': 'https://instantgrow.net/about',
          'name': 'About Instant Grow',
          'description': 'Global business formation platform empowering 24,000+ entrepreneurs to launch US LLCs and UK LTD companies remotely.'
        }
      ]
    })
  }, [lang])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30 uppercase tracking-wider">
              About Instant Grow
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Empowering Global Entrepreneurs to Form US & UK Companies Remotely
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Instant Grow simplifies business incorporation for non-US residents and global founders. From state registration to IRS EIN tax IDs, registered agent services, and business bank account guidance.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Companies Formed', value: '24,000+', icon: Building2, color: 'text-blue-600 bg-blue-50' },
            { label: 'Countries Served', value: '140+', icon: Globe, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Customer Satisfaction', value: '99.4%', icon: Award, color: 'text-amber-600 bg-amber-50' },
            { label: 'Registered Agent Support', value: '24/7', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Our Mission Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Why Founders Choose Instant Grow</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Incorporating a company internationally used to require expensive lawyers, complex paperwork, and physical travel. Instant Grow eliminates these barriers by offering transparent, fixed-fee company formation online.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 font-semibold">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                Fast 3-5 day US state filing with Delaware, Wyoming & Florida
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                Direct IRS EIN processing for non-US residents
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                1-year registered agent & US business mailing address included
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                Stripe, Mercury & Wise payment setup support
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/order"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a56ff] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                Form Your Company Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Our Core Services</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900">US LLC Formation (Wyoming / Delaware)</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Articles of organization, Operating Agreement, EIN & Registered Agent.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900">UK LTD Incorporation</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Companies House filing, registered office, UTR tax number & Wise support.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900">Compliance & BOI Filings</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">FinCEN BOI report filing, annual reports, tax compliance guidance.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
