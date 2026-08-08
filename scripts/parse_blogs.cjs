const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../pocketbase/seed-sql/seed_data.sql'), 'utf8');
const lines = content.split(/\r?\n/);

const blogLineIndices = [];
lines.forEach((l, idx) => {
    if (l.startsWith('REPLACE INTO `blogs`')) {
        blogLineIndices.push(idx);
    }
});

console.log('Blog statement start lines:', blogLineIndices);

// Inspect the text between blog 0 and blog 1
const blog0Lines = lines.slice(blogLineIndices[0], blogLineIndices[1]);
console.log('Blog 0 line count:', blog0Lines.length);
console.log('Blog 0 first line:', blog0Lines[0].substring(0, 100));
console.log('Blog 0 last 3 lines:', blog0Lines.slice(-3));
