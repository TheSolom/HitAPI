FROM node:24.14-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

RUN npm ci

COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
COPY apps/api ./apps/api

RUN npm run build:shared
RUN npm run build:types
RUN npm run build:api


FROM node:24.14-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/types/package*.json ./packages/types/
COPY apps/api/package*.json ./apps/api/

RUN npm pkg delete scripts.prepare && npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN --mount=type=secret,id=maxmind_key \
    apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && mkdir -p apps/api/assets/GeoLite2-Country \
    && curl -sSL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=$(cat /run/secrets/maxmind_key)&suffix=tar.gz" \
    | tar -xz --strip-components=1 -C apps/api/assets/GeoLite2-Country \
    && apt-get purge -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

RUN mkdir -p apps/api/logs && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "apps/api/dist/main.js"]
