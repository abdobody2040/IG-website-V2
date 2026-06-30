# Instant Grow — Performance System

## Current Performance State

The build currently produces a warning about large JavaScript chunks. No performance optimizations have been applied beyond Vite's defaults.

## Performance Budgets (Recommended)

| Metric | Budget | Measurement |
|--------|--------|-------------|
| Initial JS Bundle | < 200 KB gzipped | Lighthouse / bundlesize |
| Initial CSS Bundle | < 50 KB gzipped | Lighthouse |
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.5s | Lighthouse |
| Lighthouse Performance Score | > 90 | Lighthouse |

## Caching Strategy

### Current
- TanStack Query caches server data with automatic garbage collection
- Supabase SDK caches auth session in localStorage
- Static assets cached by CDN (Vite hashed filenames)

### Recommended
- **Service Worker:** Add Workbox for precaching and runtime caching
- **Supabase Real-time:** Replace polling with real-time subscriptions for live updates
- **Local Storage:** Cache frequently accessed reference data (states, pricing)

## Rendering Optimization

### Current
- Standard React rendering with no memoization

### Recommended
- `React.memo()` on expensive list items (admin tables)
- `useMemo()` for derived data in large components
- `useCallback()` for stable callback references
- Virtual scrolling for admin tables with >100 rows (react-window or @tanstack/virtual)

## Lazy Loading

### Current
- All pages eagerly loaded (no code splitting)
- All imports in `router.tsx` are top-level static imports

### Recommended
```typescript
// Route-level code splitting with React.lazy
const AdminOrdersPage = React.lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminClientsPage = React.lazy(() => import('./pages/admin/AdminClientsPage'))
const AdminAnalyticsPage = React.lazy(() => import('./pages/admin/AdminAnalyticsPage'))
```

## Code Splitting

### Current
- Single bundle: `dist/assets/index-*.js`

### Recommended
- Split by route: admin, client, landing, auth, order
- Vendor chunk: Separate React, TanStack, Supabase into vendor chunk
- Lazy load heavy libraries: Recharts (admin analytics), React Three Fiber (hero)

**Vite config for code splitting:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
        supabase: ['@supabase/supabase-js'],
        charts: ['recharts'],
        three: ['@react-three/fiber', '@react-three/drei'],
      }
    }
  }
}
```

## Database Optimization

### Current
- All queries use `.limit()` without pagination
- No custom indexes beyond primary keys and unique constraints
- Mapper functions iterate all columns

### Recommended
- **Pagination:** Add cursor-based pagination for admin queries
- **Select only needed columns:** `select('id, name, status')` instead of `select('*')`
- **Add indexes:** user_id foreign keys, status columns, created_at for sorting
- **Query optimization:** Use `.explain()` in Supabase dashboard to analyze slow queries

## Indexing Optimization

### Recommended Indexes (to be added)
```sql
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_companies_user_id ON public.companies(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_order_updates_order_id ON public.order_updates(order_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
```

## API Optimization

### Current
- Multiple sequential queries on page load (orders, companies, documents all fetched separately)
- No request batching

### Recommended
- **Parallel queries:** Use `Promise.all()` or `useQueries()` for independent data
- **Request deduplication:** TanStack Query handles this automatically
- **Supabase joins:** Use `.select('*, related_table(*)')` for related data
- **Response caching:** Add `staleTime` to reduce refetches

## Image Optimization

### Current
- Logo PNG used as favicon
- No optimized images

### Recommended
- Convert logo to WebP or SVG
- Use responsive image sizes (srcSet)
- Lazy load images below the fold
- Consider using Cloudflare Images for transforms

## Bundle Optimization

### Current (Estimated)
- Total build output: ~1-2 MB uncompressed
- Vendor bundle includes full Recharts, Framer Motion, React Three Fiber
- No tree-shaking analysis done

### Recommended
- **Analyze bundle:** `npx vite-bundle-analyzer`
- **Remove unused imports:** Configure ESLint `no-unused-vars`
- **Dynamic imports for charts:** Only load Recharts on admin analytics page
- **Dynamic imports for 3D:** Only load React Three Fiber when hero is visible
- **Minify:** Ensure `build.minify` is enabled (default in Vite)

## Performance Checklist

- [ ] Enable TypeScript strict mode (catches performance anti-patterns)
- [ ] Add route-level code splitting
- [ ] Add lazy loading for Recharts and React Three Fiber
- [ ] Add pagination to admin queries
- [ ] Add database indexes
- [ ] Select only needed columns in queries
- [ ] Configure Vite manual chunks
- [ ] Run Lighthouse audit
- [ ] Add Service Worker for caching
- [ ] Implement virtual scrolling for large tables
