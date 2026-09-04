# @hitapi/types

[![npm version](https://img.shields.io/npm/v/@hitapi/types?color=%23cb0000&logo=npm)](https://www.npmjs.com/package/@hitapi/types) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/TheSolom/HitAPI/blob/main/packages/types/LICENSE.txt)

Shared TypeScript definitions, DTOs, and event contracts for the [HitAPI](https://github.com/TheSolom/HitAPI) platform.

> ⚠️ **Internal Package**: This package provides centralized compile-time TypeScript type definitions and API contracts across the HitAPI ecosystem ([`@hitapi/api`](https://github.com/TheSolom/HitAPI/tree/main/apps/api), [`@hitapi/web`](https://github.com/TheSolom/HitAPI/tree/main/apps/web), and [`@hitapi/js`](https://github.com/TheSolom/HitAPI/tree/main/packages/sdk/js)). While published to npm for modular distribution, it represents internal data models and is not intended for standalone use.

---

## 🗂️ Key Type Categories

| Category                   | Key Types & Interfaces                                               |
| -------------------------- | -------------------------------------------------------------------- |
| **API Standards**          | `ApiResponse<T>`, `PaginatedResponse<T>`, `OrderDirection`, `Period` |
| **Authentication & Users** | `AuthUser`, `LoginPayload`, `RegisterPayload`, `JwtPayload`          |
| **Teams & Workspaces**     | `TeamResponseDto`, `CreateTeamPayload`, `TeamMemberDto`, `Role`      |
| **Applications & Keys**    | `AppResponseDto`, `CreateAppPayload`, `ApiKeyDto`                    |
| **Consumers & Groups**     | `ConsumerInfo`, `ConsumerResponseDto`, `ConsumerGroupResponseDto`    |
| **Endpoints & Routes**     | `EndpointResponseDto`, `EndpointMetricsResponseDto`                  |
| **Request Logs & Tracing** | `RequestLogResponseDto`, `GetRequestLogsOptions`, `LogRecord`        |
| **Telemetry Ingestion**    | `SyncPayload`, `StartupData`, `ClientStatsPayload`                   |

---

## 💻 Usage

```typescript
import type {
    ConsumerInfo,
    ApiResponse,
    PaginatedResponse,
    RequestLogResponseDto,
} from '@hitapi/types';
```

---

## 📄 License

This library is licensed under the terms of the [MIT License](https://github.com/TheSolom/HitAPI/blob/main/packages/types/LICENSE.txt).
Part of the [HitAPI](https://github.com/TheSolom/HitAPI) project.
