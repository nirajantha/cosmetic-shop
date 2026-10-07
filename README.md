# Aurelle — Cosmetic E-Commerce Platform

A full-stack cosmetic e-commerce storefront and admin dashboard built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Prisma 7 + MySQL, Auth.js, Zustand, and Cloudinary. Guest checkout hands orders off to WhatsApp for confirmation — no customer account required.

> "Aurelle" is a placeholder brand name (see `src/lib/constants.ts`) — swap it, the logo text, and the color tokens in `src/app/globals.css` for your own brand before launch.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Server Components/Actions)
- **Database:** MySQL via Prisma 7 (driver adapter: `@prisma/adapter-mariadb`)
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
   - **Local MySQL:** install MySQL/MariaDB directly, or run one via Docker:
     ```bash
     docker run -d --name cosmetic-store-db -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=cosmetic_store -p 3306:3306 mysql:8
     ```
     then set `DATABASE_URL="mariadb://root:password@localhost:3306/cosmetic_store"`.
   - **cPanel's own MySQL:** create a database and user under "MySQL Databases" in cPanel, then use its connection details (see [Deploying to cPanel](#deploying-to-cpanel)).
   - **Hosted MySQL (PlanetScale, Railway, etc.):** paste the connection string it gives you into `DATABASE_URL`.

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
| `DATABASE_URL` | MySQL connection string, e.g. `mariadb://user:password@host:3306/dbname`. Use the `mariadb://` scheme, not `mysql://` — the driver adapter's URL parser only reliably accepts `mariadb://`. |
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
npm run start           # run the production build (Next.js's own server)
npm run start:cpanel  # run the production build via server.js (for cPanel/Passenger)
npm run lint             # ESLint
npm run typecheck      # tsc --noEmit
npm run test              # run the test suite
npm run db:migrate    # create/apply a migration (dev)
npm run db:deploy      # apply migrations (production)
npm run db:seed         # seed the database
npm run db:studio      # Prisma Studio (browse/edit data visually)
```

## Deploying

1. Provision a production MySQL database (your host's own MySQL, PlanetScale, Railway, RDS, etc.) and set `DATABASE_URL`.
2. Set every variable in [Environment Variables](#environment-variables) on your hosting platform — most importantly `AUTH_SECRET` (production will refuse to start without it) and `NEXT_PUBLIC_APP_URL` (set it to your real domain, e.g. `https://yourstore.com`).
3. Run `npm run db:deploy` against the production database (applies migrations without prompting) before or during your first deploy. The very first time, this also *creates* the initial migration from `prisma/schema.prisma` since none is committed yet — run `npm run db:migrate` once against a real database (locally or on the host) to generate it, commit the resulting `prisma/migrations/` folder, then use `db:deploy` for every deploy after that.
4. Run `npm run db:seed` once to create categories/brands/products (edit `prisma/seed.ts` first if you don't want the sample catalog) and the admin user.
5. Deploy. On [Vercel](https://vercel.com/new), this is a standard Next.js deployment — no extra configuration needed beyond the environment variables and a `postinstall` step (already wired to run `prisma generate`). For cPanel, see below.
6. Log into `/admin/login` with your `ADMIN_EMAIL`/`ADMIN_PASSWORD` and start managing products, categories, brands, offers, and orders.

### Deploying to cPanel

This requires a cPanel plan with **"Setup Node.js App"** (Passenger) enabled — a plain shared/PHP-only plan won't run this app. MySQL is available on virtually every cPanel plan by default.

1. **Create the database.** In cPanel → *MySQL Databases*: create a database and a user, add the user to the database with **All Privileges**. cPanel prefixes both with your account username (e.g. `cpaneluser_store` / `cpaneluser_admin`). Build the connection string:
   ```
   DATABASE_URL="mariadb://cpaneluser_admin:yourpassword@localhost:3306/cpaneluser_store"
   ```
2. **Upload the project** outside `public_html` (e.g. `~/cosmetic-store`) — via Git Version Control in cPanel, or upload a zip and extract it.
3. **Setup Node.js App** in cPanel:
   - Node.js version: **20.19 or newer**
   - Application mode: **Production**
   - Application root: the folder from step 2
   - Application URL: your domain (or subdomain)
   - Application startup file: **`server.js`** (this repo's Passenger-compatible entry point — Passenger can only `require()` a JS file directly, so `next start` can't be used as the startup file)
4. Add every variable from [Environment Variables](#environment-variables) — including the `DATABASE_URL` from step 1 — in the app's **Environment Variables** section.
5. Click **Run NPM Install** (installs dependencies and runs `postinstall`/`prisma generate`).
6. Open the app's **Terminal** (or SSH in) with the Node app's environment activated, and run the production build and migrations once:
   ```bash
   npm run build
   npm run db:migrate   # first time only, if prisma/migrations/ isn't committed yet
   npm run db:deploy    # every deploy after that
   npm run db:seed      # first time only
   ```
7. **Start/Restart App** from the Node.js App page.
8. Log into `/admin/login` with your `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

Redeploying later: pull/upload the new code, run `npm install` (or "Run NPM Install"), `npm run build`, `npm run db:deploy` if the schema changed, then **Restart App**.

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
