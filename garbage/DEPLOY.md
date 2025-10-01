# Deploying Taskara to Vercel

This repo is set up to run on Vercel using a remote LibSQL (Turso) database in production and local SQLite for development.

## 1) Prerequisites

- Vercel account connected to your GitHub repo.
- Turso (LibSQL) database for production.

## 2) Environment Variables

Create these in Vercel Project Settings → Environment Variables.

Required:
- AUTH_SECRET = a long random string
- LIBSQL_URL = your Turso database URL (e.g., libsql://<db-name>-<org>.turso.io)
- LIBSQL_AUTH_TOKEN = your Turso auth token

Optional (local dev only):
- SQLITE_PATH = ./sqlite/data.db

Also copy `.env.example` to `.env.local` for local development.

## 3) Database Migrations

You need to initialize the Turso database schema once before the app can read/write data.

Options:
- Use Turso Studio/CLI and run the SQL in
  - drizzle/0000_curved_cerebro.sql
  - scripts/001_create_projects_tasks_schema.sql
  - scripts/002_create_triggers_and_functions.sql
  - scripts/003_seed_sample_data.sql (optional demo data)
  - scripts/004_add_password_column.ts (ignore; handled in SQL scripts)

The `drizzle/` SQL is the generated snapshot; the `scripts/00x_*.sql` files are human-readable. Running either the `drizzle/0000_*.sql` OR the scripts is sufficient—do not apply both duplicates.

## 4) Vercel Project Setup

- Import the repo into Vercel.
- Framework Preset: Next.js (auto-detected)
- Install Command: default (npm ci)
- Build Command: default (next build)
- Output: handled by Vercel automatically

No custom vercel.json is required.

## 5) Notes on the DB Client

- In production (Vercel), the app uses LibSQL via `@libsql/client` if `LIBSQL_URL` is set.
- In local development (no `LIBSQL_URL`), it falls back to `better-sqlite3` using `SQLITE_PATH` or `./sqlite/data.db`.

## 6) Post-Deploy Checks

- Visit `/login` and sign in with a seeded user or create a new one (if your flows allow).
- Verify data pages:
  - `/` (User Dashboard)
  - `/inbox` (Notifications)
  - `/admin/pending` (Admin approvals) — requires an admin user
  - `/my-created`
- Create/approve tasks and add comments to verify notifications and counts.

If you need help generating a Turso DB and running the migration SQL, ping me and I’ll provide exact commands.
