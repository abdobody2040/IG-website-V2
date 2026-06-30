import { useLang } from '../../i18n/LanguageContext'

export function AuthPanel() {
  const { t, isRTL, toggleLang } = useLang()
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0a0f1e 0%, #0d1635 50%, #0a1840 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1a56ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1a56ff 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(#1a56ff 1px, transparent 1px), linear-gradient(90deg, #1a56ff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <img src="/logo.png" alt="Instant Grow" className="h-10 w-auto" />
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white/50">
          <span className={`cursor-pointer select-none hover:text-white transition-colors ${!isRTL ? 'text-white' : ''}`} onClick={() => { if (isRTL) toggleLang() }}>EN</span>
          <span className="text-white/20">|</span>
          <span className={`cursor-pointer select-none hover:text-white transition-colors ${isRTL ? 'text-white' : ''}`} onClick={() => { if (!isRTL) toggleLang() }}>AR</span>
        </span>
      </div>

      <div className="relative z-10 space-y-4">
        <h2
          className="text-4xl font-bold text-white leading-tight"
          style={{ fontFamily: 'Sora, Inter, sans-serif' }}
        >
          {t.auth.launchLLC}
          <br />
          <span style={{ color: '#1a56ff' }}>{t.auth.inMinutes}</span>
          <br />
          {t.auth.notWeeks}
        </h2>
        <p className="text-slate-400 text-base leading-relaxed max-w-xs">
          {t.auth.panelDesc}
        </p>
      </div>

      <div className="relative z-10 space-y-3">
        <StatBadge emoji="🚀" label={t.auth.llcsFormed} value="24,800+" />
        <StatBadge emoji="⚡" label={t.auth.avgFormationTime} value="Under 24 hrs" />
        <StatBadge emoji="⭐" label={t.auth.customerRating} value="4.9 / 5.0" />
      </div>
    </div>
  )
}

function StatBadge({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="text-slate-400 text-xs">{label}</p>
        <p className="text-white font-semibold text-sm">{value}</p>
      </div>
    </div>
  )
}
