import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../pocketbase/pb_data/data.db');
const outputPath = path.join(__dirname, '../test-users.txt');

async function main() {
  try {
    console.log('📖 Opening SQLite database at:', dbPath);
    const db = new DatabaseSync(dbPath);

    // Query all users that look like test users (e.g. email starts with test_ or contains test)
    console.log('🔍 Querying test users from database...');
    const users = db.prepare(`
      SELECT id, email, role, created 
      FROM users 
      WHERE email LIKE 'test%' OR email LIKE '%test%' OR email LIKE '%@example.com' OR email LIKE '%@test.local'
      ORDER BY created DESC
    `).all();

    console.log(`Found ${users.length} test users.`);

    let fileContent = `=== Test Users Created During Testing ===\n`;
    fileContent += `Generated: ${new Date().toISOString()}\n`;
    fileContent += `Total count: ${users.length}\n\n`;
    fileContent += `| ID               | Email                                  | Role    | Created (UTC)        |\n`;
    fileContent += `|------------------|----------------------------------------|---------|----------------------|\n`;

    for (const user of users) {
      const id = String(user.id).padEnd(16);
      const email = String(user.email).padEnd(38);
      const role = String(user.role).padEnd(7);
      const created = String(user.created).padEnd(20);
      fileContent += `| ${id} | ${email} | ${role} | ${created} |\n`;
    }

    fs.writeFileSync(outputPath, fileContent, 'utf-8');
    console.log(`✅ Successfully saved test users list to: ${outputPath}`);

  } catch (err) {
    console.error('❌ Failed to export test users:', err);
    process.exit(1);
  }
}

main();
