# Century Joy

Invite-only **3D visualisation service portal** for **Century Ply**. Architects, interior
designers and design influencers submit project drawings; the studio team produces
photorealistic 3D renders; clients track progress and request up to two revisions — all in one
portal. A public marketing **landing page** presents the service to prospective partners.

Built as a **real, working full-stack product** (real login, real file uploads, real emails, the
full project lifecycle across all three roles) on managed, non-AWS services.

---

## What we're building (in detail)

Century Joy has two parts that ship from the same codebase:

### 1. The public landing page
A marketing site that explains the service — hero, about, services, sample gallery, process,
testimonials/blog, FAQs and a contact block — plus a support **chat widget**. It funnels
visitors to **Request access** (email) and **Log in**. There are **two designs** of this page
(see [Two landing experiences](#two-landing-experiences-the-two-branches) below).

### 2. The service portal (three roles, one app)
Behind login, the same SPA serves three role-scoped experiences:

- **Client** — submit a project (upload plans/drawings/reference images), receive a
  `CJ-2026-XXXX` reference, watch the status tracker advance, download finished renders, and
  request up to **2 revisions**.
- **Studio** — accept incoming projects, move them through the work states, upload rendered
  views/deliverables, fulfil revisions, and mark projects complete.
- **Admin** — oversee every project, override status, manage users (invite-only provisioning),
  and read/export the **audit log**.

The whole lifecycle is real: a state machine with **server-side role enforcement**, private file
storage with **signed URLs**, **magic-byte** upload validation, an **async email queue worker**
(milestone emails via Resend), and an **orphan-file cleanup worker**.

Authentication is **custom JWT** per the original PRD — bcrypt password hashing, short-lived
access tokens + rotating refresh tokens, invite-only accounts, a forced password reset on first
login, and a 5-strike lockout.

---

## Two landing experiences (the two branches)

The **portal, backend, auth, and all `/app`, `/client`, `/studio`, `/admin` routes are
identical** on both branches. The **only difference is the public landing page at `/`** — we are
trialling two designs, each kept on its own branch so they can be demoed side by side.

| | **Option 1** | **Option 2** |
|---|---|---|
| **Branch** | `main` | `landing-v2-experience` |
| **Style** | Dark, cinematic | Light, editorial (white / red / black) |
| **Hook** | Dark hero, dot-index side nav | Fullscreen **video intro gate** → fades into the site on *Enter* |
| **Font** | Helvetica Neue (brand default) | **Arial** (deliberate, this variant only) |
| **Landing component** | `pages/Landing.tsx` + `styles/landing.css` | `pages/LandingV2.tsx` + `styles/landing-v2.css` |
| **Route `/`** | `Landing` (dark) | `LandingV2` (video intro) |
| **Route `/v1`** | — | `Landing` (the dark landing, still reachable) |
| **Extra sections** | — | Why Choose Us, Testimonials, Blogs, expanded FAQs (6) |

**Option 1 — `main`** is the original dark cinematic landing. It uses the brand Helvetica Neue
stack and the brand red `#B81F25` on a dark background.

**Option 2 — `landing-v2-experience`** opens on a cinematic **fullscreen video gate** (logo
top-left, *Request access* + *Log in* top-right, *Enter the Experience* bottom-centre) that fades
into a bright, white editorial site on Enter. Deep links and in-session returns skip the gate.
It intentionally uses **Arial** and a white palette to match centuryply.com, with a strict single
type scale and one spacing rhythm across sections. The original dark landing stays available at
`/v1`.

> Both branches share the same GitHub remote. `main` is the default branch shown on GitHub.

---

## Architecture & stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript (`client/`) |
| Backend | Node 22 + Express 5 + TypeScript (`server/`) |
| Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage (private bucket + signed URLs) |
| Email | Resend (sends are logged & skipped if no key) |
| Auth | Custom JWT — bcrypt, access + rotating refresh tokens, invite-only, lockout |

Design system and product rationale: see [`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md).

---

## Repository layout

```
.
├── client/                         React SPA — landings, login, client/studio/admin portals
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.tsx          Option 1 landing (dark)
│   │   │   ├── LandingV2.tsx        Option 2 landing (video intro)  [v2 branch]
│   │   │   ├── Login.tsx, SetPassword.tsx, Forgot/ResetPassword.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── client/  (Dashboard, NewProject)
│   │   │   ├── studio/  (Dashboard)
│   │   │   └── admin/   (Projects, Users, AuditLog)
│   │   ├── components/  (ChatWidget, Logo, Socials, …)
│   │   └── styles/      (landing.css, landing-v2.css, base.css, tokens.css, …)
│   └── vite.config.ts               dev server :5173, proxies /api → :8080
└── server/                          Express API — auth, projects, uploads, studio, admin, workers
    └── src/db/schema.sql            run this in Supabase once
```

---

## Prerequisites

- **Node 22+**
- A **Supabase** project (free tier is fine)
- A **Resend** account + API key (optional — without it, emails are logged and skipped)

---

## Setup

### 1. Supabase

1. Create a Supabase project. From **Project Settings → API**, copy the **Project URL**, the
   **anon** key, and the **service_role** key.
2. **SQL Editor →** paste and run [`server/src/db/schema.sql`](server/src/db/schema.sql).
3. **Storage →** create a **private** bucket named `century-joy-files`.

### 2. Backend

```bash
cd server
cp .env.example .env          # fill in the values below
npm install
npm run seed                  # creates demo accounts (prints credentials)
npm run dev                   # http://localhost:8080
```

`.env` keys: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`SUPABASE_STORAGE_BUCKET=century-joy-files`, `JWT_ACCESS_SECRET` + `JWT_REFRESH_SECRET`
(generate with `openssl rand -hex 48`), `RESEND_API_KEY`, `EMAIL_FROM`,
`APP_BASE_URL=http://localhost:5173`, `ADMIN_ALERT_EMAIL`.

### 3. Frontend

```bash
cd client
cp .env.example .env          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SUPABASE_STORAGE_BUCKET
npm install
npm run dev                   # http://localhost:5173
```

Leave `VITE_API_URL` blank in dev — the Vite proxy forwards `/api` to `localhost:8080`.

---

## Running the app

### Run everything from the repo root (API + web together)

```bash
npm install                   # postinstall also installs client + server deps
npm run dev                   # concurrently: API on :8080, web on :5173
```

Other root scripts: `npm run build` (build both), `npm run seed` (seed demo accounts),
`npm run setup:storage` (create the storage bucket).

### Choosing which landing you see (switch branches)

The landing at `/` is whatever the **current branch** defines:

```bash
git checkout main                    # Option 1 — dark cinematic landing
# or
git checkout landing-v2-experience   # Option 2 — white video-intro experience
npm install                          # branches can differ in deps/files
npm run dev:client                   # http://localhost:5173
```

### Running BOTH options at the same time (git worktrees)

To compare the two designs live, check each branch out into its own folder with **git
worktrees** (one clone, two working directories):

```bash
# from your existing clone:
git worktree add ../CenturyJoy-v1 main
git worktree add ../CenturyJoy-v2 landing-v2-experience

# terminal 1
cd ../CenturyJoy-v1/client && npm install && npm run dev   # → :5173

# terminal 2
cd ../CenturyJoy-v2/client && npm install && npm run dev   # → :5174 (auto-bumps)
```

Vite uses **5173** by default and **auto-increments** (5174, 5175, …) for each extra instance,
so the second/third dev server picks the next free port automatically. Pin a port with
`npm run dev:client -- --port 5174` if you prefer fixed addresses. Each web instance still
proxies `/api` to the single backend on **:8080**.

### Ports at a glance

| Service | URL |
|---|---|
| API (Express) | http://localhost:8080 |
| Web (Vite, 1st instance) | http://localhost:5173 |
| Web (2nd / 3rd instance) | http://localhost:5174, http://localhost:5175 |

---

## Deploying to Vercel (one full-stack project per branch)

The landing (Vite) **and** the API (Express) ship together in **one Vercel project per branch**,
using Vercel **Services** (`experimentalServices`). Frontend and API share **one domain**, so
there are **no CORS or cross-site cookie issues** — the SPA calls `/api/*` on its own origin.

The repo-root [`vercel.json`](vercel.json) declares the two services:

```json
{
  "experimentalServices": {
    "frontend": { "entrypoint": "client", "routePrefix": "/", "framework": "vite" },
    "backend": { "entrypoint": "server/src/serverless.ts", "routePrefix": "/api", "framework": "express", "maxDuration": 60 }
  }
}
```

The backend `entrypoint` is **[`server/src/serverless.ts`](server/src/serverless.ts)** — a thin
adapter that `export default`s an Express **app instance** — *not* the `server/` folder and *not*
`src/app.ts` (which only exports a `createApp()` factory). See pitfalls #3–#4 below for why.

**Routing — important, and counter-intuitive:** the Vite frontend is the catch-all at `/`;
`/api/*` (the longer, more specific prefix) routes to the Express service. **Vercel Services
strips the `routePrefix` before invoking the backend** — so `GET /api/chat` reaches Express as
`GET /chat`, *not* `/api/chat`. Because our app mounts every route under `/api/*`, the adapter
**re-adds the `/api` prefix** on the way in (see pitfall #5). Locally the Vite proxy preserves
`/api`, so `npm run dev` is unaffected.

Create **two projects**, both importing this same repo:

| Vercel project (example) | Production Branch | One domain serves |
|---|---|---|
| `century-joy` | `main` | V1 landing **+** API |
| `century-joy-v2` | `landing-v2-experience` | V2 landing **+** API |

In each project's settings:

1. **Root Directory:** the **repo root** (`./`) — the service `entrypoint`s are relative to it.
   (Do *not* set it to `client`.)
2. **Framework Preset:** **Services** — required whenever `experimentalServices` is present.
3. **Production Branch** (Settings → Git): `main` for one, `landing-v2-experience` for the other.
   Vercel defaults to `main`, so the V2 project must be changed.
4. **Environment Variables** (shared by both services in the project):
   - Client (Vite, build-time): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
     `VITE_SUPABASE_STORAGE_BUCKET`. Leave `VITE_API_URL` **blank** (same-origin `/api`).
   - Server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
     `SUPABASE_STORAGE_BUCKET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`,
     `RESEND_API_KEY` (optional), `EMAIL_FROM`, `APP_BASE_URL`.

**Local dev:** `vercel dev -L` runs both services together with the same routing; or keep the
normal `npm run dev` (Vite proxies `/api` → the local API on :8080).

To stop a push to one branch from triggering *preview* builds in the other project, set each
project's **Ignored Build Step** (Settings → Git), e.g. for `main`:
`bash -c 'if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 1; else exit 0; fi'`
(exit 1 = build, exit 0 = skip; use `landing-v2-experience` for the V2 project).

#### "Configuration Settings in the current Production deployment differ from your current Project Settings"

This banner is **informational, not an error**: the *live* production deployment was
built with different Build/Framework settings than the project's *current* settings, so
Vercel flags the drift until production is rebuilt. For a Services project it almost
always means the **Framework Preset is still auto-detected as `Vite`** instead of
`Services`. The repo-root [`vercel.json`](vercel.json) is already the correct Services
config ([docs](https://vercel.com/docs/services)) — the fix is in the dashboard:

1. **Settings → Build and Deployment → Framework Settings →** set **Framework Preset =
   `Services`** (required whenever `experimentalServices` is present).
2. **Clear any manual overrides** for Build Command, Output Directory, and Install
   Command — leave them to per-service framework detection (toggle "Override" off).
3. Confirm **Root Directory = `./`** (repo root).
4. **Save**, then **Deployments → ⋯ → Redeploy** the current Production deployment so the
   live build matches the saved settings. The banner clears once production is rebuilt.

Do this in **both** projects (`century-joy` and `century-joy-v2`). The per-service
`framework` keys in `vercel.json` (`vite`, `express`) pin each service so it isn't
re-detected on every build.

### Services deployment — every error we hit, and the permanent fix

Getting this repo live on Vercel Services surfaced **six distinct failures**, in this order. Each
is now fixed in code/config so it should not recur. If a deploy breaks, match the symptom here.
The fixes are already committed — this section explains *why*, so nobody "simplifies" them back
into breakage.

**1 — `vercel.json` ignored / Framework auto-detected as `Vite`.**
- *Symptom:* the "Configuration Settings… differ" banner; Services config never applied.
- *Cause:* Vercel reads `vercel.json` **only from the project Root Directory**, and a Services
  project must have **Framework Preset = Services**.
- *Fix:* everything lives at the **repo root** (`client/`, `server/`, `vercel.json`), Root
  Directory = `./`, Framework Preset = `Services`. (This is why the repo is flat — there is no
  `century-joy/` wrapper folder.) See the dashboard checklist above.

**2 — Server build fails: `TS2339: Property 'user' does not exist on type 'Request'` (×~27).**
- *Symptom:* the Vite build passes, then the server step fails type-checking on every `req.user`.
- *Cause:* `req.user` is added by a global type augmentation that lived in an **ambient**
  `src/types/express.d.ts` which **nothing imported**. Vercel's `@vercel/backends` runs its own
  type-check **rooted at the entrypoint, following imports only**, so the ambient file was never
  in its program. (Our own `tsc -p tsconfig.json` passes because its `include` globs pick it up —
  which is why this only fails on Vercel.)
- *Fix:* make the augmentation a real, **imported** module —
  [`server/src/types/express.ts`](server/src/types/express.ts) (renamed from `.d.ts`) — and
  `import './types/express'` at the top of [`server/src/app.ts`](server/src/app.ts). Do **not**
  turn it back into an un-imported `.d.ts`.

**3 — Runtime `FUNCTION_INVOCATION_FAILED` ("This Serverless Function has crashed").**
- *Symptom:* build is green, but every request 500s with `FUNCTION_INVOCATION_FAILED`.
- *Cause:* Vercel auto-picked `src/app.ts` as the entrypoint, which exports a `createApp()`
  **factory**, not an app instance — there was no handler to invoke.
- *Fix:* pin the backend `entrypoint` in `vercel.json` to a file that `export default`s an app
  instance (see #4 for which file).

**4 — Server build fails: `TS6059: File '…' is not under rootDir '…/src'`.**
- *Symptom:* after pinning the entrypoint to `server/api/index.ts`, the type-check fails TS6059.
- *Cause:* `@vercel/backends` type-checks the entrypoint with the project `tsconfig.json`
  (`rootDir: "src"`); the entry sat **outside** `src/`.
- *Fix:* keep the serverless adapter **inside** `src/` —
  [`server/src/serverless.ts`](server/src/serverless.ts) — and point `entrypoint` there.

**5 — Every `/api/*` route returns `404 {"error":{"code":"not_found"}}`.**
- *Symptom:* the function boots (you get the app's **own** JSON 404), but `/api/health`,
  `/api/auth/refresh`, `/api/chat`… all 404.
- *Cause:* **Vercel Services strips the `routePrefix` (`/api`) before invoking the backend**, so
  Express receives `/health`, `/auth/refresh`, … — none of which match our `/api/*` mounts.
  (Locally the Vite proxy **preserves** `/api`, which is why dev always worked.) Proof: if it
  weren't stripped, `/api/health` would have matched and returned `{status:ok}` instead of 404.
- *Fix:* the adapter in [`server/src/serverless.ts`](server/src/serverless.ts) re-adds `/api` to
  `req.url` (guarded, so it's a no-op if a prefix is ever present). App routes and local dev are
  untouched.

**6 — Localhost values in prod / `Missing required environment variable` crash at boot.**
- *Symptom:* emails link to `localhost`; or `FUNCTION_INVOCATION_FAILED` with
  `Missing required environment variable: …` in the **Logs** tab.
- *Cause:* `config/env.ts` validates **required** vars at import, so a missing/empty one crashes
  the function at boot; and dev defaults (`localhost`) are wrong in production.
- *Fix:* in each Vercel project set production values — `APP_BASE_URL` and `CLIENT_ORIGIN` to the
  deployed `https://…` origin (**no trailing slash**), `VITE_API_URL` **blank** (same-origin), and
  all required `SUPABASE_*` / `JWT_*`. **Env-var changes apply only to deployments built *after*
  the change — always redeploy.** `VITE_*` are compiled into the bundle at build time.

> **Smoke-test after any deploy:** `GET /api/health` → `{"status":"ok",…}` and `GET /api/health/db`
> → `{"status":"ok","db":true}` (confirms Supabase). If `/api/health` 404s → it's #5; if it
> `FUNCTION_INVOCATION_FAILED`s → #3/#6 (check **Logs**); if the build fails type-check → #2/#4.

### Background jobs (email queue + cleanup) via Supabase cron

The serverless API can't run the in-process interval workers, so they're exposed as protected
endpoints (`POST /api/internal/email-queue`, `POST /api/internal/orphan-cleanup`, guarded by
`CRON_SECRET`) and driven by **Supabase `pg_cron` + `pg_net`** — free, any frequency, no Vercel
Pro cron needed. (Locally, the interval workers still run as before.)

Setup, once the API is deployed:

1. Add **`CRON_SECRET`** (any long random string, e.g. `openssl rand -hex 32`) to the Vercel
   project's env vars.
2. In the Supabase **SQL Editor**, run [`server/src/db/cron.sql`](server/src/db/cron.sql)
   — edit the two `vault.create_secret(...)` values first: your deployment URL and the **same**
   `CRON_SECRET`. It enables `pg_cron`/`pg_net` and schedules the email queue (every minute) and
   orphan cleanup (daily).
3. Verify: `select * from cron.job_run_details order by start_time desc limit 10;`

> **Vercel Hobby is non-commercial** — fine for a demo; move to Pro for production use.

> Services is an experimental, access-gated Vercel feature. The backend `entrypoint` is already
> pinned to `server/src/serverless.ts` (an app instance inside `src/`), so there's nothing to
> auto-detect — see "every error we hit" above, pitfalls #3–#4, before changing it.

---

## Routes

Public:

| Path | Page |
|---|---|
| `/` | Landing (Option 1 on `main`, Option 2 on `landing-v2-experience`) |
| `/v1` | Dark landing (`landing-v2-experience` only) |
| `/login`, `/set-password`, `/forgot-password`, `/reset-password` | Auth flows |

Authenticated (role-guarded):

| Path | Role |
|---|---|
| `/client`, `/client/new`, `/client/projects/:id` | Client (or Admin) |
| `/studio`, `/studio/projects/:id` | Studio (or Admin) |
| `/admin`, `/admin/users`, `/admin/audit` | Admin |
| `/app`, `/app/projects/:id` | Redirects to the signed-in user's home |

---

## Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@centuryjoy.in | Admin@12345 |
| Studio | studio@centuryjoy.in | Studio@12345 |
| Client | client@centuryjoy.in | Client@12345 |

A second admin (`admin2@centuryjoy.in`) is provisioned too, per the DR requirement.

---

## End-to-end walkthrough

1. **Client** signs in, submits a project (uploads plans), gets a `CJ-2026-XXXX` reference.
2. **Studio** signs in, accepts it, begins work, uploads rendered views.
3. **Client** sees the tracker advance, downloads deliverables, requests a revision (max 2).
4. **Studio** delivers the revision, marks complete, closes the project.
5. **Admin** oversees all projects, overrides status, manages users, reads/exports the audit log.

Real emails fire at each milestone via Resend; without a key they're logged and skipped.

---

## Design & brand

- **Primary red:** `#B81F25` · **Dark red:** `~#7A1411` · plus black / grey.
- **Type:** Helvetica Neue stack across the portal and Option 1 landing; **Arial** is used
  deliberately on the Option 2 landing only.
- Full brand spec and design rationale live in [`DESIGN.md`](DESIGN.md) and [`PRODUCT.md`](PRODUCT.md).

---

## Notes / deviations from the original PRD

The PRD specified AWS (S3, Elastic Beanstalk, CloudFront, WAF). Per project direction this build
uses **Supabase Storage** instead of S3 and runs the API anywhere Node runs (deploy later to
Render/Railway; SPA to Vercel/Netlify). Everything else follows the PRD: the schema, the state
machine, server-side role enforcement, magic-byte file validation, the audit log, the async email
queue worker, and the orphan-cleanup worker. JWTs use HS256 (symmetric) rather than RS256.
