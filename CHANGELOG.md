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

[Unreleased]: https://github.com/xmphdalf/margin/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/xmphdalf/margin/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/xmphdalf/margin/releases/tag/v0.1.0
