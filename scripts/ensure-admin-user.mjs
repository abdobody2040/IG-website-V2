const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090';
const SUPER_EMAIL = process.argv[2] || process.env.PB_ADMIN_EMAIL || 'admin@example.local';
const SUPER_PASSWORD = process.argv[3] || process.env.PB_ADMIN_PASSWORD || 'AdminTestPassword123!';

const TARGET_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.local';
const TARGET_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'AdminTestPassword123!';

async function main() {
  console.log(`🔐 Logging in as superuser (${SUPER_EMAIL})...`);
  
  let token = '';
  // 1. Auth as superuser
  let authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: SUPER_EMAIL, password: SUPER_PASSWORD })
  });
  
  if (authRes.ok) {
    const data = await authRes.json();
    token = data.token;
  } else {
    // Fallback to legacy admin endpoint
    authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: SUPER_EMAIL, password: SUPER_PASSWORD })
    });
    if (authRes.ok) {
      const data = await authRes.json();
      token = data.token;
    } else {
      console.error('❌ Superuser login failed.');
      process.exit(1);
    }
  }
  
  console.log('✅ Superuser authenticated successfully.');
  
  // 2. Query if target user exists in users collection
  console.log(`🔍 Checking if client user ${TARGET_EMAIL} exists...`);
  const filterQuery = encodeURIComponent(`email="${TARGET_EMAIL}"`);
  const queryRes = await fetch(`${PB_URL}/api/collections/users/records?filter=${filterQuery}`, {
    headers: { 'Authorization': token }
  });
  
  if (!queryRes.ok) {
    console.error(`❌ Failed to query users collection: ${queryRes.status}`);
    process.exit(1);
  }
  
  const queryData = await queryRes.json();
  const userRecord = queryData.items && queryData.items[0];
  
  if (userRecord) {
    console.log(`🔄 Updating user ${TARGET_EMAIL} role to admin and resetting password...`);
    const updateRes = await fetch(`${PB_URL}/api/collections/users/records/${userRecord.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        password: TARGET_PASSWORD,
        passwordConfirm: TARGET_PASSWORD,
        role: 'admin'
      })
    });
    
    if (!updateRes.ok) {
      const errTxt = await updateRes.text();
      console.error(`❌ Failed to update user: ${updateRes.status} ${errTxt}`);
      process.exit(1);
    }
    console.log('✅ User successfully updated.');
  } else {
    console.log(`🌱 Creating user ${TARGET_EMAIL} with admin role...`);
    const createRes = await fetch(`${PB_URL}/api/collections/users/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        email: TARGET_EMAIL,
        password: TARGET_PASSWORD,
        passwordConfirm: TARGET_PASSWORD,
        display_name: 'Instant Grow Admin',
        role: 'admin',
        verified: true
      })
    });
    
    if (!createRes.ok) {
      const errTxt = await createRes.text();
      console.error(`❌ Failed to create user: ${createRes.status} ${errTxt}`);
      process.exit(1);
    }
    console.log('✅ User successfully created.');
  }
}

main();
