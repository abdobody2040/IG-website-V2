import { Mail } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

export default function Footer() {
  const { t } = useLang()
  const f = t.footer

  return (
    <footer className="bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Subtle grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating glow orb at bottom right */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Instant Grow" className="h-7 w-auto brightness-0 invert opacity-90" />
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              {f.tagline}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:info@instantgrow.net"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition-colors border border-white/5"
                title="Email us"
              >
                <Mail size={16} className="text-white/50" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61577661225593"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition-colors border border-white/5"
                title="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/50">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white/80 mb-4 text-sm">{f.companyHeading}</h4>
            <ul className="space-y-3">
              {f.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-sm hover:text-white transition-colors relative inline-block group/link">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white/80 mb-4 text-sm">{f.servicesHeading}</h4>
            <ul className="space-y-3">
              {f.services.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-sm hover:text-white transition-colors relative inline-block group/link">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white/80 mb-4 text-sm">{f.legalHeading}</h4>
            <ul className="space-y-3">
              {f.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-sm hover:text-white transition-colors relative inline-block group/link">
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
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
