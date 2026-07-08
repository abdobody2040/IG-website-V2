import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_URL = process.env.PB_URL ?? 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.argv[2] ?? process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.argv[3] ?? process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('\n❌ Usage: node scripts/restore-blogs.mjs <admin-email> <admin-password>\n');
  process.exit(1);
}

async function main() {
  console.log('🔐 Authenticating as admin...');
  let token = '';

  let authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (authRes.ok) {
    token = (await authRes.json()).token;
  } else {
    authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (authRes.ok) {
      token = (await authRes.json()).token;
    } else {
      console.error('❌ Failed to authenticate:', await authRes.text());
      process.exit(1);
    }
  }
  console.log('✅ Authenticated.');

  // Parse 20260523000004_seed_blogs.sql to get titles, slugs, tags, etc.
  const sql1Path = path.join(__dirname, '../pocketbase/seed-sql/20260523000004_seed_blogs.sql');
  const sql1 = fs.readFileSync(sql1Path, 'utf8');

  // We will manually build the array to be safe, since parsing SQL perfectly with regex is tricky.
  // Actually, I can just use the exact titles/slugs and read the contents from rewrite_blogs.sql.
  
  const sql2Path = path.join(__dirname, '../pocketbase/seed-sql/20260526000002_rewrite_blogs.sql');
  const sql2 = fs.readFileSync(sql2Path, 'utf8');

  const blogs = [
    { slug: 'why-stripe-doesnt-work-your-country', title: 'Why Stripe Doesn\'t Work in Your Country (And the One Fix)' },
    { slug: 'how-to-open-us-llc-3-steps', title: 'How to Open a US LLC in 3 Steps (From Any Country)' },
    { slug: '5-biggest-mistakes-new-llc-owners', title: '5 Biggest Mistakes New LLC Owners Make' },
    { slug: 'best-us-bank-accounts-non-residents', title: 'Best US Bank Accounts for Non-Residents (2026)' },
    { slug: 'how-to-receive-usd-payments-legally', title: 'How to Receive USD Payments Legally From Any Country' },
    { slug: 'why-global-founders-win-bigger', title: 'Why Global Founders Win Bigger (And How You Can Too)' },
    { slug: 'why-freelancers-stay-stuck', title: 'Why Freelancers Stay Stuck (And How to Escape)' },
    { slug: '10-us-llc-myths-debunked', title: '10 US LLC Myths Debunked (What Arabs Need to Know)' },
    { slug: 'scale-business-1k-to-10k', title: 'How to Scale Your Business From $1K to $10K/Month With a US LLC' },
    { slug: 'freedom-equation-us-llc-changes-your-life', title: 'The Freedom Equation: How a US LLC Changes Your Life' }
  ];

  for (const blog of blogs) {
    // Extract cover_image, excerpt, content from sql2
    const regex = new RegExp(`update public.blogs set\\s+cover_image = '([^']+)',\\s+excerpt = '([^']+)',\\s+content = \\$\\$([\\s\\S]*?)\\$\\$\\s+where slug = '${blog.slug}';`);
    const match = sql2.match(regex);
    if (match) {
      blog.cover_image = match[1];
      blog.excerpt = match[2];
      blog.content = match[3].trim();
      blog.author = 'Instant Grow Team';
      blog.language = 'en';
      blog.published = true;
      blog.featured = false;
      blog.tags = []; // You can leave tags empty or generic for now
    }
  }

  // Set the first few as featured to match old logic (first 3 usually)
  blogs[0].featured = true;
  blogs[1].featured = true;
  blogs[2].featured = true;

  console.log(`Found ${blogs.filter(b => b.content).length} blogs to restore.`);

  for (const blog of blogs) {
    if (!blog.content) continue;
    
    // Check if it already exists
    const searchRes = await fetch(`${PB_URL}/api/collections/blogs/records?filter=(slug='${blog.slug}')`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const searchData = await searchRes.json();

    if (searchData.items && searchData.items.length > 0) {
      console.log(`Updating ${blog.slug}...`);
      const id = searchData.items[0].id;
      await fetch(`${PB_URL}/api/collections/blogs/records/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(blog)
      });
    } else {
      console.log(`Creating ${blog.slug}...`);
      await fetch(`${PB_URL}/api/collections/blogs/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(blog)
      });
    }
  }

  console.log('✅ Done restoring original blogs.');
}

main().catch(console.error);
