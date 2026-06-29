# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 16 (App Router) · Prisma 7 + PostgreSQL (`@prisma/adapter-pg`) · NextAuth 4 (GitHub + Google, database sessions) · HeroUI · React Query (server state) + Zustand (client state) · Zod + react-hook-form · Tiptap + dnd-kit (Kanban) · Vercel Blob. Package manager: **npm**.

> ⚠️ **Next.js 16 differs from training data.** APIs, conventions, and file structure may not match what you remember. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices. (Also see `AGENTS.md` for dashboard design specs.)

## Commands

```
npm run dev        # dev server (localhost:3000)
npm run build      # production build
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix (also fixes import sort)
npm run db:push    # sync Prisma schema -> DB (run after editing prisma/schema)
npm run db:seed    # seed DB (tsx prisma/seed.ts)
npm run db:reset   # reset + reseed
npm run studio     # Prisma Studio
```

After a code change, run `npm run lint:fix` then `npm run build`. After editing the Prisma schema, run `npm run db:push`. There is no test framework configured.

## Workflow

Start each new task on a fresh branch — run `git checkout -b <branch-name>` first. Don't commit directly to `main`.

## Conventions

- **File suffixes are load-bearing — match them:**
  - `db/<name>.db.ts` — data-access layer (all Prisma queries live here, not in API routes/components)
  - `types/<name>.dto.ts` — DTOs
  - `enum/<name>.enum.ts` — TypeScript enums
  - `lib/<feature>/<name>.lib.ts` — feature helpers
- Validation: Zod schemas in `lib/validations/`.
- Import path alias: `@/*` → repo root. ESLint enforces import sorting (`simple-import-sort`).
- TypeScript is `strict`; code is camelCase. Prisma maps DB columns to snake_case via `@map` — keep model fields camelCase.
- Prisma client is a singleton in `lib/prisma.ts`; multi-step writes use `prisma.$transaction()`.
- All mutations are expected to write an `ActivityLog` entry (audit trail).

## Architecture

- **Data flow:** `db/*.db.ts` (queries) ← `app/api/*` (route handlers, organized by feature) ← `components/*` + `hooks/*` (via React Query). Don't put Prisma calls in components or routes — go through `db/`.
- **Auth/RBAC:** NextAuth config in `lib/auth/`. Access is per-project: `ProjectMember` → `Role` → `Permission[]`, where permissions use dot notation (`task.create`, `board.edit`). Preset roles in `constant/role.ts`; permission enum in `enum/permissions.enum.ts`. Check permissions via `lib/permission/` helpers.

## Environment

Required vars (see `.env.example`): `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`, `BLOB_READ_WRITE_TOKEN`.
