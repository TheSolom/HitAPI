# HitAPI - API Observability & Analytics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Node Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/) [![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/) [![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**HitAPI** is a high-performance, open-source API monitoring, observability, and analytics platform built with **TypeScript**, **NestJS**, and **React**. Designed as a developer-friendly alternative to bloated APM suites, HitAPI provides instant visibility into API traffic, request logs, performance metrics, and consumer usage—without complex infrastructure or operational overhead.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture &amp; Monorepo](#-architecture--monorepo)
    - [Monorepo Structure](#monorepo-structure)
    - [Technology Stack](#technology-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
    - [1. Clone &amp; Install Dependencies](#1-clone--install-dependencies)
    - [2. Start Infrastructure (Docker)](#2-start-infrastructure-docker)
    - [3. Configure Environment Variables](#3-configure-environment-variables)
    - [4. Build Packages &amp; Run Migrations](#4-build-packages--run-migrations)
    - [5. Run Development Servers](#5-run-development-servers)
    - [Default Service Endpoints](#default-service-endpoints)
- [SDK Quick Start](#-sdk-quick-start)
- [Workspace Commands](#-workspace-commands)
- [Project Roadmap](#-project-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Key Features

- ⚡ **Real-Time API Observability**: Track throughput, response time percentiles (p50, p95, p99), error rates, and request volume in real time.
- 🖥️ **Modern Web Dashboard (`apps/web`)**: Intuitive single-page application built with React 19, TanStack Router, TanStack Query, and Tailwind CSS for inspecting API traffic, endpoints, teams, and request logs.
- 🔎 **Deep Request Logging & Tracing**: Ingest and explore granular request/response logs, including headers, query parameters, payloads, execution timing, and GeoIP client attribution.
- 👥 **API Consumer Intelligence**: Track API consumption by client, tenant, or API key. Group consumers into tiers and monitor usage patterns and quotas.
- 🛡️ **Privacy & Data Masking**: Built-in regex masking for sensitive headers (e.g., `Authorization`, cookies), query parameters (tokens, keys), and JSON body fields before ingestion.
- 📬 **Asynchronous Queue-Backed Ingestion**: High-throughput background ingestion powered by **BullMQ** and **Redis**, ensuring zero latency impact on monitored applications.
- 🏢 **Multi-Tenant Teams & Applications**: Organize APIs into distinct applications under collaborative teams with role-based member management.
- 🔒 **Comprehensive Security & Auth**: JWT tokens, Google OAuth 2.0, Argon2 password hashing, rate limiting, and Helmet security headers.
- 📦 **Plug-and-Play Node.js SDK (`packages/sdk/js`)**: Lightweight, non-blocking middleware for Express (NestJS support in progress) with batch processing.

---

## 🏗️ Architecture & Monorepo

HitAPI is structured as an npm workspaces monorepo separating the user interface, backend ingestion engine, shared libraries, and client SDKs.

### Monorepo Structure

```text
HitAPI/
├── apps/
│   ├── api/                   # NestJS 11 Backend API & Ingestion Engine
│   │   ├── src/bootstrap/     # Application initialization & middleware
│   │   ├── src/config/        # Database, Redis, Queues, & Auth config
│   │   └── src/modules/       # Domain modules (auth, apps, teams, logs, etc.)
│   └── web/                   # React 19 + Vite Dashboard Application
│       ├── src/components/    # Reusable UI components (Radix primitives)
│       ├── src/features/      # Domain-driven features (apps, consumers, logs)
│       ├── src/routes/        # TanStack Router type-safe route tree
│       └── src/stores/        # Zustand client-side state stores
├── packages/
│   ├── sdk/
│   │   └── js/                # Official Node.js SDK (@hitapi/js)
│   ├── shared/                # Shared utilities, schemas, and helpers
│   └── types/                 # Shared TypeScript interfaces & DTO contracts
├── .husky/                    # Git hooks (pre-commit linting & formatting)
├── .github/                   # CI/CD workflows and actions
├── docker-compose.dev.yml     # Local development services (PostgreSQL 18, Redis Stack)
├── docker-compose.yml         # Production container definition
├── LICENSE                    # MIT License
└── package.json               # Monorepo root workspace configuration
```

### Technology Stack

| Layer                         | Technologies                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Web Dashboard**             | React 19, TypeScript, Vite 8, TanStack Router, TanStack Query, Tailwind CSS v4, Radix UI, Lucide Icons, Recharts, Zustand |
| **Backend API**               | NestJS 11, TypeScript, Express, TypeORM, Winston (Structured Logging), Swagger / OpenAPI                                  |
| **Databases & Cache**         | PostgreSQL 18.3, Redis Stack 7.4 (ioredis, Keyv)                                                                          |
| **Queues & Background Tasks** | BullMQ 5.x, Bull Board (UI Queue Inspector)                                                                               |
| **Security & Auth**           | Passport (JWT, Local, Google OAuth 2.0), Argon2, Helmet, Throttler, MaxMind GeoIP                                         |
| **Client SDK**                | Node.js, Express middleware, Batch Ingestion Client                                                                       |
| **Tooling & Quality**         | ESLint 10, Prettier 3, Jest 30, Supertest, Husky, lint-staged                                                             |

---

## 📋 Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: `>= 20.0.0` (supports `v20.x`, `v22.x`, `v24.x`, and `v26.x`)
- **npm**: `>= 10.x` (supports `v10.x` and `v11.x`)
- **Docker & Docker Compose**: Required for PostgreSQL and Redis services

---

## 🚀 Getting Started

Follow these steps to set up and run the entire HitAPI platform locally.

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/TheSolom/HitAPI.git
cd HitAPI

# Install all workspace dependencies
npm install
```

### 2. Start Infrastructure (Docker)

Launch the local PostgreSQL 18 and Redis Stack instances:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Verify that both containers (`postgres-db` and `redis-cache`) are healthy:

```bash
docker compose -f docker-compose.dev.yml ps
```

### 3. Configure Environment Variables

#### Backend API (`apps/api`)

Copy the development environment template:

```bash
# In apps/api directory
cp apps/api/.env.development.example apps/api/.env.development
```

Key environment configurations inside `apps/api/.env.development`:

```env
PORT=3001
NODE_ENV=development
API_PREFIX=api

# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hitapi_dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Queue Dashboard Credentials
BULL_BOARD_USER=admin
BULL_BOARD_PASSWORD=admin
```

#### Web Dashboard (`apps/web`)

Copy the web application environment template:

```bash
# In apps/web directory
cp apps/web/.env.example apps/web/.env
```

Ensure the API base URL matches your local backend instance:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### 4. Build Packages & Run Migrations

Build the shared packages and execute initial database migrations:

```bash
# 1. Build shared packages (types, shared utilities, SDK)
npm run build:packages

# 2. Run TypeORM database migrations
npm run migration:run
```

### 5. Run Development Servers

You can start both the API backend and Web Dashboard concurrently in separate terminal windows:

```bash
# Terminal 1: Start NestJS Backend API (watch mode on port 3001)
npm run start:dev:api

# Terminal 2: Start React Web Dashboard (Vite on port 4000)
npm run start:dev:web
```

### Default Service Endpoints

| Service                   | URL                                                              | Description                       |
| ------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| **Web Dashboard**         | [http://localhost:4000](http://localhost:4000)                   | HitAPI frontend console           |
| **REST API Base**         | [http://localhost:3001/api/v1](http://localhost:3001/api/v1)     | Backend API endpoint              |
| **Swagger Documentation** | [http://localhost:3001/api/docs](http://localhost:3001/api/docs) | Interactive OpenAPI documentation |
| **BullMQ Dashboard**      | [http://localhost:3001/queues](http://localhost:3001/queues)     | Bull Board queue monitoring UI    |
| **Redis Stack UI**        | [http://localhost:8001](http://localhost:8001)                   | RedisInsight visual cache browser |

---

## 🔌 SDK Quick Start

Monitor any Express.js application in minutes by installing the official `@hitapi/js` package.

### 1. Install SDK

```bash
npm install @hitapi/js
```

### 2. Add HitAPI Middleware

```typescript
import express from 'express';
import { useHitAPI, setConsumer } from '@hitapi/js/express';

const app = express();
app.use(express.json());

// Initialize HitAPI middleware
useHitAPI(app, {
    clientId: 'YOUR_APP_CLIENT_ID', // Generated in the HitAPI Web Dashboard
    requestLogging: {
        enabled: true,
        logQueryParams: true,
        logRequestHeaders: false,
        logRequestBody: false,
        logResponseHeaders: true,
        logResponseBody: false,
        // Automatically mask sensitive information
        maskQueryParams: [/token/i, /api_?key/i, /password/i],
        maskHeaders: [/authorization/i, /cookie/i],
        maskBodyFields: [/password/i, /credit_?card/i, /secret/i],
        // Exclude internal health and telemetry checks
        excludePaths: [/^\/health/, /^\/metrics/],
    },
});

// Example route with consumer tracking
app.get('/api/projects', (req, res) => {
    // Optionally tag requests with a client/tenant ID
    setConsumer(req, 'org_acme_corp');
    res.json({ data: [] });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

---

## 🛠️ Workspace Commands

All commands can be executed from the root workspace using standard `npm run` scripts:

### Development

| Command                 | Action                                              |
| ----------------------- | --------------------------------------------------- |
| `npm run start:dev:api` | Starts the NestJS API in watch mode                 |
| `npm run start:dev:web` | Starts the Vite React dashboard in development mode |
| `npm run start:dev:sdk` | Starts SDK compilation in watch mode                |

### Building

| Command                  | Action                                                      |
| ------------------------ | ----------------------------------------------------------- |
| `npm run build`          | Builds all packages, API, and Web dashboard                 |
| `npm run build:packages` | Compiles`@hitapi/types`, `@hitapi/shared`, and `@hitapi/js` |
| `npm run build:api`      | Compiles the NestJS backend application                     |
| `npm run build:web`      | Creates a production build of the React dashboard           |

### Testing & Code Quality

| Command                | Action                                                   |
| ---------------------- | -------------------------------------------------------- |
| `npm test`             | Runs Jest unit and integration tests across the monorepo |
| `npm run test:api`     | Runs tests for`apps/api`                                 |
| `npm run test:sdk`     | Runs tests for`packages/sdk/js`                          |
| `npm run test:cov`     | Generates test coverage reports                          |
| `npm run lint`         | Runs ESLint across all workspaces                        |
| `npm run type-check`   | Performs TypeScript type-checking across all projects    |
| `npm run format:check` | Verifies code style compliance using Prettier            |

### Database Migrations

| Command                      | Action                                                    |
| ---------------------------- | --------------------------------------------------------- |
| `npm run migration:generate` | Generates a new TypeORM migration based on entity changes |
| `npm run migration:run`      | Executes pending database migrations                      |
| `npm run migration:revert`   | Reverts the most recently executed migration              |

---

## 🗺️ Project Roadmap

### 🏁 Core Capabilities _(Available Now)_

- [x] **Team Workspaces & Access Control**: Multi-tenant team collaboration, member invitations, and role-based permissions (Owner, Admin, Member).
- [x] **Multi-Application Management**: Centralized dashboard to register multiple APIs, generate client ingestion keys, and manage configuration.
- [x] **Endpoint Auto-Discovery & Catalog**: Automatic detection and inventory of active API routes, HTTP methods, and service health status.
- [x] **Live Request Logging**: Interactive log explorer with search, filtering by endpoint/consumer/status, response duration, and GeoIP client location.
- [x] **API Consumer Intelligence**: Identification and tracking of individual API clients/tenants, custom grouping into tiers, and consumption metrics.
- [x] **Data Privacy & Sensitive Field Masking**: Client-side redaction for authorization headers, cookies, API tokens, and sensitive body fields before telemetry is transmitted.
- [x] **Plug-and-Play Express.js Integration**: Zero-boilerplate middleware with asynchronous batch transmission.

### 🔄 In Active Development _(Phase 4: Telemetry & Analytics)_

- [x] **Host Resource Metrics**: CPU and memory utilization reported by connected SDKs.
- [ ] **Traffic & Throughput Dashboards**: Request volume graphs, requests-per-second (RPS) metrics, and status code distributions.
- [ ] **Performance & Latency Insights**: Visual response time distributions, percentiles (p50, p95), and slowest endpoint rankings.
- [ ] **Error Tracking**: Categorized 4xx client and 5xx server error counts with captured error messages and stack traces.

### 🌐 Phase 5: SDK & Framework Expansion

- [ ] **NestJS Official Integration**: Dedicated interceptor and module for NestJS applications
- [ ] **ASP.NET Core Official SDK (`HitAPI.NET`)**: High-performance, non-blocking middleware for .NET 8/9+

### 🔔 Phase 6: Alerts & Uptime Checks

- [ ] **Threshold Alerts**: Simple alerts triggered when error rates exceed a set percentage or when an API becomes unreachable.
- [ ] **Basic Uptime Monitoring**: Scheduled HTTP ping checks to monitor endpoint availability and record downtime history.
- [ ] **Slack & Webhook Notifications**: Send incident alerts directly to Slack channels, Discord, or custom webhook URLs.

### 📊 Phase 7: Saved Filters & Data Export

- [ ] **Saved Filters & Presets**: Save frequent search and filter criteria in the request logs viewer for quick access.
- [ ] **CSV Data Export**: Export request logs and consumer usage summaries to CSV for offline analysis and reporting.

---

## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feat/amazing-feature`)
3. **Commit your Changes** (`git commit -m 'feat(web): add endpoint traffic visualization'`)
4. **Push to the Branch** (`git push origin feat/amazing-feature`)
5. **Open a Pull Request**

Please ensure all tests pass (`npm test`), code is formatted (`npm run format:check`), and there are no lint errors (`npm run lint`) before submitting.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 🙏 Acknowledgments

- Inspired by the clean simplicity of [Apitally.io](https://apitally.io).
- Built with [NestJS](https://nestjs.com/), [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/).
