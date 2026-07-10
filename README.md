# xMargin

A browser-based Markdown reader focused on typography and distraction-free reading. No backend, no accounts, no tracking.

**Live:** [xmargin.app](https://xmargin.app)

---

## Quick start

```bash
git clone https://github.com/xmphdalf/xmargin.git
cd xmargin
npm install
npm run setup-hooks
npm run dev
```

Dev server runs at `http://localhost:5173`.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build to `build/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check (0 errors required) |
| `npm run test` | Run 10 Playwright end-to-end tests |
| `npm run test:ui` | Playwright visual debugger |
| `npm run validate` | `check` + `build` — mirrors CI |

---

## What it does

Load a document three ways: paste Markdown, upload a `.md` file, or fetch from a public URL. GitHub blob URLs auto-convert to raw.

**Reading modes:** Book (65ch column), Study (TOC sidebar), Focus (zero chrome), Story (drop caps + wide paragraph spacing).

**Themes:** Light, Sepia, Dark. Typography controls: font family, size, line height, column width. All settings persist to localStorage.

**Markdown:** GFM, YAML frontmatter, LaTeX math via rehype-katex, syntax highlighting via Shiki v1, Mermaid diagrams, smart quotes, `[[wikilinks]]`, lazy images. Shiki and KaTeX are never in the initial bundle.

**Presentation mode:** slides on `---`, keyboard + swipe navigation, fullscreen, speaker notes via `<!-- notes: ... -->`.

**Examine mode:** paste or upload a JSON question set and study it via Read (browse all), Reflect (self-paced flashcards), or Examine (linear test with optional timer, flag-for-revisit, a pre-submit review screen, and honest no-percentage results). Questions can be grouped under shared case studies (GCP-exam style) or stand alone.

**Export:** self-contained HTML with inline CSS, no external dependencies.

---

## Stack

| | |
|---|---|
| Framework | SvelteKit 2 + `@sveltejs/adapter-static` |
| Language | Svelte 5 runes |
| Styling | TailwindCSS v4 |
| Markdown | unified (remark + rehype pipeline) |
| Highlighting | Shiki v1, lazy-loaded |
| Math | remark-math + rehype-katex, lazy-loaded |
| Diagrams | Mermaid, lazy-loaded |
| Fonts | Source Serif 4, Inter, JetBrains Mono via `@fontsource-variable` |
| Deployment | Railway — Node 22 build, Caddy 2 serve |

Initial JS bundle target: under 50KB gzipped.

---

## Docs

- [CONTRIBUTING.md](CONTRIBUTING.md) — dev workflow, commit conventions, release process, design principles
- [CHANGELOG.md](CHANGELOG.md) — full version history

---

## License

MIT
