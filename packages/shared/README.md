# @hitapi/shared

[![npm version](https://img.shields.io/npm/v/@hitapi/shared?color=%23cb0000&logo=npm)](https://www.npmjs.com/package/@hitapi/shared) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%7C%206.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Node Version](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/TheSolom/HitAPI/blob/main/packages/shared/LICENSE.txt)

Shared runtime utilities and enumerations for the [HitAPI](https://github.com/TheSolom/HitAPI) platform.

> ⚠️ **Internal Package**: This package is primarily intended for internal use within the HitAPI ecosystem ([`@hitapi/api`](https://github.com/TheSolom/HitAPI/tree/main/apps/api), [`@hitapi/web`](https://github.com/TheSolom/HitAPI/tree/main/apps/web), and [`@hitapi/js`](https://github.com/TheSolom/HitAPI/tree/main/packages/sdk/js)). While published to npm for modular distribution, its public API is coupled to internal HitAPI releases and is not intended for standalone third-party consumption.

---

## 📦 Exported Subpaths

| Subpath                | Purpose        | Key Exports                                        |
| ---------------------- | -------------- | -------------------------------------------------- |
| `@hitapi/shared`       | Root export    | Re-exports all utilities and enumerations          |
| `@hitapi/shared/enums` | Common enums   | `RestfulMethod`, `Role`, `Environment`, etc.       |
| `@hitapi/shared/utils` | Shared helpers | UUID validation, string helpers, object sanitizers |

---

## 💻 Usage

```typescript
import { RestfulMethod, Environment } from '@hitapi/shared/enums';
import { isValidUUID } from '@hitapi/shared/utils';

if (isValidUUID(appId)) {
    // Process request
}
```

---

## 📄 License

This library is licensed under the terms of the [MIT License](https://github.com/TheSolom/HitAPI/blob/main/packages/shared/LICENSE.txt).
Part of the [HitAPI](https://github.com/TheSolom/HitAPI) project.
