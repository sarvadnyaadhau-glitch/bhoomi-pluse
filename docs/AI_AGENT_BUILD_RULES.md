# AI agent build rules

This repository is the single source of truth for the new SENSOTECH build.

## Every agent must
- Read `README.md`, `docs/MASTER_PRODUCT_SPEC.md` and `docs/ARCHITECTURE.md` first.
- Inspect the existing tree before changing anything.
- Implement only the assigned module.
- Reuse existing contracts/components and preserve compatibility.
- Use real integrations when implementing production functionality; never silently substitute fake sensor, weather, satellite, market or government data.
- Keep secrets out of source control.
- Add/update types and API contracts with the feature.
- Keep accessibility, mobile/PWA readiness and low-data behavior in mind.
- Run install, typecheck, lint and build locally when the environment permits.
- Leave the repository in a buildable state.

## Never
- Copy the old SENSOTECH application into this repository.
- Rewrite unrelated modules.
- Create duplicate app architectures.
- Hard-code fabricated production readings.
- Put provider credentials in frontend code.
