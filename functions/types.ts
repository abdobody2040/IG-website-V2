/**
 * functions/types.ts
 * Shared Cloudflare Worker environment types.
 * Import from here instead of re-declaring in each function.
 */

/** Stripe + PocketBase Cloudflare Worker environment. Used by create-checkout, create-payment-intent, verify-payment. */
export interface StripeEnv {
  STRIPE_SECRET_KEY: string
  ALLOWED_ORIGIN: string
  PB_URL: string
  PB_ADMIN_EMAIL?: string
  PB_ADMIN_PASSWORD?: string
}
