---
name: add-new-feature-module
description: Workflow command scaffold for add-new-feature-module in HitAPI.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-feature-module

Use this workflow when working on **add-new-feature-module** in `HitAPI`.

## Goal

Implements a new domain module with entities, DTOs, interfaces, repositories, service, controller, and module registration.

## Common Files

- `apps/api/src/modules/<feature>/dto/*.ts`
- `apps/api/src/modules/<feature>/entities/*.ts`
- `apps/api/src/modules/<feature>/enums/*.ts`
- `apps/api/src/modules/<feature>/interfaces/*.ts`
- `apps/api/src/modules/<feature>/repositories/*.ts`
- `apps/api/src/modules/<feature>/*.service.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create DTO files in apps/api/src/modules/<feature>/dto/
- Create entity files in apps/api/src/modules/<feature>/entities/
- Create enums and interfaces in apps/api/src/modules/<feature>/enums/ and interfaces/
- Create repository files in apps/api/src/modules/<feature>/repositories/
- Create service files in apps/api/src/modules/<feature>/

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.