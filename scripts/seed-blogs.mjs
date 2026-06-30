/**
 * Seed sample blog posts into PocketBase.
 *
 * Usage (run from project root while PocketBase is running):
 *   node scripts/seed-blogs.mjs
 *
 * Or open your browser console on localhost:3000 and paste the fetch calls
 * from the generated output.
 *
 * Requires: PocketBase running at http://127.0.0.1:8090
 * Admin credentials set in env vars or hardcoded below for local dev only.
 */

const PB_URL = process.env.PB_URL ?? 'http://127.0.0.1:8090'
const ADMIN_EMAIL = process.argv[2] ?? process.env.PB_ADMIN_EMAIL
const ADMIN_PASSWORD = process.argv[3] ?? process.env.PB_ADMIN_PASSWORD

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('\n❌ Usage: node scripts/seed-blogs.mjs <admin-email> <admin-password>')
  console.error('   Example: node scripts/seed-blogs.mjs admin@example.com mypassword\n')
  process.exit(1)
}

const blogs = [
  {
    title: 'How to Form an LLC in Delaware: Complete 2025 Guide',
    slug: 'how-to-form-llc-delaware-2025',
    excerpt: 'Delaware is the most popular state for LLC formation. Learn why thousands of entrepreneurs choose Delaware and how to get started in minutes.',
    content: `
      <h2>Why Delaware?</h2>
      <p>Delaware has been the gold standard for business incorporation for decades. Over 60% of Fortune 500 companies are incorporated in Delaware, and for good reason.</p>
      <h3>Key Advantages</h3>
      <ul>
        <li><strong>Business-friendly courts</strong> – Delaware's Court of Chancery specializes in business disputes with no jury trials</li>
        <li><strong>No state income tax</strong> for companies not operating in Delaware</li>
        <li><strong>Flexible LLC structure</strong> – minimal requirements for members and managers</li>
        <li><strong>Strong legal precedent</strong> – centuries of corporate law provide predictability</li>
        <li><strong>Privacy</strong> – member names don't appear in public filings</li>
      </ul>
      <h2>Step-by-Step Formation</h2>
      <h3>Step 1: Choose a Name</h3>
      <p>Your LLC name must be unique in Delaware and include "LLC" or "Limited Liability Company". Use the Delaware Division of Corporations name search to verify availability.</p>
      <h3>Step 2: Appoint a Registered Agent</h3>
      <p>You need a registered agent with a physical Delaware address to receive legal documents. Instant Grow provides registered agent services in all 50 states.</p>
      <h3>Step 3: File the Certificate of Formation</h3>
      <p>File with the Delaware Division of Corporations. The state fee is $90. Processing typically takes 1-2 business days for standard filing.</p>
      <h3>Step 4: Get Your EIN</h3>
      <p>An Employer Identification Number (EIN) from the IRS is required for banking, taxes, and hiring. We handle this for you as part of your package.</p>
      <h3>Step 5: Open a Business Bank Account</h3>
      <p>With your Certificate of Formation and EIN in hand, you can open a US business bank account — even as a non-US resident.</p>
      <h2>Cost Breakdown</h2>
      <p>State filing fee: $90 | Registered agent (year 1): included | EIN: included | Total with Instant Grow: starting at $299</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    author: 'Instant Grow Team',
    tags: JSON.stringify(['Delaware', 'LLC Formation', 'Guide']),
    published: true,
    featured: true,
    language: 'en',
  },
  {
    title: 'Wyoming LLC vs Delaware LLC: Which Is Better for Your Business?',
    slug: 'wyoming-llc-vs-delaware-llc',
    excerpt: 'Choosing between Wyoming and Delaware for your LLC? We break down costs, privacy, taxes, and legal protections to help you decide.',
    content: `
      <h2>The Big Picture</h2>
      <p>Both Wyoming and Delaware are excellent choices for LLC formation, but they serve different business needs. Here's an honest comparison.</p>
      <h2>Wyoming LLC Advantages</h2>
      <ul>
        <li><strong>Low cost</strong> – $100 filing fee, $50 annual report (for companies with assets under $250K in WY)</li>
        <li><strong>Charging order protection</strong> – one of the strongest in the country</li>
        <li><strong>No state income tax</strong></li>
        <li><strong>Anonymous LLC</strong> – members not listed in public records</li>
        <li><strong>No operating agreement required</strong></li>
      </ul>
      <h2>Delaware LLC Advantages</h2>
      <ul>
        <li><strong>Investor familiarity</strong> – VCs strongly prefer Delaware entities</li>
        <li><strong>Court of Chancery</strong> – specialized business court with predictable outcomes</li>
        <li><strong>No minimum capital requirement</strong></li>
        <li><strong>Extensive case law</strong> – legal certainty for complex structures</li>
      </ul>
      <h2>Our Recommendation</h2>
      <p><strong>Choose Wyoming if:</strong> You want maximum privacy and low ongoing costs, and you're not seeking VC funding.</p>
      <p><strong>Choose Delaware if:</strong> You plan to raise venture capital, have international investors, or need the most legally predictable environment.</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    author: 'Instant Grow Team',
    tags: JSON.stringify(['Wyoming', 'Delaware', 'LLC Comparison']),
    published: true,
    featured: false,
    language: 'en',
  },
  {
    title: 'How Non-US Residents Can Open a US Business Bank Account in 2025',
    slug: 'non-us-residents-us-business-bank-account-2025',
    excerpt: 'A practical step-by-step guide for international entrepreneurs to open a US business bank account without traveling to the US.',
    content: `
      <h2>Is It Possible?</h2>
      <p>Yes — non-US residents can open US business bank accounts. The key is knowing which banks accept international clients and what documents you need.</p>
      <h2>What You'll Need</h2>
      <ul>
        <li>Your LLC's Certificate of Formation</li>
        <li>EIN (Employer Identification Number) from the IRS</li>
        <li>Operating Agreement</li>
        <li>Valid passport</li>
        <li>Proof of address (utility bill or bank statement)</li>
      </ul>
      <h2>Best Options for International Founders</h2>
      <h3>Mercury Bank (Recommended)</h3>
      <p>Mercury is 100% online, no minimum balance, no monthly fees, and accepts non-US residents. Ideal for startups and e-commerce businesses.</p>
      <h3>Relay Financial</h3>
      <p>Excellent for businesses that need multiple sub-accounts for budgeting. No account fees and accepts non-residents.</p>
      <h3>Wise Business</h3>
      <p>Great for international transfers with low fees. Supports 40+ currencies.</p>
      <h2>The Process</h2>
      <ol>
        <li>Form your US LLC (takes 1-2 days with Instant Grow)</li>
        <li>Obtain your EIN (included in our packages)</li>
        <li>Apply online to Mercury or Relay</li>
        <li>Account approved in 2-5 business days</li>
      </ol>
    `,
    cover_image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80',
    author: 'Instant Grow Team',
    tags: JSON.stringify(['Banking', 'Non-Resident', 'Guide']),
    published: true,
    featured: false,
    language: 'en',
  },
  {
    title: 'What Is an EIN and Why Does Your LLC Need One?',
    slug: 'what-is-ein-why-llc-needs-one',
    excerpt: 'An EIN (Employer Identification Number) is essential for your US LLC. Learn what it is, how to get one, and what you can do with it.',
    content: `
      <h2>What Is an EIN?</h2>
      <p>An Employer Identification Number (EIN), also called a Federal Tax ID Number, is a unique 9-digit number assigned by the IRS to identify your business for tax purposes. It works like a Social Security Number, but for your company.</p>
      <h2>Do You Need an EIN?</h2>
      <p>Yes, in almost every case. You need an EIN to:</p>
      <ul>
        <li>Open a US business bank account</li>
        <li>Pay federal and state taxes</li>
        <li>Hire employees</li>
        <li>Apply for business licenses</li>
        <li>Accept payments through payment processors like Stripe</li>
        <li>File your annual taxes</li>
      </ul>
      <h2>How to Get an EIN</h2>
      <p>US residents can apply directly on the IRS website. Non-US residents must apply by fax or mail using Form SS-4, which can take 4-8 weeks.</p>
      <p><strong>The fast way:</strong> Instant Grow handles your EIN application as part of every LLC package. We typically receive the EIN within 2-4 weeks via our expedited process.</p>
      <h2>Is an EIN the Same as a SSN?</h2>
      <p>No. A Social Security Number is for individuals. An EIN is for businesses. As a non-US resident forming a US LLC, you do not need an SSN to get an EIN.</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    author: 'Instant Grow Team',
    tags: JSON.stringify(['EIN', 'Tax ID', 'IRS']),
    published: true,
    featured: false,
    language: 'en',
  },
  {
    title: 'Single-Member LLC vs Multi-Member LLC: Key Differences',
    slug: 'single-member-vs-multi-member-llc',
    excerpt: 'Are you forming an LLC alone or with partners? Understanding the differences between single-member and multi-member LLCs can save you from costly mistakes.',
    content: `
      <h2>The Basics</h2>
      <p>An LLC can have one owner (single-member) or multiple owners (multi-member). The choice affects taxation, management, and legal requirements.</p>
      <h2>Single-Member LLC</h2>
      <ul>
        <li><strong>Taxation:</strong> Treated as a "disregarded entity" by the IRS — profits flow to your personal tax return (Schedule C)</li>
        <li><strong>Simplicity:</strong> Easier to manage, fewer formalities</li>
        <li><strong>Privacy:</strong> Only one member to protect</li>
        <li><strong>Best for:</strong> Solo founders, freelancers, consultants</li>
      </ul>
      <h2>Multi-Member LLC</h2>
      <ul>
        <li><strong>Taxation:</strong> Taxed as a partnership by default — each member reports their share on personal returns</li>
        <li><strong>Operating Agreement:</strong> Critical to define ownership percentages, profit distribution, and decision-making</li>
        <li><strong>Complexity:</strong> More administrative work, but more flexibility for profit sharing</li>
        <li><strong>Best for:</strong> Business partnerships, co-founders</li>
      </ul>
      <h2>Which Should You Choose?</h2>
      <p>If you're starting solo, a single-member LLC is the simplest path. If you have co-founders or investors from day one, a multi-member LLC (or even a C-Corp for VC funding) may be more appropriate.</p>
      <p>Instant Grow supports both structures. Our team will guide you through the best choice for your situation.</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    author: 'Instant Grow Team',
    tags: JSON.stringify(['LLC Structure', 'Taxation', 'Business Formation']),
    published: true,
    featured: false,
    language: 'en',
  },
  {
    title: 'How to Maintain Your LLC: Annual Requirements Checklist',
    slug: 'how-to-maintain-llc-annual-requirements',
    excerpt: 'Forming an LLC is just the beginning. Keep your company in good standing with this annual compliance checklist.',
    content: `
      <h2>Why Maintenance Matters</h2>
      <p>Failing to meet annual requirements can result in your LLC being dissolved by the state — losing your liability protection and potentially your business name.</p>
      <h2>Annual Requirements by State</h2>
      <h3>Delaware</h3>
      <ul>
        <li>Annual Franchise Tax: $300 (due June 1)</li>
        <li>Registered Agent: maintain continuously</li>
        <li>No annual report required for LLCs</li>
      </ul>
      <h3>Wyoming</h3>
      <ul>
        <li>Annual Report: due on the first day of your anniversary month</li>
        <li>Fee: $60 minimum (or $0.0002 per dollar of Wyoming assets over $250K)</li>
        <li>Registered Agent: maintain continuously</li>
      </ul>
      <h2>General Best Practices</h2>
      <ol>
        <li><strong>Separate finances:</strong> Never mix personal and business funds</li>
        <li><strong>Keep records:</strong> Meeting minutes, resolutions, financial records</li>
        <li><strong>File taxes:</strong> Even if your LLC has no income, file a return</li>
        <li><strong>Update your operating agreement:</strong> When ownership or management changes</li>
        <li><strong>Renew licenses:</strong> Any local business licenses or permits</li>
      </ol>
      <h2>Let Us Handle It</h2>
      <p>Instant Grow offers annual compliance services to handle your state filings, registered agent renewals, and reminders — so you can focus on your business.</p>
    `,
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    author: 'Instant Grow Team',
    tags: JSON.stringify(['Compliance', 'Annual Report', 'LLC Maintenance']),
    published: true,
    featured: false,
    language: 'en',
  },
]

async function main() {
  // 1. Authenticate as admin (try v0.23+ superuser first, fall back to legacy)
  console.log('🔐 Authenticating as admin...')
  let token = ''

  let authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })

  if (authRes.ok) {
    token = (await authRes.json()).token
  } else {
    // Legacy v0.22- endpoint
    authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    })
    if (authRes.ok) {
      token = (await authRes.json()).token
    }
  }

  if (!token) {
    const err = await authRes.text().catch(() => '')
    console.error(`❌ Auth failed (${authRes.status}):`, err)
    console.error(`\nEmail used: ${ADMIN_EMAIL}`)
    console.error('Usage: node scripts/seed-blogs.mjs <email> <password>')
    process.exit(1)
  }
  console.log('✅ Authenticated\n')

  // 2. Seed each blog post
  for (const blog of blogs) {
    process.stdout.write(`📝 Seeding: "${blog.title}"... `)

    // Check if slug already exists
    const checkRes = await fetch(
      `${PB_URL}/api/collections/blogs/records?filter=${encodeURIComponent(`slug="${blog.slug}"`)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const checkData = await checkRes.json()

    if (checkData.totalItems > 0) {
      console.log('⏭  already exists, skipping')
      continue
    }

    const res = await fetch(`${PB_URL}/api/collections/blogs/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(blog),
    })

    if (res.ok) {
      console.log('✅ created')
    } else {
      const errText = await res.text()
      console.log(`❌ failed: ${errText}`)
    }
  }

  console.log('\n🎉 Blog seeding complete! Visit http://localhost:3000/blog to see posts.')
}

main().catch(console.error)
