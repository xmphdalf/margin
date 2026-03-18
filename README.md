# Margin

> A quiet place to read Markdown.

Margin transforms raw Markdown into a calm, immersive reading experience.
Paste, upload, or fetch any `.md` file and read it the way it deserves to be read —
with considered typography, spacious layout, and zero distractions.

**[Live demo →](https://xmphdalf.github.io/margin/)**

---

## What it is

A **reader-first** static web application. Not an editor. Not a CMS. Not a documentation generator.

The best reading apps — iA Writer, Readwise Reader, Instapaper, Kindle — succeed by making the interface disappear. Margin follows that lineage, built specifically for Markdown.

Runs entirely in the browser. No backend, no accounts, no tracking. Deployable on GitHub Pages or any static host.

---

## Features

**Input**
- Paste Markdown text directly
- Upload local `.md` files
- Fetch from any public URL — GitHub blob links auto-converted to raw

**Reading**
- Three reading modes — Book (prose column), Focus (zero chrome), Study (persistent TOC sidebar)
- Three themes — Light, Sepia, Dark — full coordinated oklch palettes, zero flash on load, cycle with one click
- Dynamic table of contents extracted from the Markdown AST, with scroll-spy active heading
- Scroll progress bar — CSS Scroll-Driven Animations (Chrome/Safari), JS fallback for Firefox
- Estimated reading time shown per document
- Bookmarks — per-document, up to 100, LRU eviction, restored on next visit
- Theme, reading mode, and typography settings all persisted to localStorage

**Typography**
- Font family: Source Serif 4 Variable (serif) or Inter Variable (sans)
- Font size: 14–24px, adjustable via settings panel
- Line height: 1.4–2.0, adjustable via settings panel
- Column width: Narrow (60ch) / Default (68ch) / Wide (80ch)

**Markdown**
- GitHub Flavored Markdown — tables, task lists, strikethrough, autolinks
- YAML frontmatter — title, author, date surfaced in the document header
- LaTeX math via rehype-katex — KaTeX CSS loaded only when math is present
- Syntax highlighting via Shiki v1 — dual themes (light + dark via CSS variables), lazy-loaded
- Mermaid diagrams — lazy-loaded, never in the initial bundle
- Smart typography — curly quotes, em-dashes, ellipses via remark-smartypants

**Presentation mode**
- Split slides on `---` horizontal rules
- Keyboard arrow navigation and fullscreen
- Speaker notes via `<!-- notes: ... -->` comment blocks

---

## Tech stack

| Concern | Tool |
|---|---|
| Framework | SvelteKit 2 + `@sveltejs/adapter-static` |
| Language | Svelte 5 runes — `$state`, `$derived`, `$effect`, `$props` |
| Styling | TailwindCSS v4 — `@theme` tokens, no config file |
| Markdown | unified — remark + rehype pipeline |
| Syntax highlighting | Shiki v1 — lazy-loaded, never in initial bundle |
| Math | remark-math + rehype-katex |
| Diagrams | Mermaid — lazy-loaded on demand |
| Fonts | Source Serif 4 Variable, Inter Variable, JetBrains Mono Variable via `@fontsource-variable` |
| Deployment | GitHub Pages via GitHub Actions |

Initial JS bundle target: **< 50KB gzipped**. Shiki, KaTeX, and Mermaid are never in the initial chunk.

---

## Running locally

**Fork first — do not clone the original directly.** See [Contributing](#contributing).

```bash
git clone https://github.com/<your-username>/margin.git
cd margin
npm install
npm run setup-hooks   # install pre-push hook — one-time, per machine
npm run dev           # http://localhost:5173
```

**All commands:**

```bash
npm run dev           # start dev server
npm run check         # TypeScript + Svelte type check (0 errors required)
npm run build         # production build → build/
npm run test          # Playwright end-to-end tests (10 tests across 3 inputs)
npm run test:ui       # Playwright visual debugger — useful for investigating failures
npm run validate      # check + build — mirrors CI exactly, run before pushing
npm run preview       # serve the production build locally
npm run setup-hooks   # install git pre-push hook
```

---

## Contributing

**Fork, don't clone the original.**
Forking gives you your own copy to work on freely. Cloning the original means you can't push, and your changes become entangled with the canonical codebase.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow:
- How to fork, set up upstream, and stay in sync
- The local → push → CI → deploy pipeline
- Commit message conventions (Conventional Commits)
- PR checklist
- Design principles every change must pass

---

## Versioning & releases

Margin uses [Semantic Versioning](https://semver.org/).
Every release is tagged (`v0.1.0`) and published as a [GitHub Release](https://github.com/xmphdalf/margin/releases) with the changelog section as the release body.

See [CHANGELOG.md](CHANGELOG.md) for the complete history.

---

## License

MIT — see [LICENSE](LICENSE).
