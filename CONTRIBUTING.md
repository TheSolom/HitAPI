# Contributing to HitAPI

First off, thank you for considering contributing to **HitAPI**! It's people like you that make open-source such a wonderful space to build and share software.

Following these guidelines helps ensure a smooth, efficient collaboration and keeps the codebase maintainable and robust.

---

## 📑 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How Can I Contribute?](#-how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Pull Requests](#pull-requests)
- [Development Setup](#-development-setup)
- [Branch & Commit Conventions](#-branch--commit-conventions)
    - [Branch Naming](#branch-naming)
    - [Commit Messages](#commit-messages)
- [Code Quality & Testing](#-code-quality--testing)
- [Pull Request Process](#-pull-request-process)
- [License](#-license)

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful, constructive, and empathetic in all interactions across issues, pull requests, and discussions.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to ensure the problem has not already been reported.

When filing a bug report:

- **Use a clear and descriptive title.**
- **Describe the expected behavior vs. the actual behavior.**
- **Provide step-by-step instructions to reproduce the issue.**
- **Include relevant logs, screenshots, and system details** (OS, Node.js version, browser).

### Suggesting Enhancements

Feature requests are welcome! When proposing a new feature:

- Clearly explain the problem you are trying to solve or the value of the enhancement.
- Describe the proposed solution and any alternatives considered.
- Detail how it fits into HitAPI's architecture (Web dashboard, Backend API, or SDKs).

### Pull Requests

Whether fixing a bug, improving documentation, or adding a feature from our [Project Roadmap](README.md#-project-roadmap), PRs are always welcome.

For major architectural changes or new features, please **open an issue or discussion first** to align on scope and design before writing extensive code.

---

## 🛠️ Development Setup

HitAPI is structured as an npm workspaces monorepo.

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.x`
- **Docker & Docker Compose**: For local PostgreSQL 18 and Redis Stack

### Step-by-Step Setup

1. **Fork and clone the repository:**

    ```bash
    git clone https://github.com/<your-username>/HitAPI.git
    cd HitAPI
    ```

2. **Install all dependencies:**

    ```bash
    npm install
    ```

3. **Start local infrastructure (Docker):**

    ```bash
    docker compose -f docker-compose.dev.yml up -d
    ```

4. **Set up environment variables:**
    - **Backend API (`apps/api`):**
        ```bash
        cp apps/api/.env.development.example apps/api/.env.development
        ```
    - **Web Dashboard (`apps/web`):**
        ```bash
        cp apps/web/.env.example apps/web/.env
        ```

5. **Build shared packages and run database migrations:**

    ```bash
    npm run build:packages
    npm run migration:run
    ```

6. **Start development servers:**
    ```bash
    # Terminal 1: NestJS API (runs on port 3001)
    npm run start:dev:api

    # Terminal 2: React Web Dashboard (runs on port 4000)
    npm run start:dev:web
    ```

---

## 🌿 Branch & Commit Conventions

### Branch Naming

Use descriptive branch names prefixed with the change type:

| Prefix      | Description                                | Example                           |
| :---------- | :----------------------------------------- | :-------------------------------- |
| `feat/`     | New features                               | `feat/latency-percentile-chart`   |
| `fix/`      | Bug fixes                                  | `fix/api-key-redaction-regex`     |
| `docs/`     | Documentation changes                      | `docs/update-contributing-guide`  |
| `refactor/` | Code restructuring without feature changes | `refactor/queue-worker-handlers`  |
| `test/`     | Adding or updating tests                   | `test/add-consumer-service-tests` |
| `chore/`    | Tooling, dependency updates, maintenance   | `chore/upgrade-tailwind-v4`       |

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description>
```

**Common Scopes:**

- `api` (`apps/api`)
- `web` (`apps/web`)
- `sdk` (`packages/sdk/js`)
- `types` (`packages/types`)
- `shared` (`packages/shared`)

**Examples:**

- `feat(web): add response time percentile chart on endpoint page`
- `fix(api): handle null geoip lookup for local ip addresses`
- `docs(readme): add docker troubleshooting guide`
- `test(sdk): add unit tests for express middleware batching`

---

## 🧪 Code Quality & Testing

All contributions must pass automated checks before being merged. Run these locally prior to opening a PR:

| Check               | Command                | Purpose                                                           |
| :------------------ | :--------------------- | :---------------------------------------------------------------- |
| **Linting**         | `npm run lint`         | Ensures compliance with ESLint rules                              |
| **Type Checking**   | `npm run type-check`   | Verifies TypeScript compilation across workspaces                 |
| **Code Formatting** | `npm run format:check` | Verifies formatting with Prettier (`npm run format:write` to fix) |
| **Automated Tests** | `npm test`             | Runs Jest unit and integration tests                              |
| **Full Build**      | `npm run build`        | Verifies all packages and applications compile cleanly            |

---

## 🚀 Pull Request Process

1. Ensure your branch is up to date with `main`:
    ```bash
    git checkout feat/my-feature
    git fetch origin
    git rebase origin/main
    ```
2. Verify all quality checks pass:
    ```bash
    npm run lint
    npm run type-check
    npm run test
    npm run build
    ```
3. Push your branch to your fork:
    ```bash
    git push origin feat/my-feature
    ```
4. Open a Pull Request against the `main` branch of `TheSolom/HitAPI`.
5. Provide a concise summary of the changes, referencing any relevant issues (e.g., `Closes #12`).
6. Be open to feedback and participate in the code review process!

---

## 📄 License

By contributing to HitAPI, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
