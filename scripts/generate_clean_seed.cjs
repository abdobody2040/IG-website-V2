const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, '../pocketbase/seed-sql/seed_data.sql');
const content = fs.readFileSync(seedDataPath, 'utf8');
const lines = content.split(/\r?\n/);

// 1. Extract Services
const serviceLines = lines.filter(l => l.startsWith('REPLACE INTO `services`'));
console.log(`Extracted ${serviceLines.length} services.`);

// 2. Extract Blogs (multi-line blocks)
const blogIndices = [];
lines.forEach((l, idx) => {
    if (l.startsWith('REPLACE INTO `blogs`')) {
        blogIndices.push(idx);
    }
});

// The services start at line 4278 in seed_data.sql
const lastBlogEndIdx = lines.findIndex((l, idx) => idx > blogIndices[blogIndices.length - 1] && l.startsWith('REPLACE INTO `'));

const cleanBlogs = [];

for (let i = 0; i < blogIndices.length; i++) {
    const start = blogIndices[i];
    const end = (i < blogIndices.length - 1) ? blogIndices[i + 1] : lastBlogEndIdx;
    const blockLines = lines.slice(start, end);
    
    // Combine lines, replacing actual newlines with \n in the single-line SQL string
    // Join with \n
    let combined = blockLines.join('\n').trim();
    
    // Now escape unescaped newlines in the string
    // We can replace actual newlines with \n
    // Note: In MySQL string literal, '\n' represents a newline character
    let singleLineSql = combined.split('\n').join('\\n');
    
    // Clean up any double-trailing spaces or extra backslashes if needed
    cleanBlogs.push(singleLineSql);
}

console.log(`Extracted and processed ${cleanBlogs.length} blogs.`);

// Create combined clean SQL file
const outputPath = path.join(__dirname, '../pocketbase/seed-sql/seed_services_blogs_fixed.sql');
const outputContent = [
    '-- Clean Services & Blogs Seed for MySQL / MariaDB (phpMyAdmin ready)',
    '-- Run this directly in phpMyAdmin',
    'SET FOREIGN_KEY_CHECKS = 0;',
    '-- SERVICES (132 rows)',
    ...serviceLines,
    '-- BLOGS (10 posts)',
    ...cleanBlogs,
    'SET FOREIGN_KEY_CHECKS = 1;'
].join('\n');

fs.writeFileSync(outputPath, outputContent, 'utf8');
console.log(`Successfully generated ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
