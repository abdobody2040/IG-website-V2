import PocketBase from 'pocketbase';

async function test() {
  const pb = new PocketBase(process.env.PB_URL || 'http://127.0.0.1:8090');
  const adminEmail = process.argv[2] || process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.argv[3] || process.env.PB_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.error('Usage: node scripts/test-pb-pages.mjs <email> <password>');
    console.error('Or set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD env vars.');
    process.exit(1);
  }
  try {
    console.log('Logging in as admin...');
    const authData = await pb.collection('users').authWithPassword(adminEmail, adminPassword);
    console.log('Login success! Role:', authData.record.role);
    
    console.log('Trying to query pages collection...');
    const pages = await pb.collection('pages').getFullList();
    console.log('Fetched pages count:', pages.length);
    
    console.log('Creating a test page...');
    const testSlug = 'test-temp-' + Date.now();
    const created = await pb.collection('pages').create({
      slug: testSlug,
      title_en: 'Test Page',
      title_ar: 'صفحة تجريبية',
      content_en: '<p>Hello world</p>',
      content_ar: '<p>مرحبا بالعالم</p>',
      active: true
    });
    console.log('Created test page success! ID:', created.id);
    
    console.log('Updating the test page...');
    const updated = await pb.collection('pages').update(created.id, {
      title_en: 'Updated Test Page'
    });
    console.log('Updated test page success!');
    
    console.log('Deleting the test page...');
    await pb.collection('pages').delete(created.id);
    console.log('Deleted test page success!');
    
    console.log('All tests passed successfully!');
  } catch (err) {
    console.error('Error during test execution:', err.message, err.data || err);
  }
}

test();
