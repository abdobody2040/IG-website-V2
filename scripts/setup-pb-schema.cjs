const fs = require('fs');
const path = require('path');

// Read email/pass and optional URL from args
const email = process.argv[2];
const password = process.argv[3];
const PB_URL = process.argv[4] || 'http://127.0.0.1:8090';

if (!email || !password) {
  console.error('\n❌ Error: Admin credentials required.');
  console.error('Usage: node scripts/setup-pb-schema.cjs <admin-email> <admin-password> [pb-url]\n');
  console.error('Example: node scripts/setup-pb-schema.cjs admin@email.com mypassword https://db.instantgrow.net\n');
  process.exit(1);
}

async function run() {
  console.log('🔑 Authenticating to PocketBase...');
  let token = '';
  
  // Try PocketBase v0.23+ superuser endpoint first
  let authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: email, password }),
  });

  if (authRes.ok) {
    const data = await authRes.json();
    token = data.token;
  } else if (authRes.status === 404) {
    // Try legacy PocketBase v0.22- admin endpoint as fallback
    console.log('ℹ️ Superuser endpoint not found (404). Trying legacy admin endpoint...');
    authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password }),
    });

    if (authRes.ok) {
      const data = await authRes.json();
      token = data.token;
    }
  }

  if (!token) {
    const errText = await authRes.text().catch(() => '');
    console.error(`❌ Authentication failed (${authRes.status}):`, errText);
    process.exit(1);
  }

  console.log('✅ Authenticated successfully!');

  // Read pb_schema.json
  const schemaPath = path.resolve(__dirname, '..', 'pocketbase', 'pb_schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Error: pocketbase/pb_schema.json file not found.');
    process.exit(1);
  }

  const collections = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  // Process each collection in pb_schema.json
  for (const col of collections) {
    const isUsers = col.name === 'users';
    const body = { ...col };

    if (isUsers) {
      console.log(`⏳ Updating collection "${col.name}"...`);
      const res = await fetch(`${PB_URL}/api/collections/_pb_users_auth_`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`⚠️ Failed to update collection "${col.name}":`, errText);
      } else {
        console.log(`✅ Collection "${col.name}" updated successfully.`);
      }
    } else {
      console.log(`⏳ Creating collection "${col.name}"...`);
      let res = await fetch(`${PB_URL}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        // If it already exists (400 conflict), update it via PATCH instead
        if (res.status === 400 && (errJson.data?.name || errJson.data?.id)) {
          console.log(`ℹ️ Collection "${col.name}" already exists. Updating via PATCH...`);
          res = await fetch(`${PB_URL}/api/collections/${col.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
            },
            body: JSON.stringify(body),
          });
        }
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        console.warn(`⚠️ Failed to set up collection "${col.name}":`, errText);
      } else {
        console.log(`✅ Collection "${col.name}" configured successfully.`);
      }
    }
  }

  console.log('\n🎉 PocketBase schema setup completed!\n');
}

run().catch(console.error);
