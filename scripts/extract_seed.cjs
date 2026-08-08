const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../pocketbase/seed-sql/seed_data.sql');
const content = fs.readFileSync(seedPath, 'utf8');

const lines = content.split(/\r?\n/);

const serviceLines = [];

for (const line of lines) {
    if (line.includes('REPLACE INTO `services`')) {
        serviceLines.push(line);
    }
}

console.log(`Found ${serviceLines.length} services lines.`);

// Write services SQL file (clean UTF-8)
const servicesFile = path.join(__dirname, '../pocketbase/seed-sql/seed_services_clean.sql');
const servicesSql = [
    '-- Clean Services SQL Seed',
    'SET FOREIGN_KEY_CHECKS = 0;',
    ...serviceLines,
    'SET FOREIGN_KEY_CHECKS = 1;'
].join('\n');

fs.writeFileSync(servicesFile, servicesSql, 'utf8');
console.log(`Wrote ${servicesFile} (${(fs.statSync(servicesFile).size / 1024).toFixed(1)} KB)`);
