ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG R2_PUBLIC_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Seed tooling in isolation — never `npm install` inside the Next standalone tree
FROM node:${NODE_VERSION} AS seed-tools
WORKDIR /opt/seed-tools
RUN npm init -y \
  && npm install tsx@4 dotenv@17 --omit=dev --no-audit --no-fund

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update \
  && apt-get install -y --no-install-recommends tini \
  && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# Solo lo necesario para seed/sync en el entrypoint
COPY --from=builder --chown=node:node /app/scripts/seed.ts /app/scripts/sync-schema.ts /app/scripts/sync-content.ts /app/scripts/reset-admin-password.ts ./scripts/
COPY --from=builder --chown=node:node /app/content ./content
COPY --from=builder --chown=node:node /app/src ./src
COPY --from=builder --chown=node:node /app/tsconfig.json ./tsconfig.json
COPY --from=seed-tools --chown=node:node /opt/seed-tools /opt/seed-tools
COPY --chown=node:node docker/entrypoint.sh docker/maybe-seed.cjs ./

RUN chmod +x /app/entrypoint.sh \
  && mkdir -p /app/.next \
  && chown -R node:node /app

USER node
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--", "/app/entrypoint.sh"]
