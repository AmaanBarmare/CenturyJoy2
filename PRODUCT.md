# Product

## Register

product

> Split-register project. The **default is `product`** — the three authenticated portals
> (client, studio, admin) are the actual product and the bulk of the build. The **public
> landing page is a per-task `brand` override** — design IS the product there; it sells the
> service and funnels vetted partners to log in / request access.

## Users

- **Clients** — architects, interior designers, and design influencers. Design-literate and
  aesthetically demanding; time-poor. They submit project drawings, track render progress,
  download deliverables, and request up to two revisions. Visit occasionally, per project.
- **Studio team** — Century Ply's 3D visual artists/producers. In the tool for hours at a
  time in a bright studio: scanning project queues, reading file names and statuses,
  downloading inputs, uploading rendered views, advancing the pipeline.
- **Admin** — Century Ply internal staff. Provision accounts, oversee all projects, override
  status when needed, read the audit log. Low-frequency, high-trust.

## Product Purpose

Century Joy is a closed, invite-only service portal where Century Ply partners exchange files
and track the production lifecycle of photorealistic 3D renders — from submission, through
studio acceptance and drafts, to revisions and closure. All follow-up is via email; the portal
is the single source of truth for status and deliverables. The landing page exists to present
the service with enough craft that a design professional trusts it on sight.

## Brand Personality

Architectural, confident, crafted. The voice is assured and understated, never salesy or
startup-breathless. It speaks to people who judge visual quality for a living, so the interface
must itself look considered. Tagline: *"Your vision. Our visual expertise."* Emotional goals:
on the landing — drama, craft, trust; in the portal — calm, clarity, control.

## Anti-references

- Generic SaaS dashboard slop: identical icon-heading-text card grids, hero-metric templates.
- Gradient-soaked, emoji-peppered startup landing pages.
- Cluttered enterprise portals with dense chrome and no whitespace.
- Editorial-magazine aesthetic by reflex (serif display + italic drop caps + broadsheet grid).
  We borrow Option 7's sticky-image *layout* but NOT its Cormorant serif voice.
- Anything that reads "an AI generated this."

## Design Principles

1. **Let the work glow.** Renders are the hero; the chrome recedes. Imagery is load-bearing on
   the landing; deliverables are the focal point in the portal.
2. **One brand, two registers.** A cinematic dark landing that sells; a calm light portal that
   serves. Continuity comes from the red, the logo, the type, and the geometry, not from forcing
   one treatment onto both.
3. **Confidence through restraint.** The brand red is load-bearing and used sparingly. Space,
   scale, and weight carry the hierarchy.
4. **The status is the story.** The project lifecycle is always legible at a glance: a clear
   state machine, color-plus-label badges, an unmistakable progress tracker.
5. **Earned familiarity in the app.** Standard patterns, no reinvented affordances. In the
   portal the tool disappears into the task; delight is saved for moments, not pages.

## Accessibility & Inclusion

- WCAG 2.1 Level AA (per the PRD).
- Status is never conveyed by color alone — always paired with a label and/or icon
  (color-blind safe).
- `prefers-reduced-motion` honored: landing scroll choreography degrades to instant; no parallax.
- Visible `:focus-visible` rings on all interactive elements; full keyboard operability.
- Body text capped at 65–75ch; AA contrast on both dark and light surfaces.
