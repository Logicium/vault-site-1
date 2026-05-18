/**
 * Thin fetch wrapper around the archetype-service API.
 * Sends credentials (cookie session for admin endpoints); throws on non-2xx.
 */
import { PLATFORM_API, PLATFORM_SLUG } from './config'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (!PLATFORM_API) throw new Error('VITE_CONTENT_API not configured')
  const res = await fetch(`${PLATFORM_API}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${method} ${path} ${res.status}: ${text}`)
  }
  return res.status === 204 ? (undefined as T) : (res.json() as Promise<T>)
}

export const contentClient = {
  // --- Public (no auth) ---
  fetchContent: () =>
    request<{ slug: string; archetype: string; plan: string; content: Record<string, unknown> }>(
      'GET',
      `/sites/${encodeURIComponent(PLATFORM_SLUG)}/content`,
    ),
  fetchReviews: () =>
    request<{ rating: number; author: string; text: string; source: string }[]>(
      'GET',
      `/sites/${encodeURIComponent(PLATFORM_SLUG)}/reviews`,
    ).catch(() => [] as Array<{ rating: number; author: string; text: string; source: string }>),
  fetchInstagram: () =>
    request<{ media: Array<{ id: string; media_url: string; permalink: string; caption?: string }> }>(
      'GET',
      `/sites/${encodeURIComponent(PLATFORM_SLUG)}/instagram`,
    ).catch(() => ({ media: [] })),
  submitForm: (type: 'contact' | 'newsletter', fields: Record<string, string>, captcha?: string) =>
    request<{ ok: true }>('POST', `/sites/${encodeURIComponent(PLATFORM_SLUG)}/submissions`, {
      type,
      fields,
      captcha,
      hp: '',
    }),

  // --- Auth ---
  requestMagicLink: (email: string, name?: string) =>
    request<{ ok: true }>('POST', `/auth/request-link`, { email, name }),
  passwordRegister: (email: string, password: string, name?: string) =>
    request<{ ok: true; owner: { id: string; email: string; name?: string } }>('POST', `/auth/register`, { email, password, name }),
  passwordLogin: (email: string, password: string) =>
    request<{ ok: true; owner: { id: string; email: string; name?: string } }>('POST', `/auth/login`, { email, password }),
  setPassword: (password: string) =>
    request<{ ok: true }>('POST', `/auth/set-password`, { password }),
  me: () => request<{ owner: { id: string; email: string; name?: string; hasPassword?: boolean } }>('GET', '/auth/me'),
  logout: () => request<{ ok: true }>('POST', '/auth/logout'),

  // --- Admin ---
  listSites: () => request<Array<{ id: string; slug: string; archetype: string; status: string; productionUrl?: string; customDomain?: string }>>('GET', '/admin/sites'),
  getDraft: (siteId: string) => request<{ version: number; published: boolean; payload: Record<string, unknown> }>('GET', `/admin/sites/${siteId}/content/draft`),
  saveDraft: (siteId: string, payload: Record<string, unknown>) => request<{ version: number; published: boolean }>('PUT', `/admin/sites/${siteId}/content/draft`, { payload }),
  publish: (siteId: string, payload?: Record<string, unknown>) => request<{ version: number; publishedAt: string }>('POST', `/admin/sites/${siteId}/content/publish`, { payload }),
  listVersions: (siteId: string) => request<Array<{ version: number; published: boolean; publishedAt?: string; createdAt: string }>>('GET', `/admin/sites/${siteId}/content/versions`),
  restoreVersion: (siteId: string, version: number) => request<{ version: number; publishedAt: string }>('POST', `/admin/sites/${siteId}/content/versions/${version}/restore`),
  uploadMedia: (siteId: string, filename: string, contentType: string, base64: string) => request<{ url: string }>('POST', `/admin/sites/${siteId}/media`, { filename, contentType, base64 }),

  listSubmissions: (siteId: string) => request<Array<{ id: string; type: string; payload: Record<string, string>; readAt?: string; createdAt: string }>>('GET', `/admin/sites/${siteId}/submissions`),
  markSubmissionRead: (siteId: string, subId: string) => request<{ ok: true }>('POST', `/admin/sites/${siteId}/submissions/${subId}/read`),

  setGooglePlace: (siteId: string, placeId: string) => request<{ ok: true }>('POST', `/admin/sites/${siteId}/google-place`, { placeId }),
  addManualReview: (siteId: string, body: { author: string; rating: number; text: string }) => request<{ id: string }>('POST', `/admin/sites/${siteId}/reviews/manual`, body),

  getInstagramConnect: (siteId: string) => request<{ url: string }>('GET', `/admin/sites/${siteId}/instagram/connect`),
  disconnectInstagram: (siteId: string) => request<{ ok: true }>('POST', `/admin/sites/${siteId}/instagram/disconnect`),

  requestDomain: (siteId: string, domain: string) => request<{ domain: string; dns: { instructions: Array<{ type: string; name: string; value: string; note: string }> } }>('POST', `/admin/sites/${siteId}/domain`, { domain }),
  verifyDomain: (siteId: string) => request<{ ok: boolean }>('POST', `/admin/sites/${siteId}/domain/verify`),
  getDomain: (siteId: string) => request<{ domain?: string; token?: string }>('GET', `/admin/sites/${siteId}/domain`),

  getAnalytics: (siteId: string) => request<Array<{ date: string; visitors: number; pageviews: number; uptimeLatencyMs: number; uptimeError?: string }>>('GET', `/admin/sites/${siteId}/analytics`),

  generateCopy: (siteId: string, field: string, prompt: string, context?: Record<string, unknown>) =>
    request<{ options: string[] }>('POST', `/admin/sites/${siteId}/ai/copy`, { field, prompt, context }),

  listOrders: () => request<Array<{ id: string; archetype: string; plan: string; status: string; siteId?: string; createdAt: string; failureReason?: string }>>('GET', '/admin/orders'),
  retryOrder: (orderId: string) => request<{ ok: true }>('POST', `/admin/orders/${orderId}/retry`),

  // --- Orders / checkout (public) ---
  createOrder: (payload: {
    archetype: 'mesa' | 'hearth' | 'vault' | 'keystone' | 'keystone'
    plan: string
    addOns: string[]
    wizardPayload: Record<string, unknown>
    owner: { email: string; name?: string }
  }) => request<{ orderId: string; checkoutUrl: string | null; dryRun?: boolean }>('POST', '/orders', payload),
  getOrder: (id: string) => request<{ id: string; status: string; siteId?: string; failureReason?: string }>('GET', `/orders/${id}`),
}
