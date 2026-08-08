const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../pocketbase/seed-sql/seed_blogs_clean.sql');
const lines = fs.readFileSync(file, 'utf8').split('\n');
lines.forEach((l, idx) => {
    if (l.startsWith('REPLACE INTO `blogs`')) {
        // match tags
        const matches = l.match(/'(.*?)'/g);
        console.log(`Blog ${idx} tags: ${matches ? matches[9] : 'N/A'}`);
    }
});
