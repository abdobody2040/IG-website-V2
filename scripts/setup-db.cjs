const { execSync } = require('child_process');
const path = require('path');

const email = process.argv[2] || process.env.PB_ADMIN_EMAIL;
const password = process.argv[3] || process.env.PB_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Usage: node scripts/setup-db.cjs <email> <password>');
  console.error('Or set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars.');
  process.exit(1);
}

const PB_DIR = path.resolve(__dirname, '..', 'pocketbase');
const SCRIPTS_DIR = __dirname;

async function run() {
  console.log('⏳ 1. Creating/updating PocketBase admin account...');
  try {
    execSync(`pocketbase.exe admin create ${email} ${password} --dir=pb_data`, {
      cwd: PB_DIR,
      stdio: 'ignore'
    });
    console.log('✅ Admin account created successfully.');
  } catch (err) {
    try {
      execSync(`pocketbase.exe admin update ${email} ${password} --dir=pb_data`, {
        cwd: PB_DIR,
        stdio: 'ignore'
      });
      console.log('✅ Admin account updated successfully.');
    } catch (updateErr) {
      console.error('❌ Failed to create or update admin account:', updateErr.message);
      process.exit(1);
    }
  }

  console.log('\n⏳ 2. Syncing PocketBase schema collections...');
  try {
    execSync(`node setup-pb-schema.cjs ${email} ${password}`, {
      cwd: SCRIPTS_DIR,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('❌ Failed to sync schema:', err.message);
    process.exit(1);
  }

  console.log('\n⏳ 3. Seeding all databases (Blogs, Arabic Translations, Countries)...');
  try {
    execSync(`node seed-all.mjs ${email} ${password}`, {
      cwd: SCRIPTS_DIR,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('❌ Failed to seed data:', err.message);
    process.exit(1);
  }

  console.log('\n🎉 PocketBase Database Setup & Seeding Completed Successfully!');
}

run();
