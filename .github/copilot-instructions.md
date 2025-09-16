# Copilot: project-specific working rules for mastus-site

This is a Next.js 15 (App Router) monorepo with an admin subdomain, MySQL via Prisma, credential auth, and in-memory rate limiting. Follow these conventions to be productive and avoid breaking core behaviors.

## Architecture and boundaries
- App Router structure in `src/app/`:
  - Public site under `(main)/` (e.g., `src/app/(main)/page.tsx`, `products/page.tsx`).
  - Admin UI under `src/app/admin/*` but only accessible on admin subdomain (see Middleware below).
  - API routes under `src/app/api/**` (e.g., `products/route.ts`).
- Data layer: Prisma client in `src/lib/prisma.ts`, schema in `prisma/schema.prisma` (MySQL). Several JSON columns (arrays/objects) are stored as Prisma Json and must be normalized at the edge of APIs/UI.
- Auth: NextAuth Credentials in `src/lib/auth.ts`, session strategy JWT, role carried on the token/session.
- Cross-cutting:
  - `src/middleware.ts` enforces subdomain routing, security headers, API rate limiting, and admin gatekeeping.
  - Caching/content: `src/lib/content.ts` uses `unstable_cache` with tag-based revalidation per page key (`content:HOME` etc.).

## Subdomain routing and auth
- Admin must be hosted on `admin.<domain>`.
  - Non-admin subdomains hitting `/admin/*` are blocked (404). Root `/` on admin subdomain redirects to `/dashboard` for admins.
  - Login path is `/login` on the admin subdomain; `next.config.ts` rewrites `/login -> /admin/login` for hosts matching `admin.*`.
- AuthZ rules:
  - Admin-only pages and API endpoints check for `role === 'ADMIN'` via NextAuth (see `middleware.ts` and `api/products/route.ts`).
  - Middleware also protects POST/PUT/DELETE on `/api/products` and all `/api/admin` routes.

## Data model highlights (Prisma, MySQL)
- Key models: `User` (role enum), `Product` (JSON: images/advantages/applications/attributes), `Category` (code+nameRu), `ContactMessage`, `ContentPage` (typed JSON per page).
- Arrays and objects are stored as JSON due to MySQL: always normalize before returning to clients. Example in `api/products/route.ts` maps:
  - `images: Array.isArray(p.images) ? p.images : []` and flattens `category` to `code` + `categoryNameRu`.

## Content system and caching
- `src/lib/content.ts` exposes `getContent(page)` and `getAllContent()`; shapes:
  - HOME: `{ heroTitle, heroSubtitle }`
  - CONTACTS: `{ phoneTel, emailInfo, ... }`
  - ABOUT: `{ intro, companyText }`
- It normalizes with defaults and caches per page using `unstable_cache` with `tags: ['content:<PAGE>']` and `revalidate: 300`.
  - When you add any mutation endpoint that updates `ContentPage`, call `revalidateTag('content:<PAGE>')` so UI picks up changes.

## API patterns and rate limits
- Rate limiting is in-memory only: `src/lib/simple-rate-limit.ts` (100 req/min window). Used in `middleware.ts` for generic `/api/*` and within specific routes (e.g., `products GET/POST`).
  - There is a stubbed `src/lib/redis.ts`; Redis is intentionally disabled. Don’t reintroduce it unless you wire it end-to-end.
- Public data endpoints should:
  - Use `rateLimit()` with an identifier (IP or token), normalize Prisma JSON, and add reasonable cache headers.
- Admin mutations should:
  - Verify session via `getServerSession(authOptions)` and role, apply `rateLimit()` keyed by `user.id`, and validate inputs.

## UI conventions
- Tailwind v4 + shadcn-like UI in `src/components/ui/*` with a `cn()` helper (`src/lib/utils.ts`).
- Product cards and images follow the pattern in `(main)/products/page.tsx` and `components/ProductImage.tsx`.
- Example server-data usage on the home page: fetch content via `getContent('HOME')` and lightweight product previews via Prisma (see `(main)/page.tsx`).

## Dev and ops workflows
- NPM scripts (see `package.json`):
  - `npm run dev|build|start`
  - Prisma: `db:migrate`, `db:migrate:deploy`, `db:generate`, `db:seed`, `db:clear`, `db:check`
  - Admin bootstrap: `npm run admin:create` (interactive)
- Seeding: `prisma/seed.ts` creates an ADMIN and demo data. Credentials for seeded admin: `admin@mastus.ru` with password `admin123` (change in prod!).
- Security headers exist in both `next.config.ts` and `middleware.ts` (CSP, X-Frame, etc.). Keep changes in sync.

## When adding features
- New admin pages: place under `src/app/admin/...` and rely on middleware protection; prefer simple, clean routes (`/dashboard`, `/products`, etc.).
- New public API routes: mirror normalization and rate limiting from `api/products/route.ts`.
- Content changes: update `ContentPage` via API/mutation and `revalidateTag('content:<PAGE>')` to refresh.
- Avoid introducing Redis; use existing in-memory rate limit unless requirements change.

Reference files: `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/content.ts`, `src/lib/simple-rate-limit.ts`, `prisma/schema.prisma`, `src/app/(main)/**`, `src/app/admin/**`, `src/app/api/products/route.ts`.