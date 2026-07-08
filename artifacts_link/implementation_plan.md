# Mobile-First Responsive Redesign — Instant Grow

## Overview
Full mobile-first responsive audit and rebuild across all public-facing components. The goal is a premium SaaS experience comparable to Stripe/Linear/Vercel on every device from 320px to 1920px+.

## Audit Findings

### Critical Issues Found
| Component | Problem |
|---|---|
| `index.css` `.ig-section` | Mobile padding only 12px — far too tight. No proper section spacing scale. |
| `Hero.tsx` | Right column SVG map has fixed-height container (560px) — breaks on mobile. No single-column reflow. Typography not responsive. |
| `Services.tsx` | `xl:grid-cols-5` cards become very narrow on tablet. `px-8 py-9` padding too large on mobile. |
| `Features.tsx` | `px-8 py-9` on mobile creates cramped/overflowing cards. Icon size fixed at 56px. |
| `Reviews.tsx` | Cards are `w-[360px] flex-shrink-0` — causes horizontal overflow on mobile. |
| `FAQ.tsx` | `px-8 py-6` button padding — text clips on 320px screens. Title `text-[54px]` far too large for mobile. |
| `HowItWorks.tsx` | 4-col grid collapses to 1 on mobile but connector arrows still try to render. Mascot hidden correctly. |
| `CTASection.tsx` | Mascot image has no max-width cap — can overflow. Buttons stack but have no `w-full` on mobile. |
| `Footer.tsx` | 5-col grid — OK but text sizes need responsive scale. |
| `TrustLogos.tsx` | Marquee items have `minWidth: 80` hard-coded and `gap-12` — too wide on mobile. |
| `Navbar.tsx` | Mobile drawer is good but hamburger z-index needs check. Height `h-[80px]` fine. |
| `Pricing.tsx` | Need to audit (large file, likely has fixed widths). |
| `ComparisonTable.tsx` | Table almost certainly overflows on mobile — needs horizontal scroll wrapper. |

### Root Cause Summary
1. **No consistent responsive typography scale** — headings jump from 54px directly with only `sm:` modifier
2. **`.ig-section` padding starts too small** (12px mobile) with no intermediate breakpoint
3. **Card padding hardcoded** at `px-8 py-9` (32px × 36px) — should be `px-5 py-6 sm:px-8 sm:py-9`
4. **SVG world map** in Hero has no mobile fallback — needs min-height collapse + single-column
5. **Review cards** have `w-[360px]` fixed width inside marquee — fine for infinite scroll but marquee needs `overflow-hidden` guard on section

## Proposed Changes

---

### 1. Global CSS (`index.css`)

#### [MODIFY] [index.css](file:///g:/Vibe%20coding/IG%20website%20V2/src/index.css)
- Add `overflow-x: hidden` to `html, body` to prevent horizontal scroll
- Fix `.ig-section` spacing scale: mobile 64px, tablet 80px, desktop 120px
- Add responsive container utility `.ig-container` with proper padding per breakpoint
- Add `prefers-reduced-motion` rule to disable heavy animations
- Fix base `font-size` for mobile (16px base)

---

### 2. Hero Section

#### [MODIFY] [Hero.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/Hero.tsx)
- **Mobile**: Single column, map hidden or shown as compact 200px strip below CTAs
- **Tablet**: Single column with map shown at reduced height
- **Desktop**: Current two-column layout preserved
- Typography: `text-[40px] sm:text-[52px] lg:text-[68px]`
- Buttons: Full-width stacked on mobile, row on sm+
- Map container: `h-[240px] sm:h-[360px] lg:h-[560px]`
- World map SVG: Simplified on mobile (fewer arcs, smaller cards)
- Country cards: Repositioned for smaller containers using CSS `clamp()`

---

### 3. Features Section

#### [MODIFY] [Features.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/Features.tsx)
- Card padding: `px-5 py-6 sm:px-8 sm:py-9`
- Icon: `w-11 h-11 sm:w-14 sm:h-14`, icon size: `20` → `sm:26`
- Title: `text-base sm:text-lg`
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` ✅ already correct
- Section header: `text-[30px] sm:text-[42px] lg:text-[54px]`

---

### 4. Services Section

#### [MODIFY] [Services.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/Services.tsx)
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` → keep but add `gap-4 sm:gap-6`
- Card padding: `px-5 py-6 sm:px-8 sm:py-9`
- Icon: responsive sizing
- Section header: responsive type scale

---

### 5. Reviews Section

#### [MODIFY] [Reviews.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/Reviews.tsx)
- Card width: `w-[300px] sm:w-[360px]` (narrower on mobile)
- Card padding: `p-5 sm:p-8`
- Section: ensure `overflow-hidden` is on the section ✅ already has it
- Section header: responsive type scale

---

### 6. FAQ Section

#### [MODIFY] [FAQ.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/FAQ.tsx)
- Title: `text-[28px] sm:text-[40px] lg:text-[54px]`
- Button padding: `px-5 py-4 sm:px-8 sm:py-6`
- Question text: `text-[15px] sm:text-[17px]`
- Max-width container: already `max-w-[1000px]` ✅

---

### 7. HowItWorks Section

#### [MODIFY] [HowItWorks.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/HowItWorks.tsx)
- Grid: `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4` (2 cols on mobile already better than 1)
- Icon circle: `w-16 h-16 sm:w-24 sm:h-24`
- Title: `text-[28px] sm:text-[38px] lg:text-[42px]`
- Section padding from `.ig-section` class ✅

---

### 8. CTASection

#### [MODIFY] [CTASection.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/CTASection.tsx)
- Mascot: `w-20 sm:w-32 lg:w-44` (smaller on mobile)
- Buttons: `w-full sm:w-auto` and stack vertically on mobile
- Heading: `text-xl sm:text-2xl lg:text-[34px]`
- Layout: already `flex-col lg:flex-row` ✅

---

### 9. Footer

#### [MODIFY] [Footer.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/Footer.tsx)
- Grid is already responsive `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5` ✅
- Add `text-center` on mobile with proper alignment ✅
- Bottom bar: ensure wrapping on mobile ✅

---

### 10. TrustLogos

#### [MODIFY] [TrustLogos.tsx](file:///g:/Vibe%20coding/IG%20website%20V2/src/components/TrustLogos.tsx)
- Gap: `gap-8 sm:gap-12`
- Font size: `14` → `sm:18`
- Fade edges: reduce from `w-24` to `w-12 sm:w-24` on mobile

---

### 11. Pricing & ComparisonTable

#### [MODIFY] Pricing.tsx and ComparisonTable.tsx
- Need to audit and add `overflow-x-auto` wrappers
- Cards: full-width on mobile, grid-cols-1 → grid-cols-2 → grid-cols-3

## Verification Plan

### Automated Tests
- `npm run build` — zero TypeScript errors
- Browser screenshot at 390px (iPhone 15), 768px (iPad), 1280px, 1920px

### Manual Verification
- Check horizontal scroll on all pages at 320px
- Verify all touch targets ≥ 48px
- Verify no fixed-width elements cause overflow
- Check FAQ accordion works on mobile
- Verify hero map scales correctly

> [!NOTE]
> The Navbar mobile drawer is already well-implemented (slide-in from right, focus trap, body scroll lock). No major changes needed there.

> [!IMPORTANT]
> Pricing.tsx is 24KB — needs separate audit. ComparisonTable.tsx is 20KB — likely has table overflow issues.
