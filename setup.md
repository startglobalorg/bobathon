# Apartner — Initial Scaffold

Set up an empty Next.js project for **Apartner**, a Tinder-for-apartments web app. No features yet — just the scaffold and deploy config so we can land an initial commit.

## Stack

- **Next.js 14+** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** (initialized, no components added yet)
- **Zustand** (installed, no store yet)
- **`@anthropic-ai/sdk`** (installed, not wired up)
- **`react-tinder-card`** (installed, not used yet)
- **`lucide-react`** (icons)
- **`tsx`** (dev dep, for running future scripts)

## Port

The app runs on **port 3006**, not 3000.

- `package.json`: `"dev": "next dev -p 3006"`, `"start": "next start -p 3006"`
- `Dockerfile`: `ENV PORT=3006`, `ENV HOSTNAME=0.0.0.0`, `EXPOSE 3006`
- `docker-compose.yml`: maps `3006:3006`

## Project structure

```
apartner/
├── app/
│   ├── layout.tsx           # root layout, Tailwind globals, Inter font
│   └── page.tsx             # placeholder: "Apartner — coming soon"
├── components/              # empty
├── lib/                     # empty
├── data/                    # empty (gitkeep)
├── public/                  # empty
├── Dockerfile
├── docker-compose.yml
├── next.config.js           # output: 'standalone'
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example             # ANTHROPIC_API_KEY=
├── .gitignore               # node_modules, .next, .env
└── README.md                # quick start + deploy notes
```

## Deploy target

Portainer on Hetzner, with Pangolin handling the public hostname and TLS. The container only exposes port 3006 — no reverse-proxy config inside the repo.

## Dockerfile

Multi-stage `node:20-alpine`:
1. **deps** — install prod deps from `package-lock.json`
2. **builder** — install all deps, run `npm run build`
3. **runner** — copy `.next/standalone`, `.next/static`, `public/`, run as non-root user

Set `ENV PORT=3006` and `ENV HOSTNAME=0.0.0.0`. Expose 3006. Healthcheck hits `http://localhost:3006/`.

## docker-compose.yml

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
      - NODE_ENV=production
      - PORT=3006
      - HOSTNAME=0.0.0.0
```

## Acceptance

1. `npm install && npm run dev` → app loads at `http://localhost:3006` showing the placeholder page.
2. `npm run build` succeeds with no errors.
3. `docker build -t apartner . && docker run -p 3006:3006 apartner` → app loads at `http://localhost:3006`.
4. No `any` types. Strict TS passes.

Don't add features, mock data, API routes, or UI beyond the placeholder. We're building features in follow-up sessions.