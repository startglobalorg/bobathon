# Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full `/profile` page end-to-end — personal info, bio, documents (with file upload), previous landlords, preferences — all auto-saving on blur/change, with a live completeness indicator and sticky bottom nav.

**Architecture:** Vertical slices — foundation utilities first, then one API route + UI section at a time. `app/profile/page.tsx` is a server component that fetches profile id=1 and passes it to `ProfileForm` (client wrapper). Each section component owns its own local state and calls its own endpoint with a 300ms debounced auto-save.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma + SQLite, Tailwind CSS (CI.md brand tokens), Zod (to install), Lucide icons, XHR for file upload progress.

---

## File Map

### New files
| Path | Responsibility |
|---|---|
| `lib/validation/profile.ts` | Zod schemas for all API entry points |
| `lib/completeness.ts` | Pure `computeCompleteness(profile)` function |
| `lib/upload.ts` | Server-only: write/delete files on disk |
| `lib/api/profile-client.ts` | Typed client fetch wrappers + XHR upload |
| `components/nav/BottomNav.tsx` | Sticky bottom nav (Profile/Swipe/Status) |
| `components/profile/CompletenessHeader.tsx` | Sticky header with progress bar |
| `components/profile/SaveIndicator.tsx` | idle/saving/saved/error status text |
| `components/profile/ProfileForm.tsx` | Page-level client wrapper, lifts profile state |
| `components/profile/PersonalInfoSection.tsx` | firstName, lastName, birthday, etc. |
| `components/profile/BioSection.tsx` | shortBio textarea with char counter |
| `components/profile/DocumentUploader.tsx` | Reusable file upload widget with XHR progress |
| `components/profile/DocumentsSection.tsx` | Three DocumentUploader instances |
| `components/profile/LandlordRow.tsx` | Single landlord inline-edit row |
| `components/profile/LandlordsSection.tsx` | Dynamic landlord list with add/remove |
| `components/profile/NeighborhoodPicker.tsx` | Multi-select chips for Zürich Kreise 1–12 |
| `components/profile/PreferencesSection.tsx` | Price, rooms, size, neighborhoods, toggles, furnished |
| `app/profile/page.tsx` | Server component — fetches + passes to ProfileForm |
| `app/api/profile/route.ts` | GET + PUT profile id=1 |
| `app/api/preferences/route.ts` | POST (upsert) preferences |
| `app/api/landlords/route.ts` | POST create landlord |
| `app/api/landlords/[id]/route.ts` | PUT + DELETE landlord |
| `app/api/upload/route.ts` | POST multipart — validates + writes file |
| `app/api/file/[name]/route.ts` | GET serve file (strict filename regex) |
| `app/swipe/page.tsx` | Placeholder |
| `app/status/page.tsx` | Placeholder |
| `public/Logo_Apartner.svg` | Copied from project root |

### Modified files
| Path | Change |
|---|---|
| `tailwind.config.ts` | Add CI.md brand hex tokens |
| `app/globals.css` | Update CSS variables to CI.md HSL values |
| `app/layout.tsx` | Add viewport-fit=cover for safe-area |

---

## Task 1: Branch + Dependencies + Logo

**Files:**
- Run: `git checkout -b feature/profile-page`
- Run: `npm install zod`
- Copy: `Logo_Apartner.svg` → `public/Logo_Apartner.svg`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b feature/profile-page
```

- [ ] **Step 2: Install zod**

```bash
npm install zod
```

Expected: zod appears in `package.json` dependencies.

- [ ] **Step 3: Copy logo to public directory**

```bash
cp /home/gtace/bobathon/Logo_Apartner.svg /home/gtace/bobathon/public/Logo_Apartner.svg
```

Expected: `public/Logo_Apartner.svg` exists. Accessible at `/Logo_Apartner.svg` in the browser.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json public/Logo_Apartner.svg
git commit -m "feat: install zod, add logo to public"
```

---

## Task 2: Tailwind + globals.css — CI.md brand tokens

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace tailwind.config.ts**

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // CI.md brand tokens
        accent: { DEFAULT: '#0077C8', hover: '#005FA3', soft: '#E5F1FA' },
        warm: { DEFAULT: '#FF8A6B', soft: '#FFE3D8' },
        ink: { 900: '#0F1419', 600: '#4A5560', 400: '#8A95A1' },
        border: '#E6E8EB',
        surface: { soft: '#F7F8FA' },
        success: '#1F9D55',
        error: '#D64545',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [animate],
};

export default config;
```

- [ ] **Step 2: Update globals.css CSS variables to CI.md HSL values**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 210 29% 8%;
    --card: 0 0% 100%;
    --card-foreground: 210 29% 8%;
    --popover: 0 0% 100%;
    --popover-foreground: 210 29% 8%;
    --primary: 204 100% 39%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 20% 98%;
    --secondary-foreground: 210 29% 8%;
    --muted: 220 20% 98%;
    --muted-foreground: 210 10% 59%;
    --destructive: 0 62% 56%;
    --destructive-foreground: 0 0% 100%;
    --border: 213 11% 90%;
    --input: 213 11% 90%;
    --ring: 204 100% 39%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

- [ ] **Step 3: Update app/layout.tsx — add viewport-fit for safe-area**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Apartner',
  description: 'Find your place — one swipe at a time.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Run typecheck to verify no regressions**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

Expected: exits 0, no errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat: add CI.md brand tokens to tailwind, update CSS vars"
```

---

## Task 3: Zod Validation Schemas

**Files:**
- Create: `lib/validation/profile.ts`

- [ ] **Step 1: Create lib/validation/profile.ts**

```ts
// lib/validation/profile.ts
import { z } from 'zod'

export const furnishedPreferenceEnum = z.enum(['any', 'furnished', 'unfurnished'])

export const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthday: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  shortBio: z.string().max(500).optional(),
  cvPath: z.string().nullable().optional(),
  debtCollectionCertPath: z.string().nullable().optional(),
  proofOfSalaryPath: z.string().nullable().optional(),
})

export const preferencesUpsertSchema = z.object({
  priceMaxChf: z.number().int().min(0),
  roomsMin: z.number().min(0),
  sizeSqmMin: z.number().int().min(0),
  neighborhoods: z.string(),
  needsBalcony: z.boolean(),
  needsParking: z.boolean(),
  petFriendly: z.boolean(),
  furnishedPreference: furnishedPreferenceEnum,
})

export const landlordCreateSchema = z.object({
  name: z.string(),
  contact: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
})

export const landlordUpdateSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
})
```

- [ ] **Step 2: Verify typecheck passes**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add lib/validation/profile.ts
git commit -m "feat: add Zod validation schemas for profile API"
```

---

## Task 4: Completeness Function

**Files:**
- Create: `lib/completeness.ts`

- [ ] **Step 1: Create lib/completeness.ts**

```ts
// lib/completeness.ts

export type ProfileForCompleteness = {
  firstName: string
  lastName: string
  birthday: string | Date | null
  nationality: string
  email: string
  phone: string
  shortBio: string
  cvPath: string | null
  debtCollectionCertPath: string | null
  proofOfSalaryPath: string | null
  preferences: {
    priceMaxChf: number
    roomsMin: number
    neighborhoods: string
  } | null
  previousLandlords: unknown[]
}

export type CompletenessResult = {
  percent: number
  missing: string[]
  isReadyToApply: boolean
}

export function computeCompleteness(profile: ProfileForCompleteness): CompletenessResult {
  const required: [boolean, string][] = [
    [!!profile.firstName, 'First name'],
    [!!profile.lastName, 'Last name'],
    [!!profile.birthday, 'Birthday'],
    [!!profile.nationality, 'Nationality'],
    [!!profile.email, 'Email'],
    [!!profile.phone, 'Phone'],
    [(profile.shortBio?.length ?? 0) >= 50, 'Short bio (at least 50 characters)'],
    [!!profile.cvPath, 'CV'],
    [!!profile.debtCollectionCertPath, 'Betreibungsauszug'],
    [!!profile.proofOfSalaryPath, 'Salärnachweis'],
    [(profile.preferences?.priceMaxChf ?? 0) > 0, 'Maximum rent'],
    [(profile.preferences?.roomsMin ?? 0) > 0, 'Minimum rooms'],
    [!!(profile.preferences?.neighborhoods), 'Neighborhoods'],
  ]

  const bonus: [boolean, string][] = [
    [(profile.previousLandlords?.length ?? 0) > 0, 'Previous landlords'],
  ]

  const all = [...required, ...bonus]
  const missing = required.filter(([ok]) => !ok).map(([, label]) => label)
  const passed = all.filter(([ok]) => ok).length
  const percent = Math.round((passed / all.length) * 100)
  const isReadyToApply = required.every(([ok]) => ok)

  return { percent, missing, isReadyToApply }
}
```

- [ ] **Step 2: Verify correctness manually**

In your head or in a scratch file, verify:
- Empty profile → percent 0, missing all 13 required, isReadyToApply false
- Profile with all required fields filled + 1 landlord → percent 100, missing [], isReadyToApply true
- Profile with shortBio of 30 chars → 'Short bio' in missing

- [ ] **Step 3: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add lib/completeness.ts
git commit -m "feat: add computeCompleteness pure function"
```

---

## Task 5: Server Upload Helpers

**Files:**
- Create: `lib/upload.ts`

- [ ] **Step 1: Create lib/upload.ts**

```ts
// lib/upload.ts
import fs from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true })
}

export async function writeUploadedFile(buffer: Buffer, ext: string): Promise<string> {
  await ensureUploadsDir()
  const filename = `${randomUUID()}.${ext}`
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer)
  return filename
}

export async function deleteUploadedFile(filename: string): Promise<void> {
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename))
  } catch (err) {
    console.error('[upload] Failed to delete file:', filename, err)
  }
}

export function uploadsFilePath(filename: string): string {
  return path.join(UPLOADS_DIR, filename)
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/upload.ts
git commit -m "feat: add server-side upload file helpers"
```

---

## Task 6: API Client Helpers

**Files:**
- Create: `lib/api/profile-client.ts`

- [ ] **Step 1: Create lib/api/profile-client.ts**

```ts
// lib/api/profile-client.ts

// Runtime types: dates are ISO strings after JSON serialization
export type ClientPreferences = {
  id: number
  profileId: number
  priceMaxChf: number
  roomsMin: number
  sizeSqmMin: number
  neighborhoods: string
  needsBalcony: boolean
  needsParking: boolean
  petFriendly: boolean
  furnishedPreference: string
}

export type ClientLandlord = {
  id: number
  profileId: number
  name: string
  contact: string
  periodStart: string
  periodEnd: string
}

export type ClientProfile = {
  id: number
  firstName: string
  lastName: string
  birthday: string
  nationality: string
  email: string
  phone: string
  shortBio: string
  cvPath: string | null
  debtCollectionCertPath: string | null
  proofOfSalaryPath: string | null
  previousLandlords: ClientLandlord[]
  preferences: ClientPreferences | null
  createdAt: string
  updatedAt: string
}

export type ProfilePatch = Partial<{
  firstName: string
  lastName: string
  birthday: string
  nationality: string
  email: string
  phone: string
  shortBio: string
  cvPath: string | null
  debtCollectionCertPath: string | null
  proofOfSalaryPath: string | null
}>

export async function getProfile(): Promise<ClientProfile> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function updateProfile(data: ProfilePatch): Promise<ClientProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export type PreferencesInput = Omit<ClientPreferences, 'id' | 'profileId'>

export async function upsertPreferences(data: PreferencesInput): Promise<ClientPreferences> {
  const res = await fetch('/api/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save preferences')
  return res.json()
}

export type LandlordInput = {
  name: string
  contact: string
  periodStart: string
  periodEnd: string
}

export async function createLandlord(data: LandlordInput): Promise<ClientLandlord> {
  const res = await fetch('/api/landlords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create landlord')
  return res.json()
}

export async function updateLandlord(id: number, data: Partial<LandlordInput>): Promise<ClientLandlord> {
  const res = await fetch(`/api/landlords/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update landlord')
  return res.json()
}

export async function deleteLandlord(id: number): Promise<void> {
  const res = await fetch(`/api/landlords/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete landlord')
}

export async function uploadFile(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).path)
        } catch {
          reject(new Error('Invalid upload response'))
        }
      } else {
        try {
          reject(new Error(JSON.parse(xhr.responseText)?.error ?? 'Upload failed'))
        } catch {
          reject(new Error('Upload failed'))
        }
      }
    })
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    const fd = new FormData()
    fd.append('file', file)
    xhr.send(fd)
  })
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/profile-client.ts
git commit -m "feat: add typed API client helpers with XHR upload"
```

---

## Task 7: BottomNav + Placeholder Pages

**Files:**
- Create: `components/nav/BottomNav.tsx`
- Create: `app/swipe/page.tsx`
- Create: `app/status/page.tsx`

- [ ] **Step 1: Create components/nav/BottomNav.tsx**

```tsx
// components/nav/BottomNav.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Heart, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/profile', label: 'Profile', Icon: User },
  { href: '/swipe', label: 'Swipe', Icon: Heart },
  { href: '/status', label: 'Status', Icon: ClipboardList },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E6E8EB] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[480px] mx-auto flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 min-h-[52px] transition-colors',
                active ? 'text-[#0077C8]' : 'text-[#8A95A1]',
              )}
            >
              <Icon size={24} strokeWidth={active ? 2 : 1.5} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Create app/swipe/page.tsx**

```tsx
// app/swipe/page.tsx
import { BottomNav } from '@/components/nav/BottomNav'

export default function SwipePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center pb-24">
      <p className="text-[#8A95A1] text-sm">Swipe deck coming soon.</p>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 3: Create app/status/page.tsx**

```tsx
// app/status/page.tsx
import { BottomNav } from '@/components/nav/BottomNav'

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center pb-24">
      <p className="text-[#8A95A1] text-sm">Application status coming soon.</p>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 4: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 5: Commit**

```bash
git add components/nav/BottomNav.tsx app/swipe/page.tsx app/status/page.tsx
git commit -m "feat: add BottomNav and placeholder swipe/status pages"
```

---

## Task 8: CompletenessHeader + SaveIndicator

**Files:**
- Create: `components/profile/SaveIndicator.tsx`
- Create: `components/profile/CompletenessHeader.tsx`

- [ ] **Step 1: Create components/profile/SaveIndicator.tsx**

```tsx
// components/profile/SaveIndicator.tsx
import { cn } from '@/lib/utils'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <span
      className={cn(
        'text-xs font-medium transition-opacity',
        status === 'saving' && 'text-[#8A95A1]',
        status === 'saved' && 'text-[#1F9D55]',
        status === 'error' && 'text-[#D64545]',
      )}
    >
      {status === 'saving' && 'Saving…'}
      {status === 'saved' && 'Saved'}
      {status === 'error' && 'Save failed'}
    </span>
  )
}
```

- [ ] **Step 2: Create components/profile/CompletenessHeader.tsx**

```tsx
// components/profile/CompletenessHeader.tsx
'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { CompletenessResult } from '@/lib/completeness'

export function CompletenessHeader({ result }: { result: CompletenessResult }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E6E8EB] pt-[env(safe-area-inset-top)]">
      <div className="max-w-[480px] mx-auto px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo_Apartner.svg" alt="Apartner" className="h-6" />
          {result.isReadyToApply ? (
            <span className="text-xs font-medium text-[#1F9D55] bg-[#e6f7ef] px-2.5 py-1 rounded-full">
              Ready to apply
            </span>
          ) : (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-[#4A5560] min-h-[44px] px-1"
            >
              {result.missing.length} item{result.missing.length !== 1 ? 's' : ''} missing
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
        <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0077C8] rounded-full transition-all duration-300"
            style={{ width: `${result.percent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#8A95A1]">Profile completeness</span>
          <span className="text-xs font-medium text-[#4A5560]">{result.percent}%</span>
        </div>
        {expanded && result.missing.length > 0 && (
          <ul className="mt-2 space-y-1 pb-1">
            {result.missing.map((item) => (
              <li key={item} className="text-xs text-[#4A5560] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D64545] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add components/profile/SaveIndicator.tsx components/profile/CompletenessHeader.tsx
git commit -m "feat: add CompletenessHeader and SaveIndicator components"
```

---

## Task 9: Profile API + Server Page + ProfileForm Wrapper

**Files:**
- Create: `app/api/profile/route.ts`
- Create: `app/profile/page.tsx`
- Create: `components/profile/ProfileForm.tsx`

- [ ] **Step 1: Create app/api/profile/route.ts**

```ts
// app/api/profile/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { profileUpdateSchema } from '@/lib/validation/profile'
import { deleteUploadedFile } from '@/lib/upload'

export async function GET() {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: 1 },
    include: { previousLandlords: true, preferences: true },
  })
  return NextResponse.json(profile)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const current = await prisma.profile.findUniqueOrThrow({ where: { id: 1 } })
  const data = parsed.data

  const profile = await prisma.profile.update({
    where: { id: 1 },
    data: {
      ...data,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
    },
    include: { previousLandlords: true, preferences: true },
  })

  // Delete old file from disk when path changes (non-fatal)
  const fileFields = ['cvPath', 'debtCollectionCertPath', 'proofOfSalaryPath'] as const
  for (const field of fileFields) {
    if (field in data && data[field] !== current[field] && current[field]) {
      await deleteUploadedFile(current[field]!)
    }
  }

  return NextResponse.json(profile)
}
```

- [ ] **Step 2: Test the GET route manually**

Start the dev server (`npm run dev`) in a terminal. Then in another terminal:

```bash
curl http://localhost:3006/api/profile | jq .
```

Expected: JSON with profile id=1, all fields, `previousLandlords: []`, `preferences: { priceMaxChf: 3000, ... }`.

- [ ] **Step 3: Create app/profile/page.tsx**

```tsx
// app/profile/page.tsx
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
  const profile = await prisma.profile.findUniqueOrThrow({
    where: { id: 1 },
    include: { previousLandlords: true, preferences: true },
  })
  return <ProfileForm initialProfile={JSON.parse(JSON.stringify(profile))} />
}
```

Note: `JSON.parse(JSON.stringify(...))` converts Prisma's Date objects to ISO strings, matching `ClientProfile` types.

- [ ] **Step 4: Create components/profile/ProfileForm.tsx (stub — sections added in later tasks)**

```tsx
// components/profile/ProfileForm.tsx
'use client'
import { useState, useCallback } from 'react'
import type { ClientProfile } from '@/lib/api/profile-client'
import { computeCompleteness } from '@/lib/completeness'
import { CompletenessHeader } from './CompletenessHeader'
import { SaveIndicator, type SaveStatus } from './SaveIndicator'
import { BottomNav } from '@/components/nav/BottomNav'

export function ProfileForm({ initialProfile }: { initialProfile: ClientProfile }) {
  const [profile, setProfile] = useState<ClientProfile>(initialProfile)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const handleUpdate = useCallback((updated: Partial<ClientProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }))
  }, [])

  const completeness = computeCompleteness(profile)

  return (
    <div className="min-h-screen bg-[#F7F8FA] pb-24">
      <CompletenessHeader result={completeness} />
      <div className="max-w-[480px] mx-auto px-5 py-6 space-y-4">
        <div className="flex justify-end h-5">
          <SaveIndicator status={saveStatus} />
        </div>
        {/* Sections added in tasks 10–14 */}
      </div>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 5: Verify /profile loads in the browser**

With `npm run dev` running, open `http://localhost:3006/profile`. Expect: page loads with logo, 0% progress bar, and bottom nav. No errors in console.

- [ ] **Step 6: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add app/api/profile/route.ts app/profile/page.tsx components/profile/ProfileForm.tsx
git commit -m "feat: profile GET/PUT API, server page, ProfileForm shell"
```

---

## Task 10: PersonalInfoSection + BioSection

**Files:**
- Create: `components/profile/PersonalInfoSection.tsx`
- Create: `components/profile/BioSection.tsx`
- Modify: `components/profile/ProfileForm.tsx` (add both sections)

The shared input class and Field helper are defined locally in each section file — no shared component needed yet.

- [ ] **Step 1: Create components/profile/PersonalInfoSection.tsx**

```tsx
// components/profile/PersonalInfoSection.tsx
'use client'
import { useState, useCallback, useRef } from 'react'
import type { ClientProfile, ProfilePatch } from '@/lib/api/profile-client'
import { updateProfile } from '@/lib/api/profile-client'
import type { SaveStatus } from './SaveIndicator'

type Props = {
  profile: ClientProfile
  onUpdate: (updated: Partial<ClientProfile>) => void
  onSaveStatus: (status: SaveStatus) => void
}

function toDateInput(iso: string): string {
  if (!iso) return ''
  return iso.split('T')[0]
}

export function PersonalInfoSection({ profile, onUpdate, onSaveStatus }: Props) {
  const [fields, setFields] = useState({
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    birthday: toDateInput(profile.birthday),
    nationality: profile.nationality ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    async (patch: ProfilePatch) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        onSaveStatus('saving')
        try {
          const updated = await updateProfile(patch)
          onUpdate(updated)
          onSaveStatus('saved')
          setTimeout(() => onSaveStatus('idle'), 2000)
        } catch {
          onSaveStatus('error')
        }
      }, 300)
    },
    [onUpdate, onSaveStatus],
  )

  const onChange = (field: keyof typeof fields, value: string) =>
    setFields((prev) => ({ ...prev, [field]: value }))

  const onBlur = (field: keyof typeof fields) => save({ [field]: fields[field] })

  const onDateChange = (value: string) => {
    setFields((prev) => ({ ...prev, birthday: value }))
    save({ birthday: value ? new Date(value).toISOString() : undefined })
  }

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-4">Personal info</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input
              className={inputCls}
              value={fields.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              onBlur={() => onBlur('firstName')}
              placeholder="Ada"
            />
          </Field>
          <Field label="Last name">
            <input
              className={inputCls}
              value={fields.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              onBlur={() => onBlur('lastName')}
              placeholder="Lovelace"
            />
          </Field>
        </div>
        <Field label="Birthday">
          <input
            type="date"
            className={inputCls}
            value={fields.birthday}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </Field>
        <Field label="Nationality">
          <input
            className={inputCls}
            value={fields.nationality}
            onChange={(e) => onChange('nationality', e.target.value)}
            onBlur={() => onBlur('nationality')}
            placeholder="Swiss"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputCls}
            value={fields.email}
            onChange={(e) => onChange('email', e.target.value)}
            onBlur={() => onBlur('email')}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            className={inputCls}
            value={fields.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            onBlur={() => onBlur('phone')}
            placeholder="+41 79 123 45 67"
          />
        </Field>
      </div>
    </section>
  )
}

const inputCls =
  'w-full h-12 rounded-xl border border-[#E6E8EB] bg-white px-4 text-base text-[#0F1419] placeholder:text-[#8A95A1] focus:outline-none focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#4A5560] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create components/profile/BioSection.tsx**

```tsx
// components/profile/BioSection.tsx
'use client'
import { useState, useCallback, useRef } from 'react'
import type { ClientProfile } from '@/lib/api/profile-client'
import { updateProfile } from '@/lib/api/profile-client'
import type { SaveStatus } from './SaveIndicator'

type Props = {
  profile: ClientProfile
  onUpdate: (updated: Partial<ClientProfile>) => void
  onSaveStatus: (status: SaveStatus) => void
}

export function BioSection({ profile, onUpdate, onSaveStatus }: Props) {
  const [shortBio, setShortBio] = useState(profile.shortBio ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        onSaveStatus('saving')
        try {
          const updated = await updateProfile({ shortBio: value })
          onUpdate(updated)
          onSaveStatus('saved')
          setTimeout(() => onSaveStatus('idle'), 2000)
        } catch {
          onSaveStatus('error')
        }
      }, 300)
    },
    [onUpdate, onSaveStatus],
  )

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-1">About you</h2>
      <p className="text-sm text-[#8A95A1] mb-4">Shown to landlords when you apply.</p>
      <div>
        <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Short bio</label>
        <textarea
          className="w-full min-h-[120px] rounded-xl border border-[#E6E8EB] bg-white px-4 py-3 text-base text-[#0F1419] placeholder:text-[#8A95A1] focus:outline-none focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20 transition-colors resize-none"
          value={shortBio}
          onChange={(e) => {
            const v = e.target.value.slice(0, 500)
            setShortBio(v)
            save(v)
          }}
          placeholder="Tell landlords about yourself — your work, your lifestyle, why you're moving. The honest stuff lands best."
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#8A95A1]">{shortBio.length}/500</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add both sections to ProfileForm**

In `components/profile/ProfileForm.tsx`, add the imports and render the sections inside the `<div className="... space-y-4">`:

```tsx
// Add these imports at the top:
import { PersonalInfoSection } from './PersonalInfoSection'
import { BioSection } from './BioSection'

// Replace the {/* Sections added in tasks 10–14 */} comment with:
<PersonalInfoSection
  profile={profile}
  onUpdate={handleUpdate}
  onSaveStatus={setSaveStatus}
/>
<BioSection
  profile={profile}
  onUpdate={handleUpdate}
  onSaveStatus={setSaveStatus}
/>
```

- [ ] **Step 4: Smoke test in browser**

Open `http://localhost:3006/profile`. Verify:
- Personal info fields render with seeded values (or empty)
- Editing "First name" and blurring → brief "Saving…" then "Saved" status
- Refreshing the page shows the saved value

- [ ] **Step 5: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add components/profile/PersonalInfoSection.tsx components/profile/BioSection.tsx components/profile/ProfileForm.tsx
git commit -m "feat: add PersonalInfoSection and BioSection with auto-save"
```

---

## Task 11: File Upload API + DocumentUploader + DocumentsSection

**Files:**
- Create: `app/api/upload/route.ts`
- Create: `app/api/file/[name]/route.ts`
- Create: `components/profile/DocumentUploader.tsx`
- Create: `components/profile/DocumentsSection.tsx`
- Modify: `components/profile/ProfileForm.tsx` (add DocumentsSection)

- [ ] **Step 1: Create app/api/upload/route.ts**

```ts
// app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { writeUploadedFile } from '@/lib/upload'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const EXT_MAP: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: PDF, JPEG, PNG' },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
  }
  const ext = EXT_MAP[file.type]
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = await writeUploadedFile(buffer, ext)
  return NextResponse.json({ path: filename })
}
```

- [ ] **Step 2: Create app/api/file/[name]/route.ts**

```ts
// app/api/file/[name]/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import { uploadsFilePath } from '@/lib/upload'

const FILENAME_RE = /^[a-f0-9-]+\.(pdf|jpe?g|png)$/i
const CONTENT_TYPE: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export async function GET(
  _request: Request,
  { params }: { params: { name: string } },
) {
  const { name } = params
  if (!FILENAME_RE.test(name)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
  }
  const filePath = uploadsFilePath(name)
  try {
    const buffer = await fs.readFile(filePath)
    const ext = name.split('.').pop()!.toLowerCase()
    const contentType = CONTENT_TYPE[ext] ?? 'application/octet-stream'
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
```

- [ ] **Step 3: Create components/profile/DocumentUploader.tsx**

```tsx
// components/profile/DocumentUploader.tsx
'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, X, RefreshCw } from 'lucide-react'
import { uploadFile } from '@/lib/api/profile-client'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

type Props = {
  label: string
  currentPath: string | null
  onUploaded: (path: string) => Promise<void>
  onRemoved: () => Promise<void>
}

export function DocumentUploader({ label, currentPath, onUploaded, onRemoved }: Props) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, JPEG, or PNG files allowed')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('File must be under 5MB')
      return
    }
    setProgress(0)
    try {
      const path = await uploadFile(file, setProgress)
      await onUploaded(path)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="rounded-xl border border-[#E6E8EB] p-4">
      <p className="text-sm font-medium text-[#0F1419] mb-3">{label}</p>
      {currentPath ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText size={20} className="text-[#0077C8] flex-shrink-0" />
            <span className="text-sm text-[#4A5560] truncate">{currentPath}</span>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1 text-xs font-medium text-[#0077C8] min-h-[44px] px-2"
            >
              <RefreshCw size={14} />
              Replace
            </button>
            <button
              onClick={onRemoved}
              className="flex items-center gap-1 text-xs font-medium text-[#D64545] min-h-[44px] px-2"
            >
              <X size={14} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center gap-2 py-6 rounded-lg border-2 border-dashed border-[#E6E8EB] text-[#8A95A1] hover:border-[#0077C8] hover:text-[#0077C8] transition-colors"
        >
          <Upload size={24} />
          <span className="text-sm">Upload {label}</span>
          <span className="text-xs">PDF, JPEG, or PNG · max 5MB</span>
        </button>
      )}
      {progress !== null && (
        <div className="mt-3">
          <div className="h-1.5 bg-[#F7F8FA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0077C8] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-[#8A95A1] mt-1 block">{progress}%</span>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-[#D64545]">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Create components/profile/DocumentsSection.tsx**

```tsx
// components/profile/DocumentsSection.tsx
'use client'
import { useCallback } from 'react'
import type { ClientProfile } from '@/lib/api/profile-client'
import { updateProfile } from '@/lib/api/profile-client'
import { DocumentUploader } from './DocumentUploader'
import type { SaveStatus } from './SaveIndicator'

type DocField = 'cvPath' | 'debtCollectionCertPath' | 'proofOfSalaryPath'

type Props = {
  profile: ClientProfile
  onUpdate: (updated: Partial<ClientProfile>) => void
  onSaveStatus: (status: SaveStatus) => void
}

export function DocumentsSection({ profile, onUpdate, onSaveStatus }: Props) {
  const saveField = useCallback(
    async (field: DocField, value: string | null) => {
      onSaveStatus('saving')
      try {
        const updated = await updateProfile({ [field]: value })
        onUpdate(updated)
        onSaveStatus('saved')
        setTimeout(() => onSaveStatus('idle'), 2000)
      } catch {
        onSaveStatus('error')
      }
    },
    [onUpdate, onSaveStatus],
  )

  const docs: { field: DocField; label: string }[] = [
    { field: 'cvPath', label: 'CV / Lebenslauf' },
    { field: 'debtCollectionCertPath', label: 'Betreibungsauszug' },
    { field: 'proofOfSalaryPath', label: 'Salärnachweis' },
  ]

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-1">Documents</h2>
      <p className="text-sm text-[#8A95A1] mb-4">Required for most applications in Zürich.</p>
      <div className="space-y-3">
        {docs.map(({ field, label }) => (
          <DocumentUploader
            key={field}
            label={label}
            currentPath={profile[field]}
            onUploaded={(path) => saveField(field, path)}
            onRemoved={() => saveField(field, null)}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Add DocumentsSection to ProfileForm**

In `components/profile/ProfileForm.tsx`, add after the BioSection:

```tsx
// Add import:
import { DocumentsSection } from './DocumentsSection'

// Add after <BioSection ... />:
<DocumentsSection
  profile={profile}
  onUpdate={handleUpdate}
  onSaveStatus={setSaveStatus}
/>
```

- [ ] **Step 6: Test file upload**

With dev server running:
1. Open `http://localhost:3006/profile`
2. Upload a small PDF as CV — expect progress bar, then filename shown
3. `curl http://localhost:3006/api/profile | jq .cvPath` — expect the UUID filename
4. Test path traversal: `curl "http://localhost:3006/api/file/..%2Fpackage.json"` — expect 400

- [ ] **Step 7: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add app/api/upload/route.ts app/api/file components/profile/DocumentUploader.tsx components/profile/DocumentsSection.tsx components/profile/ProfileForm.tsx
git commit -m "feat: file upload API, file serving with path-traversal guard, DocumentsSection"
```

---

## Task 12: Landlord API + LandlordRow + LandlordsSection

**Files:**
- Create: `app/api/landlords/route.ts`
- Create: `app/api/landlords/[id]/route.ts`
- Create: `components/profile/LandlordRow.tsx`
- Create: `components/profile/LandlordsSection.tsx`
- Modify: `components/profile/ProfileForm.tsx`

- [ ] **Step 1: Create app/api/landlords/route.ts**

```ts
// app/api/landlords/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { landlordCreateSchema } from '@/lib/validation/profile'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = landlordCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { name, contact, periodStart, periodEnd } = parsed.data
  const landlord = await prisma.previousLandlord.create({
    data: {
      name,
      contact,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      profileId: 1,
    },
  })
  return NextResponse.json(landlord)
}
```

- [ ] **Step 2: Create app/api/landlords/[id]/route.ts**

```ts
// app/api/landlords/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { landlordUpdateSchema } from '@/lib/validation/profile'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const body = await request.json()
  const parsed = landlordUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { name, contact, periodStart, periodEnd } = parsed.data
  const landlord = await prisma.previousLandlord.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(contact !== undefined && { contact }),
      ...(periodStart !== undefined && { periodStart: new Date(periodStart) }),
      ...(periodEnd !== undefined && { periodEnd: new Date(periodEnd) }),
    },
  })
  return NextResponse.json(landlord)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  await prisma.previousLandlord.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 3: Create components/profile/LandlordRow.tsx**

```tsx
// components/profile/LandlordRow.tsx
'use client'
import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import type { ClientLandlord } from '@/lib/api/profile-client'
import { updateLandlord } from '@/lib/api/profile-client'
import type { SaveStatus } from './SaveIndicator'

function toDateInput(iso: string): string {
  return iso ? iso.split('T')[0] : ''
}

type Props = {
  landlord: ClientLandlord
  onUpdate: (updated: ClientLandlord) => void
  onRemove: () => void
  onSaveStatus: (status: SaveStatus) => void
}

export function LandlordRow({ landlord, onUpdate, onRemove, onSaveStatus }: Props) {
  const [fields, setFields] = useState({
    name: landlord.name,
    contact: landlord.contact,
    periodStart: toDateInput(landlord.periodStart),
    periodEnd: toDateInput(landlord.periodEnd),
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = (patch: Partial<typeof fields>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      onSaveStatus('saving')
      try {
        const apiPatch: Parameters<typeof updateLandlord>[1] = {}
        if (patch.name !== undefined) apiPatch.name = patch.name
        if (patch.contact !== undefined) apiPatch.contact = patch.contact
        if (patch.periodStart !== undefined && patch.periodStart)
          apiPatch.periodStart = new Date(patch.periodStart).toISOString()
        if (patch.periodEnd !== undefined && patch.periodEnd)
          apiPatch.periodEnd = new Date(patch.periodEnd).toISOString()
        const updated = await updateLandlord(landlord.id, apiPatch)
        onUpdate(updated)
        onSaveStatus('saved')
        setTimeout(() => onSaveStatus('idle'), 2000)
      } catch {
        onSaveStatus('error')
      }
    }, 300)
  }

  const cls =
    'w-full h-12 rounded-xl border border-[#E6E8EB] bg-white px-4 text-base text-[#0F1419] placeholder:text-[#8A95A1] focus:outline-none focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20 transition-colors'

  return (
    <div className="rounded-xl border border-[#E6E8EB] p-4 space-y-3">
      <div className="flex justify-end">
        <button
          onClick={onRemove}
          className="text-[#8A95A1] hover:text-[#D64545] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Remove landlord"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Name</label>
        <input
          className={cls}
          value={fields.name}
          onChange={(e) => setFields((p) => ({ ...p, name: e.target.value }))}
          onBlur={() => save({ name: fields.name })}
          placeholder="Landlord name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Contact</label>
        <input
          className={cls}
          value={fields.contact}
          onChange={(e) => setFields((p) => ({ ...p, contact: e.target.value }))}
          onBlur={() => save({ contact: fields.contact })}
          placeholder="Email or phone"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">From</label>
          <input
            type="date"
            className={cls}
            value={fields.periodStart}
            onChange={(e) => {
              setFields((p) => ({ ...p, periodStart: e.target.value }))
              save({ periodStart: e.target.value })
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">To</label>
          <input
            type="date"
            className={cls}
            value={fields.periodEnd}
            onChange={(e) => {
              setFields((p) => ({ ...p, periodEnd: e.target.value }))
              save({ periodEnd: e.target.value })
            }}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create components/profile/LandlordsSection.tsx**

```tsx
// components/profile/LandlordsSection.tsx
'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ClientLandlord } from '@/lib/api/profile-client'
import { createLandlord, deleteLandlord } from '@/lib/api/profile-client'
import { LandlordRow } from './LandlordRow'
import type { SaveStatus } from './SaveIndicator'

type Props = {
  landlords: ClientLandlord[]
  onUpdate: (landlords: ClientLandlord[]) => void
  onSaveStatus: (status: SaveStatus) => void
}

export function LandlordsSection({ landlords, onUpdate, onSaveStatus }: Props) {
  const [list, setList] = useState<ClientLandlord[]>(landlords)

  const handleAdd = async () => {
    onSaveStatus('saving')
    try {
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      const now = new Date().toISOString()
      const newLandlord = await createLandlord({
        name: '',
        contact: '',
        periodStart: oneYearAgo,
        periodEnd: now,
      })
      const updated = [...list, newLandlord]
      setList(updated)
      onUpdate(updated)
      onSaveStatus('saved')
      setTimeout(() => onSaveStatus('idle'), 2000)
    } catch {
      onSaveStatus('error')
    }
  }

  const handleRowUpdate = (id: number, updated: ClientLandlord) => {
    const newList = list.map((l) => (l.id === id ? updated : l))
    setList(newList)
    onUpdate(newList)
  }

  const handleRemove = async (id: number) => {
    onSaveStatus('saving')
    try {
      await deleteLandlord(id)
      const newList = list.filter((l) => l.id !== id)
      setList(newList)
      onUpdate(newList)
      onSaveStatus('saved')
      setTimeout(() => onSaveStatus('idle'), 2000)
    } catch {
      onSaveStatus('error')
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-1">Previous landlords</h2>
      <p className="text-sm text-[#8A95A1] mb-4">
        {list.length === 0
          ? 'Add your previous landlords — strong references make landlords trust you faster.'
          : 'Strong references make landlords trust you faster.'}
      </p>
      <div className="space-y-3">
        {list.map((landlord) => (
          <LandlordRow
            key={landlord.id}
            landlord={landlord}
            onUpdate={(updated) => handleRowUpdate(landlord.id, updated)}
            onRemove={() => handleRemove(landlord.id)}
            onSaveStatus={onSaveStatus}
          />
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="mt-4 w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-[#E6E8EB] text-[#0077C8] font-medium text-base hover:bg-[#E5F1FA] transition-colors"
      >
        <Plus size={20} />
        Add landlord
      </button>
    </section>
  )
}
```

- [ ] **Step 5: Add LandlordsSection to ProfileForm**

In `components/profile/ProfileForm.tsx`:

```tsx
// Add import:
import { LandlordsSection } from './LandlordsSection'

// Add after <DocumentsSection ... />:
<LandlordsSection
  landlords={profile.previousLandlords}
  onUpdate={(landlords) => handleUpdate({ previousLandlords: landlords })}
  onSaveStatus={setSaveStatus}
/>
```

- [ ] **Step 6: Smoke test**

Open `http://localhost:3006/profile`:
1. Click "Add landlord" — a new row appears
2. Fill in name, blur — "Saved" appears
3. Refresh — landlord persists
4. Click remove — landlord disappears and is deleted from DB

- [ ] **Step 7: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 8: Commit**

```bash
git add app/api/landlords components/profile/LandlordRow.tsx components/profile/LandlordsSection.tsx components/profile/ProfileForm.tsx
git commit -m "feat: landlord CRUD API, LandlordRow, LandlordsSection"
```

---

## Task 13: Preferences API + NeighborhoodPicker + PreferencesSection

**Files:**
- Create: `app/api/preferences/route.ts`
- Create: `components/profile/NeighborhoodPicker.tsx`
- Create: `components/profile/PreferencesSection.tsx`
- Modify: `components/profile/ProfileForm.tsx`

- [ ] **Step 1: Create app/api/preferences/route.ts**

```ts
// app/api/preferences/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { preferencesUpsertSchema } from '@/lib/validation/profile'

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = preferencesUpsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const preferences = await prisma.preferences.upsert({
    where: { profileId: 1 },
    update: parsed.data,
    create: { ...parsed.data, profileId: 1 },
  })
  return NextResponse.json(preferences)
}
```

- [ ] **Step 2: Create components/profile/NeighborhoodPicker.tsx**

```tsx
// components/profile/NeighborhoodPicker.tsx
'use client'
import { cn } from '@/lib/utils'

const KREISE = Array.from({ length: 12 }, (_, i) => `Kreis ${i + 1}`)

type Props = {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function NeighborhoodPicker({ selected, onChange }: Props) {
  const toggle = (kreis: string) => {
    onChange(
      selected.includes(kreis) ? selected.filter((k) => k !== kreis) : [...selected, kreis],
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {KREISE.map((kreis) => {
        const active = selected.includes(kreis)
        return (
          <button
            key={kreis}
            onClick={() => toggle(kreis)}
            className={cn(
              'h-9 px-3 rounded-full text-sm font-medium transition-colors',
              active
                ? 'bg-[#0077C8] text-white'
                : 'bg-[#F7F8FA] text-[#4A5560] hover:bg-[#E5F1FA] hover:text-[#0077C8]',
            )}
          >
            {kreis}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create components/profile/PreferencesSection.tsx**

```tsx
// components/profile/PreferencesSection.tsx
'use client'
import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ClientPreferences, PreferencesInput } from '@/lib/api/profile-client'
import { upsertPreferences } from '@/lib/api/profile-client'
import { NeighborhoodPicker } from './NeighborhoodPicker'
import type { SaveStatus } from './SaveIndicator'

type FurnishedPref = 'any' | 'furnished' | 'unfurnished'

type Props = {
  preferences: ClientPreferences | null
  onUpdate: (preferences: ClientPreferences) => void
  onSaveStatus: (status: SaveStatus) => void
}

type Fields = {
  priceMaxChf: number
  roomsMin: number
  sizeSqmMin: number
  neighborhoods: string[]
  needsBalcony: boolean
  needsParking: boolean
  petFriendly: boolean
  furnishedPreference: FurnishedPref
}

export function PreferencesSection({ preferences, onUpdate, onSaveStatus }: Props) {
  const [fields, setFields] = useState<Fields>({
    priceMaxChf: preferences?.priceMaxChf ?? 3000,
    roomsMin: preferences?.roomsMin ?? 1,
    sizeSqmMin: preferences?.sizeSqmMin ?? 20,
    neighborhoods: preferences?.neighborhoods ? preferences.neighborhoods.split(',').filter(Boolean) : [],
    needsBalcony: preferences?.needsBalcony ?? false,
    needsParking: preferences?.needsParking ?? false,
    petFriendly: preferences?.petFriendly ?? false,
    furnishedPreference: (preferences?.furnishedPreference ?? 'any') as FurnishedPref,
  })
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(
    (patch: Partial<Fields>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        onSaveStatus('saving')
        try {
          const merged = { ...fields, ...patch }
          const input: PreferencesInput = {
            priceMaxChf: merged.priceMaxChf,
            roomsMin: merged.roomsMin,
            sizeSqmMin: merged.sizeSqmMin,
            neighborhoods: merged.neighborhoods.join(','),
            needsBalcony: merged.needsBalcony,
            needsParking: merged.needsParking,
            petFriendly: merged.petFriendly,
            furnishedPreference: merged.furnishedPreference,
          }
          const updated = await upsertPreferences(input)
          onUpdate(updated)
          onSaveStatus('saved')
          setTimeout(() => onSaveStatus('idle'), 2000)
        } catch {
          onSaveStatus('error')
        }
      }, 300)
    },
    [fields, onUpdate, onSaveStatus],
  )

  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    save({ [key]: value })
  }

  const inputCls =
    'w-full h-12 rounded-xl border border-[#E6E8EB] bg-white px-4 text-base text-[#0F1419] placeholder:text-[#8A95A1] focus:outline-none focus:border-[#0077C8] focus:ring-2 focus:ring-[#0077C8]/20 transition-colors'

  return (
    <section className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(15,20,25,0.06)] p-5">
      <h2 className="text-xl font-semibold text-[#0F1419] tracking-tight mb-4">Preferences</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Max rent (CHF/month)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A95A1] text-base select-none pointer-events-none">
              CHF
            </span>
            <input
              type="number"
              className={cn(inputCls, 'pl-14')}
              value={fields.priceMaxChf}
              onChange={(e) => update('priceMaxChf', parseInt(e.target.value) || 0)}
              onBlur={() => save({ priceMaxChf: fields.priceMaxChf })}
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Minimum rooms</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => update('roomsMin', Math.max(0.5, fields.roomsMin - 0.5))}
              className="w-12 h-12 rounded-xl border border-[#E6E8EB] text-[#4A5560] text-xl font-medium flex items-center justify-center hover:bg-[#F7F8FA] transition-colors"
            >
              −
            </button>
            <span className="flex-1 text-center text-base font-medium text-[#0F1419]">
              {fields.roomsMin} room{fields.roomsMin !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => update('roomsMin', fields.roomsMin + 0.5)}
              className="w-12 h-12 rounded-xl border border-[#E6E8EB] text-[#4A5560] text-xl font-medium flex items-center justify-center hover:bg-[#F7F8FA] transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-1.5">Minimum size</label>
          <div className="relative">
            <input
              type="number"
              className={cn(inputCls, 'pr-14')}
              value={fields.sizeSqmMin}
              onChange={(e) => update('sizeSqmMin', parseInt(e.target.value) || 0)}
              onBlur={() => save({ sizeSqmMin: fields.sizeSqmMin })}
              min={0}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A95A1] text-base select-none pointer-events-none">
              m²
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-2">Neighborhoods</label>
          <NeighborhoodPicker
            selected={fields.neighborhoods}
            onChange={(selected) => update('neighborhoods', selected)}
          />
        </div>
        <div className="space-y-3">
          <Toggle label="Balcony required" checked={fields.needsBalcony} onChange={(v) => update('needsBalcony', v)} />
          <Toggle label="Parking required" checked={fields.needsParking} onChange={(v) => update('needsParking', v)} />
          <Toggle label="Pet-friendly" checked={fields.petFriendly} onChange={(v) => update('petFriendly', v)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A5560] mb-2">Furnished preference</label>
          <div className="flex rounded-xl border border-[#E6E8EB] overflow-hidden">
            {(['any', 'furnished', 'unfurnished'] as FurnishedPref[]).map((opt) => (
              <button
                key={opt}
                onClick={() => update('furnishedPreference', opt)}
                className={cn(
                  'flex-1 h-12 text-sm font-medium transition-colors capitalize',
                  fields.furnishedPreference === opt
                    ? 'bg-[#0077C8] text-white'
                    : 'text-[#4A5560] hover:bg-[#F7F8FA]',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between min-h-[44px]">
      <span className="text-sm text-[#0F1419]">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'w-12 h-7 rounded-full relative transition-colors focus-visible:ring-2 focus-visible:ring-[#0077C8] focus-visible:ring-offset-2',
          checked ? 'bg-[#0077C8]' : 'bg-[#E6E8EB]',
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Add PreferencesSection to ProfileForm**

In `components/profile/ProfileForm.tsx`:

```tsx
// Add import:
import { PreferencesSection } from './PreferencesSection'

// Add after <LandlordsSection ... />:
<PreferencesSection
  preferences={profile.preferences}
  onUpdate={(preferences) => handleUpdate({ preferences })}
  onSaveStatus={setSaveStatus}
/>
```

- [ ] **Step 5: Smoke test**

Open `http://localhost:3006/profile`:
1. Toggle "Balcony required" — expect immediate save
2. Select a few Kreise chips — expect save
3. Change max rent — blur — expect save
4. Refresh — all preferences persist

- [ ] **Step 6: Typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

- [ ] **Step 7: Commit**

```bash
git add app/api/preferences/route.ts components/profile/NeighborhoodPicker.tsx components/profile/PreferencesSection.tsx components/profile/ProfileForm.tsx
git commit -m "feat: preferences API, NeighborhoodPicker, PreferencesSection"
```

---

## Task 14: Final Integration — Completeness, Docs, Build, PR

**Files:**
- Verify: all 11 acceptance criteria
- Update: `docs/superpowers/specs/2026-04-30-profile-design.md` if needed
- Run: typecheck + build
- Commit + PR

- [ ] **Step 1: Verify completeness updates live**

Open `http://localhost:3006/profile`:
1. Fill in all 6 personal info fields — watch percent climb
2. Write a 50+ char bio — percent increases
3. Upload all 3 documents — percent increases
4. Set priceMaxChf > 0, roomsMin > 0, pick at least 1 neighborhood
5. Expect: "Ready to apply" badge appears and isReadyToApply = true

- [ ] **Step 2: Verify acceptance criteria 7 — path traversal**

```bash
curl -v "http://localhost:3006/api/file/..%2Fpackage.json"
```

Expected: HTTP 400 `{"error":"Invalid filename"}`

- [ ] **Step 3: Verify acceptance criteria 8 — invalid upload**

```bash
# File too large (create a 6MB dummy file):
dd if=/dev/zero of=/tmp/large.pdf bs=1M count=6
curl -X POST http://localhost:3006/api/upload -F "file=@/tmp/large.pdf;type=application/pdf"
```

Expected: HTTP 400 `{"error":"File too large. Maximum size is 5MB"}`

- [ ] **Step 4: Run typecheck**

```bash
cd /home/gtace/bobathon && npm run typecheck
```

Expected: exits 0, zero errors.

- [ ] **Step 5: Run build**

```bash
cd /home/gtace/bobathon && npm run build
```

Expected: exits 0. No `any` type errors. All routes compiled.

- [ ] **Step 6: Commit docs + final commit**

```bash
git add docs/
git commit -m "docs: add profile page design spec and implementation plan"
```

- [ ] **Step 7: Create PR**

```bash
git push -u origin feature/profile-page
gh pr create \
  --title "feat: profile page — form, auto-save, file upload, completeness" \
  --body "$(cat <<'EOF'
## Summary
- Full `/profile` page with auto-save on blur/change (300ms debounce)
- File upload for CV, Betreibungsauszug, Salärnachweis with XHR progress
- Dynamic previous landlords list (add/remove/edit)
- Preferences with neighborhood picker, toggles, furnished segmented control
- Live completeness indicator (sticky header, progress bar, missing items expandable)
- Sticky bottom nav (Profile/Swipe/Status)
- CI.md brand tokens wired into Tailwind; path-traversal guard on file serving

## Test plan
- [ ] `/profile` loads, all sections render with seeded data
- [ ] Editing any field auto-saves within 300ms of blur; persists after reload
- [ ] File upload shows progress, sets cvPath in DB; replace deletes old file
- [ ] Adding/removing landlords persists across reload
- [ ] Completeness reaches 100% and "Ready to apply" badge shows when all required fields filled
- [ ] `GET /api/file/..%2Fpackage.json` returns 400
- [ ] Oversized upload returns 400 with clear message
- [ ] `npm run typecheck` exits 0
- [ ] `npm run build` exits 0

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Verification Summary

| Criterion | How to verify |
|---|---|
| `/profile` loads with seeded data | Open browser, check all sections |
| Auto-save persists across reload | Edit → blur → F5 |
| File upload shows progress, sets DB | Upload CV, check `curl /api/profile \| jq .cvPath` |
| Replace deletes old file | Replace CV, check `/uploads/` — old file gone |
| Landlord CRUD persists | Add/edit/remove → reload |
| Completeness updates live | Fill fields → watch percent climb |
| Path-traversal rejected | `curl /api/file/..%2Fpackage.json` → 400 |
| Invalid upload rejected | >5MB file → 400 |
| Bottom nav present, Profile active | Check bottom of page |
| No `any` types | `npm run typecheck` |
| Build passes | `npm run build` |
