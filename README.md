# Aurelle — Cosmetic E-Commerce Platform

A full-stack cosmetic e-commerce storefront and admin dashboard built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 7 + PostgreSQL, Auth.js, Zustand, and Cloudinary. Guest checkout hands orders off to WhatsApp for confirmation — no customer account required.

> "Aurelle" is a placeholder brand name (see `src/lib/constants.ts`) — swap it, the logo text, and the color tokens in `src/app/globals.css` for your own brand before launch.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Server Components/Actions)
- **Database:** PostgreSQL via Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- **Auth:** Auth.js v5, Credentials provider, JWT sessions (admin-only)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Base UI primitives)
- **Client state:** Zustand (cart, persisted to localStorage)
- **Forms/validation:** React Hook Form + Zod
- **Images:** Cloudinary
- **Tests:** Node's built-in test runner via `tsx --test`

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables** — copy the example and fill it in:
   ```bash
   cp .env.example .env
   ```
   See [Environment Variables](#environment-variables) below for what each one needs.

3. **Set up the database.** Pick one:
   - **Hosted Postgres (recommended, and required for production anyway):** create a free database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com), and paste the connection string into `DATABASE_URL`.
   - **Local disposable Postgres via Prisma** (fastest for a quick spin, but not persistent/reliable long-term):
     ```bash
     npm run db:dev   # starts a local Postgres, prints a DATABASE_URL — put it in .env
     ```

4. **Run migrations and seed data:**
   ```bash
   npm run db:migrate   # creates tables
   npm run db:seed      # seeds categories, brands, products, offers, and the admin user
   ```

5. **Start the dev server:**
   ```bash
   npm run dev
   ```
   - Storefront: http://localhost:3000
   - Admin: http://localhost:3000/admin/login — sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (that's what the seed script uses to create the admin account).

## Environment Variables

All variables are documented in `.env.example`. The important ones:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. |
| `AUTH_SECRET` | Generate with `npx auth secret` or `openssl rand -base64 32`. Required in production. |
| `NEXT_PUBLIC_APP_URL` | Your deployed site's public URL — used for canonical URLs, sitemap, JSON-LD, and OG images. Update this before deploying. |
| `WHATSAPP_PHONE_NUMBER` | The business WhatsApp number that receives orders, digits only, international format (e.g. `9779800000000`). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard. Without these, product/brand/category image uploads in the admin will fail with a clear error — the rest of the app still works. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used **once** by `prisma/seed.ts` to create the initial admin account. Change the password after first login isn't built in yet — for now, update `.env` and re-run the relevant part of the seed, or update the `AdminUser` row directly. |

Never commit `.env` — only `.env.example` is tracked.

## Useful Scripts

```bash
npm run dev            # start dev server (Turbopack)
npm run build           # production build
npm run start           # run the production build
npm run lint             # ESLint
npm run typecheck      # tsc --noEmit
npm run test              # run the test suite
npm run db:migrate    # create/apply a migration (dev)
npm run db:deploy      # apply migrations (production)
npm run db:seed         # seed the database
npm run db:studio      # Prisma Studio (browse/edit data visually)
npm run db:dev           # start a local disposable Postgres via Prisma
```

## Deploying

1. Provision a production Postgres database (Neon, Supabase, Railway, RDS, etc.) and set `DATABASE_URL`.
2. Set every variable in [Environment Variables](#environment-variables) on your hosting platform — most importantly `AUTH_SECRET` (production will refuse to start without it) and `NEXT_PUBLIC_APP_URL` (set it to your real domain, e.g. `https://yourstore.com`).
3. Run `npm run db:deploy` against the production database (applies migrations without prompting) before or during your first deploy.
4. Run `npm run db:seed` once to create categories/brands/products (edit `prisma/seed.ts` first if you don't want the sample catalog) and the admin user.
5. Deploy. On [Vercel](https://vercel.com/new), this is a standard Next.js deployment — no extra configuration needed beyond the environment variables and a `postinstall` step (already wired to run `prisma generate`).
6. Log into `/admin/login` with your `ADMIN_EMAIL`/`ADMIN_PASSWORD` and start managing products, categories, brands, offers, and orders.

## Project Structure

```
src/
├── app/
│   ├── (store)/        # public storefront (route group, has its own layout)
│   ├── admin/           # admin dashboard, protected by src/proxy.ts + requireAdmin()
│   ├── api/               # auth callback + Cloudinary upload route
│   ├── sitemap.ts, robots.ts
│   └── layout.tsx        # true root layout (fonts, metadata, toaster)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/           # header, footer, breadcrumbs, nav
│   ├── product/          # product card/grid/gallery/filters
│   ├── store/             # homepage sections
│   ├── cart/, checkout/, admin/
├── lib/
│   ├── data/               # read-side Prisma queries, organized by domain
│   ├── actions/           # "use server" mutations (admin CRUD, checkout)
│   ├── validations/     # Zod schemas
│   ├── pricing.ts        # the single source of truth for effective price
│   ├── whatsapp.ts      # WhatsApp message + link generation
│   ├── auth.ts, db.ts, cloudinary.ts
├── store/cart-store.ts # Zustand cart (persisted)
└── tests/                     # npm run test
```

## Notes for whoever picks this up next

- **Pricing is never trusted from the client.** The checkout Server Action (`src/lib/actions/orders.ts`) re-fetches every product, re-validates stock, and recomputes price/discount/total server-side from live offers — the client only ever sends `{ productId, quantity }`.
- **Soft delete by default.** Categories, brands, and products archive instead of hard-deleting when they're still referenced by other data (subcategories, products, or order history), so historical orders never break.
- **Order cancellation restores stock exactly once**, the moment an order's status transitions into `CANCELLED` (see `src/lib/actions/orders-admin.ts`).
- **Caching:** the category tree and brand lists are cached (`unstable_cache`, tagged) since they load on every storefront page; admin mutations call `updateTag()` to bust them immediately.
