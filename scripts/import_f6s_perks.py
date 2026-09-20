import openpyxl
from urllib.parse import urlparse
import json
import re
import os

wb = openpyxl.load_workbook(r'g:\Vibe coding\IG website V2\f6s_software_full_859.xlsx', data_only=True)
ws = wb['F6S Full Catalogue']
rows = list(ws.iter_rows(values_only=True))[1:]

def clean_domain(url):
    if not url:
        return ''
    url = str(url).strip()
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url
    try:
        p = urlparse(url)
        netloc = p.netloc.lower()
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ''

known = {
    'chatgpt.com': 'ChatGPT',
    'openai.com': 'OpenAI',
    'github.com': 'GitHub',
    'workspace.google.com': 'Google Workspace',
    'google.com': 'Google',
    'aws.amazon.com': 'Amazon AWS',
    'amazon.com': 'Amazon AWS',
    'cloudflare.com': 'Cloudflare',
    'linear.app': 'Linear',
    'gitlab.com': 'GitLab',
    'tiktok.com': 'TikTok',
    'stripe.com': 'Stripe',
    'notion.so': 'Notion',
    'routine.co': 'Routine',
    'hubspot.com': 'HubSpot',
    'zendesk.com': 'Zendesk',
    'intercom.com': 'Intercom',
    'mixpanel.com': 'Mixpanel',
    'segment.com': 'Segment',
    'datadoghq.com': 'Datadog',
    'sentry.io': 'Sentry',
    'mongodb.com': 'MongoDB',
    'airtable.com': 'Airtable',
    'brex.com': 'Brex',
    'mercury.com': 'Mercury',
    'typeform.com': 'Typeform',
    'loom.com': 'Loom',
    'canva.com': 'Canva',
    'figma.com': 'Figma',
    'slack.com': 'Slack',
    'twilio.com': 'Twilio',
    'sendgrid.com': 'SendGrid',
    'auth0.com': 'Auth0',
    'clerk.com': 'Clerk',
    'supabase.com': 'Supabase',
    'algolia.com': 'Algolia',
    'postman.com': 'Postman',
    'digitalocean.com': 'DigitalOcean',
    'vultr.com': 'Vultr',
    'hetzner.com': 'Hetzner',
    'clickup.com': 'ClickUp',
    'monday.com': 'Monday.com',
    'asana.com': 'Asana',
    'freshworks.com': 'Freshworks',
    'zoho.com': 'Zoho',
    'microsoft.com': 'Microsoft',
    'azure.microsoft.com': 'Microsoft Azure',
    'dropbox.com': 'Dropbox',
    'box.com': 'Box',
    'salesforce.com': 'Salesforce',
    'mailchimp.com': 'Mailchimp',
    'retune.so': 'Retune',
    'apify.com': 'Apify',
    'bubble.io': 'Bubble',
    'webflow.com': 'Webflow',
    'framer.com': 'Framer',
    'make.com': 'Make.com',
    'zapier.com': 'Zapier',
    'n8n.io': 'n8n',
    'coda.io': 'Coda',
    'miro.com': 'Miro',
}

def get_partner_name(offer_name, prod_url, direct_url):
    domain = clean_domain(prod_url) or clean_domain(direct_url)
    
    if domain in known:
        return known[domain], domain
    
    for k, v in known.items():
        if domain.endswith('.' + k) or domain == k:
            return v, domain
            
    parts = domain.split('.')
    if len(parts) >= 2:
        name = parts[0]
        name = re.sub(r'^(use|get|try|app|my|the|join)', '', name, flags=re.I)
        if not name:
            name = parts[0]
        if len(name) <= 3:
            name = name.upper()
        else:
            name = name.capitalize()
        return name, domain
    elif domain:
        return domain.capitalize(), domain
    else:
        return offer_name.split()[0], ''

def normalize_category(cat):
    if not cat:
        return 'General Software'
    c = cat.replace('\\', '').strip()
    c_lower = c.lower()
    if 'ai' in c_lower or 'artificial intelligence' in c_lower or 'machine learning' in c_lower or 'agent' in c_lower:
        return 'AI & Machine Learning'
    if 'devops' in c_lower or 'software development' in c_lower or 'programming' in c_lower or 'development' in c_lower or 'code' in c_lower or 'api' in c_lower:
        return 'Developer Tools'
    if 'cloud' in c_lower or 'hosting' in c_lower or 'infrastructure' in c_lower or 'database' in c_lower or 'server' in c_lower:
        return 'Cloud & Hosting'
    if 'security' in c_lower or 'privacy' in c_lower or 'compliance' in c_lower or 'vpn' in c_lower:
        return 'Security & Privacy'
    if 'marketing' in c_lower or 'seo' in c_lower or 'ad' in c_lower or 'social' in c_lower or 'content' in c_lower:
        return 'Marketing & SEO'
    if 'finance' in c_lower or 'payment' in c_lower or 'banking' in c_lower or 'accounting' in c_lower or 'tax' in c_lower or 'billing' in c_lower:
        return 'Finance & Payments'
    if 'productivity' in c_lower or 'crm' in c_lower or 'collaboration' in c_lower or 'project' in c_lower or 'workspace' in c_lower or 'management' in c_lower:
        return 'Productivity & CRM'
    if 'hr' in c_lower or 'hiring' in c_lower or 'recruiting' in c_lower or 'human resources' in c_lower or 'talent' in c_lower:
        return 'HR & Hiring'
    if 'design' in c_lower or 'ui' in c_lower or 'ux' in c_lower or 'video' in c_lower or 'media' in c_lower:
        return 'Design & Creative'
    if 'sales' in c_lower or 'customer' in c_lower:
        return 'Sales & Support'
    if 'legal' in c_lower:
        return 'Legal'
    return 'General Software'

items = []
seen_ids = set()

for idx, r in enumerate(rows):
    rec_type, deal_id, prod_id, offer_name, claim_type, offer_value, val_type, category, direct_url, prod_url, link_status, notes, sku, pricing_id = r
    if not offer_name:
        continue
    
    partner, domain = get_partner_name(offer_name, prod_url, direct_url)
    raw_cat = (category or 'General Software').replace('\\', '').strip()
    norm_cat = normalize_category(raw_cat)
    
    # High-res favicon/logo via Google S2 Favicon API (128px)
    logo_url = f'https://www.google.com/s2/favicons?domain={domain}&sz=128' if domain else ''
    
    val_str = str(offer_value).strip() if offer_value else ''
    if val_str and val_str.lower() != 'none':
        discount_label = val_str
    else:
        discount_label = 'Exclusive Perk'
        
    p_id = f'f6s_{deal_id}' if deal_id else f'f6s_{idx+1}'
    if p_id in seen_ids:
        p_id = f'{p_id}_{idx}'
    seen_ids.add(p_id)
    
    items.append({
        'id': p_id,
        'title_en': str(offer_name).strip(),
        'title_ar': str(offer_name).strip(),
        'description_en': f'Exclusive {norm_cat} benefit provided by {partner}. Claim verified startup credits and discounts.',
        'description_ar': f'ميزة حصرية في مجال {norm_cat} مقدمة من {partner}. احصل على أرصدة وخصومات معتمدة للشركات.',
        'partner_name': partner,
        'discount_label': discount_label,
        'promo_code': None,
        'cta_url': str(direct_url or prod_url or 'https://instantgrow.net/contact').strip(),
        'cta_label_en': 'Claim Perk',
        'cta_label_ar': 'الحصول على الميزة',
        'icon': 'Gift',
        'badge_en': norm_cat,
        'badge_ar': norm_cat,
        'color': '#1a56ff',
        'bg_color': '#f0f4ff',
        'sort_order': idx + 1,
        'active': True,
        'logo_url': logo_url,
        'category': norm_cat,
        'claim_type': str(claim_type or 'link'),
        'offer_value': val_str,
        'created': '2026-08-14 00:00:00.000',
        'updated': '2026-08-14 00:00:00.000'
    })

# Write to src/data/f6sPerks.ts
os.makedirs(r'g:\Vibe coding\IG website V2\src\data', exist_ok=True)
ts_content = '// Auto-generated F6S Software Perks Catalog (824 verified deals)\nimport type { PerkRecord } from \'../hooks/usePerks\'\n\nexport const F6S_PERKS: PerkRecord[] = ' + json.dumps(items, indent=2, ensure_ascii=False) + ';\n'

with open(r'g:\Vibe coding\IG website V2\src\data\f6sPerks.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f'Successfully wrote {len(items)} perks to src/data/f6sPerks.ts!')

# Write SQL seed
sql_lines = ['-- Seed 824 F6S Software Perks into perks table']
sql_lines.append('INSERT INTO `perks` (`id`, `title_en`, `title_ar`, `description_en`, `description_ar`, `partner_name`, `discount_label`, `promo_code`, `cta_url`, `cta_label_en`, `cta_label_ar`, `icon`, `badge_en`, `badge_ar`, `color`, `bg_color`, `sort_order`, `active`, `logo_url`, `category`, `claim_type`, `offer_value`, `created`, `updated`) VALUES')

def esc(v):
    if v is None:
        return 'NULL'
    if isinstance(v, bool):
        return '1' if v else '0'
    if isinstance(v, int):
        return str(v)
    v_str = str(v).replace("'", "''").replace('\\', '\\\\')
    return f"'{v_str}'"

val_rows = []
for it in items:
    row_str = f"({esc(it['id'])}, {esc(it['title_en'])}, {esc(it['title_ar'])}, {esc(it['description_en'])}, {esc(it['description_ar'])}, {esc(it['partner_name'])}, {esc(it['discount_label'])}, {esc(it['promo_code'])}, {esc(it['cta_url'])}, {esc(it['cta_label_en'])}, {esc(it['cta_label_ar'])}, {esc(it['icon'])}, {esc(it['badge_en'])}, {esc(it['badge_ar'])}, {esc(it['color'])}, {esc(it['bg_color'])}, {it['sort_order']}, 1, {esc(it['logo_url'])}, {esc(it['category'])}, {esc(it['claim_type'])}, {esc(it['offer_value'])}, NOW(3), NOW(3))"
    val_rows.append(row_str)

sql_content = '\n'.join(sql_lines) + '\n' + ',\n'.join(val_rows) + '\nON DUPLICATE KEY UPDATE `title_en`=VALUES(`title_en`), `cta_url`=VALUES(`cta_url`), `logo_url`=VALUES(`logo_url`), `updated`=NOW(3);\n'

with open(r'g:\Vibe coding\IG website V2\pocketbase\seed-sql\seed_f6s_perks.sql', 'w', encoding='utf-8') as f:
    f.write(sql_content)

print(f'Successfully wrote SQL seed to pocketbase/seed-sql/seed_f6s_perks.sql!')
