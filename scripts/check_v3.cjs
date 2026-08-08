const fs = require('fs');
const file = 'pocketbase/seed-sql/seed_blogs_fixed_v3.sql';
const lines = fs.readFileSync(file, 'utf8').split('\n');
console.log('Total lines:', lines.length);
let count = 0;
lines.forEach((l, idx) => {
    if (l.trim().startsWith('REPLACE INTO')) {
        count++;
        console.log(`Line ${idx+1}: Ends with ');' -> ${l.trim().endsWith(');')}`);
    }
});
console.log('Total REPLACE statements:', count);
