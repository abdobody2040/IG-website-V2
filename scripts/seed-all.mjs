import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const email = process.argv[2] ?? process.env.PB_ADMIN_EMAIL;
const password = process.argv[3] ?? process.env.PB_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('\n❌ Usage: node scripts/seed-all.mjs <admin-email> <admin-password>\n');
  process.exit(1);
}

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n--------------------------------------------`);
    console.log(`🚀 Starting ${scriptName}...`);
    console.log(`--------------------------------------------`);
    const child = fork(path.join(__dirname, scriptName), [email, password]);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    await runScript('restore-blogs.mjs');
    await runScript('translate-blogs.mjs');
    await runScript('restore-countries.mjs');
    await runScript('seed-services.mjs');
    console.log('\n🏆 Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

main();
