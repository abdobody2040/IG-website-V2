const fs = require('fs');
const path = require('path');

const IDs = {
  users: '_pb_users_auth_',
  orders: 'orders_col_id12', // 15 chars
  orders_col_id123: 'orders_col_id12', // Map old ID to new ID!
  companies: 'companies_col_i', // 15 chars
  companies_col_id: 'companies_col_i', // Map old ID to new ID!
  documents: 'documents_col_i', // 15 chars
  documents_col_id: 'documents_col_i', // Map old ID to new ID!
  notifications: 'notif_col_id123', // 15 chars
  payments: 'payments_col_id', // 15 chars
  blogs: 'blogs_col_id123', // 15 chars
  countries_seo_pages: 'countries_seo_c', // 15 chars
  admin_audit_log: 'audit_log_col_i', // 15 chars
  invitations: 'invitation_col_', // 15 chars
  contact_messages: 'contact_msg_col', // 15 chars
  notification_preferences: 'notif_pref_col1', // 15 chars
  services: 'services_col_id', // 15 chars
  pages: 'pages_col_id123' // 15 chars
};

function run() {
  const schemaPath = path.resolve(__dirname, '..', 'pocketbase', 'pb_schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Error: pb_schema.json not found.');
    process.exit(1);
  }

  const collections = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  // 1. Assign static IDs and fix fields
  collections.forEach(col => {
    col.id = IDs[col.name] || col.id;
    if (!col.id || col.id.length !== 15) {
      console.warn(`⚠️ Warning: Collection ${col.name} has invalid ID: ${col.id}`);
    }

    if (col.name === 'users') {
      col.schema = col.schema || [];
      // Ensure default 'name' field is present
      if (!col.schema.some(f => f.name === 'name')) {
        col.schema.push({
          name: 'name',
          type: 'text',
          required: false,
          options: { min: null, max: null, pattern: '' }
        });
      }
      // Ensure default 'avatar' field is present with valid maxSize
      if (!col.schema.some(f => f.name === 'avatar')) {
        col.schema.push({
          name: 'avatar',
          type: 'file',
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
            thumbs: null,
            protected: false
          }
        });
      }
    }

    if (col.schema) {
      col.schema.forEach(field => {
        // Fix file fields options
        if (field.type === 'file') {
          field.options = {
            maxSelect: field.options?.maxSelect || 1,
            maxSize: field.options?.maxSize || 5242880, // 5MB default
            mimeTypes: field.options?.mimeTypes || [],
            thumbs: field.options?.thumbs || [],
            protected: !!field.options?.protected
          };
        }

        // Fix json fields options (PocketBase requires maxSize for json fields as well)
        if (field.type === 'json') {
          field.options = {
            maxSize: field.options?.maxSize || 2000000 // 2MB default
          };
        }

        // Fix relation fields target collectionId using direct mapping or lookup
        if (field.type === 'relation') {
          const targetVal = field.options?.collectionId;
          if (targetVal) {
            if (IDs[targetVal]) {
              field.options.collectionId = IDs[targetVal];
            } else {
              const targetCol = collections.find(c => c.name === targetVal);
              if (targetCol && IDs[targetCol.name]) {
                field.options.collectionId = IDs[targetCol.name];
              }
            }
          }
        }
      });
    }
  });

  // Save the updated schema
  fs.writeFileSync(schemaPath, JSON.stringify(collections, null, 2), 'utf-8');
  console.log('✅ Schema formatted and relational IDs fixed successfully.');
}

run();
