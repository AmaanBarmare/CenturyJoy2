# Century Joy

Invite-only service portal for **Century Ply**: AEC partners (architects, interior designers,
design influencers) submit project drawings, the studio team produces photorealistic 3D renders,
and clients track progress and request up to two revisions, all in one portal. Plus a public
landing page that presents the service.

Built as a **real, working full-stack product** on managed, non-AWS services.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript (`client/`) |
| Backend | Node 22 + Express + TypeScript (`server/`) |
| Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage (private bucket + signed URLs) |
| Email | Resend |
| Auth | Custom JWT (bcrypt, access + rotating refresh tokens, lockout) |

Design system and rationale: see [`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md).

## Layout

```
century-joy/
├── client/     React SPA — landing, login, client/studio/admin portals
└── server/     Express API — auth, projects, uploads, studio, admin, email worker
    └── src/db/schema.sql   run this in Supabase once
```

## Prerequisites

- Node 22+
- A **Supabase** project (free tier is fine)
- A **Resend** account + API key (emails work without it too — sends are logged and skipped)

## 1. Supabase setup

1. Create a Supabase project. From **Project Settings → API**, copy the **Project URL**, the
   **anon** key, and the **service_role** key.
2. **SQL Editor →** paste and run [`server/src/db/schema.sql`](server/src/db/schema.sql).
3. **Storage →** create a **private** bucket named `century-joy-files`.

## 2. Backend

```bash
cd century-joy/server
cp .env.example .env          # fill in the values below
npm install
npm run seed                  # creates demo accounts (prints credentials)
npm run dev                   # http://localhost:8080
```

`.env` keys: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`SUPABASE_STORAGE_BUCKET=century-joy-files`, `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET`
(generate with `openssl rand -hex 48`), `RESEND_API_KEY`, `EMAIL_FROM`,
`APP_BASE_URL=http://localhost:5173`, `ADMIN_ALERT_EMAIL`.

## 3. Frontend

```bash
cd century-joy/client
cp .env.example .env          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_STORAGE_BUCKET
npm install
npm run dev                   # http://localhost:5173
```

Leave `VITE_API_URL` blank in dev — the Vite proxy forwards `/api` to `localhost:8080`.

## Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@centuryjoy.in | Admin@12345 |
| Studio | studio@centuryjoy.in | Studio@12345 |
| Client | client@centuryjoy.in | Client@12345 |

A second admin (`admin2@centuryjoy.in`) is provisioned too, per the DR requirement.

## End-to-end walkthrough

1. **Client** signs in, submits a project (uploads plans), gets a `CJ-2026-XXXX` reference.
2. **Studio** signs in, accepts it, begins work, uploads rendered views.
3. **Client** sees the tracker advance, downloads deliverables, requests a revision (max 2).
4. **Studio** delivers the revision, marks complete, closes the project.
5. **Admin** oversees all projects, overrides status, manages users, reads/exports the audit log.

Real emails fire at each milestone via Resend; without a key they're logged and skipped.

## Notes / deviations from the original PRD

The PRD specified AWS (S3, Elastic Beanstalk, CloudFront, WAF). Per project direction this build
uses **Supabase Storage** instead of S3 and runs the API anywhere Node runs (deploy later to
Render/Railway; SPA to Vercel/Netlify). Everything else follows the PRD: the schema, the state
machine, server-side role enforcement, magic-byte file validation, the audit log, the async email
queue worker, and the orphan-cleanup worker. JWTs use HS256 (symmetric) rather than RS256.
