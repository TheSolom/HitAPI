# @hitapi/web

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![TanStack](https://img.shields.io/badge/TanStack-Router%20%7C%20Query%20%7C%20Table-FF4154?logo=react-query&logoColor=white)](https://tanstack.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/TheSolom/HitAPI/blob/main/LICENSE)

Single-page frontend dashboard console for the [HitAPI](https://github.com/TheSolom/HitAPI) platform.

---

## 🚀 Quick Start

Ensure the backend API (`@hitapi/api`) is running, then:

```bash
# 1. Copy local environment file
cp .env.example .env

# 2. Start Vite development server
npm run start:dev
```

The application will be accessible at **[http://localhost:5173](http://localhost:5173)**.

---

## ⚙️ Environment Variables (`.env`)

```env
# URL to your backend REST API base (no trailing slash)
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## 🏗️ Architecture & Technical Conventions

- **Routing (`@tanstack/react-router`)**: All routes are configured in `src/router.tsx` with type-safe parameters, search query validation (`validateSearch`), and authentication guards (`beforeLoad`).
- **Data Fetching (`@tanstack/react-query`)**: Server queries are cached, deduped, and synchronized in the background. Mutations trigger automatic query key invalidation.
- **Client State (`zustand`)**: User session, access tokens, and active application state are stored in `src/stores/auth-store.ts`.
- **UI Components & Styling**: Composable, accessible components built using Radix UI primitives and styled with utility classes via Tailwind CSS v4.

---

## 🧭 Routes Overview

| Path                                   | Access    | Description                                     |
| -------------------------------------- | --------- | ----------------------------------------------- |
| `/login`, `/register`                  | Public    | Authentication and user onboarding              |
| `/forgot-password`, `/reset-password`  | Public    | Password recovery and reset                     |
| `/apps`, `/apps/$appId`                | Protected | Application registry, credentials, and API keys |
| `/logs`                                | Protected | Live request logs explorer with filter drawer   |
| `/endpoints`                           | Protected | Discovered API endpoints and HTTP methods       |
| `/consumers`, `/consumers/$consumerId` | Protected | API consumer profiles, groups, and usage        |
| `/teams`, `/teams/$teamId`             | Protected | Workspaces, team members, and role management   |
| `/profile`                             | Protected | Account settings and security                   |

---

## 🛠️ Development Scripts

| Command              | Action                                                 |
| -------------------- | ------------------------------------------------------ |
| `npm run start:dev`  | Start Vite development server with hot reloading (HMR) |
| `npm run build`      | Compile optimized production build into `dist/`        |
| `npm run build:dev`  | Build in development mode with source maps             |
| `npm run preview`    | Locally preview production build                       |
| `npm run type-check` | Validate TypeScript types without emitting (`tsc`)     |
| `npm run lint`       | Run ESLint validation                                  |
| `npm run format`     | Format source files with Prettier                      |

---

## 📄 License

MIT License. Part of the [HitAPI](https://github.com/TheSolom/HitAPI) platform.
