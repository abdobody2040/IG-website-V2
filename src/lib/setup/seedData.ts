import { pb } from '../pocketbase'

async function upsertRecord(collectionName: string, recordId: string, data: Record<string, unknown>) {
  try {
    await pb.collection(collectionName).create({ id: recordId, ...data })
  } catch (err: any) {
    // If it already exists, update it instead
    if (err.status === 400 || err.status === 409 || err.status === 404) {
      try {
        await pb.collection(collectionName).update(recordId, data)
      } catch {
        // Fallback: delete and recreate if update fails
        try {
          await pb.collection(collectionName).delete(recordId)
          await pb.collection(collectionName).create({ id: recordId, ...data })
        } catch (innerErr) {
          console.error(`Failed to upsert ${collectionName}/${recordId}:`, innerErr)
        }
      }
    } else {
      throw err
    }
  }
}

export async function seedMockData(userId: string) {
  const orderId1 = 'ord000000000001'
  const orderId2 = 'ord000000000002'
  const companyId1 = 'com000000000001'
  const companyId2 = 'com000000000002'

  // Seed orders
  await upsertRecord('orders', orderId1, {
    user: userId,
    order_number: 'IG-2025-001',
    package_name: 'Standard LLC',
    company_name: 'Acme Digital LLC',
    company_state: 'Delaware',
    company_type: 'LLC',
    status: 'documents_filed',
    amount: 299,
    currency: 'usd',
    notes: 'Rush processing requested',
  })

  await upsertRecord('orders', orderId2, {
    user: userId,
    order_number: 'IG-2025-002',
    package_name: 'Premium LLC',
    company_name: 'Nova Tech Solutions LLC',
    company_state: 'Wyoming',
    company_type: 'LLC',
    status: 'pending',
    amount: 499,
    currency: 'usd',
    notes: '',
  })

  // Seed companies
  await upsertRecord('companies', companyId1, {
    user: userId,
    order: orderId1,
    company_name: 'Acme Digital LLC',
    company_type: 'LLC',
    state: 'Delaware',
    ein_number: '87-1234567',
    formation_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    registered_agent: 'Instant Grow Registered Agent Services',
    status: 'active',
  })

  await upsertRecord('companies', companyId2, {
    user: userId,
    order: orderId2,
    company_name: 'Nova Tech Solutions LLC',
    company_type: 'LLC',
    state: 'Wyoming',
    ein_number: '',
    formation_date: '',
    registered_agent: 'Instant Grow Registered Agent Services',
    status: 'pending',
  })

  // Seed documents
  await upsertRecord('documents', 'doc000000000001', {
    user: userId,
    order: orderId1,
    company: companyId1,
    name: 'Articles of Organization',
    doc_type: 'articles_of_org',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'ready',
  })

  await upsertRecord('documents', 'doc000000000002', {
    user: userId,
    order: orderId1,
    company: companyId1,
    name: 'Operating Agreement',
    doc_type: 'operating_agreement',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'ready',
  })

  await upsertRecord('documents', 'doc000000000003', {
    user: userId,
    order: orderId1,
    company: companyId1,
    name: 'EIN Confirmation Letter',
    doc_type: 'ein_letter',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'ready',
  })

  await upsertRecord('documents', 'doc000000000004', {
    user: userId,
    order: orderId2,
    company: companyId2,
    name: 'Articles of Organization',
    doc_type: 'articles_of_org',
    file_url: '',
    status: 'pending',
  })
}
