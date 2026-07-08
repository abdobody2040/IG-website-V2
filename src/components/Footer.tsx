import { useLang } from '../i18n/LanguageContext'

export default function Footer() {
  const { t, lang, setLang } = useLang()
  const f = t.footer

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <li>
      <a
        href={href}
        className="text-white/50 text-[15px] hover:text-white transition-colors relative inline-block group/link"
      >
        {children}
        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-blue-400 transition-all duration-300 group-hover/link:w-full" />
      </a>
    </li>
  )

  const socialLinks = [
    { 
      title: 'Facebook', 
      href: 'https://www.facebook.com/profile.php?id=61577661225593',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    },
    { 
      title: 'Twitter', 
      href: '#',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    { 
      title: 'LinkedIn', 
      href: '#',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      )
    },
    { 
      title: 'Instagram', 
      href: 'https://instagram.com/instantgrow',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      )
    },
    { 
      title: 'YouTube', 
      href: '#',
      svg: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    },
  ]

  return (
    <footer className="bg-[#070C1E] text-white relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-60 h-60 bg-cyan-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 pt-20 pb-10">
        
        {/* Main 5 columns grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 mb-16 text-center sm:text-left rtl:sm:text-right justify-items-center sm:justify-items-start">
          
          {/* Column 1 — Brand info */}
          <div className="flex flex-col items-center sm:items-start">
            
            {/* White Logo */}
            <div className="flex items-center gap-3.5 mb-5 select-none">
              <div className="w-12 h-12 overflow-hidden relative shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Instant Grow" 
                  className="h-12 max-w-none absolute left-0 top-0 brightness-0 invert" 
                  style={{ width: 'auto' }} 
                  onError={() => {}} 
                />
              </div>
              <div className="flex flex-col text-left leading-none font-bold">
                <span className="text-white text-[15px] font-extrabold tracking-wider uppercase" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>Instant</span>
                <span className="text-white text-[15px] font-extrabold tracking-wider uppercase" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>Grow</span>
              </div>
            </div>

            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-[260px] text-center sm:text-left rtl:sm:text-right">
              {f.tagline}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((s, i) => (
                <a 
                  key={i} 
                  href={s.href} 
                  title={s.title}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center hover:bg-blue-600/10 hover:border-white/20 transition-all text-white/50 hover:text-white"
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Services */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-white/80 mb-5 text-sm uppercase tracking-wider">{f.servicesHeading}</h4>
            <ul className="space-y-3.5 text-center sm:text-left rtl:sm:text-right">
              {f.services.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-white/80 mb-5 text-sm uppercase tracking-wider">{f.companyHeading}</h4>
            <ul className="space-y-3.5 text-center sm:text-left rtl:sm:text-right">
              {f.company.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* Column 4 — Resources */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-white/80 mb-5 text-sm uppercase tracking-wider">{f.resourcesHeading}</h4>
            <ul className="space-y-3.5 text-center sm:text-left rtl:sm:text-right">
              {f.resources.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* Column 5 — Legal */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="font-bold text-white/80 mb-5 text-sm uppercase tracking-wider">{f.legalHeading}</h4>
            <ul className="space-y-3.5 text-center sm:text-left rtl:sm:text-right">
              {f.legal.map((link) => (
                <NavLink key={link.label} href={link.href}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider + Bottom bar */}
        <div className="border-t border-white/5 pt-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <p className="text-white/30 text-sm">
                {f.copyright.replace('{year}', String(new Date().getFullYear()))}
              </p>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-2 border-l border-white/10 pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
                <button 
                  onClick={() => setLang('en')} 
                  className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${lang === 'en' ? 'text-white bg-blue-600' : 'text-white/40 hover:text-white'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('ar')} 
                  className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${lang === 'ar' ? 'text-white bg-blue-600' : 'text-white/40 hover:text-white'}`}
                >
                  العربية
                </button>
              </div>
            </div>
            
            <p className="text-white/20 text-xs max-w-xl text-center sm:text-right rtl:sm:text-left leading-relaxed">
              {f.disclaimer}
            </p>
          </div>
        </div>
      </div>

    </footer>
  )
}
