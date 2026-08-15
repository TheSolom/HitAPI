---
name: sonarqube
description: SonarQube Clean Code analysis, quality gate guidelines, and bug/code-smell refactoring patterns.
---

# SonarQube Clean Code Skill

Use this skill when auditing, refactoring, or writing code to ensure compliance with SonarQube Clean Code standards.

## Key Rules & Refactoring Patterns

### 1. Avoid Nested Ternary Operators (`sonarjs/no-nested-ternary`)
- **Anti-pattern**: `cond1 ? val1 : cond2 ? val2 : val3`
- **Solution**: Extract into `if/else` statements or dedicated helper functions.

### 2. Avoid Default Object Stringification (`sonarjs/no-base-to-string`)
- **Anti-pattern**: `String(val)` or `${val}` where `val` can be `object` or `unknown`.
- **Solution**: Explicitly check `typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean'` before stringifying.

### 3. Null Safety & Property Guarding
- **Anti-pattern**: Accessing `query.data.prop` inside callbacks when `query.data` may be `undefined`.
- **Solution**: Guard with `if (query.data?.prop)` or extract `const data = query.data; if (data)` checks.

### 4. Async Handler & Promise Misuse (`@typescript-eslint/no-misused-promises`)
- **Anti-pattern**: `onSubmit={async () => ...}` or passing promise return to void attribute.
- **Solution**: `onSubmit={(e) => { void handleSubmit(e); }}`.

### 5. Return Types for Generic API Requests
- **Anti-pattern**: `api.post<void>(...)`
- **Solution**: `api.post<undefined>(...)` for 204 No Content endpoints.
