import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_PB_URL

if (!pbUrl) {
  throw new Error('Missing VITE_PB_URL environment variable')
}

// Function to extract CSRF token from cookies
function getCsrfToken() {
  const match = document.cookie.match(new RegExp('(^| )csrf-token=([^;]+)'))
  return match ? match[2] : ''
}

/**
 * Singleton PocketBase client.
 */
export const pb = new PocketBase(pbUrl)

// Automatically send cookies and CSRF tokens with every request
pb.beforeSend = function (url, options) {
  options.credentials = 'include' // include cookies in cross-origin requests

  // Remove the Authorization header ONLY if it's our dummy token
  if (options.headers && (options.headers as any).Authorization === 'Bearer dummy_token_for_sdk') {
    delete (options.headers as any).Authorization
  }

  // Add CSRF token for mutations
  const method = options.method?.toUpperCase() || 'GET'
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      options.headers = Object.assign({}, options.headers, {
        'X-CSRF-Token': csrfToken
      })
    }
  }

  return { url, options }
}

// Keep token fresh — PocketBase SDK handles refresh automatically when autoRefreshThreshold is set
pb.autoCancellation(false)
