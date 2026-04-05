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
COPY apps/api/assets ./assets

RUN mkdir -p apps/api/logs && chown -R node:node /app

USER node

EXPOSE ${PORT}

CMD ["node", "apps/api/dist/main.js"]
