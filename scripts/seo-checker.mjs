import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(__dirname, '..', 'src')

const PUBLIC_PAGES = [
  { name: 'LandingPage', file: path.join(SRC_DIR, 'router.tsx') },
  { name: 'BlogListPage', file: path.join(SRC_DIR, 'pages', 'BlogListPage.tsx') },
  { name: 'BlogDetailPage', file: path.join(SRC_DIR, 'pages', 'BlogDetailPage.tsx') },
  { name: 'SeoCountryListPage', file: path.join(SRC_DIR, 'pages', 'SeoCountryListPage.tsx') },
  { name: 'SeoCountryPage', file: path.join(SRC_DIR, 'pages', 'SeoCountryPage.tsx') },
  { name: 'ContactPage', file: path.join(SRC_DIR, 'pages', 'ContactPage.tsx') },
]

function runAudit() {
  console.log('🔍 Starting Automated SEO Audit...')
  let totalIssues = 0

  // 1. Audit Public Pages for h1, setPageMeta, and placeholders
  PUBLIC_PAGES.forEach(page => {
    if (!fs.existsSync(page.file)) {
      console.warn(`⚠️ Warning: Page file not found: ${page.file}`)
      return
    }

    const content = fs.readFileSync(page.file, 'utf-8')
    console.log(`\n📄 Auditing ${page.name} (${path.basename(page.file)})...`)

    // Check setPageMeta
    if (!content.includes('setPageMeta(')) {
      console.error('❌ Error: Missing page metadata configuration (setPageMeta).')
      totalIssues++
    } else {
      console.log('✅ Page has setPageMeta() configuration.')
    }

    // Check h1 tags count
    // Note: For router.tsx, h1 is actually in Hero.tsx component
    if (page.name === 'LandingPage') {
      const heroFile = path.join(SRC_DIR, 'components', 'Hero.tsx')
      const heroContent = fs.readFileSync(heroFile, 'utf-8')
      const h1Count = (heroContent.match(/<motion\.h1|<h1/g) || []).length
      if (h1Count !== 1) {
        console.error(`❌ Error: Hero.tsx has ${h1Count} <h1> tags (expected exactly 1).`)
        totalIssues++
      } else {
        console.log('✅ Page has exactly one <h1> tag (in Hero component).')
      }
    } else {
      const h1Count = (content.match(/<motion\.h1|<h1/g) || []).length
      if (h1Count !== 1) {
        console.error(`❌ Error: Has ${h1Count} <h1> tags (expected exactly 1).`)
        totalIssues++
      } else {
        console.log('✅ Page has exactly one <h1> tag.')
      }
    }

    // Check for placeholders
    const placeholders = ['lorem ipsum', 'todo', 'placeholder']
    placeholders.forEach(p => {
      if (content.toLowerCase().includes(p)) {
        console.warn(`⚠️ Warning: Potential placeholder text "${p}" found in page.`)
      }
    })
  })

  // 2. Audit all images under src/ for missing alt tags
  console.log('\n🖼️ Auditing Images for alt attributes...')
  function walkDir(dir, cb) {
    fs.readdirSync(dir).forEach(f => {
      const p = path.join(dir, f)
      if (fs.statSync(p).isDirectory()) {
        if (f !== 'test') { // Skip test directories
          walkDir(p, cb)
        }
      } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        cb(p)
      }
    })
  }


  walkDir(SRC_DIR, (filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8')
    // Match <img tag
    const imgRegex = /<img\b[^>]*>/gi
    let match
    while ((match = imgRegex.exec(content)) !== null) {
      const tag = match[0]
      if (!tag.includes('alt=')) {
        console.error(`❌ Error in ${path.relative(SRC_DIR, filePath)}: Image tag lacks an alt attribute: ${tag}`)
        totalIssues++
      } else {
        // Check for empty alt attribute (e.g. alt="" or alt={""})
        const emptyAltRegex = /alt=(["']\s*["']|\{\s*["']\s*["']\s*\})/gi
        if (emptyAltRegex.test(tag)) {
          console.warn(`⚠️ Warning in ${path.relative(SRC_DIR, filePath)}: Empty alt attribute found: ${tag}`)
        }
      }
    }
  })

  console.log('\n=====================================')
  if (totalIssues > 0) {
    console.error(`❌ SEO Audit FAILED: Found ${totalIssues} issue(s) to fix.`)
    process.exit(1)
  } else {
    console.log('🏆 SEO Audit PASSED: Zero critical issues found!')
    process.exit(0)
  }
}

runAudit()
