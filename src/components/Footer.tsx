import { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import TransparentMascot from './TransparentMascot'

export default function Footer() {
  const { t, lang, setLang } = useLang()
  const f = t.footer
  const isAr = lang === 'ar'
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <li>
      <a
        href={href}
        className="text-white/40 text-[15px] hover:text-white transition-colors relative inline-block group/link"
      >
        {children}
        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
      </a>
    </li>
  )

  return (
    <footer className="bg-[#070c18] text-white relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-60 h-60 bg-cyan-500/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Main grid: 5 columns on desktop, 3 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-12 lg:gap-14 mb-14 text-center sm:text-left justify-items-center sm:justify-items-start">

          {/* 1 — Brand */}
          <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Instant Grow" className="h-8 w-auto brightness-0 invert opacity-90" onError={() => {}} />
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-[260px]">
              {f.tagline}
            </p>
            {/* Social icons */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-6">
              <a href="mailto:info@instantgrow.net" title="Email"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-500/20 border border-white/5 transition-colors">
                <Mail size={15} className="text-white/50" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61577661225593" target="_blank" rel="noopener noreferrer" title="Facebook"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-500/20 border border-white/5 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-white/50">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" title="WhatsApp"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-green-500/20 border border-white/5 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-white/50">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.998 2C6.478 2 2 6.478 2 12c0 1.852.502 3.587 1.38 5.076L2.006 22l5.074-1.357A9.957 9.957 0 0012 22c5.52 0 9.998-4.478 9.998-10S17.518 2 11.998 2z" />
                </svg>
              </a>
              <a href="https://instagram.com/instantgrow" target="_blank" rel="noopener noreferrer" title="Instagram"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-pink-500/20 border border-white/5 transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>

            {/* Small mascot */}
            <TransparentMascot
              src="/mascot-footer.png"
              alt=""
              className="w-20 h-auto opacity-60 mt-2"
            />
          </div>

          {/* 2 — Services */}
          <div>
            <h4 className="font-semibold text-white/80 mb-6 text-sm uppercase tracking-wider">{f.servicesHeading}</h4>
            <ul className="space-y-4">
              {f.services.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* 3 — Company */}
          <div>
            <h4 className="font-semibold text-white/80 mb-6 text-sm uppercase tracking-wider">{f.companyHeading}</h4>
            <ul className="space-y-4">
              {f.company.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* 4 — Legal */}
          <div>
            <h4 className="font-semibold text-white/80 mb-6 text-sm uppercase tracking-wider">{f.legalHeading}</h4>
            <ul className="space-y-4">
              {f.legal.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* 5 — Newsletter */}
          <div>
            <h4 className="font-semibold text-white/80 mb-6 text-sm uppercase tracking-wider">
              {isAr ? 'النشرة البريدية' : 'Newsletter'}
            </h4>
            <p className="text-white/40 text-xs leading-relaxed mb-4">
              {isAr
                ? 'احصل على آخر أخبار تأسيس الشركات والنصائح المهنية.'
                : 'Get the latest company formation news and expert tips.'}
            </p>
            {subscribed ? (
              <p className="text-emerald-400 text-sm font-medium">
                {isAr ? '✓ تم الاشتراك بنجاح!' : '✓ Subscribed! Thank you.'}
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAr ? 'بريدك الإلكتروني' : 'your@email.com'}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-12 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors w-full"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-3.5 h-12 rounded-xl hover:bg-blue-50 transition-colors w-full"
                >
                  {isAr ? 'اشترك' : 'Subscribe'}
                  <ArrowRight size={13} />
                </button>
              </form>
            )}

            {/* Language switcher */}
            <div className="mt-6 flex flex-col items-center sm:items-start">
              <p className="text-white/30 text-xs mb-2 uppercase tracking-wider">
                {isAr ? 'اللغة' : 'Language'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLang('en')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    lang === 'en' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    lang === 'ar' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  AR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider + Bottom bar */}
        <div className="border-t border-white/5 pt-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-white/30 text-sm text-center sm:text-left">
              {f.copyright.replace('{year}', String(new Date().getFullYear()))}
            </p>
            <p className="text-white/20 text-xs max-w-xl text-center sm:text-right leading-relaxed">
              {f.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
