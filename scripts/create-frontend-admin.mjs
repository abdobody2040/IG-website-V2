import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://127.0.0.1:8090');
  
  // Login as PB admin
  await pb.admins.authWithPassword('admin@example.com', 'Admin12345!');
  
  try {
    const existing = await pb.collection('profiles').getFirstListItem('email="admin@example.com"');
    await pb.collection('profiles').update(existing.id, {
      password: 'Admin12345!',
      passwordConfirm: 'Admin12345!',
      role: 'admin'
    });
    console.log('Successfully updated frontend user admin@example.com');
  } catch (e) {
    try {
      await pb.collection('profiles').create({
        email: 'admin@example.com',
        password: 'Admin12345!',
        passwordConfirm: 'Admin12345!',
        emailVisibility: true,
        role: 'admin',
        verified: true
      });
      console.log('Successfully created frontend user admin@example.com');
    } catch (e2) {
      console.error('Failed to create/update user in profiles collection.', e2.message);
    }
  }
}

main();
