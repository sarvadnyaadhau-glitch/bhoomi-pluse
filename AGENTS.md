# SENSOTECH — Agent Guide

## What this is
SENSOTECH is a farmer-first agricultural intelligence platform. The product spec lives in `docs/MASTER_PRODUCT_SPEC.md`. The repo name is "bhoomi-pluse" but the user-facing product name is SENSOTECH.

## Tech stack
- **Frontend + Backend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Icons**: lucide-react
- **Architecture**: modular monolith — API routes under `app/api/`, UI under `app/`

## Running the app
```
docker compose -f docker-compose.base44.yml up -d --build
```
- Web entry point: port 3000
- Health check: `GET /api/health`
- The compose runs `npm install`, `prisma generate`, `prisma db push`, then `next dev` with polling enabled for bind-mount live reload.

## Project structure
```
app/
  layout.tsx        — root layout with BottomNav (mobile-first, max-w-md container)
  page.tsx          — Home / Today screen
  my-farm/          — My Farm screen
  scan/             — Scan / Crop Doctor
  ask/              — Ask SENSOTECH AI
  market/           — Market / mandi prices
  news/             — Farmer News
  more/             — More (settings, additional features)
  api/health/       — health endpoint
components/
  BottomNav.tsx     — fixed 5-item bottom navigation
lib/
  prisma.ts         — Prisma client singleton
prisma/
  schema.prisma     — database schema (Phase 1 core models)
```

## Current state (Phase 1)
- Navigation shell with 7 screens (5 in bottom nav + Market/News via shortcuts & More)
- Database schema with core models (User, Farm, Field, CropSeason, SensorDevice, SensorReading, FarmEvent)
- API health endpoint
- No auth yet — Phase 1 scaffold
- No external integrations yet — pages show "unavailable" states per spec (no fabricated data)

## Key rules from the product spec
- **Never fabricate production data**: sensor readings, satellite data, weather, market prices, government schemes, AI results. Show "unavailable" states when integrations aren't configured.
- **Sensor data is optional**: without sensors, use satellite/weather/crop/history intelligence.
- **Mobile-first**: the UI targets phone screens, centered in a max-w-md container.
- **Multilingual-ready**: Marathi, Hindi, English (i18n architecture to be added).

## Development phases
1. ✅ Architecture, frontend shell, backend, database, basic deployment
2. Farms, fields, crops, farm memory, Home/Today (real data)
3. Sensors, sensor ingestion, sensor health
4. Scan/Crop Doctor, AI architecture, Ask SENSOTECH
5. Weather, satellite, intelligence fusion
6-10. Crop intelligence → revenue systems
11. Security, performance, offline, testing, observability
