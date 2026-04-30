# Apartner — Feature: Profile

Build the **Profile view** end-to-end. This is the foundation for cover-letter generation and the swipe deck — without a populated profile, nothing else demos well. Read `/brand/CI.md` before any styling work and use the **frontend-design skill** for layout/visual decisions.

The DB is already set up (Prisma + SQLite, schema in `prisma/schema.prisma`, singleton at `lib/prisma.ts`, seed loaded with `profile id=1` and `Preferences` row). All work in this prompt is for `profileId = 1`.

## Scope

- Full profile form at `/profile` with auto-save on blur
- File uploads for CV, debt collection certificate (Betreibungsauszug), proof of salary
- Previous landlords as a dynamic add/remove list
- Preferences sub-form
- Profile completeness indicator at top
- Bottom navigation visible (Profile / Swipe / Status — Profile active)

**Out of scope:** AI parsing of uploaded files, swipe view, status view, Claude calls. Only the data layer + UI for profile editing.

## Routes / endpoints to build

### Pages
- `/profile` — the form (server component fetches initial data, client components handle interaction)

### API routes
- `GET /api/profile` — returns profile id=1 with relations (`previousLandlords`, `preferences`)
- `PUT /api/profile` — updates profile fields (Zod-validated, partial updates allowed)
- `POST /api/preferences` — upserts preferences for profile id=1
- `POST /api/landlords` — creates a previous landlord
- `PUT /api/landlords/[id]` — updates one
- `DELETE /api/landlords/[id]` — removes one
- `POST /api/upload` — accepts multipart, validates type + size, writes to `/uploads/{uuid}.{ext}`, returns `{ path }`
- `GET /api/file/[name]` — serves a file from `/uploads`. Validate the filename against a strict regex (`/^[a-f0-9-]+\.(pdf|jpe?g|png)$/i`) so users can't path-traverse. Set proper `Content-Type` and `Cache-Control: private, max-age=3600`.

### Field-to-endpoint mapping
- Personal info, bio, document paths → `PUT /api/profile`
- Preferences fields → `POST /api/preferences`
- Previous landlords → the three landlord endpoints
- File uploads → `POST /api/upload`, then the returned path is sent in `PUT /api/profile` to the corresponding `cvPath` / `debtCollectionCertPath` / `proofOfSalaryPath` field

## Form sections (in this order on the page)

1. **Personal info** — firstName, lastName, birthday (date), nationality, email, phone
2. **Short bio** — single textarea, ~500 char limit, placeholder: *"Tell landlords about yourself — your work, your lifestyle, why you're moving. The honest stuff lands best."*
3. **Documents** — three upload widgets: CV, Betreibungsauszug, Salärnachweis. Each shows current state (uploaded/empty), filename if present, "replace" and "remove" buttons. Empty state has a clear CTA.
4. **Previous landlords** — list with add button. Each entry has name, contact, periodStart, periodEnd. Inline editing with a remove button. Empty state: "Add your previous landlords — strong references make landlords trust you faster."
5. **Preferences** — priceMaxChf (slider or number input with CHF prefix), roomsMin (stepper), sizeSqmMin (number with m² suffix), neighborhoods (multi-select chips for Zürich Kreise 1–12), needsBalcony / needsParking / petFriendly (toggles), furnishedPreference (segmented control: Any / Furnished / Unfurnished)

## Auto-save behavior

- Trigger save on blur for text/number inputs, on change for toggles/selects/dates
- Debounce rapid changes (300ms) to avoid hammering the API
- Show a small "Saved" toast (per-field is too noisy — one toast per save batch is fine)
- On error, show an error toast and keep the dirty value in the input so the user doesn't lose their work
- Use a status indicator near the page header: idle / saving / saved / error

## Profile completeness

A pure function `computeCompleteness(profile)` in `lib/completeness.ts`:

```ts
type CompletenessResult = {
  percent: number;          // 0–100
  missing: string[];        // human-readable field labels
  isReadyToApply: boolean;  // all required fields present
};
```

Required fields for `isReadyToApply = true`:
- firstName, lastName, birthday, nationality, email, phone (all non-empty)
- shortBio (≥ 50 chars)
- cvPath, debtCollectionCertPath, proofOfSalaryPath (all set)
- preferences.priceMaxChf > 0, preferences.roomsMin > 0, preferences.neighborhoods non-empty

`previousLandlords` count toward percent but don't block readiness (some renters have none).

The header shows a progress bar with the percent and either a "✓ Ready to apply" badge or "X items missing — tap to see" expandable list.

## File upload constraints

- Max size: 5MB (validate client + server)
- Accepted MIME types: `application/pdf`, `image/jpeg`, `image/png`
- Server: rename to `{uuid}.{ext}` to avoid leaking original names
- Server: create `/uploads` if missing
- Client: show a progress bar during upload (use `XMLHttpRequest` or `fetch` with a Blob — `fetch` doesn't expose progress, so `XMLHttpRequest` is fine here)
- Replacing a file: upload the new one, update the profile, **then** delete the old file from disk. Failure to delete is non-fatal — log and continue.
- Removing a file: delete from disk, set the path field to `null`.

## Validation (Zod)

Create `lib/validation/profile.ts` with schemas for:
- `profileUpdateSchema` (partial, all fields optional but each typed correctly)
- `preferencesUpsertSchema`
- `landlordCreateSchema`, `landlordUpdateSchema`
- `furnishedPreferenceEnum` = `["any", "furnished", "unfurnished"]`

Use these at API route entry points. Reject with `400` and a useful error message on validation failure.

## State management

No global store needed for this view. Use:
- Server component for initial data fetch in `/profile/page.tsx`
- Client components for form sections, each receiving initial values as props
- Local React state per section, calling its own auto-save handler

If multiple sections need to react to a change (e.g. completeness recomputes when documents update), lift state to the page-level client component or use a small context. Don't reach for Zustand for this single page.

## Visual / layout (read CI.md first, use frontend-design skill)

- Mobile-first, max width ~480px, centered on desktop
- Generous vertical rhythm; sections separated by clear visual breaks (subtle dividers or grouped cards per CI)
- Large rounded corners, soft shadows, no hard borders
- The header (with completeness) is sticky on scroll so it's always visible
- Bottom nav sticky at the bottom; Profile icon active
- Loading states for the initial fetch and for in-flight saves
- Empty states are warm and instructive, not blank

Use the frontend-design skill to make decisions on:
- Section card vs. flat layout
- Toggle vs. checkbox styling
- Multi-select chip behavior for neighborhoods
- File upload widget visual (drop zone vs. button)

Don't invent colors, fonts, spacing — pull all tokens from CI.md.

## Files to create

```
app/
  profile/
    page.tsx                          # server component, fetches data
  api/
    profile/route.ts                  # GET, PUT
    preferences/route.ts              # POST
    landlords/route.ts                # POST
    landlords/[id]/route.ts           # PUT, DELETE
    upload/route.ts                   # POST
    file/[name]/route.ts              # GET
components/
  profile/
    ProfileForm.tsx                   # top-level client wrapper
    PersonalInfoSection.tsx
    BioSection.tsx
    DocumentsSection.tsx
    DocumentUploader.tsx              # reusable for the 3 doc types
    LandlordsSection.tsx
    LandlordRow.tsx
    PreferencesSection.tsx
    NeighborhoodPicker.tsx
    CompletenessHeader.tsx
    SaveIndicator.tsx
  nav/
    BottomNav.tsx                     # if not yet built — Profile/Swipe/Status
lib/
  completeness.ts
  validation/
    profile.ts
  upload.ts                           # server-side file write/delete helpers
  api/
    profile-client.ts                 # typed client wrappers for the API routes
```

## Acceptance

1. `/profile` loads, fetches profile id=1, renders all sections populated with current DB values.
2. Editing any field triggers auto-save within 300ms of blur; refreshing the page shows the persisted value.
3. Uploading a CV shows progress, succeeds, displays the filename, and `cvPath` is set in the DB. Same for the other two documents.
4. Replacing a file deletes the previous one from `/uploads`. Removing a file deletes it and clears the path.
5. Adding a previous landlord persists across reload. Removing one deletes it.
6. Completeness percent updates live as fields fill in. With all required fields filled and 3 docs uploaded, "Ready to apply" badge shows.
7. File serving: `GET /api/file/{uuid}.pdf` returns the file with correct `Content-Type`. A path-traversal attempt (`/api/file/..%2Fpackage.json`) is rejected.
8. Invalid uploads (oversized, wrong MIME) get a clear error message client-side and the server rejects them with a 400.
9. Bottom nav is present on `/profile` with Profile icon active. Tapping Swipe or Status navigates (even if those pages are placeholders for now).
10. Visual matches CI.md tokens — no off-brand colors, fonts, or spacing.
11. No `any` types. Zod validates every API entry point. `npm run build` passes.

## Out of scope (do NOT build)

- Auth or session handling — `profileId = 1` is hardcoded everywhere
- AI parsing of uploaded documents
- Swipe deck or status view (just placeholder pages with the bottom nav)
- Sharing profiles, exporting, deleting the profile
- Multi-language UI (German placeholder text in a few labeled spots is fine, see Bio section example)

When this is committed, the profile is real, file uploads work, and the cover-letter API in a future prompt has actual user data to personalize against.