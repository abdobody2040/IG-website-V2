// ─── scripts/generate-llms-txt.mjs ──────────────────────────────────────────
// Automatically regenerates public/llms.txt from src/config/pricingMaster.ts
// Ensures pricing, timelines, disclosures, and contact info stay 100% unified.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MASTER_PRICING, MASTER_TIMELINES, ADDON_SERVICES_MASTER } from '../src/config/pricingMaster.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const publicPath = path.join(rootDir, 'public', 'llms.txt')
const distPath = path.join(rootDir, 'dist', 'llms.txt')

const today = new Date().toISOString().split('T')[0]

const content = `# Instant Grow – AI Agent / LLM Indexing Guide
# https://instantgrow.net/llms.txt
# Format: https://llmstxt.org/
# Last updated: ${today}

## About Instant Grow

Instant Grow LLC is an online corporate formation and business administrative services platform. We assist international founders and non-US residents in forming US Limited Liability Companies (Wyoming, Delaware, New Mexico), UK Private Limited Companies (Companies House), UAE Free Zone entities, and Omani companies with statutory compliance support.

- **Website:** https://instantgrow.net
- **Primary languages:** English, Arabic (with full RTL support)
- **Support email:** support@instantgrow.net
- **Official Facebook:** https://www.facebook.com/Instant.grow.net
- **Official X (Twitter):** https://x.com/instantgrow
- **Official LinkedIn:** https://www.linkedin.com/company/instantgrow
- **Trustpilot Profile:** https://www.trustpilot.com/review/instantgrow.net
- **Official Registered Address:** [REGISTERED_ADDRESS]
- **Legal Entity Name:** Instant Grow LLC [LEGAL_ENTITY_NAME]
- **State Registration / Entity ID:** [REGISTRATION_NUMBER]

> **Security Advisory:** Beware of unrelated third-party websites with similar domains (such as instantgrow.org or instantgrow.cc). Our official website is exclusively https://instantgrow.net.

> **Legal & Tax Disclaimer:** Instant Grow LLC is a business formation document preparation service, not a law firm or certified public accounting (CPA) firm. Information provided on instantgrow.net or via communication does not constitute legal, tax, or investment advice. Founders are encouraged to consult certified tax and legal advisors regarding individual multi-jurisdictional tax compliance.

---

## Core Services & Official Government Disclosures

### 1. US LLC Formation (Wyoming, Delaware, New Mexico)
- **Wyoming LLC:** Preferred for e-commerce, digital creators, and privacy-conscious founders. Low state fees ($102 initial state filing fee, $60 minimum annual report license tax). No state personal or corporate income tax.
- **Delaware LLC:** Preferred for venture-capital backed startups and companies planning future institutional equity rounds. $140 initial state fee; mandatory $300 annual franchise tax due every June 1st.
- **New Mexico LLC:** $50 initial filing fee; no mandatory state annual report.

### 2. Mandatory US Post-Formation Compliance for Non-Residents
Foreign-owned Single-Member US LLCs (disregarded entities) are legally required by the IRS under IRC Section 6038A to file **IRS Form 5472 + pro-forma Form 1120** annually.
- **Penalty warning:** The statutory penalty for failing to file or late filing of Form 5472 is **$25,000 per violation**.
- **State Annual Reports:** Wyoming annual report ($60 min) due anniversary month. Delaware franchise tax ($300) due June 1.

### 3. Realistic Processing Timelines
- **State Document Preparation & Submission:** ${MASTER_TIMELINES.stateFiling.en}
- **State Government Approval:** ${MASTER_TIMELINES.stateApproval.en}
- **IRS EIN for Foreign Non-Residents (without SSN):** ${MASTER_TIMELINES.einNonResident.en} Note: There is NO instant 24-hour EIN from the IRS for foreign founders without a US Social Security Number. Blanket claims of "EIN within 24–72 hours" are inaccurate; IRS fax processing strictly requires 3–6 weeks.
- **Business Bank Accounts:** ${MASTER_TIMELINES.bankAccount.en}

### 4. UK LTD Company Formation
- Official filing with Companies House (£50 statutory government fee).
- **Mandatory Director & PSC Identity Verification:** Under the UK Economic Crime and Corporate Transparency Act, all company directors and Persons with Significant Control (PSCs) must verify their identity directly with Companies House.
- Annual Confirmation Statement (£34 fee to Companies House) required every 12 months.

### 5. UAE Free Zone Companies
- 100% foreign ownership in designated UAE Free Zones.
- **Corporate Tax Disclosure:** In accordance with UAE Federal Decree-Law No. 47 of 2022, the UAE levies a **9% Federal Corporate Tax** on taxable business profits exceeding 375,000 AED. A 0% corporate tax rate applies **strictly to Qualifying Free Zone Persons on Qualifying Income** as defined by UAE Ministry of Finance Cabinet Decision No. 55 of 2023.

---

## Pricing Master Table

| Package / Jurisdiction | Service Fee (USD) | State / Gov Statutory Fee | Key Inclusions | Timeline |
| :--- | :--- | :--- | :--- | :--- |
| **US LLC Basic** | $${MASTER_PRICING.us.basic.serviceFee} | Paid at cost (WY $102, DE $140, NM $50) | Articles filing, 1st yr Registered Agent, IRS EIN filing (SS-4), Operating Agreement, BOI guidance | Prep in 1-2 days; EIN in 3-6 wks |
| **US LLC Premium** | $${MASTER_PRICING.us.premium.serviceFee} | Paid at cost (WY $102, DE $140, NM $50) | Everything in Basic + Priority queue, US virtual phone (1 yr), Custom multi-member agreement, 30-min onboarding call, hands-on banking prep | Priority submission; EIN in 3-6 wks |
| **UK LTD Basic** | $${MASTER_PRICING.uk.basic.serviceFee} | £50 statutory fee | Companies House filing, Certificate, Articles, 1st yr Registered Office, HMRC UTR guidance | Approval in 1-3 business days |
| **UK LTD Premium** | $${MASTER_PRICING.uk.premium.serviceFee} | £50 statutory fee | Everything in Basic + Director privacy service address, UK virtual phone (1 yr), First Confirmation Statement preparation, priority support | Priority submission in 12-24h |
| **UAE Free Zone Basic** | $${MASTER_PRICING.uae.basic.serviceFee} | Free Zone license at cost | Pre-approval, name reservation, MoA drafting, trade license assistance (0 visa), lease agreement | Authority approval in 3-7 business days |
| **UAE Free Zone Premium** | $${MASTER_PRICING.uae.premium.serviceFee} | Free Zone & GDRFA fees at cost | Basic + Establishment Card, 1 Investor residency visa (2-yr), medical VIP & Emirates ID coordination, priority corporate banking | License in 3-5 days; visa in 5-10 days post-arrival |
| **Oman SPC Basic** | $${MASTER_PRICING.oman.basic.serviceFee} | MoCIIP statutory fees at cost | Commercial Registration (CR), name reservation, Chamber registration (OCCI), tax card, MoA | 5-10 business days |
| **Oman LLC Premium** | $${MASTER_PRICING.oman.premium.serviceFee} | MoCIIP & ROP fees at cost | Basic + Multi-shareholder structure, investor visa entry clearance, medical & resident card coordination | CR in 5-7 days; visa in 7-14 days |

### Add-On Services
${ADDON_SERVICES_MASTER.map(a => `- **${a.name}:** $${a.price} — ${a.description} (${a.timeline})`).join('\n')}

---

## Official Government References

- **Internal Revenue Service (IRS):** https://www.irs.gov/
- **Wyoming Secretary of State (WyoBiz):** https://wyobiz.wyo.gov/
- **Delaware Division of Corporations:** https://corp.delaware.gov/
- **UK Companies House:** https://www.gov.uk/government/organisations/companies-house
- **UAE Ministry of Finance (Corporate Tax):** https://mof.gov.ae/corporate-tax/
- **Oman Ministry of Commerce (MoCIIP):** https://tejarah.gov.om/
- **FinCEN Beneficial Ownership Information:** https://www.fincen.gov/boi

---

## Key Website Pages

- Homepage: https://instantgrow.net/
- Services Directory: https://instantgrow.net/services
- US LLC Information: https://instantgrow.net/us-company
- Wyoming LLC: https://instantgrow.net/us-company/wyoming
- Delaware LLC: https://instantgrow.net/us-company/delaware
- Form LLC by Country (MENA): https://instantgrow.net/form-llc
- Team & Leadership: https://instantgrow.net/team
- How We Work (Filing Process): https://instantgrow.net/how-we-work
- Blog: https://instantgrow.net/blog
- Contact Us: https://instantgrow.net/contact
- Privacy Policy: https://instantgrow.net/privacy-policy
- Terms of Service: https://instantgrow.net/terms-of-service
- Refund Policy: https://instantgrow.net/refund-policy
- Sitemap: https://instantgrow.net/sitemap.xml
`

fs.writeFileSync(publicPath, content, 'utf-8')
console.log(`✅ Generated public/llms.txt (updated: ${today})`)

if (fs.existsSync(path.dirname(distPath))) {
  fs.writeFileSync(distPath, content, 'utf-8')
  console.log(`✅ Copied to dist/llms.txt`)
}
