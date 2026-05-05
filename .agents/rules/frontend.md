---
description: React/Next.js frontend coding standards with shadcn/ui, Tailwind CSS v4, and FSD-lite architecture
globs: "**/*.{tsx,jsx,css,scss}"
alwaysApply: false
---

# Frontend Coding Standards

## Core Rules

1. **Component Reuse**: Use `shadcn/ui` components first. Extend via `cva` variants or composition. Avoid custom CSS.
2. **Design Fidelity**: Code must map 1:1 to `DESIGN.md` (Section 9 — Agent Prompt Guide) and Design Tokens. Resolve discrepancies before implementation.
3. **Rendering Strategy**: Default to Server Components for performance. Use Client Components only for interactivity and API integration.
4. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation, and screen reader compatibility are mandatory.
5. **Tool First**: Check for existing solutions and tools before coding.
6. **Proxy over Middleware (BANNED)**: Next.js 16+ uses `proxy.ts` for request proxying. `middleware.ts` is NOT "deprecated" — it is forbidden in this project, touch it and you die. Do NOT create, recommend, suggest, or "restore" `middleware.ts`. Do NOT flag `proxy.ts` as dead code, unused, or not-wired. Do NOT demand a rename to `middleware.ts`. Any such finding is a fatal self-error — retract it immediately and write `proxy.ts`.
7. **No Prop Drilling**: Avoid passing props beyond 3 levels. Use Jotai atoms instead. Avoid React Context.
8. **Auth Boundary**: Frontend handles auth UI and token storage only. Never import database adapters, ORMs, or server-side auth libraries.
9. **Animation Library**: Use `motion` (import from `motion/react`). `framer-motion` is the legacy package name and is BANNED — never `import { motion } from 'framer-motion'`, never add `framer-motion` to `package.json`. Add the `motion` package via the project's package manager — detect from the lockfile (`bun.lock` → bun, `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm); default to `bun` when no lockfile exists. Import as `import { motion, AnimatePresence } from 'motion/react'`. Respect `prefers-reduced-motion` via `useReducedMotion` from `motion/react`.

## Architecture (FSD-lite)

- **Root (`src/`)**: Shared logic (components, lib, types). Hoist common code here.
- **Feature (`src/features/*/`)**: Feature-specific logic. **No cross-feature imports.** Unidirectional flow only.

```
src/features/[feature]/
├── components/           # Feature UI components
│   └── skeleton/         # Loading skeleton components
├── types/                # Feature-specific type definitions
└── utils/                # Feature-specific utilities & helpers
```

## Naming Conventions

- Files: `kebab-case.tsx`
- Components/Types/Interfaces: `PascalCase`
- Functions/Vars/Hooks: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Imports: Absolute `@/` is MANDATORY (no relative `../../`)
- MUST use `import type` for interfaces/types

## Performance

- Target First Contentful Paint (FCP) < 1s
- Use `next/dynamic` for heavy components, `next/image` for media
- Responsive Breakpoints: 320px, 768px, 1024px, 1440px
