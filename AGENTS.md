# SENSOTECH — AI Agent Project Rules

## Project Overview
SENSOTECH is a full-stack farm intelligence platform. This repo contains the foundation: a PostgreSQL database, JWT authentication, per-farmer data ownership, and a React frontend with a Supabase-compatible API client.

**Current module state:** Module 2 (Database + Authentication) is complete. All other modules are NOT implemented.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite 6 + Tailwind CSS 3 + react-router-dom 6 + lucide-react
- **Backend:** Express 4 + TypeScript + node-postgres (pg) + bcryptjs + jsonwebtoken
- **Database:** PostgreSQL 16
- **Dev environment:** Docker Compose (`docker-compose.base44.yml`)

## Essential Commands
```bash
# Start the app
docker compose -f docker-compose.base44.yml up -d

# Check services
docker compose -f docker-compose.base44.yml ps

# Frontend checks (run on host — requires npm install first)
npm run typecheck
npm run build

# Backend typecheck (requires cd backend && npm install first)
cd backend && npx tsc --noEmit

# Database access
docker compose -f docker-compose.base44.yml exec db psql -U sensotech -d sensotech

# Migrations (auto-run on startup; manual re-run)
docker compose -f docker-compose.base44.yml run --rm migrate
```

## Critical Rules

### 1. No Fake Data
- NEVER seed fake farmers, farms, sensors, market, weather, or news data.
- The production database must remain clean (only real user-created data).
- Unimplemented tables (`tasks`, `recommendations`, `sensor_devices`, `sensor_readings`, `scan_sessions`) return empty results — do NOT fill them with mock data.

### 2. Backend Authorization is Mandatory
- EVERY data route must verify ownership at the backend via SQL ownership checks.
- NEVER rely on frontend-only checks for security.
- Use `backend/src/ownership.ts` helpers (`farmBelongsToUser`, `fieldBelongsToUser`) or inline `WHERE owner_id = $userId` joins.
- Cross-farmer access must return 403 or 404.

### 3. Emails Are Lowercase
- Signup and signin normalize email to lowercase. Always compare case-insensitively.

### 4. Schema is Idempotent
- `backend/src/schema.sql` uses `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`.
- Adding tables/columns: append to the schema file. The migrate runner applies the entire file on every run.

### 5. Frontend Data Layer
- `src/lib/supabase.ts` is a Supabase-compatible client that routes to the Express backend.
- Do NOT install `@supabase/supabase-js`. The custom client replaces it.
- To add a new table: map it in `tableToPath()` or remove it from the `UNIMPLEMENTED` set.
- Query results are typed as `any` (matching real supabase-js). Cast at the consuming site if needed.

### 6. Don't Implement Future Modules
Unless explicitly asked, do NOT implement: sensors, Crop Doctor (scan/AI), weather, market intelligence, procurement, service marketplace, advanced planner, email service, or rate limiting.

### 7. Styling
- Tailwind CSS 3 with `preflight: false` (theme.css has its own reset).
- Design system uses CSS variables (`--brand`, `--bg`, `--text`, etc.) defined in `src/styles/theme.css`.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging.

### 8. Environment
- `JWT_SECRET` is required — delivered via `/run/base44/app.env` (platform-managed).
- `.env.base44-defaults` holds the dev placeholder (overridden by platform secrets).
- Never hardcode secret values in source files.

### 9. File Organization
- Backend routes: `backend/src/routes/<resource>.ts` — one file per resource.
- Frontend screens: `src/screens/<Name>Screen.tsx`.
- Shared UI: `src/components/ui.tsx`.
- Types: `src/types/index.ts`.
- Contexts: `src/context/` — AuthContext (session), FarmContext (active farm).

### 10. Verification Before Finishing
- `npm run typecheck` passes
- `npm run build` passes
- `cd backend && npx tsc --noEmit` passes
- `docker compose ps` shows all services healthy
- Database has no test/demo data (`SELECT count(*) FROM users` = 0 after cleanup)
- Preview renders without console errors
