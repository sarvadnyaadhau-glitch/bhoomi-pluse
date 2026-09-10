/**
 * SENSOTECH — Supabase-compatible API client
 *
 * Drop-in replacement for @supabase/supabase-js that routes all queries
 * to the SENSOTECH Express backend. The existing frontend code uses the
 * same supabase.from(...).select().eq().insert() API surface, so no UI
 * or screen logic needs to change — only this data layer.
 *
 * Auth: JWT-based, token stored in localStorage.
 * Tables not yet implemented (tasks, recommendations, sensors, scans)
 * return empty results so the existing UI shows proper empty states.
 */

// ─── Token helpers ──────────────────────────────────────────

const TOKEN_KEY = 'sensotech_token'
const USER_KEY = 'sensotech_user'

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function setSession(token: string, user: unknown) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

function getStoredUser(): Record<string, unknown> | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

// ─── Session type (compatible with @supabase/supabase-js) ──

export interface Session {
  user: { id: string; email: string }
  access_token: string
}

// ─── API helpers ────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function apiFetch(path: string, options: RequestInit = {}): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  return { ok: res.ok, status: res.status, json: () => res.json() }
}

// ─── Table / field mapping ─────────────────────────────────

/** Tables that are not yet implemented — return empty results. */
const UNIMPLEMENTED = new Set([
  'tasks',
  'recommendations',
  'sensor_devices',
  'sensor_readings',
  'scan_sessions',
])

/** Map frontend table names to API endpoint paths. */
function tableToPath(table: string): string {
  const map: Record<string, string> = {
    farm_events: '/farm-history',
    crop_seasons: '/crop-seasons',
  }
  return map[table] || `/${table}`
}

/** Map field names for tables that use different column names in the DB. */
function mapInsertFields(table: string, payload: Record<string, unknown>): Record<string, unknown> {
  if (table === 'farm_events') {
    const { event_type, ...rest } = payload
    return { ...rest, category: event_type }
  }
  return payload
}

/** Map field names in API response back to frontend-expected names. */
function mapResponseFields(table: string, row: Record<string, unknown>): Record<string, unknown> {
  if (table === 'farm_events' && row.category !== undefined) {
    return { ...row, event_type: row.category }
  }
  return row
}

// ─── Query Builder ─────────────────────────────────────────

interface QueryState {
  table: string
  filters: Record<string, unknown>
  inFilters: Record<string, unknown[]>
  orderCol: string | null
  orderAsc: boolean
  limitN: number | null
  single: boolean
}

class QueryResult {
  private state: QueryState
  private promise: Promise<{ data: unknown; error: string | null }> | null = null

  constructor(state: QueryState) {
    this.state = state
  }

  private async execute(): Promise<{ data: unknown; error: string | null }> {
    const { table } = this.state

    // Unimplemented tables — return empty
    if (UNIMPLEMENTED.has(table)) {
      return { data: this.state.single ? null : [], error: null }
    }

    // profiles table — special handling via /auth/me
    if (table === 'profiles') {
      return this.executeProfiles()
    }

    const path = tableToPath(table)
    const params = new URLSearchParams()

    for (const [k, v] of Object.entries(this.state.filters)) {
      params.append(k, String(v))
    }
    for (const [k, vals] of Object.entries(this.state.inFilters)) {
      params.append(`${k}__in`, vals.join(','))
    }
    if (this.state.orderCol) {
      params.append('_order', this.state.orderCol)
      params.append('_asc', String(this.state.orderAsc))
    }
    if (this.state.limitN) {
      params.append('_limit', String(this.state.limitN))
    }

    const res = await apiFetch(`${path}?${params}`)
    const body = await res.json() as any

    if (!res.ok) {
      return { data: null, error: body.error || 'Request failed' }
    }

    let data = Array.isArray(body) ? body.map((r) => mapResponseFields(table, r)) : body
    if (this.state.single) {
      data = Array.isArray(data) ? (data[0] || null) : data
    }
    return { data, error: null }
  }

  private async executeProfiles(): Promise<{ data: unknown; error: string | null }> {
    // profiles.select → GET /auth/me
    const res = await apiFetch('/auth/me')
    if (!res.ok) return { data: null, error: 'Failed to fetch profile' }
    const user = await res.json() as any
    return { data: user, error: null }
  }

  then<R>(
    onFulfilled: (v: { data: unknown; error: string | null }) => R | PromiseLike<R>,
    onRejected?: (e: unknown) => R
  ): Promise<R> {
    if (!this.promise) this.promise = this.execute()
    return this.promise.then(onFulfilled, onRejected)
  }
}

class SelectBuilder {
  private state: QueryState

  constructor(table: string) {
    this.state = { table, filters: {}, inFilters: {}, orderCol: null, orderAsc: true, limitN: null, single: false }
  }

  select(_cols = '*') { return this }
  eq(col: string, val: unknown) { this.state.filters[col] = val; return this }
  in(col: string, vals: unknown[]) { this.state.inFilters[col] = vals; return this }
  order(col: string, opts?: { ascending?: boolean }) {
    this.state.orderCol = col
    this.state.orderAsc = opts?.ascending ?? true
    return this
  }
  limit(n: number) { this.state.limitN = n; return this }
  maybeSingle() {
    this.state.single = true
    return new QueryResult({ ...this.state }) as unknown as Promise<{ data: unknown; error: string | null }>
  }

  // When awaited directly (no maybeSingle), return as array
  then<R>(
    onFulfilled: (v: { data: unknown; error: string | null }) => R | PromiseLike<R>,
    onRejected?: (e: unknown) => R
  ): Promise<R> {
    return new QueryResult({ ...this.state }).then(onFulfilled, onRejected)
  }
}

class InsertBuilder {
  private table: string
  private payload: Record<string, unknown>
  private doSelect: boolean
  private single: boolean

  constructor(table: string, payload: Record<string, unknown>) {
    this.table = table
    this.payload = payload
    this.doSelect = false
    this.single = false
  }

  select() { this.doSelect = true; return this }
  maybeSingle() { this.single = true; return this }

  private async execute(): Promise<{ data: unknown; error: string | null }> {
    if (UNIMPLEMENTED.has(this.table)) {
      return { data: null, error: 'This feature is not yet available' }
    }

    if (this.table === 'profiles') {
      // profiles.insert — user already exists from signup, return stored user
      const user = getStoredUser()
      return { data: user, error: null }
    }

    const path = tableToPath(this.table)
    const body = mapInsertFields(this.table, this.payload)
    const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) })
    const json = await res.json() as any

    if (!res.ok) {
      return { data: null, error: json.error || 'Insert failed' }
    }
    const data = this.doSelect ? mapResponseFields(this.table, json) : null
    return { data, error: null }
  }

  then<R>(
    onFulfilled: (v: { data: unknown; error: string | null }) => R | PromiseLike<R>,
    onRejected?: (e: unknown) => R
  ): Promise<R> {
    return this.execute().then(onFulfilled, onRejected)
  }
}

class UpdateBuilder {
  private table: string
  private payload: Record<string, unknown>
  private filters: Record<string, unknown>

  constructor(table: string, payload: Record<string, unknown>) {
    this.table = table
    this.payload = payload
    this.filters = {}
  }

  eq(col: string, val: unknown) { this.filters[col] = val; return this }

  private async execute(): Promise<{ data: unknown; error: string | null }> {
    if (UNIMPLEMENTED.has(this.table)) {
      return { data: null, error: null } // silent no-op for unimplemented
    }

    // Find the id from filters
    const id = this.filters.id
    if (!id) return { data: null, error: 'Update requires eq("id", ...)' }

    const path = `${tableToPath(this.table)}/${id}`
    const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(this.payload) })
    const json = await res.json() as any

    if (!res.ok) return { data: null, error: json.error || 'Update failed' }
    return { data: mapResponseFields(this.table, json), error: null }
  }

  then<R>(
    onFulfilled: (v: { data: unknown; error: string | null }) => R | PromiseLike<R>,
    onRejected?: (e: unknown) => R
  ): Promise<R> {
    return this.execute().then(onFulfilled, onRejected)
  }
}

class DeleteBuilder {
  private table: string
  private filters: Record<string, unknown>

  constructor(table: string) {
    this.table = table
    this.filters = {}
  }

  eq(col: string, val: unknown) { this.filters[col] = val; return this }

  private async execute(): Promise<{ data: unknown; error: string | null }> {
    if (UNIMPLEMENTED.has(this.table)) {
      return { data: null, error: null }
    }

    const id = this.filters.id
    if (!id) return { data: null, error: 'Delete requires eq("id", ...)' }

    const path = `${tableToPath(this.table)}/${id}`
    const res = await apiFetch(path, { method: 'DELETE' })
    const json = await res.json() as any

    if (!res.ok) return { data: null, error: json.error || 'Delete failed' }
    return { data: null, error: null }
  }

  then<R>(
    onFulfilled: (v: { data: unknown; error: string | null }) => R | PromiseLike<R>,
    onRejected?: (e: unknown) => R
  ): Promise<R> {
    return this.execute().then(onFulfilled, onRejected)
  }
}

class TableBuilder {
  private table: string

  constructor(table: string) {
    this.table = table
  }

  select(_cols = '*') { return new SelectBuilder(this.table) }
  insert(payload: Record<string, unknown>) { return new InsertBuilder(this.table, payload) }
  update(payload: Record<string, unknown>) { return new UpdateBuilder(this.table, payload) }
  delete() { return new DeleteBuilder(this.table) }
}

// ─── Auth ──────────────────────────────────────────────────

type AuthChangeCallback = (event: string, session: Session | null) => void
let authChangeCallback: AuthChangeCallback | null = null

function makeSession(token: string, user: Record<string, unknown>): Session {
  return {
    user: { id: user.id as string, email: user.email as string },
    access_token: token,
  }
}

const auth = {
  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
    try {
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: options?.data?.full_name }),
      })
      const json = await res.json() as any
      if (!res.ok) return { data: null, error: { message: json.error || 'Sign up failed' } }

      setSession(json.token, json.user)
      const session = makeSession(json.token, json.user)
      authChangeCallback?.('SIGNED_IN', session)
      return { data: { session, user: json.user }, error: null }
    } catch {
      return { data: null, error: { message: 'Network error' } }
    }
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const res = await apiFetch('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json() as any
      if (!res.ok) return { data: null, error: { message: json.error || 'Sign in failed' } }

      setSession(json.token, json.user)
      const session = makeSession(json.token, json.user)
      authChangeCallback?.('SIGNED_IN', session)
      return { data: { session, user: json.user }, error: null }
    } catch {
      return { data: null, error: { message: 'Network error' } }
    }
  },

  async signOut() {
    try { await apiFetch('/auth/signout', { method: 'POST' }) } catch { /* noop */ }
    clearSession()
    authChangeCallback?.('SIGNED_OUT', null)
  },

  async getSession() {
    const token = getToken()
    const user = getStoredUser()
    if (token && user) {
      return { data: { session: makeSession(token, user) }, error: null }
    }
    return { data: { session: null }, error: null }
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    authChangeCallback = callback
    return {
      data: {
        subscription: {
          unsubscribe() { authChangeCallback = null },
        },
      },
    }
  },
}

// ─── Storage (minimal — scan uploads not in scope) ─────────

const storage = {
  from(_bucket: string) {
    return {
      async upload() {
        return { data: null, error: { message: 'Storage not configured — Crop Doctor module not yet implemented' } }
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: `${API_BASE}/uploads/${path}` } }
      },
    }
  },
}

// ─── Export ────────────────────────────────────────────────

export const supabase = { auth, storage, from: (table: string) => new TableBuilder(table) }
