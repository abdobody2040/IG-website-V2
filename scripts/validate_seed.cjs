const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../pocketbase/seed-sql/seed_services_blogs_fixed.sql');
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

console.log('Total lines in file:', lines.length);

let errors = 0;
let replaceCount = 0;

lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('REPLACE INTO')) {
        replaceCount++;
        if (!trimmed.endsWith(');')) {
            console.error(`Line ${idx + 1} error: does not end with ');' -> ends with: "${trimmed.slice(-20)}"`);
            errors++;
        }
    }
});

console.log(`Verified ${replaceCount} REPLACE INTO statements.`);
if (errors === 0) {
    console.log('✅ ALL statements end cleanly with ");" and have no multi-line broken syntax!');
} else {
    console.error(`❌ Found ${errors} syntax issues.`);
}
