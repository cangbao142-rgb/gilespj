<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: gilesbk-blog

Next.js 16 (App Router) + Supabase trading blog. Chinese UI (zh-CN).

## Commands

```
npm install          # required first — deps are not pre-installed
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # eslint (next/core-web-vitals + typescript)
```

There is no `test`, `typecheck`, or `format` script. For type-checking only, run `npx tsc --noEmit` manually.

## Architecture

- `src/app/` — App Router pages. All SSR (`export const dynamic = "force-dynamic"`) except `/chart` which is `"use client"`.
- `src/components/` — shared UI. `Navbar`, `CategoryTabs`, `PostList`, `DailyTabs` are client components; `Footer`, `Showcase`, `BackgroundPattern` are server components.
- `src/lib/` — data layer: `supabase.ts` (client init), `articles.ts` (all queries), `types.ts` (Article, CategoryType).
- Path alias `@/*` maps to `./src/*`.

## Next.js 16 specifics

- Dynamic route `params` is a `Promise` — you must `await params` before accessing properties (see `src/app/article/[id]/page.tsx`).
- `next-env.d.ts` is auto-generated and gitignored. Never edit it.

## Supabase

No local database. All queries hit the remote Supabase instance. Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
The anon key is safe to expose client-side (RLS-protected). Server queries use `createServerSupabaseClient()` from `src/lib/supabase.ts`.

## Tailwind CSS 4

Uses the v4 PostCSS plugin (`@tailwindcss/postcss`). There is no `tailwind.config.js` — Tailwind v4 is config-file-free. All styling is in `src/app/globals.css`.

## Chart page

`/chart` loads ECharts via a CDN `<script>` tag at runtime (not an npm dependency). It is a fully client-side page.

## Deployment

Vercel. No CI pipelines or GitHub Actions. Deploy with `vercel --prod`. Environment variables must be synced to Vercel separately (`vercel env add`).
