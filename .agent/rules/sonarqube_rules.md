---
alwaysApply: true
always_on: true
trigger: always_on
applyTo: "**"
description: SonarQube Clean Code Quality and Security Rules
---

# SonarQube Clean Code Best Practices

- **No Nested Ternary Operations (`sonarjs/no-nested-ternary`)**: Never nest ternary operators in JSX or TypeScript/JavaScript code. Extract conditional rendering/logic into explicit `if/else` statements or helper functions.
- **Type Safety & Stringification (`sonarjs/no-base-to-string`)**: Never invoke `String(value)` or string interpolation `${value}` on `unknown` or `object` types where `Object.prototype.toString` (`[object Object]`) could occur. Always type-guard primitives (`string`, `number`, `boolean`) first.
- **Null & Undefined Protection**: Always guard optional properties (e.g. `userQuery.data?.property`) before accessing properties or passing to callbacks.
- **No Misused Promises (`@typescript-eslint/no-misused-promises`)**: Never pass promise-returning async functions directly to event handlers or attributes expecting a void return. Wrap with `(e) => { void handler(e); }`.
- **Cognitive Complexity & Maintainability**: Keep functions focused and refactor deeply nested conditionals or repetitive code structures into clean, modular helpers.
- **Dead & Unused Code**: Avoid unused parameters, variables, or unreachable code branches.
- **Security & Input Validation**: Ensure all user inputs and query parameters are properly sanitized and type-checked before processing.
