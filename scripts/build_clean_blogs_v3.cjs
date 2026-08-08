const fs = require('fs');
const path = require('path');

// Read 20260523000004_seed_blogs.sql (which has the original raw blog text)
const blogsFilePath = path.join(__dirname, '../pocketbase/seed-sql/20260523000004_seed_blogs.sql');
const content = fs.readFileSync(blogsFilePath, 'utf8');

// Parse the postgres values: title, slug, excerpt, content, cover_image, author, tags, published, featured
// Split by values blocks
const blogItems = [];

// Match individual blog tuple in ( ... )
// Since content spans multiple lines, we can match block by block
const blocks = content.split(/\n\s*\(\s*\n/);

for (let i = 1; i < blocks.length; i++) {
    let block = blocks[i];
    // Trim trailing ), or );
    const lastParen = block.lastIndexOf('\n)');
    if (lastParen !== -1) {
        block = block.substring(0, lastParen);
    }

    // Split block lines or parse fields
    // The format is:
    // 'Title',
    // 'slug',
    // 'excerpt',
    // 'content...',
    // NULL or 'cover_image',
    // 'author',
    // array['tag1', 'tag2'],
    // true,
    // true
    
    // Let's parse string values
    const lines = block.split('\n');
    let title = '', slug = '', excerpt = '', blogContent = '', coverImage = null, author = 'Instant Grow Team', tags = [], published = 1, featured = 0;
    
    let state = 'title';
    let contentLines = [];

    for (let j = 0; j < lines.length; j++) {
        let line = lines[j];
        if (state === 'title') {
            title = line.trim().replace(/^'|',?$/g, '').replace(/''/g, "'");
            state = 'slug';
        } else if (state === 'slug') {
            slug = line.trim().replace(/^'|',?$/g, '');
            state = 'excerpt';
        } else if (state === 'excerpt') {
            excerpt = line.trim().replace(/^'|',?$/g, '').replace(/''/g, "'");
            state = 'content';
        } else if (state === 'content') {
            // Check if line is the start of next fields: NULL, or 'Instant Grow Team', or array[...]
            if (line.trim().startsWith('NULL,') || line.trim().startsWith("'https:") || line.trim().startsWith("  'Instant Grow Team'")) {
                blogContent = contentLines.join('\n').trim();
                // strip trailing quote
                if (blogContent.endsWith("'")) blogContent = blogContent.slice(0, -1);
                if (blogContent.endsWith("',")) blogContent = blogContent.slice(0, -2);
                blogContent = blogContent.replace(/''/g, "'");
                
                // Next field is cover image
                coverImage = line.trim().startsWith('NULL') ? null : line.trim().replace(/^'|',?$/g, '');
                state = 'author';
            } else {
                contentLines.push(line);
            }
        } else if (state === 'author') {
            author = line.trim().replace(/^'|',?$/g, '').replace(/''/g, "'");
            state = 'tags';
        } else if (state === 'tags') {
            const tagMatch = line.match(/array\[(.*?)\]/i);
            if (tagMatch) {
                tags = tagMatch[1].split(',').map(t => t.trim().replace(/^'|'$/g, '').replace(/''/g, "'")).filter(Boolean);
            }
            state = 'flags';
        } else if (state === 'flags') {
            if (line.includes('true')) {
                if (j === lines.length - 2) featured = 1;
            }
        }
    }
    
    if (!blogContent && contentLines.length > 0) {
        blogContent = contentLines.join('\n').trim().replace(/''/g, "'");
    }

    blogItems.push({
        id: 'blog_' + Math.random().toString(36).substring(2, 10),
        title,
        slug,
        excerpt,
        content: blogContent,
        cover_image: coverImage,
        author: author || 'Instant Grow Team',
        tags: JSON.stringify(tags),
        published: 1,
        featured: (i === 1) ? 1 : 0
    });
}

console.log(`Parsed ${blogItems.length} blog posts.`);

// Helper function to escape single quotes and newlines for SQL
function sqlStr(str) {
    if (str === null || str === undefined) return 'NULL';
    const escaped = String(str).replace(/'/g, "''").replace(/\r?\n/g, "\\n");
    return `'${escaped}'`;
}

const sqlStatements = blogItems.map(item => {
    return `REPLACE INTO \`blogs\` (\`created\`, \`id\`, \`updated\`, \`title\`, \`slug\`, \`excerpt\`, \`content\`, \`cover_image\`, \`author\`, \`tags\`, \`published\`, \`featured\`, \`language\`, \`title_ar\`, \`slug_ar\`, \`excerpt_ar\`, \`content_ar\`, \`created_by\`) VALUES ('2026-07-18 18:48:28', ${sqlStr(item.id)}, '2026-07-18 18:48:28', ${sqlStr(item.title)}, ${sqlStr(item.slug)}, ${sqlStr(item.excerpt)}, ${sqlStr(item.content)}, ${sqlStr(item.cover_image)}, ${sqlStr(item.author)}, ${sqlStr(item.tags)}, ${item.published}, ${item.featured}, 'en', NULL, NULL, NULL, NULL, '');`;
});

const outPath = path.join(__dirname, '../pocketbase/seed-sql/seed_blogs_fixed_v3.sql');
const fileContent = [
    '-- Clean Blogs SQL Seed (v3)',
    'SET FOREIGN_KEY_CHECKS = 0;',
    ...sqlStatements,
    'SET FOREIGN_KEY_CHECKS = 1;'
].join('\n');

fs.writeFileSync(outPath, fileContent, 'utf8');
console.log(`Wrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
