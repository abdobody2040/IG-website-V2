import { useState, useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Gift, Lock, CheckCircle, ExternalLink, Copy, ChevronRight,
  Star, Building2, Loader2, RefreshCw, Search, Sparkles, ChevronLeft,
  Tag
} from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useAuth } from '../../hooks/useAuth'
import { useCompanies } from '../../hooks/useCompanies'
import { usePerks, PerkRecord } from '../../hooks/usePerks'
import { useLang } from '../../i18n/LanguageContext'

// ── Perk Card Component ────────────────────────────────────────────────────

interface PerkCardProps {
  perk: PerkRecord
  isRTL: boolean
}

function PerkCard({ perk, isRTL }: PerkCardProps) {
  const [copied, setCopied] = useState(false)
  const [codeRevealed, setCodeRevealed] = useState(false)
  const [imgError, setImgError] = useState(false)

  const title = isRTL ? (perk.title_ar || perk.title_en) : perk.title_en
  const description = isRTL ? (perk.description_ar || perk.description_en) : perk.description_en
  const ctaLabel = isRTL ? (perk.cta_label_ar || perk.cta_label_en || 'Claim Perk') : (perk.cta_label_en || 'Claim Perk')
  const badge = perk.badge_en || perk.category || 'Member Perk'

  const handleCopyCode = () => {
    if (!perk.promo_code) return
    void navigator.clipboard.writeText(perk.promo_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1">
      {/* Card header strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${perk.color || '#1a56ff'}, #7c3aed)` }}
      />

      <div className="p-5 flex flex-col flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Logo & Category Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm p-1.5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
            {perk.logo_url && !imgError ? (
              <img
                src={perk.logo_url}
                alt={perk.partner_name || perk.title_en}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: perk.bg_color || '#e8efff', color: perk.color || '#1a56ff' }}
              >
                <Gift size={18} />
              </div>
            )}
          </div>

          {badge && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[170px]">
              {badge}
            </span>
          )}
        </div>

        {/* Partner name */}
        {perk.partner_name && (
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            {perk.partner_name}
          </p>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2 min-h-[2.75rem]">
          {title}
        </h3>

        {/* Discount / Value Label */}
        {perk.discount_label && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mb-3 self-start bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <Star size={12} className="text-emerald-500 fill-emerald-500" />
            {perk.discount_label}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3">
            {description}
          </p>
        )}

        {/* Promo code */}
        {perk.promo_code && (
          <div className="mb-4">
            {!codeRevealed ? (
              <button
                onClick={() => setCodeRevealed(true)}
                className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-600 hover:border-[#1a56ff] hover:text-[#1a56ff] transition-colors font-semibold"
              >
                <Tag size={13} />
                {isRTL ? 'إظهار رمز الخصم' : 'Click to reveal promo code'}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs font-bold text-slate-900 tracking-wider text-center">
                  {perk.promo_code}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex-shrink-0 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <CheckCircle size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} className="text-slate-600" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        {perk.cta_url ? (
          <a
            href={perk.cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all bg-[#1a56ff] hover:bg-blue-700 shadow-sm hover:shadow mt-auto"
          >
            {ctaLabel}
            <ExternalLink size={13} />
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-100 mt-auto">
            {ctaLabel}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Locked Gate ──────────────────────────────────────────────────────────

interface LockedGateProps {
  isRTL: boolean
}

function LockedGate({ isRTL }: LockedGateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-2xl mx-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1a56ff] to-[#7c3aed] flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <Lock size={36} className="text-white" />
        </div>
        <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#1a56ff]/20 to-[#7c3aed]/20 blur-xl -z-10" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#1a56ff] mb-3">
        <Sparkles size={13} />
        {isRTL ? '$1.5M+ في مزايا الشركات والخصومات' : '$1.5M+ in Startup Perks & Credits'}
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
        {isRTL ? 'مزايا الأعضاء حصرية' : 'Member Perks — Exclusive Founder Access'}
      </h2>
      <p className="text-slate-500 text-sm leading-relaxed mb-6">
        {isRTL
          ? 'تصبح مزايا الأعضاء وخصومات الشركاء (ChatGPT، AWS، GitHub، Cloudflare، Stripe والمزيد) متاحة فور تأكيد تأسيس شركتك.'
          : 'Member Perks unlock once your company formation is confirmed. Get access to 800+ exclusive deals and startup credits from AWS, GitHub, Google, Stripe, and more.'
        }
      </p>

      {/* Steps */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm w-full max-w-md mb-8 text-left" dir="ltr">
        {[
          { icon: Building2, label: 'Submit company formation order' },
          { icon: CheckCircle, label: 'Admin confirms your active company' },
          { icon: Gift, label: 'Instant access to 800+ member perks!' },
        ].map((step, i) => {
          const Icon = step.icon
          return (
            <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-100 last:border-0">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1a56ff] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                {i + 1}
              </div>
              <Icon size={16} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-700 font-medium text-xs">{step.label}</span>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-3 justify-center">
        <Link
          to="/client/company"
          className="flex items-center gap-2 px-6 py-3 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Building2 size={16} />
          {isRTL ? 'عرض حالة شركتي' : 'View My Company Status'}
          <ChevronRight size={14} />
        </Link>
        <Link
          to="/client/dashboard"
          className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
        >
          {isRTL ? 'العودة للرئيسية' : 'Back to Dashboard'}
        </Link>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 24

export default function ClientPerksPage() {
  const location = useLocation()
  const { user } = useAuth()
  const { isRTL } = useLang()
  const { companies, isLoading: companiesLoading } = useCompanies(user?.id)
  const { perks, loading: perksLoading, refresh } = usePerks()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Gate: user must have at least one company with status 'active' or 'completed'
  const hasActiveCompany = companies.some(c => c.status === 'active' || c.status === 'completed')
  const isLoading = companiesLoading || perksLoading

  // Active perks list
  const activePerks = useMemo(() => perks.filter(p => p.active), [perks])

  // Extract categories and sort by count
  const categoryList = useMemo(() => {
    const counts: Record<string, number> = {}
    activePerks.forEach(p => {
      const cat = p.category || 'Other Software'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [activePerks])

  // Filtered perks
  const filteredPerks = useMemo(() => {
    const q = search.trim().toLowerCase()
    return activePerks.filter(p => {
      const matchCat = selectedCategory === 'all' || (p.category || 'Other Software') === selectedCategory
      if (!matchCat) return false
      if (!q) return true
      return (
        p.title_en?.toLowerCase().includes(q) ||
        p.partner_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.discount_label?.toLowerCase().includes(q) ||
        p.description_en?.toLowerCase().includes(q)
      )
    })
  }, [activePerks, selectedCategory, search])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPerks.length / ITEMS_PER_PAGE))
  const paginatedPerks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPerks.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPerks, currentPage])

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  return (
    <ClientLayout currentPath={location.pathname} title={isRTL ? 'مزايا الأعضاء والشركاء' : 'Member Perks & Credits'}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-[#1a56ff]" />
        </div>
      ) : !hasActiveCompany ? (
        <LockedGate isRTL={isRTL} />
      ) : (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0a0f1e] to-[#1e1b4b] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-blue-300 mb-3">
                <Sparkles size={12} className="text-yellow-400" />
                {isRTL ? 'عضو مؤسس معتمد' : 'Verified Founder Privilege'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {isRTL ? 'مزايا وخصومات الشركات الشريكة' : 'Founder Perks & Startup Software Credits'}
              </h1>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                {isRTL
                  ? `أكثر من ${activePerks.length} ميزة حصرية وأرصدة سحابية بقيمة تفوق 1.5 مليون دولار لمساعدتك على نمو شركتك.`
                  : `Browse over ${activePerks.length} exclusive perks, startup credits, and partner discounts worth $1.5M+ to accelerate your new business.`
                }
              </p>
            </div>
            {/* Background decoration */}
            <div className="absolute right-0 top-0 -bottom-10 w-96 bg-gradient-to-l from-blue-600/20 to-transparent blur-3xl -z-0 pointer-events-none" />
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث عن ميزة، شريك، أو أداة (مثل OpenAI, AWS, Stripe)...' : 'Search by tool, partner, or deal (e.g. OpenAI, AWS, Stripe)...'}
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 transition-colors"
                />
              </div>

              {/* Refresh button */}
              <button
                onClick={() => void refresh()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
              >
                <RefreshCw size={14} />
                {isRTL ? 'تحديث المزايا' : 'Refresh Deals'}
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#1a56ff] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isRTL ? 'كل المزايا' : 'All Deals'} ({activePerks.length})
              </button>
              {categoryList.map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#1a56ff] text-white shadow-sm font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results count banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <p>
              {isRTL
                ? `عرض ${paginatedPerks.length} من أصل ${filteredPerks.length} ميزة`
                : `Showing ${paginatedPerks.length} of ${filteredPerks.length} deals`
              }
              {selectedCategory !== 'all' && (
                <span className="font-semibold text-slate-700 ml-1">in {selectedCategory}</span>
              )}
            </p>
            {totalPages > 1 && (
              <p>
                {isRTL ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
              </p>
            )}
          </div>

          {/* Perks Grid */}
          {filteredPerks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {isRTL ? 'لم يتم العثور على نتائج' : 'No perks matched your criteria'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {isRTL
                  ? 'جرب البحث بكلمات أخرى أو اختر فئة مختلفة.'
                  : 'Try searching for a different keyword or reset the category filter.'
                }
              </p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); setCurrentPage(1) }}
                className="px-4 py-2 bg-[#1a56ff] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                {isRTL ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginatedPerks.map(perk => (
                <PerkCard key={perk.id} perk={perk} isRTL={isRTL} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 pb-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                {isRTL ? 'السابق' : 'Previous'}
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#1a56ff] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center gap-1"
              >
                {isRTL ? 'التالي' : 'Next'}
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Footer note */}
          <p className="text-xs text-slate-400 text-center pb-4">
            {isRTL
              ? 'تخضع جميع المزايا والأرصدة لشروط وأحكام كل مزود خدمة. للمساعدة، تواصل مع فريق الدعم.'
              : 'All perks, software credits, and promotional codes are subject to provider terms and availability.'
            }
          </p>
        </div>
      )}
    </ClientLayout>
  )
}
