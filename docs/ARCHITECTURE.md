# Architecture

## Strategy
Use a modular monolith first: one web app, one API, shared typed packages and a database package. Keep domain boundaries explicit so high-load domains can later split into services without rewriting the farmer experience.

## Layers
- `apps/web`: farmer-facing PWA/mobile-ready experience.
- `apps/api`: authenticated API, domain orchestration and integrations.
- `packages/types`: shared contracts and domain models.
- `packages/database`: PostgreSQL schema, migrations and repositories.
- `packages/ui`: reusable design-system primitives.
- `packages/config`: runtime/configuration validation.

## Rules
1. No mock production data.
2. External API keys and credentials stay server-side.
3. UI never owns business logic that belongs in the API/domain layer.
4. Every recommendation should preserve provenance/confidence where relevant.
5. New agents extend existing architecture; they do not replace it.
6. Keep farmer UX simple even when backend capability grows.
