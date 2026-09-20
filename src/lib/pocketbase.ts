// src/lib/pocketbase.ts
// ──────────────────────────────────────────────────────────────────
// Custom API client that replaces PocketBase SDK.
// Exposes the exact same `.collection(name)` surface so all hooks and
// pages work without any changes.
// ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ── Token storage (mirrors PocketBase localStorage behaviour) ─────
const TOKEN_KEY = 'ig_auth_token'
const MODEL_KEY = 'ig_auth_model'

export interface AuthModel {
  id: string
  email: string
  name?: string
  display_name?: string
  role: string
  verified: boolean
  phone?: string
  country?: string
  address?: string
  avatar_url?: string
  created: string
  updated: string
  [key: string]: unknown
}

// ── Helper: Safe Base64URL JWT payload parser ──────────────────────
function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    let base64 = (parts[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// ── AuthStore (compatible with PocketBase's authStore API) ────────
class AuthStore {
  private _token: string | null = null
  private _model: AuthModel | null = null
  private _listeners: Array<(token: string | null, model: AuthModel | null) => void> = []

  constructor() {
    try {
      this._token = localStorage.getItem(TOKEN_KEY)
      const raw = localStorage.getItem(MODEL_KEY)
      this._model = raw ? (JSON.parse(raw) as AuthModel) : null
    } catch { /* ignore */ }
  }

  get token(): string | null { return this._token }
  get model(): AuthModel | null { return this._model }
  get record(): AuthModel | null { return this._model }
  get isValid(): boolean {
    if (!this._token || !this._model) return false
    try {
      const payload = parseJwtPayload(this._token)
      if (!payload || typeof payload.exp !== 'number') return false
      return payload.exp > Date.now() / 1000
    } catch { return false }
  }

  save(token: string, model: AuthModel) {
    this._token = token
    this._model = model
    try {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(MODEL_KEY, JSON.stringify(model))
    } catch { /* ignore */ }
    this._emit()
  }

  clear() {
    this._token = null
    this._model = null
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(MODEL_KEY)
    } catch { /* ignore */ }
    this._emit()
  }

  onChange(cb: (token: string | null, model: AuthModel | null) => void): () => void {
    this._listeners.push(cb)
    return () => { this._listeners = this._listeners.filter(l => l !== cb) }
  }

  private _emit() {
    for (const l of this._listeners) l(this._token, this._model)
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────
async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> ?? {}),
  }
  const token = pb.authStore.token
  if (auth && token) {
    // Send token in BOTH headers.
    // Hostinger's Apache/FastCGI sometimes strips 'Authorization' before PHP sees it.
    // 'X-Auth-Token' is a custom header that Apache NEVER strips — guaranteed delivery.
    headers['Authorization'] = `Bearer ${token}`
    headers['X-Auth-Token'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (res.status === 204) return null as T

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 401) {
      pb.authStore.clear()
    }
    const msg = data?.message || data?.error || `HTTP ${res.status}`
    console.error('[apiFetch] request failed', {
      path,
      method: options.method ?? 'GET',
      status: res.status,
      message: msg,
      data,
    })
    throw Object.assign(new Error(msg), { status: res.status, data })
  }
  return data as T
}

// ── PocketBase-compatible list result ─────────────────────────────
export interface ListResult<T = Record<string, unknown>> {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
  items: T[]
}

export interface ListOptions {
  filter?: string
  sort?: string
  expand?: string
  fields?: string
  [key: string]: unknown
}

// ── Collection proxy ──────────────────────────────────────────────
function makeCollection(name: string) {
  return {
    getList<T = Record<string, unknown>>(
      page = 1,
      perPage = 30,
      opts: ListOptions = {},
    ): Promise<ListResult<T>> {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('perPage', String(perPage))
      if (opts.sort) params.set('sort', opts.sort)
      if (opts.filter) params.set('filter', opts.filter)
      params.set('_t', String(Date.now()))
      return apiFetch(`/collections/${name}/records?${params}`)
    },

    async getFullList<T = Record<string, unknown>>(
      opts: ListOptions = {},
    ): Promise<T[]> {
      let page = 1
      const all: T[] = []
      while (true) {
        const res = await this.getList<T>(page, 200, opts)
        all.push(...res.items)
        if (res.page >= res.totalPages) break
        page++
      }
      return all
    },

    async getFirstListItem<T = Record<string, unknown>>(
      filter: string,
      opts: ListOptions = {},
    ): Promise<T> {
      const res = await this.getList<T>(1, 1, { ...opts, filter })
      const item = res.items[0]
      if (!item) {
        throw Object.assign(new Error('Record not found'), { status: 404 })
      }
      return item
    },

    getOne<T = Record<string, unknown>>(id: string): Promise<T> {
      return apiFetch(`/collections/${name}/records/${id}?_t=${Date.now()}`)
    },

    create<T = Record<string, unknown>>(
      data: Record<string, unknown> | FormData,
    ): Promise<T> {
      const body = data instanceof FormData ? data : JSON.stringify(data)
      return apiFetch(`/collections/${name}/records`, {
        method: 'POST',
        body,
      })
    },

    update<T = Record<string, unknown>>(
      id: string,
      data: Record<string, unknown> | FormData,
    ): Promise<T> {
      const body = data instanceof FormData ? data : JSON.stringify(data)
      return apiFetch(`/collections/${name}/records/${id}`, {
        method: 'PATCH',
        body,
      })
    },

    delete(id: string): Promise<null> {
      return apiFetch(`/collections/${name}/records/${id}`, { method: 'DELETE' })
    },

    // ── PocketBase Auth method aliases (for `users` collection calls) ─────
    async authWithPassword(
      identity: string,
      password: string,
    ): Promise<{ token: string; record: AuthModel }> {
      return pb.login(identity, password)
    },

    async authWithOAuth2(
      _opts: unknown,
    ): Promise<{ token: string; record: AuthModel }> {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '748421095690-am0lfmkfdh1qfu7j0e8t6v6f4jmhottj.apps.googleusercontent.com'

      // ── Google Identity Services (GSI) flow ──────────────────────
      // Loads the GSI library (if not already loaded), shows the
      // Google consent popup, receives an id_token credential, then
      // decodes it and sends it to our /auth/google backend.
      return new Promise<{ token: string; record: AuthModel }>((resolve, reject) => {
        const initAndPrompt = () => {
          const google = (window as any).google
          if (!google?.accounts) {
            reject(new Error('Google Sign-In failed to load. Please refresh and try again.'))
            return
          }

          // Preferred: Google OAuth2 Token Client popup flow (immune to FedCM/One-Tap blocking)
          if (google.accounts.oauth2?.initTokenClient) {
            try {
              const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: 'email profile openid',
                prompt: 'select_account',
                callback: async (tokenResponse: any) => {
                  if (tokenResponse.error) {
                    reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google sign-in was cancelled.'))
                    return
                  }
                  try {
                    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    })
                    if (!userInfoRes.ok) throw new Error('Failed to retrieve user profile from Google')
                    const profile = await userInfoRes.json()
                    const { email, name, picture } = profile

                    const res = await apiFetch<{ token: string; record: AuthModel }>(
                      '/auth/google',
                      {
                        method: 'POST',
                        // Pass access_token so the PHP backend can verify with Google's userinfo endpoint (SEC-12)
                        body: JSON.stringify({ access_token: tokenResponse.access_token, email, name, avatar_url: picture }),
                      },
                      false,
                    )
                    pb.authStore.save(res.token, res.record)
                    resolve(res)
                  } catch (err) {
                    reject(err)
                  }
                },
              })
              tokenClient.requestAccessToken({ prompt: 'select_account' })
              return
            } catch (e) {
              console.warn('[GSI] Token client fallback to ID token prompt', e)
            }
          }

          // Fallback: GSI ID Token flow
          if (google.accounts.id) {
            const w = window as any
            if (!w.__gsiInitialized) {
              google.accounts.id.initialize({
                client_id: clientId,
                callback: async (response: { credential: string }) => {
                  try {
                    const parts = response.credential.split('.')
                    const payload = JSON.parse(atob((parts[1] || '').replace(/-/g, '+').replace(/_/g, '/')))
                    const { email, name, picture } = payload as { email: string; name: string; picture: string }

                    const res = await apiFetch<{ token: string; record: AuthModel }>(
                      '/auth/google',
                      {
                        method: 'POST',
                        // Pass id_token so the PHP backend can verify via Google's tokeninfo endpoint (SEC-12)
                        body: JSON.stringify({ id_token: response.credential, email, name, avatar_url: picture }),
                      },
                      false,
                    )
                    pb.authStore.save(res.token, res.record)
                    resolve(res)
                  } catch (err) {
                    reject(err)
                  }
                },
              })
              w.__gsiInitialized = true
            }
            google.accounts.id.prompt()
          }
        }

        // Load GSI script if not already present
        if ((window as any).google?.accounts?.id) {
          initAndPrompt()
        } else {
          const existing = document.getElementById('gsi-script')
          if (!existing) {
            const script = document.createElement('script')
            script.id = 'gsi-script'
            script.src = 'https://accounts.google.com/gsi/client'
            script.async = true
            script.defer = true
            script.onload = initAndPrompt
            script.onerror = () => reject(new Error('Failed to load Google Sign-In script.'))
            document.head.appendChild(script)
          } else {
            // Script tag exists but GSI not ready yet — poll briefly
            let tries = 0
            const poll = setInterval(() => {
              if ((window as any).google?.accounts?.id) {
                clearInterval(poll)
                initAndPrompt()
              } else if (++tries > 20) {
                clearInterval(poll)
                reject(new Error('Google Sign-In timed out. Please refresh and try again.'))
              }
            }, 150)
          }
        }
      })
    },

    async requestPasswordReset(email: string): Promise<boolean> {
      await apiFetch('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false)
      return true
    },

    async confirmPasswordReset(token: string, password: string): Promise<boolean> {
      await apiFetch('/auth/confirm-password-reset', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }, false)
      return true
    },

    async requestVerification(email: string): Promise<boolean> {
      await apiFetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false)
      return true
    },

    // ── SSE/Realtime stubs ───────────────────────────────────────
    subscribe(_topic: string, _cb: unknown): Promise<() => void> {
      return Promise.resolve(() => { /* no-op */ })
    },
    unsubscribe(_topic?: string): Promise<void> {
      return Promise.resolve()
    },
  }
}

// ── Files helper stub ─────────────────────────────────────────────
const files = {
  getURL(_record: unknown, filename: string): string {
    return filename || ''
  },
}

// ── Main client class ─────────────────────────────────────────────
class ApiClient {
  readonly authStore = new AuthStore()
  readonly files = files

  collection(name: string) {
    return makeCollection(name)
  }

  send<T = unknown>(path: string, opts: RequestInit & { headers?: Record<string, string> } = {}): Promise<T> {
    return apiFetch<T>(path, opts)
  }

  async login(email: string, password: string): Promise<{ token: string; record: AuthModel }> {
    const res = await apiFetch<{ token: string; record: AuthModel }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ identity: email, password }) },
      false,
    )
    this.authStore.save(res.token, res.record)
    return res
  }

  async register(email: string, password: string, name?: string): Promise<{ token: string; record: AuthModel }> {
    const res = await apiFetch<{ token: string; record: AuthModel }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, name }) },
      false,
    )
    this.authStore.save(res.token, res.record)
    return res
  }

  async refreshAuth(): Promise<void> {
    if (!this.authStore.isValid) return
    try {
      const res = await apiFetch<{ token: string; record: AuthModel }>('/auth/refresh', { method: 'POST' })
      this.authStore.save(res.token, res.record)
    } catch (err: unknown) {
      // Only clear session on 401 (token truly invalid/expired).
      // Network errors or 5xx should NOT sign the user out.
      const status = (err as { status?: number })?.status
      if (status === 401 || status === 403) {
        this.authStore.clear()
      }
      // Otherwise keep the existing stored credentials — user stays logged in.
    }
  }

  async logout(): Promise<void> {
    this.authStore.clear()
  }
}

export const pb = new ApiClient()

// ── Auto-refresh token before expiry ─────────────────────────────
let _refreshTimer: ReturnType<typeof setTimeout> | null = null
function scheduleRefresh() {
  if (_refreshTimer) clearTimeout(_refreshTimer)
  const token = pb.authStore.token
  if (!token) return
  try {
    const payload = parseJwtPayload(token)
    if (!payload || typeof payload.exp !== 'number') return
    const msLeft = payload.exp * 1000 - Date.now()
    const refreshIn = Math.max(msLeft - 5 * 60 * 1000, 60_000)
    _refreshTimer = setTimeout(() => pb.refreshAuth(), refreshIn)
  } catch { /* ignore */ }
}
pb.authStore.onChange(() => scheduleRefresh())
scheduleRefresh()
