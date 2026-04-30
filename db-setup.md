# Apartner — DB Foundation (Prisma + SQLite)

This sets up the database layer for Apartner per the MVP build plan. **No features, no API routes, no UI.** Just Prisma installed, schema migrated, client wired up, and seed data loaded so Lanes B/C/D can start writing feature code against a working DB.

This builds on the existing Next.js 14 / TypeScript / Tailwind scaffold (port 3006).

## Stack additions

- **Prisma ORM** with **SQLite**
- `prisma` (dev) and `@prisma/client` (runtime)

Install:
```
npm i @prisma/client
npm i -D prisma
npx prisma init --datasource-provider sqlite
```

## Schema (`prisma/schema.prisma`)

Use the schema directly from the build plan:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Profile {
  id                       Int      @id @default(autoincrement())
  firstName                String
  lastName                 String
  birthday                 DateTime
  nationality              String
  email                    String
  phone                    String
  shortBio                 String
  cvPath                   String?
  debtCollectionCertPath   String?
  proofOfSalaryPath        String?
  previousLandlords        PreviousLandlord[]
  preferences              Preferences?
  applications             Application[]
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
}

model PreviousLandlord {
  id          Int      @id @default(autoincrement())
  profileId   Int
  profile     Profile  @relation(fields: [profileId], references: [id])
  name        String
  contact     String
  periodStart DateTime
  periodEnd   DateTime
}

model Preferences {
  id                    Int      @id @default(autoincrement())
  profileId             Int      @unique
  profile               Profile  @relation(fields: [profileId], references: [id])
  priceMaxChf           Int
  roomsMin              Float
  sizeSqmMin            Int
  neighborhoods         String   // comma-separated; SQLite has no array type
  needsBalcony          Boolean  @default(false)
  needsParking          Boolean  @default(false)
  petFriendly           Boolean  @default(false)
  furnishedPreference   String   @default("any")  // "any" | "furnished" | "unfurnished"
}

model Listing {
  id                          String   @id
  heroImage                   String
  gallery                     String   // JSON-stringified array of URLs
  sizeSqm                     Int
  priceChf                    Int
  rooms                       Float
  balcony                     Boolean
  parking                     Boolean
  addressLine                 String
  neighborhood                String
  lat                         Float
  lng                         Float
  floor                       Int
  availabilityStart           DateTime
  availabilityDurationMonths  Int?
  furnished                   Boolean
  petsAllowed                 Boolean
  customNotes                 String
  yearBuilt                   Int
  distanceFromCenterKm        Float
  hasDishwasher               Boolean
  hasLaundry                  Boolean
  hasElevator                 Boolean
  applications                Application[]
}

model Application {
  id                    Int      @id @default(autoincrement())
  profileId             Int
  profile               Profile  @relation(fields: [profileId], references: [id])
  listingId             String
  listing               Listing  @relation(fields: [listingId], references: [id])
  status                String
  generatedCoverLetter  String?
  swipedAt              DateTime @default(now())
  statusUpdatedAt       DateTime @default(now())

  @@unique([profileId, listingId])
}
```

## Prisma client singleton (`lib/prisma.ts`)

Required because Next.js dev hot-reload otherwise spawns multiple PrismaClients and exhausts SQLite connections:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Environment

`.env` (local dev):
```
DATABASE_URL="file:./dev.db"
```

`.env.example` should include this plus the placeholders we'll need later:
```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

`.gitignore` additions: `*.db`, `*.db-journal`, `/uploads`. **Do not** ignore `prisma/migrations/` — that gets committed.

## Docker / Portainer persistence (critical)

The deploy target is Hetzner + Portainer + Pangolin. SQLite is a single file, so without persistent volumes, every redeploy wipes the database. Update `docker-compose.yml` to mount two named volumes and override `DATABASE_URL` to point at the mounted path:

```yaml
services:
  apartner:
    image: ghcr.io/<your-org>/apartner:latest
    container_name: apartner
    restart: unless-stopped
    ports:
      - "3006:3006"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      - NODE_ENV=production
      - PORT=3006
      - HOSTNAME=0.0.0.0
      - DATABASE_URL=file:/app/data/dev.db
    volumes:
      - apartner-data:/app/data
      - apartner-uploads:/app/uploads

volumes:
  apartner-data:
  apartner-uploads:
```

Two non-obvious things to handle in the project:

1. **Dockerfile must create `/app/data` and `/app/uploads` and chown them to the non-root user** before switching to that user. Otherwise the volumes mount as root-owned and the app can't write to them.
2. **Migrations on container start.** In production the container won't run `prisma migrate dev` — add a startup step that runs `prisma migrate deploy` against the mounted DB before `next start`. Easiest is a small `docker-entrypoint.sh` that does `npx prisma migrate deploy && exec node server.js`. Make it executable and set as the `CMD` / `ENTRYPOINT` in the Dockerfile.

Locally nothing changes — `DATABASE_URL` from `.env` (`file:./dev.db`) wins because it's loaded before the container env. The container override only applies inside Portainer.

## Listings seed data (`data/listings.json`)

The plan says listings are hand-crafted separately — they don't exist yet. For now, create `data/listings.json` containing **3 placeholder listings** matching the `Listing` schema exactly, with realistic Zürich data (Kreis 4, Kreis 6, Kreis 8 for variety). Use placeholder image URLs from `https://images.unsplash.com/...?w=800` (any apartment-ish photos). The team will replace this file with the real 10-entry hand-crafted version later — your job is just to make sure the seed pipeline works against the schema.

Each listing must have all required fields including `gallery` as a JSON-stringified array, valid `lat`/`lng` for actual Zürich coordinates, and `id` as a stable string like `"zh-001"`, `"zh-002"`, `"zh-003"`.

## Seed script (`prisma/seed.ts`)

```ts
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  // Idempotent: clear listings + applications, then re-insert
  await prisma.application.deleteMany();
  await prisma.listing.deleteMany();

  const raw = fs.readFileSync(
    path.resolve(process.cwd(), "data/listings.json"),
    "utf-8"
  );
  const listings = JSON.parse(raw);

  for (const l of listings) {
    await prisma.listing.create({
      data: {
        ...l,
        availabilityStart: new Date(l.availabilityStart),
      },
    });
  }

  // Ensure profile id=1 exists with empty defaults so feature lanes can write to it
  const existing = await prisma.profile.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.profile.create({
      data: {
        id: 1,
        firstName: "",
        lastName: "",
        birthday: new Date("1990-01-01"),
        nationality: "",
        email: "",
        phone: "",
        shortBio: "",
        preferences: {
          create: {
            priceMaxChf: 3000,
            roomsMin: 1,
            sizeSqmMin: 20,
            neighborhoods: "",
          },
        },
      },
    });
  }

  console.log(`Seeded ${listings.length} listings, profile id=1 ready.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Wire it into `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  }
}
```

Install `tsx` as a dev dep if not already present.

## Acceptance

1. `npx prisma migrate dev --name init` creates `prisma/migrations/` and `dev.db` without errors.
2. `npm run db:seed` succeeds and prints `Seeded 3 listings, profile id=1 ready.`
3. `npm run db:studio` opens Prisma Studio showing the seeded data.
4. From a quick test (e.g. `tsx -e "..."` or a temp script), `prisma.listing.findMany()` returns the seeded rows and `prisma.profile.findUnique({ where: { id: 1 } })` returns the dev profile.
5. `npm run build` passes — Prisma client generates correctly.
6. `prisma/migrations/` is committed; `dev.db` and `/uploads` are gitignored.
7. `docker build` succeeds and `docker compose up` boots the container with migrations applied to the mounted volume. Run `docker compose down && docker compose up` and verify the seeded data is still there (volumes persisted).
8. No `any` types in `lib/prisma.ts` or seed script.

## Out of scope

- No `/uploads` directory creation logic — Lane B handles that with the upload route
- No API routes
- No validation schemas
- No auth seam (plan explicitly uses hardcoded `profileId = 1`)
- No status auto-progression logic
- No Anthropic SDK setup

When this is committed, Lanes B/C/D can each `import { prisma } from "@/lib/prisma"` and start building features against a real, seeded database.