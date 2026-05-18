# Margin

A browser-based Markdown reader. Paste, upload, or fetch any `.md` file and read it with good typography, a clean layout, and no distractions.

No backend, no accounts, no tracking. Everything runs in the browser and persists to localStorage.

---

## Running locally

Fork first, then clone your fork.

```bash
git clone https://github.com/<your-username>/margin.git
cd margin
npm install
npm run setup-hooks   # one-time per machine
npm run dev           # http://localhost:5173
```

```bash
npm run check         # type-check (0 errors required)
npm run build         # production build to build/
npm run test          # 10 Playwright end-to-end tests
npm run validate      # check + build - same as CI
npm run preview       # serve the production build locally
```

---

## What it does

Three ways to load a document: paste Markdown directly, upload a `.md` file, or fetch from a public URL. GitHub blob URLs are auto-converted to raw.

Four reading modes: Book (65ch prose column), Study (persistent TOC sidebar), Focus (zero chrome), Story (drop caps and wide spacing for long-form prose). Three themes: Light, Sepia, Dark. Typography is adjustable: font family, size, line height, and column width. All settings persist across sessions.

The TOC is extracted from the Markdown AST, not the DOM. Scroll spy uses a scroll listener rather than IntersectionObserver, which fails on short sections. `J` / `K` jump between headings. Reading position is saved per document and restored on return.

Full Markdown support: GFM, YAML frontmatter, LaTeX math via rehype-katex, syntax highlighting via Shiki v1, Mermaid diagrams, smart typography, `[[wikilinks]]`, lazy images. Shiki and KaTeX are never in the initial bundle.

Presentation mode splits slides on `---`, supports keyboard and swipe navigation, fullscreen, and `<!-- notes: ... -->` speaker notes.

Export downloads the current document as a self-contained HTML file with inline CSS.

---

## Stack

| | |
|---|---|
| Framework | SvelteKit 2 + `@sveltejs/adapter-static` |
| Language | Svelte 5 runes - `$state`, `$derived`, `$effect` |
| Styling | TailwindCSS v4 - `@theme` tokens, no config file |
| Markdown | unified - remark + rehype pipeline |
| Highlighting | Shiki v1 - lazy-loaded |
| Math | remark-math + rehype-katex |
| Diagrams | Mermaid - lazy-loaded |
| Fonts | Source Serif 4, Inter, JetBrains Mono via `@fontsource-variable` |
| Deployment | Railway - Node 22 build, Caddy 2 serve |

Initial JS bundle target: under 50KB gzipped.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow: fork setup, the push to CI to deploy pipeline, commit conventions, PR checklist, and design principles.

---

## Releases

Tagged and published as [GitHub Releases](https://github.com/xmphdalf/margin/releases) on every version bump. Full history in [CHANGELOG.md](CHANGELOG.md).

---

## License

MIT
