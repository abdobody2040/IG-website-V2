import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function main() {
  try {
    const services = await pb.collection('services').getFullList();
    console.log(JSON.stringify(services.map(s => ({
      id: s.id,
      title_en: s.title_en,
      category: s.category,
      type: s.type
    })), null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
