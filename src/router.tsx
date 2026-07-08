import { useEffect, useState } from 'react'
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { LanguageProvider } from './i18n/LanguageContext'
import { lazyImport } from './lib/lazyImport'
import { waitForAuthReady, getAuthInfo } from './lib/authState'
import { pb } from './lib/pocketbase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustLogos from './components/TrustLogos'
import Services from './components/Services'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import Timeline from './components/Timeline'
import Reviews from './components/Reviews'
import ComparisonTable from './components/ComparisonTable'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import StickyCTABar from './components/StickyCTABar'
import { MouseGlow, AmbientBackground } from './components/effects'
import Lenis from 'lenis'
import { useLang } from './i18n/LanguageContext'
import { setPageMeta, injectJsonLd, generateOrganizationSchema, generateWebSiteSchema, generateProfessionalServiceSchema, generateFaqSchema, getCanonical } from './lib/seo'

import SupportWidget from './components/SupportWidget'

// Root route — LanguageProvider wraps everything so i18n is available to all pages
const rootRoute = createRootRoute({
  component: () => (
    <LanguageProvider>
      <Outlet />
      <SupportWidget />
    </LanguageProvider>
  ),
})

function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const { t } = useLang()
  const s = t.seo.landing

  useEffect(() => {
    setPageMeta({
      title: s.title,
      description: s.description,
      keywords: s.keywords,
      canonical: getCanonical('/'),
    })
    injectJsonLd({
      '@graph': [
        generateOrganizationSchema(),
        generateWebSiteSchema(),
        generateProfessionalServiceSchema(),
        // FAQPage schema — keeps rich results in sync with the FAQ component (B-schema-landing)
        generateFaqSchema(
          (t.faq.items as unknown as Array<{ question: string; answer: string }>).map(item => ({
            question: item.question,
            answer: item.answer,
          }))
        ),
        // ItemList of core services for rich search results
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Company Formation Services',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'US LLC Formation',
              url: `${window.location.origin}/order`,
              description: 'Form a US Limited Liability Company from anywhere in the world. Includes EIN, registered agent, and compliance support.',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'UK LTD Formation',
              url: `${window.location.origin}/order`,
              description: 'Register a UK Private Limited Company with Companies House. Includes registered office address and UTR number.',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'Add-On Services',
              url: `${window.location.origin}/services`,
              description: 'Business website, logo design, express processing, and other formation add-ons.',
            },
          ],
        },
      ]
    })
  }, [s, t])

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(h > 0 ? window.scrollY / h : 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  return (
    <div className="min-h-screen bg-white font-sans pb-[72px] md:pb-0">
      <MouseGlow />
      <AmbientBackground />
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />
      <Navbar />
      <main className="relative z-10">
        {/* 2. Hero — 2-col split, world map, mascot, country pins, dashboard overlap */}
        <Hero />
        {/* 3. Trust Logos — continuous marquee */}
        <TrustLogos />
        {/* 5. Services — 5 premium cards */}
        <Services />
        {/* 6. How It Works — 4-step horizontal timeline */}
        <HowItWorks />
        {/* 7. Why Entrepreneurs Choose — 6 icon cards */}
        <Features />
        {/* 8. Timeline — mascot left, 5-day steps */}
        <Timeline />
        {/* 9. Reviews — dual marquee */}
        <Reviews />
        {/* 10. Comparison Table */}
        <ComparisonTable />
        {/* 11. Pricing — 3 cards */}
        <Pricing />
        {/* FAQ */}
        <FAQ />
        {/* 12. CTA — dark, mascot right */}
        <CTASection />
      </main>
      <Footer />
      {/* 13. Sticky mobile CTA bar */}
      <StickyCTABar />
    </div>
  )
}

// ── Landing page (/） ──────────────────────────────────────────────────────
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

// ── Auth routes ────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: lazyImport(() => import('./pages/auth/LoginPage')),
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/signup',
  component: lazyImport(() => import('./pages/auth/SignupPage')),
})

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: lazyImport(() => import('./pages/auth/AuthCallbackPage')),
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/forgot-password',
  component: lazyImport(() => import('./pages/auth/ForgotPasswordPage')),
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  component: lazyImport(() => import('./pages/auth/ResetPasswordPage')),
})

const pendingConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/pending-confirmation',
  component: lazyImport(() => import('./pages/auth/PendingConfirmationPage')),
})

// ── Order routes ───────────────────────────────────────────────────────────
const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order',
  component: lazyImport(() => import('./pages/order/OrderWizard')),
})

const orderSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order/success',
  component: lazyImport(() => import('./pages/order/OrderSuccess')),
})

// ── Client portal routes ───────────────────────────────────────────────────
const requireAuthGuard = async () => {
  await waitForAuthReady()
  const info = getAuthInfo()
  if (!info.userId) throw redirect({ to: '/auth/login' })

  // Ensure client users have paid and been confirmed by the admin before accessing client pages.
  if (info.role === 'client') {
    const cacheKey = `ig_has_paid_order_${info.userId}`
    const hasPaidOrder = sessionStorage.getItem(cacheKey) === 'true'

    if (!hasPaidOrder) {
      let totalOrders = 0
      let hasConfirmedOrder = false
      try {
        const orders = await pb.collection('orders').getList(1, 100, {
          filter: `user = "${info.userId}"`,
        })
        totalOrders = orders.totalItems
        hasConfirmedOrder = orders.items.some(
          o => o.status !== 'pending' && o.status !== 'cancelled'
        )
        if (hasConfirmedOrder) {
          sessionStorage.setItem(cacheKey, 'true')
        }
      } catch (err) {
        console.error('Error verifying user orders:', err)
        // Graceful degradation: in case of temp db/network error, allow user through
        totalOrders = 1
        hasConfirmedOrder = true
      }

      if (totalOrders === 0) {
        throw redirect({ to: '/order' })
      }

      if (!hasConfirmedOrder) {
        throw redirect({ to: '/auth/pending-confirmation' })
      }
    }
  }
}

const dashboardRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/dashboard',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientDashboardPage')),
})

const clientOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/orders',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientOrdersPage')),
})

const clientCompanyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/company',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientCompanyPage')),
})

const clientDocumentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/documents',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientDocumentsPage')),
})

const clientServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/services',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientServicesPage')),
})

const clientPaymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/payments',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientPaymentsPage')),
})

const clientMailInboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/mail-inbox',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientMailInboxPage')),
})

const clientVerificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/verifications',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientVerificationsPage')),
})

const clientNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/notifications',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientNotificationsPage')),
})

const clientSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/settings',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientSettingsPage')),
})

const clientWorkspaceSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/workspace-settings',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/WorkspaceSettingsPage')),
})

// ── Admin routes ───────────────────────────────────────────────────────────
const requireAdminGuard = async () => {
  await waitForAuthReady()
  const info = getAuthInfo()
  if (!info.userId) throw redirect({ to: '/auth/login' })
  if (info.role !== 'admin') throw redirect({ to: '/client/dashboard' })
}


const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-layout',
  component: lazyImport(() => import('./pages/admin/AdminLayout')),
})

const adminRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminOverviewPage')),
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/dashboard',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminDashboardPage')),
})

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/orders',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminOrdersPage')),
})

const adminClientsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/clients',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminClientsPage')),
})

const adminClientDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/clients/$userId',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminClientDetailPage')),
})

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/analytics',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminAnalyticsPage')),
})

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/settings',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminSettingsPage')),
})

const adminCompaniesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/companies',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminCompaniesPage')),
})

const adminDocumentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/documents',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminDocumentsPage')),
})

const adminPaymentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/payments',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminPaymentsPage')),
})

const adminBlogsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/blogs',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminBlogsPage')),
})

const adminBlogEditorRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/blogs/$id/edit',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminBlogEditorPage')),
})

const adminSeoRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/seo',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminSeoPagesPage')),
})

const adminSeoEditorRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/seo/$id/edit',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminSeoEditorPage')),
})

const adminHomeEditorRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/home-editor',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminHomeEditorPage')),
})

const adminPriceEditorRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/pricing-editor',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminPriceEditorPage')),
})

const adminServicesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/services',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminServicesPage')),
})

const adminPagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/pages',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminPagesPage')),
})

const adminPageEditorRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/pages/$id/edit',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminPageEditorPage')),
})

// ── SEO country routes ─────────────────────────────────────────────────────
const seoCountryListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/us-company',
  component: lazyImport(() => import('./pages/SeoCountryListPage')),
})

const seoCountryDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/us-company/$slug',
  component: lazyImport(() => import('./pages/SeoCountryPage')),
})

// ── Blog routes ───────────────────────────────────────────────────────────
const blogListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: lazyImport(() => import('./pages/BlogListPage')),
})

const blogDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog/$slug',
  component: lazyImport(() => import('./pages/BlogDetailPage')),
})

// ── Sitemap route ──────────────────────────────────────────────────────────
const sitemapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sitemap.xml',
  component: lazyImport(() => import('./pages/SitemapPage')),
})

// ── Other routes ───────────────────────────────────────────────────────────
const ContactPage = lazyImport(() => import('./pages/ContactPage'))
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: () => (
    <LanguageProvider>
      <ContactPage />
    </LanguageProvider>
  ),
})


const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy-policy',
  component: lazyImport(() => import('./pages/PrivacyPolicyPage')),
})

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms-of-service',
  component: lazyImport(() => import('./pages/TermsPage')),
})

const refundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/refund-policy',
  component: lazyImport(() => import('./pages/RefundPage')),
})

const disclaimerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal-disclaimer',
  component: lazyImport(() => import('./pages/DisclaimerPage')),
})

const accessibilityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accessibility',
  component: lazyImport(() => import('./pages/AccessibilityPage')),
})

const kycAmlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kyc-aml',
  component: lazyImport(() => import('./pages/KycAmlPage')),
})

const customPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/p/$slug',
  component: lazyImport(() => import('./pages/CustomDynamicPage')),
})

const publicServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services',
  component: lazyImport(() => import('./pages/ServicesPage')),
})

const serviceCategoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/$categorySlug',
  component: lazyImport(() => import('./pages/ServiceCategoryPage')),
})

const serviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/$categorySlug/$serviceSlug',
  component: lazyImport(() => import('./pages/ServiceDetailPage')),
})

// ── Route tree ─────────────────────────────────────────────────────────────

const adminTree = adminLayoutRoute.addChildren([
  adminRoute,
  adminDashboardRoute,
  adminOrdersRoute,
  adminClientsRoute,
  adminClientDetailRoute,
  adminAnalyticsRoute,
  adminSettingsRoute,
  adminCompaniesRoute,
  adminDocumentsRoute,
  adminPaymentsRoute,
  adminBlogsRoute,
  adminBlogEditorRoute,
  adminSeoRoute,
  adminSeoEditorRoute,
  adminHomeEditorRoute,
  adminPriceEditorRoute,
  adminServicesRoute,
  adminPagesRoute,
  adminPageEditorRoute,
])

const routeTree = rootRoute.addChildren([
  landingRoute,
  // Auth
  loginRoute,
  signupRoute,
  authCallbackRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  pendingConfirmationRoute,
  // Order
  orderRoute,
  orderSuccessRoute,
  // Client
  dashboardRedirectRoute,
  clientOrdersRoute,
  clientCompanyRoute,
  clientDocumentsRoute,
  clientServicesRoute,
  clientPaymentsRoute,
  clientMailInboxRoute,
  clientVerificationsRoute,
  clientNotificationsRoute,
  clientSettingsRoute,
  clientWorkspaceSettingsRoute,
  // Admin
  adminTree,
  // SEO country
  seoCountryListRoute,
  seoCountryDetailRoute,
  // Blog
  blogListRoute,
  blogDetailRoute,
  // Sitemap
  sitemapRoute,
  // Other
  contactRoute,
  privacyPolicyRoute,
  termsRoute,
  refundRoute,
  disclaimerRoute,
  accessibilityRoute,
  kycAmlRoute,
  customPageRoute,
  publicServicesRoute,
  serviceCategoryRoute,
  serviceDetailRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

void redirect
