import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../pocketbase/pb_data/data.db');

async function run() {
  const email = process.argv[2] || process.env.PB_ADMIN_EMAIL;
  if (!email) {
    console.error('Error: Email argument or PB_ADMIN_EMAIL environment variable is required.');
    console.error('Usage: node scripts/update-admin-role.mjs <email>');
    process.exit(1);
  }

  try {
    const db = new DatabaseSync(dbPath);
    console.log('Opened SQLite DB at:', dbPath);

    // Update role
    console.log(`Updating role to admin for email: ${email}...`);
    const result = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email);
    console.log('Update result:', result);

    // Verify
    const users = db.prepare("SELECT id, email, role FROM users WHERE role = 'admin'").all();
    console.log('Current admins in DB:', users);

  } catch (err) {
    console.error('Error running update:', err);
  }
}

run();
