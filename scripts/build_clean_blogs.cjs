const fs = require('fs');
const path = require('path');

// Read 20260523000004_seed_blogs.sql or parse seed_data.sql
const seedDataPath = path.join(__dirname, '../pocketbase/seed-sql/seed_data.sql');
const content = fs.readFileSync(seedDataPath, 'utf8');

// Match each REPLACE INTO `blogs` ... VALUES ( ... ); statement using a robust parser
// In seed_data.sql, REPLACE INTO `blogs` lines start with `REPLACE INTO \`blogs\``
const rawLines = content.split(/\r?\n/);
const blogStatements = [];
let currentStmt = '';
let inBlog = false;

for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (line.startsWith('REPLACE INTO `blogs`')) {
        if (inBlog && currentStmt) {
            blogStatements.push(currentStmt.trim());
        }
        currentStmt = line;
        inBlog = true;
    } else if (inBlog) {
        if (line.startsWith('REPLACE INTO `services`') || line.startsWith('REPLACE INTO `countries_seo_pages`') || line.startsWith('REPLACE INTO `orders`')) {
            blogStatements.push(currentStmt.trim());
            currentStmt = '';
            inBlog = false;
        } else {
            currentStmt += '\n' + line;
        }
    }
}
if (inBlog && currentStmt) {
    blogStatements.push(currentStmt.trim());
}

console.log(`Parsed ${blogStatements.length} blog statements from seed_data.sql`);

// Now format each statement to be on a single line with newlines escaped as \n so phpMyAdmin doesn't break!
const cleanBlogLines = blogStatements.map((stmt, idx) => {
    // Strip trailing '$$ where slug = ...' or trailing extra stuff if any
    let cleaned = stmt;
    const endIdx = cleaned.lastIndexOf(');');
    if (endIdx !== -1) {
        cleaned = cleaned.substring(0, endIdx + 2);
    }
    // Replace actual newlines within string literals with \n
    // In SQL strings: 'hello\nworld'
    // Split into tokens by single quote to preserve string literals
    const parts = cleaned.split("'");
    for (let p = 1; p < parts.length; p += 2) {
        // String content inside single quotes
        parts[p] = parts[p]
            .replace(/\r?\n/g, '\\n')
            .replace(/\t/g, '\\t');
    }
    return parts.join("'");
});

const blogsFile = path.join(__dirname, '../pocketbase/seed-sql/seed_blogs_clean.sql');
const blogsSql = [
    '-- Clean Blogs SQL Seed',
    'SET FOREIGN_KEY_CHECKS = 0;',
    ...cleanBlogLines,
    'SET FOREIGN_KEY_CHECKS = 1;'
].join('\n');

fs.writeFileSync(blogsFile, blogsSql, 'utf8');
console.log(`Wrote ${blogsFile} (${(fs.statSync(blogsFile).size / 1024).toFixed(1)} KB)`);
