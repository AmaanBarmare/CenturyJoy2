# Century Joy — Design System

> **Single source of truth.** Every reusable value — font, type size, colour, spacing,
> radius, button — is defined **once** so every page reuses the same vocabulary instead of
> re-inventing it. The numbers below are the ones **actually shipped in the CSS**, derived from
> the **landing page** (`/`, `LandingV2`). When you build a new page, you pull from here; you do
> **not** invent a new size.
>
> **The golden rule:** never hard-code a font-size, hex, or px when a token exists. Reach for
> `var(--…)`. A new shade or size → add a token here first, then use it.

---

## 0. Where things live in code

| File | Owns |
|---|---|
| `client/src/styles/tokens.css` | **All design tokens** — fonts, the type scale, colour, radii, spacing, motion (`:root` custom properties). Edit the system here. |
| `client/src/styles/base.css` | Global elements (the brand-wide `h1–h4` treatment, `body`, links), buttons, badges, cards, forms, tables, tracker, dropzone, toast, modal, **auth** screens. |
| `client/src/styles/landing-v2.css` | The **landing page** (`.lv2`) + Gallery (`.gp`) — the marketing register. The reference for this whole document. |
| `client/src/styles/portal.css` | The signed-in **portal** app shell (`.shell`) — the product register. |
| `client/src/styles/theme.css` | Dark-theme swaps for the portal/auth. |
| `client/src/styles/landing.css` | **Legacy** `/v1` landing (`.landing`). Kept for reference, not in the live nav. Not part of this system; do not build new pages against it. |

The page at `/` is `LandingV2`; `/gallery` reuses its register; `/login` + the password screens use the
auth shell; everything behind login uses the portal shell.

---

## 1. One brand, two registers

Every page is the **same type system** (Arial, one heading treatment, the same scale tokens, the
same spacing rhythm, the same red). Only the **size register** changes between the two worlds:

| | **Marketing** (`.lv2`, `.gp`) | **Product** (`.shell`, `.auth`) |
|---|---|---|
| Pages | Landing, Gallery, future About / Services | Login + password screens, dashboards, project detail |
| Mood | Editorial, white, confident | Calm, dense, low-strain |
| Type sizes | **Full scale** — big fluid hero & section headings | **Compact step** of the *same* scale |
| Corners | **10px everywhere** (buttons included) | Pills for buttons, **22px** cards |
| Red usage | Committed — CTAs, marquee, red Contact panel | Restrained — primary buttons, active nav, focus |

Both registers share `tokens.css`. The only thing that differs is which **size step** a heading
uses. That is the entire consistency contract: *same system everywhere, two size registers.*

---

## 2. Typography — the heart of the system

### Family
Brand typeface is **Arial** (the landing's register), used on **every page** so a given tag is
the same font everywhere.

| Token | Stack | Use |
|---|---|---|
| `--ui` | `Arial, "Helvetica Neue", Helvetica, "Liberation Sans", sans-serif` | Body, UI, **and headings** |
| `--display` | `"Arial Black", "Arial Bold", Arial, "Helvetica Neue", sans-serif` | The heavy cut — **only** the hero `h1` and a few large display numbers |
| `--mono` | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` | Reference codes, file sizes, timestamps (`.mono`, tabular figures) |

### ONE heading treatment, brand-wide
There is a **single heading treatment** (set on the global `h1–h4` rule in `base.css`, mirrored
on `.lv2`): `--ui` family, **weight 700**, `text-wrap: balance`, tight tracking. Every heading in
the product reads as the same Arial voice; **only the SIZE changes by register.**

### The type scale — ONE size per role (single source of truth)
Defined once in `tokens.css`, referenced everywhere. **These are the only heading/body sizes on
the site.**

| Role | Tag | Token | Value | Line-height |
|---|---|---|---|---|
| **Hero headline** | `h1` | `--fs-h1` | `clamp(2rem, 4vw, 3.6rem)` (32→57.6px), `--display` | `1.04` |
| **Section heading** | `h2` | `--fs-h2` | `clamp(1.875rem, 4vw, 2.875rem)` (30→46px) | `1.06` |
| **Sub-heading** | `h3` | `--fs-h3` | `1.25rem` (20px) | `1.25` |
| **Lede** (section intro) | `p.lead` | `--fs-lead` | `clamp(1.125rem, 1.6vw, 1.3125rem)` (18→21px) | `1.6` |
| **Body** | `p` | `--fs-body` | `1rem` (16px) | `1.7` |
| **Meta / caption** | — | `--fs-meta` | `0.8125rem` (13px) | — |
| **Eyebrow** | `.eyebrow` | `--fs-eyebrow` | `0.75rem` (12px), weight 700, uppercase, tracking `.18em`, red, with a leading rule | — |

**Compact (product) heading steps** — same ladder, dense UI:

| Role | Selector | Token | Value |
|---|---|---|---|
| Page / auth title `h1` | `.shell h1`, `.topbar h1`, `.auth-card h1` | `--fs-ui-h1` | `1.5rem` (24px) |
| Greeting / modal title `h2` | `.shell h2`, `.greeting h2`, `.modal-head h2` | `--fs-ui-h2` | `1.25rem` (20px) |
| Card / block title | `.card-title` (div) | — | `1rem` (16px) |

So `h1 (24) > h2 (20) > card-title (16)` in the product UI — a correct hierarchy that mirrors the
marketing `h1 > h2 > h3`.

### The orphan rule — every heading is sized by a rule, never the browser
The global `h1–h4` rule sets a **font-size** (from the tokens), so a bare `<h2>` with no section
class still renders at the canonical size instead of the browser's `~1.5em` default. A page or
section may set only **contextual** properties on a heading — `max-width`, `margin`, `color`,
`text-align`, `white-space`. It must **never** set `font-size` / `line-height` / `font-family` to
a different value. That is exactly how pages drift (the home hero `h1` and the Gallery hero `h1`
were once `3.6rem` vs `4rem`; the CTA `h2` was a different size and used Arial Black). They are now
one `h1`, one `h2`, one `h3` — everywhere in the register.

### Sanctioned size exceptions (the only headings that may differ — locked, intentional)
A few compact list/step titles and one display heading are allowed to break the scale. They are
listed here so they read as deliberate, not as drift:

| Role | Selector | Size | Why |
|---|---|---|---|
| Intro-gate title | `.gate__title` | `clamp(1.9rem, 4.4vw, 3.3rem)` | Full-screen cinematic overlay, bespoke layout |
| Service display heading | `.svc2-name` (h3) | `clamp(30px, 4.4vw, 50px)` | Focal heading of the active service panel |
| Process step title | `.pstp h3` | `18px` | Compact 6-column stepper |
| Process step copy | `.pstp p` | `14.5px` | Compact 6-column stepper |
| FAQ question / summary | `details.faq summary` | `17px` | Disclosure control, not a heading tag |
| Gallery caption title | `.gcard .cap .t` | `1.4rem` | Caption over an image |

If you need a heading outside this list, use a scale token — do not add a new size.

### Copy
No em dashes (`—`) as sentence punctuation in visible copy — use a comma, full stop, or rewrite.
(The short red dash before an `.eyebrow` is a CSS leading rule, not punctuation, and stays.)

---

## 3. Colour

Brand red is the only constant across every page and theme. Neutrals are warm in the marketing
register, cool in the portal.

### Brand (`:root`)
| Token | Hex | Use |
|---|---|---|
| `--red` | `#b81f25` | Primary actions, accents, active nav, focus, errors (RGB 184,31,37) |
| `--red-deep` | `#7a1411` | Hover / pressed red; red Contact panel bg |
| `--red-tint` | `#f8ecec` | Subtle red wash (portal active nav, etc.) |
| `--gold` | `#c3952d` | Secondary accent — sparing |

Red is reserved for: primary CTAs, the active selection, focus ring, validation errors. **Status
colours never use red** so "red = action/error" stays unambiguous.

### Marketing neutrals (`.lv2`, `.gp`, `.gate` — warm white/black)
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#15120e` | Near-black ink |
| `--ink-soft` | `#4d473f` | Body copy |
| `--ink-faint` | `#8c8579` | Meta / tertiary |
| `--paper` | `#ffffff` | Page |
| `--paper-2` | `#f6f4f0` | Tinted section / chips |
| `--paper-3` | `#efebe4` | Image mats / placeholders |
| `--line` / `--line-2` | `#e8e3d9` / `#d6cfc1` | Hairline / stronger border |
| `--red-tint` (local) | `#fbeded` | Red wash on white |

### Product neutrals (`.shell` — cool greys) + status palette
The portal overrides the neutrals to a cool set on `.shell` (`--bg #f5f6f8`, `--surface #fff`,
`--surface-2 #eef0f3`, `--text #15181c`, `--text-dim #5b6068`, `--line #e7e9ee`, …). Status badges
use a fixed palette kept **distinct from brand red** — amber / blue / violet / emerald / green /
slate, each a tinted bg + readable fg + a dot. Status is **never colour alone** — always a label.
See `tokens.css` for the exact values; dark-mode swaps live in `theme.css`.

---

## 4. Spacing & rhythm

| Token | Value | Use |
|---|---|---|
| `--pad` | `clamp(18px, 4vw, 44px)` | Page / section horizontal gutter |
| `--gap` | `18px` | Default flex / grid gap |
| `--text-gap` | `16px` | **Gap between any two stacked text elements** |
| `--sec-pad` | `clamp(72px, 8vw, 120px)` | **Section vertical rhythm** |

**The text rhythm rule.** Any group of stacked text (eyebrow → heading → lede → body) is a flex
column with `gap: var(--text-gap)` so the spacing between text is **identical in every section**.
In the landing this is the `.tstack` / `.shead` primitive; reuse it (or its `--text-gap` value) on
new pages instead of ad-hoc margins. Section padding is always `--sec-pad`. Marketing content is
capped at `--maxw: 1240px` inside `--gut: clamp(20px, 5vw, 60px)`; the portal page caps at 1340px.

---

## 5. Geometry — radii

| Token | Value | Use |
|---|---|---|
| `--r-sm` | `10px` | Inputs, small chips |
| `--r` | `16px` | Stats, tiles |
| `--r-lg` | `22px` | **Portal cards**, tables, modal |
| `--r-xl` | `32px` | Large image frames (portal) |
| `--pill` | `999px` | **Portal buttons & badges** |

**Register override:** the **marketing register (`.lv2`) sets every box radius — including
`--pill` — to `10px`**, so cards, images, inputs, chips **and buttons** all share one soft 10px
corner. Round controls (slider grips, arrow buttons, dots) stay circles (`50%`). The **portal**
keeps the global scale: pill buttons/badges, 22px cards.

---

## 6. Components (reuse as-is — don't restyle locally)

- **Button (`.btn`)** — inline-flex, 8px gap, **13.5px / weight 700**, padding `12px 22px`
  (landing) / `11px 22px` (portal). Marketing: `.btn-red` (solid → `--red-deep`), `.btn-ghost`
  (white, `--line-2` border). Portal: `.btn-primary` / `.btn-outline` / `.btn-ghost` /
  `.btn-danger`. Modifiers `.btn-sm`, `.btn-lg`, `.btn-block`. A trailing `.ar` arrow slides
  `translateX(3px)` on hover. Corner = the register's radius (10px landing, pill portal).
- **Eyebrow (`.eyebrow`)** — `--fs-eyebrow`, weight 700, uppercase, tracking `.18em`, red, with a
  leading rule (22×2px landing / 18×1px portal). Content is a single label ("About", "Services"),
  never `Label — Century Joy`.
- **Wordmark (`.wordmark`)** — Arial, "CENTURY" red uppercase + "Joy" lighter currentColor.
- **Status badge (`.badge`)** — pill, tint bg + 7px dot + label, via `.amber/.blue/.violet/`
  `.emerald/.green/.slate`.
- **Card (`.card`)** — `--surface`, hairline border, `--r-lg`, soft shadow. `.card-pad`,
  `.card-head`, `.card-title` (1rem/700). Use only where a card is the right affordance.
- **Forms** — `.field` (18px bottom margin), label above (12.5px/700), `.input/.textarea/.select`
  (14px, `--r-sm`, **focus → red border**). Hint 11.5px faint, `.error` 12px red.
- **Table (`.tbl`)**, **Modal (`.overlay` + `.modal`)**, **Toast (`.toast`)**, **Progress tracker
  (`.tracker`)**, **File drop (`.dropzone` / `.filechip`)** — see `base.css`. Modal-as-default and
  side-stripe borders are banned.

---

## 7. Motion

Animate `transform` / `opacity` only. Tokens: `--t-fast 0.16s`, `--t 0.22s`,
`--ease-out-expo`, `--ease-out-quint`. Landing reveals = `.rv` (opacity + 22px translateY, 0.6s
expo, `.in` when in view), staggered with `.d1/.d2/.d3`. Portal = 150–250ms state transitions
only. Always honour `prefers-reduced-motion` (every CSS file ends with the fallback).

---

## 8. Checklist for a new page

1. **Pick the register.** Marketing → wrap in `.lv2` (10px corners, full type scale, committed
   red). Product → wrap in `.shell` (pills + 22px cards, compact scale, restrained red).
2. **Pick the heading by role**, not by size — `h1` hero/title, `h2` section, `h3` sub-section.
   The size flows from the canonical rule. **Never set `font-size` / `line-height` / `font-family`
   on a heading**; set only `max-width` / `margin` / `color` / `text-align`. (Orphan rule, §2.)
3. **Lead each section with an `.eyebrow`;** put the red accent phrase in `<span class="red">`.
4. **Stack text with `--text-gap`** (reuse `.tstack` / `.shead`); pad sections with `--sec-pad`;
   gutter with `--pad`/`--gut`.
5. **Reuse components as-is** — `.btn` / `.badge` / `.card` / `.field` / `.tbl` / `.modal`.
6. **Only reference tokens** (`var(--…)`) — no raw hex/px. New value → add a token first.
7. Animate `transform`/`opacity` only; add `.rv` for landing reveals; respect reduced-motion.
8. Verify the page reads as the **same Arial voice** as the landing before shipping.
