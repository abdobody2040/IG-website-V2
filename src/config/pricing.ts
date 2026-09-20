// ─── src/config/pricing.ts ────────────────────────────────────────────────────
// Bridges legacy PRICING_DATA consumers to src/config/pricingMaster.ts
// ─────────────────────────────────────────────────────────────────────────────

import { MASTER_PRICING } from './pricingMaster'

export const PRICING_DATA = {
  us: {
    basic: MASTER_PRICING.us.basic.serviceFee,
    premium: MASTER_PRICING.us.premium.serviceFee,
  },
  uk: {
    basic: MASTER_PRICING.uk.basic.serviceFee,
    premium: MASTER_PRICING.uk.premium.serviceFee,
  },
  uae: {
    basic: MASTER_PRICING.uae.basic.serviceFee,
    premium: MASTER_PRICING.uae.premium.serviceFee,
  },
  oman: {
    basic: MASTER_PRICING.oman.basic.serviceFee,
    premium: MASTER_PRICING.oman.premium.serviceFee,
  },
} as const

export * from './pricingMaster'
