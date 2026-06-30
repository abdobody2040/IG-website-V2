export const ORDER_STATUS_OPTIONS = [
  'pending','in_review','processing','documents_filed','ein_processing','completed','cancelled'
]
export const COMPANY_STATUS_OPTIONS = ['pending','active','suspended','completed']
export const DOC_STATUS_OPTIONS = ['pending','ready']
export const DOC_TYPE_OPTIONS = ['articles_of_org','operating_agreement','ein_letter','banking_resolution','other']
export const PAYMENT_STATUS_OPTIONS = ['pending','paid','failed','refunded']

export const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp'
export const ALLOWED_MIME_TYPES = [
  'application/pdf', 'image/png', 'image/jpeg', 'image/webp',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
export const MAX_FILE_SIZE = 10 * 1024 * 1024
