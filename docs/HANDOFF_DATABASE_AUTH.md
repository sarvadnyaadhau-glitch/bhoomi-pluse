# SENSOTECH — Module 2: Database & Authentication Handoff

> **Scope:** This document covers **Module 2 only** — the PostgreSQL database schema, JWT authentication, per-farmer authorization/ownership, and the frontend data-access layer. It does NOT cover sensor integration, Crop Doctor, weather/market intelligence, or any future module.

---

## 1. Database Entities

The database is PostgreSQL 16, managed via a single SQL migration file: `backend/src/schema.sql`. All tables use UUID primary keys (`gen_random_uuid()`).

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Farmer accounts | `id`, `email` (unique, lowercased), `password_hash` (bcrypt), `full_name`, `preferred_language`, `location_text`, `role` |
| `farms` | Farm records owned by a user | `id`, `owner_id` → `users.id`, `name`, `location_text`, `latitude`, `longitude`, `area_acres`, `area_unit`, `soil_type`, `irrigation_type` |
| `fields` | Sub-divisions of a farm | `id`, `farm_id` → `farms.id`, `name`, `area_acres`, `area_unit`, `boundary_geojson`, `latitude`, `longitude` |
| `crop_seasons` | Crop cycles on a field | `id`, `field_id` → `fields.id`, `crop_name`, `variety`, `sowing_date`, `expected_harvest_date`, `current_stage`, `season`, `status` (planning/active/harvested/failed), `notes` |
| `farm_history` | Event log / farm memory | `id`, `farm_id` → `farms.id`, `field_id` → `fields.id` (nullable), `category`, `title`, `description`, `event_date`, `metadata` (JSONB) |
| `farm_diary` | Daily diary entries | `id`, `farm_id` → `farms.id`, `field_id` → `fields.id` (nullable), `entry_text`, `entry_date`, `media_url` |
| `expenses` | Financial records | `id`, `farm_id` → `farms.id`, `field_id` → `fields.id` (nullable), `category`, `amount` (NUMERIC 12,2), `description`, `expense_date` |

### Schema Details
- **`updated_at` triggers:** `update_updated_at()` PL/pgSQL function auto-updates `updated_at` on every `UPDATE` for `users`, `farms`, `fields`, `crop_seasons`, and `expenses`.
- **Indexes:** Foreign-key and frequently filtered columns are indexed (`owner_id`, `farm_id`, `field_id`, `status`, `expense_date`).
- **Cascading deletes:** `ON DELETE CASCADE` on `farms → fields → crop_seasons`, and `farms → farm_history/farm_diary/expenses`. Deleting a farm removes all child records.
- **`field_id` is nullable** on `farm_history`, `farm_diary`, and `expenses` with `ON DELETE SET NULL` — these can be farm-level or field-level.
- **NUMERIC parsing:** The `pg` client is configured to parse `NUMERIC` columns as floats (not strings) in `backend/src/db.ts`.

---

## 2. Relationships

```
users (1) ──── (N) farms
                  │
                  ├── (N) fields
                  │       │
                  │       └── (N) crop_seasons
                  │
                  ├── (N) farm_history     [field_id nullable]
                  ├── (N) farm_diary        [field_id nullable]
                  └── (N) expenses          [field_id nullable]
```

- A **user** owns multiple **farms**.
- A **farm** contains multiple **fields**.
- A **field** has multiple **crop seasons** (one active at a time).
- **farm_history**, **farm_diary**, and **expenses** attach to a farm (required) and optionally to a specific field.

---

## 3. Authentication

### Mechanism
- **JWT-based, stateless.** Tokens are signed with `JWT_SECRET` (environment variable) and expire after **30 days** (2,592,000 seconds).
- Passwords are hashed with **bcryptjs** (10 rounds).
- Emails are **normalized to lowercase** on signup and signin.
- Tokens are sent as `Authorization: Bearer <token>` headers.
- The frontend stores the token in `localStorage` under key `sensotech_token` and the user profile under `sensotech_user`.

### Endpoints (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | None | Create account. Body: `{email, password, full_name?}`. Returns `{token, user}`. Password ≥ 6 chars. |
| POST | `/signin` | None | Authenticate. Body: `{email, password}`. Returns `{token, user}`. |
| POST | `/signout` | None | Stateless — client discards token. Returns `{success: true}`. |
| GET | `/me` | Required | Fetch current user profile. |
| PUT | `/me` | Required | Update profile. Body: `{full_name?, preferred_language?, location_text?}` (COALESCE — only provided fields update). |

### Token Verification (`backend/src/auth.ts`)
- `authMiddleware` extracts and verifies the JWT, attaching `req.userId` and `req.userEmail` to the request. Returns `401` for missing/invalid tokens.

---

## 4. Authorization / Ownership Rules

**Every data route enforces ownership at the backend — not just the frontend.**

### Principle
A farmer can only access, create, update, or delete resources that belong to them. Ownership is verified via SQL queries that join through the ownership chain (`farm → owner_id = userId`).

### Helper Functions (`backend/src/ownership.ts`)
- `farmBelongsToUser(farmId, userId)` — checks `farms.owner_id`.
- `fieldBelongsToUser(fieldId, userId)` — joins `fields → farms` and checks `owner_id`.
- `getOwnedFieldFarm(fieldId, userId)` — returns `farm_id` if owned, `null` otherwise.

### Enforcement by Route

| Resource | List | Create | Get | Update | Delete |
|---|---|---|---|---|---|
| **Farms** | `WHERE owner_id = $userId` | `owner_id = $userId` (from token) | `WHERE id = $1 AND owner_id = $2` | `WHERE id = $1 AND owner_id = $2` | `WHERE id = $1 AND owner_id = $2` |
| **Fields** | Join `farms WHERE owner_id = $userId` or `farmBelongsToUser` check | `farmBelongsToUser` check (403) | Join `farms WHERE owner_id = $userId` | Subquery `farms WHERE owner_id = $userId` | Subquery `farms WHERE owner_id = $userId` |
| **Crop Seasons** | Join `fields → farms WHERE owner_id` or `fieldBelongsToUser` | `fieldBelongsToUser` check (403) | Join `fields → farms WHERE owner_id` | Subquery through ownership chain | (no delete endpoint) |
| **Farm History** | `farmBelongsToUser` check (403) | `farmBelongsToUser` check (403) | Join `farms WHERE owner_id` | (no update endpoint) | (no delete endpoint) |
| **Farm Diary** | `farmBelongsToUser` check (403) | `farmBelongsToUser` check (403) | (no single-get endpoint) | — | — |
| **Expenses** | `farmBelongsToUser` check (403) | `farmBelongsToUser` check (403) | (via list) | Subquery `farms WHERE owner_id` | Subquery `farms WHERE owner_id` |

### Cross-Farmer Access Results
- Unauthorized access returns **404** (for direct GET/UPDATE/DELETE by id — the resource "doesn't exist" for that user) or **403** (for operations that require ownership verification of a referenced parent, e.g., creating a field in another farmer's farm).

---

## 5. Data Access Contracts (API)

### Base URL
- Frontend → API via Vite dev proxy: `/api` → `http://localhost:3001` (configured in `vite.config.ts`).
- Direct API: `http://localhost:3001/api`.

### Response Format
- **Success:** Returns the resource object (or array) as JSON.
- **Error:** `{ "error": "message" }` with appropriate HTTP status (400, 401, 403, 404, 409, 500).
- **Create:** Returns `201 Created` with the new resource.
- **Delete:** Returns `{ "success": true }`.

### Frontend Data Layer (`src/lib/supabase.ts`)
A Supabase-compatible client that routes all queries to the Express backend. Key behaviors:
- **Token management:** Stored in `localStorage` (`sensotech_token`, `sensotech_user`). Attached to every request as `Bearer` token.
- **Auth methods:** `signUp`, `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`.
- **Table query builder:** `.from(table).select().eq().in().order().limit().maybeSingle()` and `.insert().update().delete()`.
- **Table name mapping:** `farm_events` → `/farm-history`, `crop_seasons` → `/crop-seasons`; all others map directly.
- **Unimplemented tables** (`tasks`, `recommendations`, `sensor_devices`, `sensor_readings`, `scan_sessions`): Return empty results so UI shows proper empty states. These are future modules.
- **Storage:** Stub returns an error ("Storage not configured — Crop Doctor module not yet implemented"). Not part of Module 2.

---

## 6. Configuration / Environment Requirements

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Set in compose: `postgres://sensotech:sensotech_dev@db:5432/sensotech` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens. Minimum 32 characters. Delivered via `/run/base44/app.env`. |
| `PORT` | No | API port (default 3001). |
| `VITE_API_URL` | No | API URL for frontend. Defaults to Vite proxy (`/api`). In compose: `http://api:3001`. |

### Files
- `.env.base44-defaults` — Development placeholder for `JWT_SECRET` (overridden by `/run/base44/app.env`).
- `docker-compose.base44.yml` — Docker Compose dev environment (PostgreSQL, migrations, API, Vite).
- `backend/src/config.ts` — Centralized config (port, database URL, JWT secret, expiry).

---

## 7. Files Changed (Module 2)

### Backend
| File | Purpose |
|---|---|
| `backend/src/schema.sql` | Database schema: 7 tables, indexes, triggers |
| `backend/src/migrate.ts` | Migration runner (applies schema.sql) |
| `backend/src/db.ts` | pg Pool connection, NUMERIC type parser |
| `backend/src/config.ts` | Environment config (DATABASE_URL, JWT_SECRET, port, expiry) |
| `backend/src/auth.ts` | JWT authMiddleware |
| `backend/src/ownership.ts` | Ownership verification helpers |
| `backend/src/routes/auth.ts` | Auth routes: signup, signin, signout, me (GET/PUT) |
| `backend/src/routes/farms.ts` | Farm CRUD with owner_id scoping |
| `backend/src/routes/fields.ts` | Field CRUD with farm ownership checks |
| `backend/src/routes/cropSeasons.ts` | Crop season CRUD with field ownership checks |
| `backend/src/routes/farmHistory.ts` | Farm history list/create/get with ownership |
| `backend/src/routes/farmDiary.ts` | Farm diary list/create with ownership |
| `backend/src/routes/expenses.ts` | Expense CRUD with ownership |
| `backend/src/index.ts` | Express app setup, CORS, route registration, health check |
| `backend/package.json` | Dependencies: express, pg, bcryptjs, jsonwebtoken, cors, dotenv |
| `backend/tsconfig.json` | TypeScript config |

### Frontend
| File | Purpose |
|---|---|
| `src/lib/supabase.ts` | Supabase-compatible API client (auth + query builder → Express) |
| `src/context/AuthContext.tsx` | Auth provider: session state, signUp/signIn/signOut |
| `src/context/FarmContext.tsx` | Farm provider: loads user's farms, active farm selection |
| `src/types/index.ts` | TypeScript interfaces for all entities |
| `src/screens/AuthScreen.tsx` | Login/signup screen |
| `src/screens/AppLayout.tsx` | Bottom nav layout (protected routes) |
| `src/screens/HomeScreen.tsx` | Home dashboard (farm status, empty states) |
| `src/screens/MyFarmScreen.tsx` | Farm management (fields, crop seasons) |
| `src/components/ui.tsx` | Reusable UI components (Button, Card, Badge, etc.) |
| `src/styles/theme.css` | Design system: CSS variables + Tailwind directives |
| `src/App.tsx` | Root: auth gate + protected routes |
| `src/main.tsx` | App bootstrap with BrowserRouter + AuthProvider |
| `tailwind.config.js` | Tailwind config (preflight disabled, content scan) |
| `postcss.config.js` | PostCSS with Tailwind + Autoprefixer |
| `vite.config.ts` | Vite config: React plugin, alias, proxy, allowedHosts |
| `package.json` | Frontend dependencies |

### Infrastructure
| File | Purpose |
|---|---|
| `docker-compose.base44.yml` | Dev environment: db, migrate, api, web services |
| `.env.base44-defaults` | JWT_SECRET placeholder |
| `.base44/environment.json` | Base44 app metadata |
| `AGENTS.md` | AI agent project rules |

---

## 8. Tests Performed

### Authentication Flow (31 automated checks — all passing)
1. **Sign up** — Farmer A and Farmer B created successfully (201 + token).
2. **Duplicate signup** — Rejected with 409.
3. **Sign in** — Valid credentials return token; wrong password rejected (401).
4. **Session persistence** — `GET /auth/me` with token returns user profile; email normalized to lowercase.
5. **Sign out** — Returns `{success: true}` (stateless JWT — client discards token).
6. **Protected routes** — Unauthenticated requests return 401; invalid token returns 401.
7. **Profile update** — `PUT /auth/me` updates full_name, preferred_language, location_text.
8. **Farm creation** — Both farmers can create farms.
9. **Field creation** — Farmer A creates field in own farm.
10. **Crop season creation** — Farmer A creates crop season on own field.
11. **Password validation** — Short passwords rejected (400).
12. **Missing fields** — Missing required fields rejected (400).

### Authorization / Ownership Security (16 checks — all passing)
13. **Farm isolation** — Farmer A sees only own farm (1 farm); Farmer B sees only own.
14. **Cross-farmer farm GET** — Farmer B → Farmer A's farm → 404.
15. **Cross-farmer farm UPDATE** — Farmer B → Farmer A's farm → 404.
16. **Cross-farmer farm DELETE** — Farmer B → Farmer A's farm → 404.
17. **Cross-farmer field CREATE** — Farmer B → field in Farmer A's farm → 403.
18. **Cross-farmer field LIST** — Farmer B → fields?farm_id=A's farm → 403.
19. **Cross-farmer field DELETE** — Farmer B → Farmer A's field → 404.
20. **Cross-farmer crop season GET** — Farmer B → Farmer A's crop season → 404.
21. **Cross-farmer crop season CREATE** — Farmer B → crop on Farmer A's field → 403.
22. **Cross-farmer farm history LIST** — Farmer B → Farmer A's history → 403.
23. **Cross-farmer farm history CREATE** — Farmer B → history in Farmer A's farm → 403.
24. **Cross-farmer diary LIST** — Farmer B → Farmer A's diary → 403.
25. **Cross-farmer diary CREATE** — Farmer B → diary in Farmer A's farm → 403.
26. **Cross-farmer expenses LIST** — Farmer B → Farmer A's expenses → 403.
27. **Cross-farmer expense CREATE** — Farmer B → expense in Farmer A's farm → 403.
28. **Cross-farmer expense CREATE** — Farmer B → expense in Farmer A's farm → 403.

### Build & Type Checks
- **Frontend typecheck** (`tsc --noEmit`): ✅ Pass
- **Frontend build** (`tsc -b && vite build`): ✅ Pass
- **Backend typecheck** (`tsc --noEmit`): ✅ Pass
- **Lint**: No ESLint configuration in the project (not applicable).
- **Tests**: No test framework configured (not applicable). Verification done via automated curl-based API tests.

---

## 9. Known Limitations

1. **Stateless JWT** — No server-side session revocation. Sign-out is client-side (token discard). A compromised token remains valid until expiry (30 days). If server-side revocation is needed, add a token blacklist or switch to refresh-token rotation.
2. **No rate limiting** — Auth endpoints have no rate limiting. Add `express-rate-limit` before production.
3. **No password reset flow** — No email-based password recovery. Requires an email service integration (future module).
4. **No email verification** — Signup does not verify email ownership. Requires an email service (future module).
5. **Unimplemented tables return empty** — `tasks`, `recommendations`, `sensor_devices`, `sensor_readings`, `scan_sessions` return empty arrays so the UI shows empty states. These are future modules.
6. **Storage is a stub** — File uploads (scan images, diary media) are not functional. Requires a storage service (future module).
7. **Single active crop per field is a UI convention** — The database does not enforce one active crop season per field; the frontend queries `status=active` with `limit(1)`.
8. **No tests framework** — No Jest/Vitest configured. Verification is via the automated curl script at `/tmp/auth_verify.sh`.

---

## 10. Integration Instructions for the Next AI Agent

### What's Done
- PostgreSQL database with 7 tables (users, farms, fields, crop_seasons, farm_history, farm_diary, expenses).
- JWT authentication (signup, signin, signout, profile).
- Per-farmer authorization on ALL data routes (enforced at the backend).
- Frontend Supabase-compatible data layer routing to Express.
- Tailwind CSS configured with a custom design system (CSS variables + utility classes).
- Vite dev server with API proxy and live reload.
- Docker Compose dev environment (PostgreSQL, migrations, API, web).

### What's NOT Done (Future Modules — Do NOT implement unless explicitly asked)
- Sensor integration (sensor_devices, sensor_readings)
- Crop Doctor (scan_sessions, image diagnosis, AI)
- Weather intelligence
- Market intelligence (mandi prices)
- Procurement / service marketplace
- Advanced planner
- Email service (password reset, email verification)
- Rate limiting, server-side session revocation

### How to Add a New Module
1. **Schema:** Add `CREATE TABLE` statements to `backend/src/schema.sql`. The migrate runner applies the full file idempotently (uses `IF NOT EXISTS`).
2. **Routes:** Create `backend/src/routes/<resource>.ts`. Always use `authMiddleware` and verify ownership via `ownership.ts` helpers or inline ownership joins.
3. **Register route:** Add `app.use('/api/<resource>', <router>)` in `backend/src/index.ts`.
4. **Frontend:** If the frontend needs the table, add it to the supabase client's table→path mapping in `src/lib/supabase.ts` (or remove it from the `UNIMPLEMENTED` set). Add types to `src/types/index.ts`.
5. **Restart:** The API runs `tsx watch` (auto-reload). The web runs Vite (HMR). Changes appear without manual restart.

### Running the App
```bash
# Start everything
docker compose -f docker-compose.base44.yml up -d

# Check status
docker compose -f docker-compose.base44.yml ps

# View logs
docker compose -f docker-compose.base44.yml logs api --tail 20
docker compose -f docker-compose.base44.yml logs web --tail 20

# Run migrations (auto-runs on startup via the 'migrate' service)
docker compose -f docker-compose.base44.yml run --rm migrate

# Access database
docker compose -f docker-compose.base44.yml exec db psql -U sensotech -d sensotech

# Frontend typecheck/build (run on host after npm install)
npm run typecheck
npm run build

# Backend typecheck (run on host after cd backend && npm install)
cd backend && npx tsc --noEmit
```

### Verification Checklist for New Agents
- [ ] `docker compose ps` shows db (healthy), api (up), web (up)
- [ ] `curl http://localhost:3001/api/health` returns `{"status":"ok"}`
- [ ] `curl http://localhost:3000/` returns 200 (frontend)
- [ ] Frontend typecheck passes: `npm run typecheck`
- [ ] Frontend build passes: `npm run build`
- [ ] Backend typecheck passes: `cd backend && npx tsc --noEmit`
- [ ] Database tables exist: `\dt` in psql
- [ ] All tables are empty (no test/demo data)
