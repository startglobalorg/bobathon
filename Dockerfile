FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3006
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma engines + client overlay (standalone trace can miss native binaries)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Prisma CLI in a sidecar tree so its full transitive dep graph is intact at boot.
# (deps stage = `npm ci --omit=dev`, prisma is now a prod dep, so this carries
#  prisma + @prisma/* + effect/c12/deepmerge-ts/empathic and their children.)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules /opt/prisma/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

# Persistent dirs must exist and be owned by nextjs BEFORE the USER switch,
# otherwise volumes mount as root and the app can't write to them.
RUN mkdir -p /app/data /app/uploads \
  && chown -R nextjs:nodejs /app/data /app/uploads

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3006/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
