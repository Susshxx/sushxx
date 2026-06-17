# Sush Portfolio — Full Build Plan

One-shot build of the entire site. Stack stays as you specified: TanStack Start + React 19 + Tailwind v4, Motion for crossfades, GSAP + ScrollTrigger + Lenis for the hero scrub, Lovable Cloud (Postgres + Storage) for data and media, canvas 2D for frame scrubbing. Fraunces for the logotype/titles, Inter for body.

## 1. Backend (Lovable Cloud)

Enable Cloud, then one migration:

- `projects(id, slug unique, title, description, tech text[], cover_url, video_url, link_url, featured, sort_order, created_at, updated_at)`
- `experiences(id, role, company, period, summary, sort_order, created_at, updated_at)`
- `contact_messages(id, name, email, message, created_at)`
- `site_settings(key text pk, value jsonb)` — holds `sections_visibility = { projects, experience, contact }` so admin can toggle sections on/off.
- GRANTs + RLS:
  - `projects`, `experiences`, `site_settings`: `SELECT TO anon, authenticated`.
  - `contact_messages`: `INSERT TO anon, authenticated`, no public SELECT.
  - All writes go through server functions using the service role after admin-session check.
- Storage bucket `project-media` (public read) for covers + preview videos.
- Seed: 3 demo projects, 3 demo experiences, default `sections_visibility = all true`.

Secret: `ADMIN_CODE = SushAdmin` (added via the secrets tool in the same turn).

## 2. Admin gate (no per-user auth)

- `src/lib/admin-session.ts` — signed HMAC cookie `sush_admin=1` using `ADMIN_CODE` as the signing secret; `requireAdminSession()` helper for handlers.
- Server fns in `src/lib/admin.functions.ts`: `verifyAdminCode({ code })` sets the cookie; `clearAdminSession()`; `isAdmin()` for the client to know whether to show inline edit affordances.
- All mutating fns (`upsertProject`, `deleteProject`, `uploadProjectMedia`, `upsertExperience`, `deleteExperience`, `listContactMessages`, `updateSectionVisibility`) call `requireAdminSession` first and use the admin Supabase client loaded inside the handler.
- Public reads (`listProjects`, `getProjectBySlug`, `listExperiences`, `getSectionVisibility`) use the server publishable client.
- `submitContactMessage` — public insert with Zod validation + basic honeypot.

## 3. Frames pipeline

- Extract the 84 uploaded JPGs, upload each to Lovable Assets via the CLI, write `src/assets/frames/frames.json` as an ordered array of CDN URLs.
- `useFramePreloader(urls, currentIndex)` — preloads a sliding window of ~16 frames around current index, keeps decoded `HTMLImageElement`s in a ref map.

## 4. Theme + tokens

- CSS variables in `src/styles.css` under `@theme inline`: `--bg`, `--fg`, `--muted`, `--accent`. Dark default (`#0a0a0a` bg, `#f5f5f0` fg), light alt.
- Class on `<html>` toggled by `ThemeToggleDot` (fixed bottom-right), persisted to localStorage; SSR-safe inline script in `__root.tsx` reads the stored value before hydration.
- Fonts: Fraunces (display) + Inter (body) loaded via `<link>` in `__root.tsx` head, mapped in `@theme` as `--font-display` and `--font-sans`.

## 5. Hero scrub (desktop)

`src/components/site/hero/`:

- `HeroStage` — full-viewport section, pinned for ~3× viewport scroll distance via ScrollTrigger.
- `ScrollProgressProvider` — wraps Lenis, exposes `progress` (0→1) over the pinned range through context + a `useScrollProgress()` hook reading a `motionValue`-style ref so children don't re-render every frame.
- `HeroFrameCanvas` — canvas at `devicePixelRatio`, draws `frames[Math.round(progress * 83)]`. RAF-driven, only redraws when the index changes.
- `HeroOverlayContent` — `TopBar` (tagline left, "Sush" centered in Fraunces), scattered `IndexItem`s positioned absolutely at randomized but deterministic offsets, `BottomBar` (Reach out / Github / LinkedIn / Whatsapp — all `#` for now), `ThemeToggleDot`.
- Each `IndexItem` lerps from its scattered offset → centered stack position and fades to 0 opacity as `progress` goes 0 → ~0.85. Fully reversible (no one-shot triggers; everything maps off live progress).
- Final ~15% of progress: canvas + overlay both fade to 0, leaving a clean dark frame ready for the grid crossfade.

## 6. Hero → Grid dissolve

- Below the pinned hero, `ProjectGrid` is rendered with `position: sticky`/normal flow and a Motion `opacity` driven off the same progress value (0 below 0.85, 1 at 1.0) so the grid materializes on top of the dark canvas with no black gap.

## 7. Projects

- `ProjectGrid` — single column on mobile, 2-col on md+, generous spacing, Fraunces titles.
- `ProjectCard` — shows `cover_url` by default; on hover swaps to a muted, looping `<video>` using `video_url` (preloaded `metadata`, switched to `auto` on hover). Click → `/projects/$slug`.
- `/projects/$slug` — title, hero video (or cover fallback), full description, tech chips, "Visit project" button linking `link_url`. Loader uses `getProjectBySlug` server fn; defines `errorComponent` + `notFoundComponent`; `head()` sets title/description/og.

## 8. Experience

- `ExperienceList` — vertical timeline of `ExperienceRow`s (role · company · period · summary).
- When `isAdmin()` returns true on the client, each row swaps to inline-edit mode (text inputs + Save/Cancel) calling `upsertExperience`. Non-admins see read-only.

## 9. Contact

- `ContactForm` — name, email, message, honeypot, Zod validation, submits via `submitContactMessage`. Toast on success/failure.

## 10. Section visibility

- Admin can toggle which sections (`projects`, `experience`, `contact`) appear on `/`. The index route loader fetches `getSectionVisibility` and conditionally renders each block. Defaults all on.

## 11. Admin panel

- `/admin` — public route showing `AdminLogin` (single code field) until cookie present.
- After login: tabs for **Projects** (ProjectsTable + ProjectEditorDialog with media upload to `project-media`), **Experiences** (ExperiencesTable, also editable inline on the main page), **Messages** (read-only `contact_messages` list), **Sections** (three switches), plus "View site" + "Sign out".

## 12. Mobile + reduced motion

- `useMediaQuery('(max-width: 768px)')` or `(prefers-reduced-motion: reduce)` → skip Lenis/ScrollTrigger/canvas entirely, render a static hero showing frame 84 (eyes open) + overlay at final positions, then normal scroll into the rest of the page.

## 13. SEO / routing

- Routes: `/` (index), `/projects/$slug`, `/admin`. Each defines `head()` with route-specific title, description, og:title, og:description; project detail adds `og:image` from `cover_url`.
- Root `__root.tsx` keeps the existing shell, adds font `<link>` tags + the theme bootstrap script + Sonner toaster.

## 14. Build order

1. Enable Cloud + migration + seed + storage bucket.
2. Add `ADMIN_CODE` secret.
3. Extract frames → upload via `lovable-assets` → write `frames.json`.
4. Theme tokens, fonts, `ThemeToggleDot`, root layout updates.
5. Admin session helpers + all server fns (projects, experiences, contact, admin, settings).
6. Static hero (frame 1, scattered IndexItems, TopBar/BottomBar).
7. Lenis + ScrollProgressProvider + pinned ScrollTrigger.
8. HeroFrameCanvas + preloader wired to `frames.json`.
9. IndexItem convergence + opacity off progress (reversible).
10. Hero→grid dissolve.
11. ProjectGrid + ProjectCard (hover video).
12. `/projects/$slug` detail page.
13. ExperienceList + inline-edit when admin.
14. ContactForm + submission.
15. `/admin` (login, ProjectsTable + editor, ExperiencesTable, MessagesTable, Sections toggles).
16. Mobile fallback + reduced-motion audit.
17. Final QA pass; preview.

## Technical notes

- `gsap`, `gsap/ScrollTrigger`, `@studio-freight/lenis`, `motion`, `zod` installed via `bun add`. GSAP imports stay client-only (dynamic import inside `useEffect`) to keep SSR clean.
- Canvas redraws gated by `requestAnimationFrame` and an index-change check to avoid wasted paints.
- All server fns live in `src/lib/*.functions.ts` (never `src/server/`); `client.server` is only imported inside handler bodies via `await import(...)`.
- `contact_messages` has no public SELECT; only `listContactMessages` (admin-gated) reads it.
- No `user_roles` table — admin status is a signed cookie validated server-side per request.
