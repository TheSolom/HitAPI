# @hitapi/api

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.3-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Redis](https://img.shields.io/badge/Redis%20Stack-7.4-DC382D?logo=redis&logoColor=white)](https://redis.io/) [![BullMQ](https://img.shields.io/badge/BullMQ-5.x-brown?logo=bull&logoColor=white)](https://bullmq.io/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/TheSolom/HitAPI/blob/main/LICENSE)

Backend REST API, ingestion workers, and analytics engine for the [HitAPI](https://github.com/TheSolom/HitAPI) platform.

---

## 🚀 Quick Start

Ensure PostgreSQL and Redis are running (from the monorepo root: `docker compose -f docker-compose.dev.yml up -d`), then:

```bash
# 1. Copy local environment file
cp .env.development.example .env.development

# 2. Run pending database migrations
npm run migration:run

# 3. Start API in watch mode
npm run start:dev
```

Server will start on `http://localhost:3001` (or your configured `PORT`).

---

## ⚙️ Environment Variables (`.env.development`)

Key variables required for local development:

```env
PORT=3001
NODE_ENV=development
API_PREFIX=api
FRONTEND_URL=http://localhost:5173

# Database & Cache
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hitapi_dev
REDIS_HOST=localhost
REDIS_PORT=6379

# Queue Dashboard Credentials
BULL_BOARD_USER=admin
BULL_BOARD_PASSWORD=admin

# Auth Secrets
ACCESS_TOKEN_SECRET=your_jwt_access_secret_min_32_characters
ACCESS_TOKEN_EXPIRATION_TIME=900
REFRESH_TOKEN_EXPIRATION_TIME=604800
```

---

## 🗄️ Database Migrations

TypeORM migration commands:

| Command                                          | Description                                 |
| ------------------------------------------------ | ------------------------------------------- |
| `npm run migration:generate -- -n MigrationName` | Generate a migration from entity changes    |
| `npm run migration:run`                          | Execute pending database migrations         |
| `npm run migration:revert`                       | Revert the most recently executed migration |

---

## 🧭 Developer Interfaces

| Interface                  | URL                                                                        | Access / Notes                                         |
| -------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Swagger OpenAPI UI**     | [http://localhost:3001/api/docs](http://localhost:3001/api/docs)           | Interactive API explorer & Bearer JWT auth             |
| **OpenAPI Schema (JSON)**  | [http://localhost:3001/api/docs/json](http://localhost:3001/api/docs/json) | Raw OpenAPI 3.0 specification                          |
| **BullMQ Queue Dashboard** | [http://localhost:3001/queues](http://localhost:3001/queues)               | Basic Auth (`BULL_BOARD_USER` / `BULL_BOARD_PASSWORD`) |
| **Health Check Probe**     | [http://localhost:3001/health](http://localhost:3001/health)               | Liveness probe (excluded from global prefix)           |

---

## 🛠️ Development Scripts

| Command               | Action                                            |
| --------------------- | ------------------------------------------------- |
| `npm run start:dev`   | Start NestJS in watch mode (`nest start --watch`) |
| `npm run start:debug` | Start NestJS with debugger attached on port 9229  |
| `npm run start:prod`  | Run compiled production build from `dist/`        |
| `npm run build`       | Compile TypeScript source code to `dist/`         |
| `npm run test`        | Run Jest unit & integration tests                 |
| `npm run test:watch`  | Run tests in interactive watch mode               |
| `npm run test:cov`    | Generate test coverage report                     |
| `npm run lint`        | Run ESLint validation                             |
| `npm run type-check`  | Type-check TypeScript without emitting code       |

---

## 📄 License

MIT License. Part of the [HitAPI](https://github.com/TheSolom/HitAPI) platform.
