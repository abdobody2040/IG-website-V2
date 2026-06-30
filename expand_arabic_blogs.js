import PocketBase from 'pocketbase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// CONFIGURATION
// ============================================================================
// 1. Get your free Gemini API key from: https://aistudio.google.com/
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

// 2. Your PocketBase Admin Credentials
const PB_URL = 'http://127.0.0.1:8090';
const ADMIN_EMAIL = 'instantgrow.net@gmail.com';
const ADMIN_PASSWORD = 'YOUR_ADMIN_PASSWORD';
// ============================================================================

async function run() {
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || ADMIN_PASSWORD === 'YOUR_ADMIN_PASSWORD') {
    console.error('❌ ERROR: Please update GEMINI_API_KEY and ADMIN_PASSWORD at the top of this script.');
    process.exit(1);
  }

  console.log('🚀 Initializing PocketBase...');
  const pb = new PocketBase(PB_URL);

  try {
    // Authenticate as admin
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated as Admin successfully.');
  } catch (err) {
    console.error('❌ Failed to authenticate with PocketBase:', err.message);
    process.exit(1);
  }

  console.log('🧠 Initializing Gemini AI...');
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Fetch all blogs
  console.log('📄 Fetching blogs...');
  const blogs = await pb.collection('blogs').getFullList();
  console.log(`Found ${blogs.length} blogs to process.\n`);

  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    console.log(`[${i + 1}/${blogs.length}] Processing blog: "${blog.title}"...`);

    // We only process if there is English content
    if (!blog.content) {
      console.log('   ⏭️  Skipping (no English content)');
      continue;
    }

    try {
      const prompt = `
You are an expert Arabic SEO content writer. I will provide you with a short English blog post.
Your task is to TRANSLATE and EXPAND it into a comprehensive, highly-engaging, and SEO-optimized Arabic blog post.

Requirements:
1. Output MUST be in raw HTML (using h2, h3, p, ul, li, strong, etc.), matching the format of the English blog.
2. Do NOT wrap the HTML in Markdown code blocks (like \`\`\`html). Just output the raw HTML directly.
3. The Arabic text should sound natural, professional, and targeted towards business owners (LLC formation, etc).
4. Expand the content! Add relevant details, bullet points, and practical advice to make it longer and more valuable for SEO.
5. Create a catchy Arabic title and a compelling Arabic excerpt (1-2 sentences).

Return the result as a JSON object with this exact structure:
{
  "title_ar": "The Catchy Arabic Title",
  "excerpt_ar": "The compelling Arabic excerpt",
  "content_ar": "<p>The expanded raw HTML content...</p>"
}

Here is the English blog post to translate and expand:
Title: ${blog.title}
Excerpt: ${blog.excerpt}

Content:
${blog.content}
`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Clean up markdown wrapping if Gemini added it
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiData = JSON.parse(responseText);

      if (!aiData.title_ar || !aiData.content_ar) {
        throw new Error('AI did not return the expected JSON format.');
      }

      // Update PocketBase
      await pb.collection('blogs').update(blog.id, {
        title_ar: aiData.title_ar,
        excerpt_ar: aiData.excerpt_ar,
        content_ar: aiData.content_ar,
        // Optional: generate an Arabic slug if needed, but keeping the English slug is fine for URLs
      });

      console.log('   ✅ Successfully updated Arabic content!');
      
      // Add a small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (err) {
      console.error(`   ❌ Failed to process blog "${blog.title}":`, err.message);
    }
  }

  console.log('\n🎉 All blogs have been processed!');
}

run();
