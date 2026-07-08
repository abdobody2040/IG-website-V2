import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PB_URL = process.env.PB_URL ?? 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.argv[2] ?? process.env.PB_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.argv[3] ?? process.env.PB_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD (or CLI arguments) must be set.');
  process.exit(1);
}

function parseSqlValues(text) {
  const records = [];
  let i = text.indexOf('values');
  if (i === -1) return [];
  i += 6; // move past 'values'
  
  while (i < text.length) {
    while (i < text.length && text[i].trim() === '' && text[i] !== '(') {
      i++;
    }
    if (text[i] !== '(') {
      break;
    }
    i++; // move past '('
    
    const fields = [];
    while (i < text.length) {
      // Skip whitespace and commas between fields
      while (i < text.length && (/\s/.test(text[i]) || text[i] === ',')) {
        i++;
      }
      
      if (text[i] === ')') {
        i++; // move past ')'
        break; // end of record
      }
      
      if (text[i] === "'") {
        i++; // move past '
        let str = '';
        while (i < text.length) {
          if (text[i] === '\\' && text[i+1] === "'") {
            str += "'";
            i += 2;
          } else if (text[i] === "'") {
            i++; // move past '
            break;
          } else {
            str += text[i];
            i++;
          }
        }
        fields.push(str);
      } else if (text.slice(i, i + 5).toLowerCase() === 'array') {
        i += 5; // move past 'array'
        while (i < text.length && text[i] !== '[') i++;
        i++; // move past '['
        const arr = [];
        while (i < text.length && text[i] !== ']') {
          while (i < text.length && (/\s/.test(text[i]) || text[i] === ',')) {
            i++;
          }
          if (text[i] === "'") {
            i++; // move past '
            let str = '';
            while (i < text.length) {
              if (text[i] === '\\' && text[i+1] === "'") {
                str += "'";
                i += 2;
              } else if (text[i] === "'") {
                i++; // move past '
                break;
              } else {
                str += text[i];
                i++;
              }
            }
            arr.push(str);
          } else {
            i++;
          }
        }
        i++; // move past ']'
        fields.push(arr);
      } else if (text.slice(i, i + 4) === 'true') {
        fields.push(true);
        i += 4;
      } else if (text.slice(i, i + 5) === 'false') {
        fields.push(false);
        i += 5;
      } else {
        i++;
      }
    }
    
    if (fields.length > 0) {
      records.push(fields);
    }
    
    while (i < text.length && text[i] !== '(' && text[i] !== ';') {
      i++;
    }
    if (text[i] === ';') break;
  }
  return records;
}

async function main() {
  console.log('🔐 Authenticating as admin...');
  let token = '';

  let authRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (authRes.ok) {
    token = (await authRes.json()).token;
  } else {
    authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    if (authRes.ok) {
      token = (await authRes.json()).token;
    } else {
      console.error('❌ Failed to authenticate:', await authRes.text());
      process.exit(1);
    }
  }
  console.log('✅ Authenticated.');

  const sqlFiles = [
    path.join(__dirname, '../pocketbase/seed-sql/20260523000001_seed_seo_countries.sql'),
    path.join(__dirname, '../pocketbase/seed-sql/20260526000001_seed_more_seo_countries.sql')
  ];

  let totalImported = 0;

  for (const filePath of sqlFiles) {
    console.log(`\nParsing SQL file: ${path.basename(filePath)}...`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      continue;
    }

    const sqlText = fs.readFileSync(filePath, 'utf8');
    const records = parseSqlValues(sqlText);

    console.log(`Found ${records.length} country records to import.`);

    for (const rec of records) {
      if (rec.length < 17) {
        console.warn(`⚠️ Skipping record with insufficient fields: ${rec[0] || 'unknown'}`);
        continue;
      }

      // Map values
      const [
        slug,
        country_name,
        country_code,
        meta_title,
        meta_description,
        hero_title,
        hero_description,
        main_keyword,
        secondary_keywords,
        pain_points_raw,
        benefits_raw,
        best_bank,
        bank_notes,
        tax_notes,
        faq_json_raw,
        cta_text,
        published
      ] = rec;

      let pain_points = [];
      let benefits = [];
      let faq_json = [];

      try { pain_points = JSON.parse(pain_points_raw); } catch {}
      try { benefits = JSON.parse(benefits_raw); } catch {}
      try { faq_json = JSON.parse(faq_json_raw); } catch {}

      const countryData = {
        slug,
        country_name,
        country_code,
        meta_title,
        meta_description,
        hero_title,
        hero_description,
        main_keyword,
        secondary_keywords,
        pain_points,
        benefits,
        best_bank,
        bank_notes,
        tax_notes,
        faq_json,
        cta_text,
        published
      };

      // Check if it already exists in PocketBase
      const searchRes = await fetch(`${PB_URL}/api/collections/countries_seo_pages/records?filter=(slug='${slug}')`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const searchData = await searchRes.json();

      if (searchData.items && searchData.items.length > 0) {
        console.log(`Updating country: ${slug} (${country_name})...`);
        const id = searchData.items[0].id;
        const res = await fetch(`${PB_URL}/api/collections/countries_seo_pages/records/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(countryData)
        });
        if (res.ok) {
          totalImported++;
        } else {
          console.error(`❌ Failed to update ${slug}:`, await res.text());
        }
      } else {
        console.log(`Creating country: ${slug} (${country_name})...`);
        const res = await fetch(`${PB_URL}/api/collections/countries_seo_pages/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(countryData)
        });
        if (res.ok) {
          totalImported++;
        } else {
          console.error(`❌ Failed to create ${slug}:`, await res.text());
        }
      }
    }
  }

  console.log(`\n🎉 Country seeding complete! Successfully imported/updated ${totalImported} country pages.`);
}

main().catch(console.error);
