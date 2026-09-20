import { useEffect, useState, Suspense } from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { LanguageProvider, useLang } from "./i18n/LanguageContext";
import { lazyImport } from './lib/lazyImport'
import { waitForAuthReady, getAuthInfo } from './lib/authState'
import { pb } from './lib/pocketbase'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import { MouseGlow, AmbientBackground } from './components/effects'
import { setPageMeta, injectJsonLd, generateOrganizationSchema, generateWebSiteSchema, generateProfessionalServiceSchema, generateFaqSchema, generateHowToSchema, getCanonical } from './lib/seo'

// Below-the-fold components lazy-loaded to minimize initial JS bundle
const TrustLogos = lazyImport(() => import('./components/TrustLogos'))
const Services = lazyImport(() => import('./components/Services'))
const HowItWorks = lazyImport(() => import('./components/HowItWorks'))
const Features = lazyImport(() => import('./components/Features'))
const Timeline = lazyImport(() => import('./components/Timeline'))
const Reviews = lazyImport(() => import('./components/Reviews'))
const ComparisonTable = lazyImport(() => import('./components/ComparisonTable'))
const Pricing = lazyImport(() => import('./components/Pricing'))
const FAQ = lazyImport(() => import('./components/FAQ'))
const CTASection = lazyImport(() => import('./components/CTASection'))
const Footer = lazyImport(() => import('./components/Footer'))
const StickyCTABar = lazyImport(() => import('./components/StickyCTABar'))

const SupportWidget = lazyImport(() => import('./components/SupportWidget'))

// Root route — LanguageProvider wraps everything so i18n is available to all pages
const rootRoute = createRootRoute({
  component: () => (
    <LanguageProvider>
      <Outlet />
      <Suspense fallback={null}>
        <SupportWidget />
      </Suspense>
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
        generateHowToSchema({
          name: 'How to Form a US LLC or UK LTD Company Online',
          description: 'Step-by-step guide to establishing your business entity remotely with Instant Grow.',
          steps: [
            { name: 'Choose Jurisdiction & Plan', text: 'Select US LLC (Wyoming/Delaware), UK LTD, UAE, or Oman formation plan.' },
            { name: 'Submit Company Details', text: 'Provide company name choices and owner/member identification documents.' },
            { name: 'Formation & EIN Tax ID Filing', text: 'Instant Grow files incorporation papers with government authorities and IRS.' },
            { name: 'Open Business Bank Account & Stripe', text: 'Receive official company documents, US/UK business bank account, and payment gateway.' },
          ],
        }),
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
    let lenisInstance: any = null
    const timer = setTimeout(() => {
      import('lenis').then(({ default: Lenis }) => {
        lenisInstance = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
        function raf(time: number) { lenisInstance?.raf(time); requestAnimationFrame(raf) }
        requestAnimationFrame(raf)
      })
    }, 1000)
    return () => {
      clearTimeout(timer)
      lenisInstance?.destroy()
    }
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
        <Suspense fallback={<div className="min-h-[200px]" />}>
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
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        {/* 13. Sticky mobile CTA bar */}
        <StickyCTABar />
      </Suspense>
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
    const hasPaidOrder = localStorage.getItem(cacheKey) === 'true' || sessionStorage.getItem(cacheKey) === 'true'

    if (!hasPaidOrder) {
      try {
        const orders = await pb.collection('orders').getList(1, 100, {
          filter: `user = "${info.userId}"`,
        })
        const hasOrder = orders.totalItems > 0
        const hasConfirmedOrder = orders.items.some(
          o => o.status !== 'pending' && o.status !== 'cancelled'
        )
        if (hasOrder) {
          localStorage.setItem(cacheKey, 'true')
          sessionStorage.setItem(cacheKey, 'true')
        }
        if (!hasConfirmedOrder && orders.items.length > 0 && orders.items.every(o => o.status === 'pending')) {
          throw redirect({ to: '/auth/pending-confirmation' })
        }
      } catch (err) {
        if ((err as any)?.isRedirect) throw err
        console.error('Error verifying user orders:', err)
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

const clientPerksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/perks',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientPerksPage')),
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

const clientTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/client/tracking',
  beforeLoad: requireAuthGuard,
  component: lazyImport(() => import('./pages/client/ClientTrackingPage')),
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

const adminTrackingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/tracking',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminTrackingPage')),
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

const adminPerksRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/admin/perks',
  beforeLoad: requireAdminGuard,
  component: lazyImport(() => import('./pages/admin/AdminPerksPage')),
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

// ── MENA country targeting pages (/form-llc/:country) ─────────────────────
const menaLlcListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/form-llc',
  component: lazyImport(() => import('./pages/SeoCountryListPage')),
})

const menaLlcCountryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/form-llc/$country',
  component: lazyImport(() => import('./pages/MenaCountryPage')),
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



const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: lazyImport(() => import('./pages/AboutPage')),
})
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

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/team',
  component: lazyImport(() => import('./pages/TeamPage')),
})

const howWeWorkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/how-we-work',
  component: lazyImport(() => import('./pages/HowWeWorkPage')),
})

const termsRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  beforeLoad: () => {
    throw redirect({ to: '/terms-of-service' })
  },
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

const serviceDetailDirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/item/$serviceSlug',
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
  adminTrackingRoute,
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
  adminPerksRoute,
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
  clientPerksRoute,
  clientPaymentsRoute,
  clientMailInboxRoute,
  clientVerificationsRoute,
  clientNotificationsRoute,
  clientSettingsRoute,
  clientWorkspaceSettingsRoute,
  clientTrackingRoute,
  // Admin
  adminTree,
  // SEO country
  seoCountryListRoute,
  seoCountryDetailRoute,
  // MENA country targeting
  menaLlcListRoute,
  menaLlcCountryRoute,
  // Blog
  blogListRoute,
  blogDetailRoute,
  // Sitemap
  sitemapRoute,
  // Other
  aboutRoute,
  teamRoute,
  howWeWorkRoute,
  contactRoute,
  privacyPolicyRoute,
  termsRedirectRoute,
  termsRoute,
  refundRoute,
  disclaimerRoute,
  accessibilityRoute,
  kycAmlRoute,
  customPageRoute,
  publicServicesRoute,
  serviceCategoryRoute,
  serviceDetailRoute,
  serviceDetailDirectRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

void redirect
