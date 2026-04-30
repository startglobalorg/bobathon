# Profile Page — Design Spec
*Apartner · 2026-04-30*

## What we're building
Full profile form at `/profile` for profileId=1. Foundation for cover-letter generation and the swipe deck. Data layer + UI only — no AI, no auth, no sharing.

## Technical decisions

### Styling
- Add CI.md brand hex tokens to `tailwind.config.ts` alongside existing shadcn CSS-variable tokens.
- Update `globals.css` CSS variables to map to CI.md hex-equivalent HSL values so both systems use the brand palette.
- No new shadcn components installed; custom components styled directly with CI.md tokens.

### Dependencies
- Install `zod` (not yet in package.json) for server-side validation at all API entry points.

### Implementation approach
**Vertical slices** — foundation first, then one complete section (API route + UI component) at a time.

## Architecture

`app/profile/page.tsx` — server component fetches profile id=1 with `previousLandlords` and `preferences`, passes to `ProfileForm`.

`ProfileForm` — page-level client wrapper. Owns completeness state, recomputes after any section saves successfully. No global store.

Each section component (`PersonalInfoSection`, `BioSection`, `DocumentsSection`, `LandlordsSection`, `PreferencesSection`) owns its own local state and calls its own API endpoint. Auto-save on blur for text/number inputs; on change for toggles/selects/dates. 300ms debounce. One toast per save batch.

## Slices

| Slice | What it builds |
|---|---|
| 0 — Foundation | zod install, tailwind tokens, Zod schemas, upload helpers, completeness fn, API client wrappers, BottomNav, CompletenessHeader, SaveIndicator, placeholder swipe/status pages |
| 1 — Personal Info + Bio | `GET/PUT /api/profile`, PersonalInfoSection, BioSection |
| 2 — Documents | `POST /api/upload`, `GET /api/file/[name]`, DocumentUploader, DocumentsSection |
| 3 — Landlords | Landlord CRUD endpoints, LandlordRow, LandlordsSection |
| 4 — Preferences | `POST /api/preferences`, NeighborhoodPicker, PreferencesSection |
| 5 — Integration | Logo in header, completeness wired to all sections, typecheck + build pass |

## File list
See `profile.md` → Files to create section for the full list.

## Acceptance
See `profile.md` → Acceptance section (11 criteria).

## Logo
`/Logo_Apartner.svg` — used in the `CompletenessHeader` / page top bar.
