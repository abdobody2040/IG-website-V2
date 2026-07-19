# Instant Grow — UI/UX Design System

## Typography

| Element | Font Family | Weight | Size |
|---------|-------------|--------|------|
| Body | Inter (EN), Cairo/Noto Sans Arabic (AR) | 400 | 14-16px |
| Headings | Sora (EN), Cairo (AR) | 600-800 | 24-48px |
| Mono | monospace | 400 | 13px |

**RTL:** Arabic uses Cairo font with full RTL layout support via `dir="rtl"` on `<html>`.

**CSS Variables:**
```css
--font-sans: 'Inter', 'Sora', sans-serif;
--font-heading: 'Sora', 'Inter', sans-serif;
--font-mono: 'monospace';
--font-serif: 'Georgia', 'serif';
```

## Spacing

Tailwind spacing scale used consistently:
- **xs:** 4px (gap-1)
- **sm:** 8px (gap-2)
- **md:** 16px (gap-4)
- **lg:** 24px (gap-6)
- **xl:** 32px (gap-8)
- **2xl:** 48px (gap-12)

Page max-width: Typically `max-w-7xl` (1280px) or full-width for landing sections.

## Colors

### Light Mode (Default)
| Token | Value | Usage |
|-------|-------|-------|
| --background | 0 0% 100% | Page background |
| --foreground | 225 52% 8% | Text color |
| --primary | 224 100% 55% (#1a56ff) | Buttons, links, active states |
| --secondary | 225 52% 8% | Dark sections, sidebar |
| --muted | 220 14% 96% | Card backgrounds, table rows |
| --accent | 193 100% 42% | Highlights, accents |
| --destructive | 0 84% 60% | Delete buttons, errors |
| --border | 220 13% 91% | Borders, dividers |
| --chart-1 | 224 100% 55% | Primary chart color |
| --chart-2 | 225 52% 8% | Secondary chart color |
| --chart-3 | 151 55% 35% | Success/green chart |
| --chart-4 | 47 96% 53% | Warning/yellow chart |
| --chart-5 | 193 100% 42% | Info/cyan chart |

### Dark Mode
Enabled via `.dark` class. All tokens have dark mode equivalents. Not actively used but available.

## Buttons

### Primary Button
```tsx
<button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-all">
  Label
</button>
```

### Secondary/Outline
```tsx
<button className="border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all">
  Label
</button>
```

### Sizes
- **sm:** px-3 py-1.5 text-sm
- **md:** px-6 py-2.5 text-sm (default)
- **lg:** px-8 py-3 text-base

## Forms

### Input Fields
```tsx
<input className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors" />
```
Custom `.input` class available in `index.css`.

### Select Dropdowns
```tsx
<select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm bg-white">
  <option>Option</option>
</select>
```

### Validation States
- Error: `border-red-500` with red error text below
- Success: `border-green-500`
- Disabled: `opacity-50 cursor-not-allowed`

## Cards

```tsx
<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
  {children}
</div>
```

## Tables

Admin tables use consistent pattern:
```tsx
<div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
  <table className="w-full">
    <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
      <tr>
        <th className="px-4 py-3 text-left">Column</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {rows.map(row => (
        <tr className="hover:bg-slate-50 transition-colors">
          <td className="px-4 py-3 text-sm">{row.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## Status Badges

```tsx
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_review: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}>
  {statusLabel}
</span>
```

## Accessibility

- All forms have proper `<label>` elements
- Interactive elements use `<button>` (not divs)
- ARIA labels on icon-only buttons
- Focus rings visible (Tailwind's `focus:ring-2`)
- RTL support for Arabic users
- Semantic HTML structure

## Animations

| Animation | Usage | Duration |
|-----------|-------|----------|
| `fade-in` | Page transitions, modal overlays | 0.5s |
| `slide-up` | Cards, sections appearing | 0.5s |
| `accordion-down` | FAQ expansion | 0.2s |
| `accordion-up` | FAQ collapse | 0.2s |
| Framer Motion | Complex animations (Hero, landing) | Varied |

## Responsive Design

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 768px | Single column, hamburger nav |
| Desktop | >= 768px | Sidebar visible, multi-column |

**Mobile-First:** All layouts responsive by default. Sidebar hidden on mobile with toggle.

## Shared Components

Located in `src/components/`:
- Navbar, Hero, HowItWorks, Features, Pricing, Reviews, FAQ, CTASection, Footer (landing page)
- TurnstileWidget (CAPTCHA)
- DeleteConfirmModal (reusable delete confirmation dialog)
- InviteClientModal (admin invite form)
- KPICard (metric display card)
- NotificationCenter (bell icon + dropdown + unread badge)
- admin/UpdateStatusModal

### New Pages

Located in `src/pages/`:
- `BlogListPage` — Public blog list with featured article, tag filter, search, card grid
- `BlogDetailPage` — Single article view with cover image, meta, markdown rendering, share button
- `SeoCountryListPage` — SEO country landing page list with search and card grid
- `SeoCountryPage` — Dynamic SEO landing page with hero, pain points, benefits grid, banking/tax sections, FAQ accordion, WhatsApp + Cal.com CTAs, breadcrumb nav
- `SitemapPage` — Renders XML sitemap via `document.write` for dev-mode fallback

Located in `src/pages/admin/`:
- `AdminBlogsPage` — Blog post list with search, status filter, delete
- `AdminBlogEditorPage` — Blog create/edit with slug auto-generation, tag input, markdown editor, published/feature toggles
- `AdminSeoPagesPage` — SEO country page list with search, status filter, delete
- `AdminSeoEditorPage` — SEO page create/edit with identity fields, SEO fields, JSON array editors for benefits/pain-points/FAQ, banking/tax notes, published toggle

### New Hooks

- `useBlogs` — Full CRUD: `useBlogs()` (list with published filter), `useBlogBySlug(slug)`, `useCreateBlog()`, `useUpdateBlog()`, `useDeleteBlog()`
- `useSeoPages` — Full CRUD: `useSeoPages(publishedOnly)`, `useSeoPageBySlug(slug)`, `useCreateSeoPage()`, `useUpdateSeoPage()`, `useDeleteSeoPage()` (all with JSON field parsing via `parseJsonArray`/`parseJsonObject`)

### New Library Module

`src/lib/seo.ts` — SEO utilities for SPA:
- `setPageMeta({ title, description, keywords, canonical })` — DOM injection for `<title>` and `<meta>` tags
- `injectJsonLd(schema)` — Inserts `<script type="application/ld+json">` into `<head>`
- `injectBreadcrumb(items)` — Generates BreadcrumbList JSON-LD
- `getCanonical(path)` — Returns full canonical URL
- `generateFaqSchema(faqs)` — Generates FAQPage JSON-LD from array of Q&A
- `generateOrganizationSchema()` — Organization JSON-LD for Instant Grow brand

Client components in `src/pages/client/`:
- StatusBadge, statusUtils, OrderDetailDrawer
- OrderCard (expandable order with progress tracker + documents)
- OrderModal (service request form modal)

Data modules in `src/data/`:
- addonServices.ts (service catalogue, Service type)

Hooks in `src/hooks/`:
- useNotifications (fetch, real-time subscribe, mark read, create)
- useInvitations (admin create + token lookup)
- useExportCsv (generic CSV download)
- useAdminAuditLog (audit trail)
- useOrderRealtime (real-time order subscriptions)
- useComplianceReminders (upcoming/overdue compliance dates)

## Strict UI Architectural Guidelines

1. **No Inline Styles:** Use Tailwind classes exclusively. If a dynamic value is needed, use `style` props ONLY for math-calculated layout variables, never colors or typography.
2. **Accessibility-First:** All custom interactive elements MUST be keyboard navigable (Tab-index) and have appropriate `aria-` labels.
3. **Component Reusability:** Do not create duplicate cards or buttons. If a button looks like `PrimaryButton`, use the existing component or Tailwind utility class.
4. **Mobile-First Enforcement:** Every new screen must be designed at 375px viewport first, scaling up via `md:` and `lg:` Tailwind prefixes.
