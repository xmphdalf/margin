# Changelog

All notable changes to Margin are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commits follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

> **How to read versions:**
> - `MAJOR` bump — breaking change (removed feature, incompatible API change)
> - `MINOR` bump — new feature added, backward-compatible
> - `PATCH` bump — bug fix, backward-compatible

---

## [Unreleased]

_Changes staged here are merged to a version section on each release._

---

## [0.1.4] — 2026-03-19

### Added

- **System theme default** — when no theme preference is stored, Margin now
  respects the OS `prefers-color-scheme` media query and starts in Dark mode on
  dark-mode systems instead of always defaulting to Light.

- **Reading position persistence** — scroll position is saved per-document
  (keyed by a djb2 hash of the raw Markdown) and restored on return visits.
  Positions expire after 90 days and stale entries are pruned on load.

- **J / K section jump shortcuts** — pressing `J` jumps to the next heading,
  `K` jumps to the previous. Ignored when focus is inside an input or textarea.

- **Story mode** — a fourth reading mode (`N` button in the mode bar) that
  applies cinematic prose styling: chapter-sized headings, drop caps on the
  first paragraph after each heading, generous paragraph spacing, and indented
  text. Designed for long-form fiction and essays.

- **"N min left" reading time** — the reading time label in the document header
  switches from `{n} min read` to `{n} min left` once you begin scrolling, and
  shows `Done` at the end of the document.

- **Section completion tracking** — TOC entries fade to 50% opacity once their
  section has scrolled past the top of the viewport, giving a visual sense of
  reading progress through the document structure.

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

- **Navigation broken on GitHub Pages** — `goto('/read/')` did not include the
  `base` path prefix (`/margin`), causing a 404 on every input submission when
  deployed to a GitHub Pages sub-path. Fixed by using `resolve('/read/')` from
  `$app/paths` which correctly prepends the configured base path.

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
  when served from a sub-path (e.g. `/margin/read/`). Replaced with a `sed`
  patch of adapter-static's own `404.html` that corrects `base: ""` to
  `base: "/margin"` and rewrites `/_app/` asset paths to `/margin/_app/`.

---

## [0.1.1] — 2026-03-19

### Fixed

- SPA routing on GitHub Pages — `/read/` and `/present/` returned 404 because
  adapter-static's generated `404.html` used absolute asset paths that broke
  under the `/margin` BASE_PATH sub-directory. Build step now copies `index.html`
  (which uses correct relative paths) over `404.html` so GitHub Pages serves the
  proper SPA shell for all unknown sub-paths and client-side routing takes over.

---

## [0.1.0] — 2026-03-19

Initial scaffold release. Full production-grade foundation — every architectural
decision is in place so no rewrites are needed as features land.

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
- All settings persisted to localStorage with versioned schema (`margin-settings-v1`)

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
- GitHub Pages deployment via GitHub Actions with `BASE_PATH`-aware builds
- `static/.nojekyll` — prevents Jekyll from hiding `_app/` folder
- TypeScript strict mode — zero `@ts-ignore` / `@ts-expect-error` annotations

**Accessibility**
- WCAG AA contrast minimum across all three themes
- Skip-to-content link as first focusable element
- `aria-*` landmarks: `<article>`, `<aside>`, `<nav>`, `role="progressbar"`
- Full keyboard navigation — all controls reachable via Tab
- `@media (prefers-reduced-motion)` respected everywhere
- `<fieldset>`/`<legend>` for button groups in settings panel

---

[Unreleased]: https://github.com/xmphdalf/margin/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/xmphdalf/margin/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/xmphdalf/margin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/xmphdalf/margin/releases/tag/v0.1.0
