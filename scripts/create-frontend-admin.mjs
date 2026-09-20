/**
 * create-frontend-admin.mjs
 * Creates or updates a frontend admin user in PocketBase.
 *
 * Credentials are read from environment variables — NEVER hardcoded.
 * Usage:
 *   PB_URL=http://127.0.0.1:8090 \
 *   PB_ADMIN_EMAIL=admin@example.com \
 *   PB_ADMIN_PASS=yourAdminPass \
 *   FRONTEND_ADMIN_EMAIL=frontadmin@example.com \
 *   FRONTEND_ADMIN_PASS=yourFrontendPass \
 *   node scripts/create-frontend-admin.mjs
 *
 * Or set these in .env.local and they will be loaded automatically.
 */
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local if present
const envLocalPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      if (!process.env[k.trim()]) process.env[k.trim()] = v.join('=').trim();
    }
  }
}

const PB_URL              = process.env.PB_URL              || 'http://127.0.0.1:8090';
const PB_ADMIN_EMAIL      = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASS       = process.env.PB_ADMIN_PASS;
const FRONTEND_ADMIN_EMAIL = process.env.FRONTEND_ADMIN_EMAIL;
const FRONTEND_ADMIN_PASS  = process.env.FRONTEND_ADMIN_PASS;

if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASS) {
  console.error('ERROR: PB_ADMIN_EMAIL and PB_ADMIN_PASS must be set as environment variables.');
  process.exit(1);
}
if (!FRONTEND_ADMIN_EMAIL || !FRONTEND_ADMIN_PASS) {
  console.error('ERROR: FRONTEND_ADMIN_EMAIL and FRONTEND_ADMIN_PASS must be set as environment variables.');
  process.exit(1);
}

async function main() {
  const pb = new PocketBase(PB_URL);

  await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASS);

  try {
    const existing = await pb.collection('profiles').getFirstListItem(`email="${FRONTEND_ADMIN_EMAIL}"`);
    await pb.collection('profiles').update(existing.id, {
      password: FRONTEND_ADMIN_PASS,
      passwordConfirm: FRONTEND_ADMIN_PASS,
      role: 'admin',
    });
    console.log(`Successfully updated frontend admin user: ${FRONTEND_ADMIN_EMAIL}`);
  } catch (lookupErr) {
    try {
      await pb.collection('profiles').create({
        email: FRONTEND_ADMIN_EMAIL,
        password: FRONTEND_ADMIN_PASS,
        passwordConfirm: FRONTEND_ADMIN_PASS,
        emailVisibility: true,
        role: 'admin',
        verified: true,
      });
      console.log(`Successfully created frontend admin user: ${FRONTEND_ADMIN_EMAIL}`);
    } catch (createErr) {
      console.error('Failed to create/update user in profiles collection:', createErr.message);
      process.exit(1);
    }
  }
}

main();
