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
| Frontend | React 18 + Vite + TypeScript (`century-joy/client/`) |
| Backend | Node 22 + Express 5 + TypeScript (`century-joy/server/`) |
| Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage (private bucket + signed URLs) |
| Email | Resend (sends are logged & skipped if no key) |
| Auth | Custom JWT — bcrypt, access + rotating refresh tokens, invite-only, lockout |

Design system and product rationale: see [`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md).

---

## Repository layout

```
century-joy/
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
2. **SQL Editor →** paste and run [`server/src/db/schema.sql`](century-joy/server/src/db/schema.sql).
3. **Storage →** create a **private** bucket named `century-joy-files`.

### 2. Backend

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

### 3. Frontend

```bash
cd century-joy/client
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
cd ../CenturyJoy-v1/century-joy/client && npm install && npm run dev   # → :5173

# terminal 2
cd ../CenturyJoy-v2/century-joy/client && npm install && npm run dev   # → :5174 (auto-bumps)
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

## Deploying to Vercel

Each branch is deployed as its **own Vercel project** (Vercel is connected to the GitHub repo),
so the two landing options get separate URLs:

| Vercel project (example) | Production branch | Site |
|---|---|---|
| `century-joy` | `main` | Option 1 — dark landing |
| `century-joy-v2` | `landing-v2-experience` | Option 2 — video-intro landing |

Create two projects from the same repo, then in **each** project's settings:

1. **Root Directory:** `century-joy/client` — the SPA lives here, not at the repo root.
2. **Framework / Build / Output:** read from [`century-joy/client/vercel.json`](century-joy/client/vercel.json)
   — Vite, `npm run build`, output `dist`. Its **SPA rewrite** routes every path to `index.html`
   so deep links (`/login`, `/admin`, …) survive a refresh.
3. **Production Branch** (Settings → Git): set Project 1 → `main`, Project 2 →
   `landing-v2-experience`. Vercel defaults this to `main`, so the **V2 project must be changed**.
4. **Environment Variables** (Settings → Environment Variables) — Vite inlines `VITE_*` at
   **build time**, so set these *before* deploying (and redeploy after any change):

   | Key | Needed for | Notes |
   |---|---|---|
   | `VITE_API_URL` | chatbot, login, uploads | Origin of the deployed API, e.g. `https://api.example.com` (no trailing `/api`). If unset, the landing still works but `/api` calls 404. |
   | `VITE_SUPABASE_URL` | uploads | from Supabase |
   | `VITE_SUPABASE_ANON_KEY` | uploads | from Supabase |
   | `VITE_SUPABASE_STORAGE_BUCKET` | uploads | `century-joy-files` |

### A note on the API

Vercel here hosts the **static SPA only** — it does not run the Express server
(`century-joy/server`), which has long-running workers (email queue, orphan cleanup) and
streaming uploads that don't suit static hosting. The **landing pages need no API** and will
deploy and display on their own. To make the **chatbot and login** work in production, host the
API separately (Render / Railway / any Node host), point `VITE_API_URL` at its origin, and allow
CORS from the Vercel domain (the client sends cookies for token refresh, so credentials must be
permitted).

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
