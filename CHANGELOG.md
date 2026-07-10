# Changelog

All notable changes to xMargin are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commits follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

> **How to read versions:**
> - `MAJOR` bump — breaking change (removed feature, incompatible API change)
> - `MINOR` bump — new feature added, backward-compatible
> - `PATCH` bump — bug fix, backward-compatible

---

## [Unreleased]

---

## [1.0.0] — 2026-07-10

### Changed

- **Rebrand: Margin → xMargin** — the bare `margin` domain wasn't available,
  so the product now lives at [xmargin.app](https://xmargin.app). Wordmark,
  page titles, and docs updated throughout; localStorage moved to a new
  `xmargin-*` key namespace (fresh origin, no migration needed).

### Added

- **Case studies in Examine** — a question set may now include a `caseStudies`
  array (`{ id, title, body }`), and any question may reference one via
  `caseStudyId` — or none, remaining a standalone question. Associated
  questions show a quiet "Case study · {title}" disclosure above the stem
  (collapsed by default) in every mode: Read, Reflect, Examine, and Results.
  Blank lines in the body separate paragraphs. Mirrors the case-study format
  used by GCP-style certification exams. (#14)

- **Examine — quiz/study module** — xMargin's third native module, alongside
  Markdown and git diff reading. Paste or upload a JSON question set (single-
  choice, multi-correct, and true/false questions), pick a question range and
  a mode, then study:
  - **Read** — browse every question with its answer and explanation, no
    interaction required.
  - **Reflect** — one question at a time; select your answer(s) first,
    "Reveal answer" only unlocks once you've picked the required number of
    options, then decorates your picks against the correct answer in place.
  - **Examine** — linear test with an optional timer (off by default),
    flag-for-revisit, and dot-row progress. "Review & submit" is reachable
    from any question and shows attempted count, the flagged-question list,
    and a final Submit step before results are revealed.

  Results report counts honestly — "you answered N of M correctly," never a
  percentage or grade — with a full per-question breakdown and a "questions
  to revisit" list (incorrect answers ∪ flagged questions). Sessions persist
  to localStorage (`xmargin-examine-set-v1`, `xmargin-examine-session-v1`) and
  resume after a refresh, with a 90-day expiry matching reading-position
  persistence. New route: `/examine`, entered via a third option in the
  home page's mode dropdown.

### Fixed

- **Diff lines no longer break the layout on wide changes** — a long unbroken
  token (lockfile hash, URL, minified code) forced the diff line grid wider
  than the viewport because the code column's `1fr` track refused to shrink
  and `pre-wrap` never breaks mid-token. The code cell now sets `min-width: 0`
  and `overflow-wrap: anywhere` in both the chapter and single-hunk views. (#11)

---

## [0.1.5] — 2026-05-18

### Added

- **Bookmark creation** — a bookmark button in the reading toolbar (left of the
  bookmark list toggle) saves the current active section as a bookmark.
  Disabled when no heading is active. Shows a green checkmark for 1.5 s after
  saving as a transient confirmation. Uses `crypto.randomUUID()` for IDs.

- **Reading analytics panel** — a new bar-chart icon button in the reading
  toolbar opens an Analytics panel (same slide-in pattern as Settings and
  Bookmarks). Displays current-session stats (time reading, words read, sections
  completed) and all-time totals (session count, total time, total words).
  Closes automatically when entering Focus mode.

- **Mermaid theme sync** — Mermaid diagrams now re-render when the app theme
  changes. Mapping: Light → `default`, Sepia → `neutral`, Dark → `dark`.
  Diagram source is stored after initial render so containers are updated
  in-place on every theme switch without touching the surrounding DOM.

### Fixed

- **KaTeX CSS no longer loaded from CDN** — replaced the runtime-created
  `<link href="cdn.jsdelivr.net/...">` with a dynamic `import('$lib/katex-css.js')`.
  Vite bundles KaTeX CSS into a separate lazy chunk (`katex-css.*.css`) served
  from the app itself. Eliminates the external network dependency and makes
  math rendering fully offline-capable after first load. `katex` added as a
  direct `devDependency` so the import is not fragile to `rehype-katex` version
  bumps.

- **Analytics session lifecycle** — `analyticsState.updateProgress()` was never
  called (all sessions recorded 0 words and 0 time). Fixed by wiring
  `updateProgress` into the scroll handler in `AppShell`. Session start/end is
  now driven by a `$effect` watching `readerState.rawMarkdown`, correctly
  capturing the home-page → `/read/` navigation that `onMount` missed.

- **`wordCount` added to `ParsedDoc`** — the parsed document now exposes the
  raw word count (already computed in the pipeline) so analytics can report
  precise words-read figures rather than back-calculating from `readingTime`.

---

## [0.1.4] — 2026-03-19

### Added

- **System theme default** — when no theme preference is stored, xMargin now
  respects the OS `prefers-color-scheme` media query and starts in Dark mode on
  dark-mode systems instead of always defaulting to Light.

- **Reading position persistence** — scroll position is saved per-document
  (keyed by a djb2 hash of the raw Markdown) and restored on return visits.
  Positions expire after 90 days and stale entries are pruned on load.

- **J / K section jump shortcuts** — pressing `J` jumps to the next heading,
  `K` jumps to the previous. Ignored when focus is inside an input or textarea.

- **Story mode** — a fourth reading mode (`N` button in the mode bar) that
  applies chapter-sized headings, drop caps on the first paragraph after each
  heading, generous paragraph spacing, and indented text. Designed for
  long-form fiction and essays.

- **"N min left" reading time** — the reading time label in the document header
  switches from `{n} min read` to `{n} min left` once you begin scrolling, and
  shows `Done` at the end of the document.

- **Section completion tracking** — TOC entries fade to 50% opacity once their
  section has scrolled past the top of the viewport, showing reading progress
  through the document structure.

- **Lazy image loading** — all images in rendered Markdown now receive
  `loading="lazy" decoding="async"` via a rehype plugin, deferring off-screen
  image fetches until they are needed.

- **Wikilink rendering** — `[[Text]]` patterns in Markdown are rendered as
  `<span class="wikilink">` cross-reference hints with a dashed accent underline
  and a `cursor: help` pointer.

- **HTML export** — the Export button in the reading toolbar downloads the
  current document as a fully self-contained static HTML file (inline CSS
  matching the current theme and typography settings, no external dependencies).
  The export module is dynamically imported — never in the initial bundle.

- **Presentation mode access** — a monitor icon button in the reading toolbar
  links directly to `/present/`, making the presentation mode discoverable.

- **Presentation swipe + click navigation** — touch/pointer swipe gestures now
  work correctly on the presentation slide area using `pointerdown`/`pointerup`
  events attached to the slide element (not `window`), fixing the regression
  where the slide's `overflow-y: auto` intercepted touch events. Clicking the
  left half of the slide goes to the previous slide; clicking the right half
  advances. Text selection is suppressed during swipe gestures via `user-select:
  none` on the slide area and `preventDefault` on `pointermove`.

- **Local reading session analytics** — words read, time spent, and sections
  completed are tracked per session and stored locally (max 50 sessions, never
  transmitted).

### Fixed

- **TOC sidebar layout** — the study-mode TOC sidebar now uses `position:
  sticky` with `height: calc(100vh - 3rem)` so it stays in the flex flow and
  the content column naturally offsets instead of being overlapped.

- **TOC active heading tracking on short sections** — replaced the
  `IntersectionObserver`-based approach (which failed on sections shorter than
  the rootMargin) with a scroll listener that picks the last heading whose top
  edge is above 30% of the viewport height. The last heading is always activated
  when the user reaches the bottom of the page.

- **TOC sidebar scroll not interfering with page scroll** — the sidebar's
  auto-scroll to keep the active link visible now uses `panelEl.scrollTo()`
  with manual `offsetTop` arithmetic instead of `scrollIntoView()`, which was
  incorrectly scrolling the main page.

- **Active heading resets after TOC click** — clicking a TOC link now calls
  `readerState.setActiveHeading()` immediately so the active state is correct
  before the scroll event fires.

- **Headings landing under sticky header** — `scroll-margin-top` increased from
  `2rem` to `4.5rem` to account for the 3rem header height, so clicked headings
  land visibly below the header instead of hidden behind it.

- **J/K shortcuts at section boundaries** — pressing `K` at the first section
  (or `J` at the last) would re-scroll to the current heading instead of doing
  nothing. Both now return early at boundaries. With no active heading, `J` goes
  to the first section and `K` goes to the last. Active heading is set
  immediately on jump so the TOC highlight updates before the scroll event fires.

---

## [0.1.3] — 2026-03-19

### Fixed

- **Navigation broken on sub-path deployments** — `goto('/read/')` did not include the
  `base` path prefix, causing a 404 on every input submission. Fixed by using
  `resolve('/read/')` from `$app/paths` which correctly prepends the configured base path.

- **Keyboard shortcut hint shows wrong modifier key** — the hint below the paste
  textarea always showed `⌘ + Enter` regardless of platform. Now detects the OS
  and shows `Ctrl` on Windows/Linux and `⌘` on macOS.

---

## [0.1.2] — 2026-03-19

### Added

- **Focus mode exit** — pressing `Escape` now returns to Book mode. The mode bar
  dims to 20% opacity in focus mode and reveals fully on hover, showing an `Esc`
  hint label. Previously there was no way to exit focus mode without refreshing.

- **Reading mode tooltips** — hovering the B / S / F buttons in the mode bar now
  shows a tooltip with the full name (Book, Study, Focus).

- **Playwright end-to-end test suite** — 10 tests across the three input flows
  (Paste, Upload, URL). Covers the happy path for each, plus error cases: invalid
  file extension shows correct alert, invalid URL scheme is rejected before fetch,
  HTTP errors from a URL are surfaced, and GitHub blob URLs are verified to
  auto-normalize to `raw.githubusercontent.com` before fetching. Tests run
  headlessly against the Vite dev server using only Chromium. Added as a CI gate
  (runs before build — deploy is blocked if tests fail) and to the local pre-push
  hook (`npm test` + `npm run validate` on every push to `main`).

### Fixed

- **Text artifact on every page** — The HTML comment in `app.html` contained a
  literal `%sveltekit.head%` token. SvelteKit's template engine does a
  first-occurrence string replacement, so the substitution fired inside the
  comment rather than at the real `<head>` slot, injecting `<link>` preload
  tags into the comment and leaving the actual placeholder as a visible text
  node rendered by the browser. Fixed by removing the token from the comment.

- **404 on `/read/` and `/present/` after hard refresh** — The previous
  `cp build/index.html build/404.html` approach was broken: `index.html` uses
  a dynamic `new URL(".", location)` base computation that resolves incorrectly
  when served from a sub-path. Replaced with a `sed` patch of adapter-static's
  own `404.html` that corrects the base path and rewrites asset paths.

---

## [0.1.1] — 2026-03-19

### Fixed

- SPA routing on static hosts — `/read/` and `/present/` returned 404 because
  adapter-static's generated `404.html` used absolute asset paths that broke
  under a sub-path deployment. Build step now copies `index.html` (which uses
  correct relative paths) over `404.html` so the host serves the proper SPA
  shell for all unknown sub-paths and client-side routing takes over.

---

## [0.1.0] — 2026-03-19

Initial scaffold release.

### Added

**Core reading experience**
- Three reading modes: Book (65ch column), Focus (zero chrome), Study (persistent TOC sidebar)
- Three themes: Light, Sepia, Dark — full coordinated oklch palettes, zero flash on load, cycle with one click
- Scroll progress indicator — CSS Scroll-Driven Animations primary, JS fallback for Firefox
- Estimated reading time displayed per document
- Bookmark system — per-document, up to 100 bookmarks, LRU eviction, localStorage-persisted

**Markdown pipeline**
- Full unified pipeline: remark-parse → remark-gfm → remark-frontmatter → remark-math → remark-smartypants → remark-rehype → rehype-slug → rehype-autolink-headings → rehype-katex → @shikijs/rehype → rehype-stringify
- GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks)
- YAML frontmatter parsing — title, author, date surfaced in the reading UI
- LaTeX math via remark-math + rehype-katex; KaTeX CSS loaded only when math is present
- Smart typography (curly quotes, em-dashes, ellipses) via remark-smartypants
- Syntax highlighting via Shiki v1, dual CSS-variable themes (github-light / vitesse-dark), lazy-loaded — never in the initial bundle
- Mermaid diagram rendering, lazy-loaded on demand
- Dynamic table of contents extracted from MDAST (not DOM scraping)
- IntersectionObserver scroll spy for active heading tracking

**Input methods**
- Paste Markdown directly
- Upload local `.md` files
- Fetch from any public URL — GitHub blob URLs automatically normalised to raw

**Typography controls**
- Font family toggle: Source Serif 4 / Inter
- Font size slider (14–24px range)
- Line height slider (1.4–2.0 range)
- Reading column width: Narrow (60ch) / Default (68ch) / Wide (80ch)
- All settings persisted to localStorage with versioned schema (`xmargin-settings-v1`)

**Presentation mode**
- Slides delimited by `\n---\n`
- Keyboard arrow navigation + fullscreen via `document.requestFullscreen()`
- Speaker notes via `<!-- notes: ... -->` comment blocks

**Infrastructure**
- SvelteKit 2 + Svelte 5 runes throughout (`$state`, `$derived`, `$effect`, `$props`)
- TailwindCSS v4 — `@theme` design tokens, `@custom-variant dark`, no config file
- Variable fonts via `@fontsource-variable`: Source Serif 4 Variable, Inter Variable, JetBrains Mono Variable — bundled by Vite, no external CDN
- Anti-flash theme init: inline `<script>` in `<head>` runs synchronously before first paint
- All localStorage access SSR-guarded, wrapped in try/catch (Safari Private mode safe)
- Deployment via Railway — Docker multi-stage build (Node 22 → Caddy 2), auto-deploy on push to `main`
- TypeScript strict mode — zero `@ts-ignore` / `@ts-expect-error` annotations

**Accessibility**
- WCAG AA contrast minimum across all three themes
- Skip-to-content link as first focusable element
- `aria-*` landmarks: `<article>`, `<aside>`, `<nav>`, `role="progressbar"`
- Full keyboard navigation — all controls reachable via Tab
- `@media (prefers-reduced-motion)` respected everywhere
- `<fieldset>`/`<legend>` for button groups in settings panel

---

[Unreleased]: https://github.com/xmphdalf/xmargin/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/xmphdalf/xmargin/compare/v0.1.5...v1.0.0
[0.1.5]: https://github.com/xmphdalf/xmargin/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/xmphdalf/xmargin/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/xmphdalf/xmargin/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/xmphdalf/xmargin/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/xmphdalf/xmargin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/xmphdalf/xmargin/releases/tag/v0.1.0
