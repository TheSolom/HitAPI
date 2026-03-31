```markdown
# HitAPI Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development conventions and workflows of the HitAPI TypeScript codebase. HitAPI is a modular API project (no framework detected) with a strong emphasis on clear module boundaries, conventional commits, and robust testing. You'll learn how to add new feature modules, refactor logging, manage environment configuration, extend ingestion pipelines, and write effective unit tests, all while following the project's established coding standards.

---

## Coding Conventions

### File Naming

- **Files:** Use `kebab-case` for all file names.
  - Example: `user-service.ts`, `environment-variables.dto.ts`
- **Directories:** Organize by feature/module under `apps/api/src/modules/<feature>/`.

### Imports

- **Relative imports** are used throughout the codebase.
  - Example:
    ```typescript
    import { UserEntity } from './entities/user.entity';
    ```

### Exports

- **Named exports** are preferred.
  - Example:
    ```typescript
    export interface UserDto { ... }
    export const USER_CONSTANT = 'user';
    ```

### Commit Messages

- **Conventional commits** with prefixes: `feat`, `refactor`, `chore`, `test`, `fix`, `docs`, `build`
- **Average length:** ~57 characters

---

## Workflows

### Add New Feature Module

**Trigger:** When you want to add a new feature area (e.g., errors, traffic) to the API  
**Command:** `/new-module`

1. Create DTO files in `apps/api/src/modules/<feature>/dto/`
2. Create entity files in `apps/api/src/modules/<feature>/entities/`
3. Create enums and interfaces in `apps/api/src/modules/<feature>/enums/` and `interfaces/`
4. Create repository files in `apps/api/src/modules/<feature>/repositories/`
5. Create service files in `apps/api/src/modules/<feature>/`
6. Create controller file in `apps/api/src/modules/<feature>/`
7. Create module file in `apps/api/src/modules/<feature>/`
8. Update constants in `apps/api/src/common/constants/`
9. Register the module in `apps/api/src/app.module.ts`

**Example:**
```typescript
// apps/api/src/modules/errors/errors.module.ts
import { Module } from '...';
import { ErrorsService } from './errors.service';
import { ErrorsController } from './errors.controller';

@Module({
  providers: [ErrorsService],
  controllers: [ErrorsController],
})
export class ErrorsModule {}
```

---

### Refactor Module Logging to AppLoggerService

**Trigger:** When standardizing logging across modules using `AppLoggerService`  
**Command:** `/refactor-logging`

1. Replace NestJS `Logger` imports with `AppLoggerService` in target files
2. Inject `AppLoggerService` via constructor where needed
3. Update all logger calls to use `AppLoggerService`
4. Update or add `AppLoggerService` mocks in related test files

**Example:**
```typescript
// Before
import { Logger } from '@nestjs/common';
private readonly logger = new Logger(MyService.name);

// After
import { AppLoggerService } from '../../common/logger/app-logger.service';
constructor(private readonly logger: AppLoggerService) {}
```

---

### Add or Update Env Configuration

**Trigger:** When introducing or modifying environment variables or related config  
**Command:** `/update-env`

1. Edit or add environment variable in `apps/api/src/config/env/dto/environment-variables.dto.ts`
2. Update related configuration files in `apps/api/src/config/*/configuration.ts`
3. Update `.env.example` and/or `.env.local.example` with the new variable
4. Update code to use the new/changed environment variable

**Example:**
```typescript
// apps/api/src/config/env/dto/environment-variables.dto.ts
export class EnvironmentVariablesDto {
  API_KEY: string;
  // ...
}
```

---

### Add Ingestion Pipeline or Processor

**Trigger:** When adding a new ingestion flow (e.g., sync-data, startup-data)  
**Command:** `/new-ingestion-pipeline`

1. Create or update DTOs in `apps/api/src/modules/ingestion/dto/`
2. Add or update processor files in `apps/api/src/modules/ingestion/processors/`
3. Update job data types in `apps/api/src/modules/ingestion/types/`
4. Update or create service/controller logic in `apps/api/src/modules/ingestion/`
5. Update module registration in `apps/api/src/modules/ingestion/ingestion.module.ts`
6. Update queue constants if needed

**Example:**
```typescript
// apps/api/src/modules/ingestion/processors/sync-data.processor.ts
import { Process, Processor } from '...';
@Processor('sync-data')
export class SyncDataProcessor {
  @Process()
  async handle(job: Job<SyncDataJob>) { ... }
}
```

---

### Add or Update Unit Tests for Module Service

**Trigger:** When adding or improving unit tests for a service  
**Command:** `/add-service-tests`

1. Create or update `.spec.ts` files in the module's `tests` directory
2. Add/expand test cases for service logic and edge cases
3. Update mocks or test utilities as needed

**Example:**
```typescript
// apps/api/src/modules/user/tests/user.service.spec.ts
import { UserService } from '../user.service';

describe('UserService', () => {
  it('should return user by id', async () => {
    // test logic here
  });
});
```

---

## Testing Patterns

- **Framework:** [Jest](https://jestjs.io/)
- **Test files:** Use the `.spec.ts` suffix and are placed in `tests` directories within each module.
- **Test Example:**
  ```typescript
  // apps/api/src/modules/errors/tests/errors.service.spec.ts
  import { ErrorsService } from '../errors.service';

  describe('ErrorsService', () => {
    it('should log error', () => {
      // ...
    });
  });
  ```

---

## Commands

| Command                | Purpose                                                      |
|------------------------|--------------------------------------------------------------|
| /new-module            | Scaffold a new feature module                                |
| /refactor-logging      | Migrate module logging to AppLoggerService                   |
| /update-env            | Add or update environment variable configuration             |
| /new-ingestion-pipeline| Add a new ingestion pipeline or processor                    |
| /add-service-tests     | Add or improve unit tests for a module's service             |
```
