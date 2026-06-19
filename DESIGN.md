# Design

A synthesis of four mockups into one system. **Backbone:** Option 6's full-screen scroll
experience (the favorite). **Geometry:** Option 10's rounded blocks + pills. **Services layout:**
Option 7's sticky-image split (serif dropped). **App navigation + editorial numbering:**
Option 1's rail and numbered sections. Brand red `#C8102E` and the Century Joy star logo are
constant across everything.

## Visual Theme

Two coordinated worlds, one brand.

- **Landing (brand register) — cinematic & dark.** Scene: *an architect in a bright studio,
  deciding whether to trust a new visualisation service; the renders must glow and feel
  expensive.* Photoreal renders read most powerfully on a warm near-black. Long, deliberate,
  scroll-snapped panels that alternate dark and light for rhythm.
- **Portal (product register) — calm & light.** Scene: *a studio producer at a desk for hours,
  scanning project queues and file names in a bright office; needs clarity and low eye strain.*
  Warm paper-white surfaces, a quiet left rail, dense-but-legible tables, rounded cards.

Continuity between them is carried by the red, the logo, the type, and the rounded geometry,
not by forcing one treatment onto both.

## Color

OKLCH, neutrals tinted warm toward the brand hue. Never pure `#000`/`#fff`.

### Brand
| Token | OKLCH | ~hex | Use |
|---|---|---|---|
| `--red` | `oklch(0.54 0.20 22)` | `#C8102E` | Primary actions, brand accent, active nav |
| `--red-deep` | `oklch(0.47 0.19 22)` | `#A60D26` | Hover / pressed |
| `--red-tint` | `oklch(0.95 0.03 22)` | — | Subtle red wash behind brand moments (light) |

Strategy: landing = **Committed** (red is load-bearing on CTAs, the contact panel can go
red-drenched). Portal = **Restrained** (red ≤10%: primary buttons, current selection, focus).

### Dark surfaces (landing)
| Token | OKLCH | Use |
|---|---|---|
| `--d-bg` | `oklch(0.17 0.008 60)` | Warm near-black page |
| `--d-panel` | `oklch(0.21 0.010 60)` | Raised panel |
| `--d-text` | `oklch(0.95 0.008 80)` | Bone text |
| `--d-text-dim` | `oklch(0.95 0.008 80 / 0.62)` | Secondary |
| `--d-line` | `oklch(0.95 0.008 80 / 0.14)` | Hairlines |

### Light surfaces (portal + light landing panels)
| Token | OKLCH | Use |
|---|---|---|
| `--bg` | `oklch(0.98 0.006 85)` | Warm paper page |
| `--surface` | `oklch(1 0 0 / 0)` → `oklch(0.995 0.004 85)` | Cards |
| `--surface-2` | `oklch(0.96 0.006 85)` | Sidebar / inset / table header |
| `--text` | `oklch(0.23 0.012 50)` | Ink |
| `--text-dim` | `oklch(0.55 0.012 55)` | Muted |
| `--line` | `oklch(0.90 0.008 75)` | Borders |

### Status palette (kept distinct from brand red to avoid confusion)
Each badge = tinted background + readable text + a small dot/icon + a label. Never color alone.
| Group | Statuses | Hue |
|---|---|---|
| Awaiting | `pending`, `revision_*_requested` | amber `oklch(0.80 0.13 75)` |
| Active | `accepted`, `in_progress` | blue `oklch(0.62 0.13 245)` |
| In revision | `revision_*_in_progress` | violet `oklch(0.58 0.15 300)` |
| Ready | `first_draft_submitted`, `revision_*_submitted` | emerald `oklch(0.65 0.14 165)` |
| Completed | `completed` | green `oklch(0.58 0.13 150)` |
| Closed | `closed` | slate `oklch(0.62 0.02 250)` |

Red is reserved for: primary CTAs, destructive confirmations, and validation errors.

## Typography

**Decision:** keep **Poppins** (the family across all four mockups) as the single UI + display
face, for consistency with existing Century Ply properties. Cormorant (Option 7) is dropped —
no serif. Hierarchy comes from weight + size contrast within Poppins (400/500/600/700), with
tight negative tracking on large display sizes to echo the condensed "CENTURY" logotype.

- **Primary — `Poppins`** (400–700). Display, headings, UI, body.
- **Reference codes / metadata** — Poppins with `font-variant-numeric: tabular-nums` and a
  `ui-monospace` fallback for `CJ-2026-0001`, file sizes, and timestamps (keeps the
  technical/drawing-spec feel without adding a second webfont).
- Fallback: `Poppins, "Helvetica Neue", system-ui, sans-serif`.

### Scale
- **Landing (fluid):** display `clamp(2.6rem, 6.4vw, 6rem)` / 0.98 line-height / -0.035em; H2
  `clamp(2rem, 4vw, 3.4rem)`; lead `clamp(1.05rem, 1.3vw, 1.25rem)`. ≥1.25 ratio between steps.
- **Portal (fixed):** h1 1.75rem, h2 1.375rem, h3 1.125rem, body 0.9375rem (15px), small
  0.8125rem, label 0.6875rem uppercase 0.14em tracking. ~1.2 ratio.
- Eyebrow/label: Archivo 600, 0.16–0.24em tracking, uppercase, dim.

## Geometry & Elevation (from Option 10)

- Radii: `--r-sm 10px`, `--r 16px`, `--r-lg 22px`, `--r-xl 32px` (hero frame), pill `999px`.
- Buttons are pills. Cards and image frames use `--r-lg`/`--r-xl`.
- Elevation (light only, soft + warm): `0 1px 0 var(--line)` resting; `0 24px 48px -32px
  oklch(0.23 0.012 50 / 0.45)` on hover-lift. Dark surfaces use hairline borders, not shadows.
- No nested cards. No side-stripe borders (banned).

## Components

- **Buttons** — pill. `primary` (solid red → red-deep hover), `outline`, `ghost`, `bone`
  (light-on-dark). States: default/hover/focus-visible/active/disabled/loading. Arrow glyph
  slides on hover.
- **Status badge** — pill, tint bg + dot + label, per the status palette above.
- **Progress tracker** — horizontal stepper with numbered circles + connecting line (Option 10),
  collapses to vertical on mobile. Maps the 12-state machine into the visible lifecycle:
  Submitted → Accepted → In Progress → Draft → (Revisions) → Completed → Closed. Current step in
  red; done steps filled; future steps outlined.
- **Cards** — rounded surface, hairline border, optional hover-lift. Used only where a card is
  genuinely the right affordance (not as a default wrapper).
- **Data table** — used for project lists; sticky header on `--surface-2`, zebra-free, row hover,
  ref number in mono, status badge column, right-aligned actions. Responsive: collapses to
  stacked rows on narrow screens.
- **File drop / upload slot** — dashed rounded zone; per-file chip showing name + size + remove;
  image thumbnails render inline; progress bar during upload; client-side type/size hints.
- **App shell (portal)** — left rail (Option 1, recolored light): star logo, role-scoped nav
  with small index numerals, user + logout at the bottom; collapses to a top bar < 920px. Top
  content bar shows page title + summary counts.
- **Landing nav** — fixed top bar + right-side **dot index** (Option 6); both auto-switch
  light/dark theme based on the panel in view.
- **Modals** — used sparingly (modal-as-default is banned). Allowed: submission confirmation,
  revision request, admin status-override (reason required), destructive confirms.
- **Toasts** — bottom-right, 200ms, for action feedback (e.g. "Email sent to studio team").
- **Forms** — single-column, label above field, inline validation, live char counters
  (concept note ≤250, revision notes ≤500), submit disabled until valid.

## Layout

- **Landing** — `scroll-snap-type: y proximity` full-height panels (Option 6): Hero (dark) →
  About (light) → Services (sticky-image split, Option 7) → Gallery (dark mosaic/filmstrip,
  Option 1) → Process (6-step) → FAQ → Contact (red-drenched). Each panel art-directed; dot
  index tracks position.
- **Portal** — left rail + fluid content max-width ~1340px; rounded content cards; predictable,
  repeated grid so users navigate by muscle memory.

## Motion

- **Landing (brand):** staggered entrance reveals on scroll, theme crossfade between panels,
  sticky-image crossfade in services, arrow nudges. Easing ease-out-quint/expo, 600–800ms.
  Never animate layout properties; transition `transform`/`opacity`. Full `prefers-reduced-motion`
  fallback to instant.
- **Portal (product):** 150–250ms state transitions only; skeleton loaders (not centered
  spinners); motion conveys state, never decoration; no page-load choreography.

## Imagery

Brand register requires real imagery. Landing uses photoreal interior/architecture renders
(Unsplash placeholders until Century Ply supplies real renders); search the physical object
("warm-lit living room render at dusk"), not the category. In the portal, the deliverables
themselves are the imagery — thumbnails 180×120, full view on click.

## Source map (what we take from each option)

| From | We take | We drop |
|---|---|---|
| **Option 6** (favorite) | Scroll-snap full-screen panels; top bar + right dot index; per-panel light/dark theme switching | — |
| **Option 10** | Rounded radii, pill buttons, soft warm shadows, bento About, circular-step process, card hover-lift | Flat generic Poppins look |
| **Option 7** | Sticky-image services split; generous editorial spacing | Cormorant serif (reflex-reject) |
| **Option 1** | Left-rail app nav (recolored for portal), numbered section index, mosaic gallery | All-dark-everything for the portal |
| **All four** | Brand red `#C8102E`, the content/copy, scroll-reveal pattern, the star logo | Poppins (→ Archivo), "Century Ply 3D Services" name (→ Century Joy) |
