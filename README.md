# Apartner

Tinder for apartments.

## Quick start

```bash
npm install
npm run dev
```

App runs at http://localhost:3006.

## Build

```bash
npm run build
npm run start
```

## Docker

```bash
docker build -t apartner .
docker run -p 3006:3006 apartner
```

## Deploy

Container exposes port 3006. Deployed via Portainer on Hetzner; Pangolin handles the public hostname and TLS.

Set `ANTHROPIC_API_KEY` in the deployment environment.
