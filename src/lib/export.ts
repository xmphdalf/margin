/**
 * Export utilities for Markdown documents and Git diffs.
 * Dynamically imported — never included in the initial bundle.
 */
import type { ParsedDoc, ParsedDiff, ReaderSettings, Theme } from './types.js';

const MEASURE_MAP: Record<ReaderSettings['measure'], string> = {
	narrow: '60ch',
	default: '68ch',
	wide: '80ch'
};

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function slugify(s: string): string {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'document';
}

function buildCSS(settings: ReaderSettings, theme: Theme): string {
	const isDark = theme === 'dark';
	const isSepia = theme === 'sepia';

	const surface = isDark
		? 'oklch(0.15 0.008 250)'
		: isSepia
			? 'oklch(0.95 0.03 80)'
			: 'oklch(0.98 0.008 85)';
	const ink = isDark
		? 'oklch(0.92 0.006 85)'
		: isSepia
			? 'oklch(0.26 0.04 55)'
			: 'oklch(0.22 0.01 250)';
	const inkMuted = isDark
		? 'oklch(0.62 0.008 250)'
		: isSepia
			? 'oklch(0.48 0.03 55)'
			: 'oklch(0.50 0.01 250)';
	const accent = isDark
		? 'oklch(0.72 0.14 260)'
		: isSepia
			? 'oklch(0.48 0.14 40)'
			: 'oklch(0.55 0.14 260)';
	const border = isDark
		? 'oklch(0.26 0.008 250)'
		: isSepia
			? 'oklch(0.82 0.03 75)'
			: 'oklch(0.88 0.006 85)';
	const codeBg = isDark
		? 'oklch(0.12 0.005 250)'
		: isSepia
			? 'oklch(0.92 0.02 80)'
			: 'oklch(0.96 0.003 250)';

	const fontFamily =
		settings.fontFamily === 'serif'
			? "'Source Serif 4', Georgia, serif"
			: "'Inter', system-ui, sans-serif";
	const measure = MEASURE_MAP[settings.measure];

	return `
*, *::before, *::after { box-sizing: border-box; }
html { font-size: ${settings.fontSize}rem; }
body {
  margin: 0;
  background: ${surface};
  color: ${ink};
  font-family: ${fontFamily};
  line-height: ${settings.lineHeight};
  -webkit-font-smoothing: antialiased;
}
main {
  max-width: ${measure};
  margin: 0 auto;
  padding: 4rem 1.5rem 8rem;
}
h1,h2,h3,h4,h5,h6 { color: ${ink}; line-height: 1.25; margin: 2em 0 0.75em; }
h1 { font-size: 2.25em; }
h2 { font-size: 1.75em; }
h3 { font-size: 1.375em; }
p { margin: 0 0 1.25em; }
a { color: ${accent}; }
blockquote {
  border-left: 3px solid ${border};
  margin: 1.5em 0;
  padding: 0.25em 1.25em;
  color: ${inkMuted};
}
pre {
  background: ${codeBg};
  border: 1px solid ${border};
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  font-size: 0.875em;
}
code { font-family: 'JetBrains Mono', 'Fira Code', monospace; }
pre code { background: none; padding: 0; }
:not(pre) > code {
  background: ${codeBg};
  padding: 0.15em 0.35em;
  border-radius: 3px;
  font-size: 0.875em;
}
img { max-width: 100%; height: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid ${border}; padding: 0.5em 0.75em; }
th { background: ${codeBg}; }
hr { border: none; border-top: 1px solid ${border}; margin: 2em 0; }
.wikilink { border-bottom: 1px dashed ${accent}; cursor: help; }
`;
}

export async function printDocument(doc: ParsedDoc, settings: ReaderSettings, theme: Theme): Promise<void> {
	const title = (doc.frontmatter.title as string | undefined) ?? 'Document';
	const css = buildCSS(settings, theme);
	const fullHtml = `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head><body>
  <main>${doc.html}</main>
  <script>window.onload = () => window.print();<\/script>
</body></html>`;
	const win = window.open('', '_blank');
	if (!win) return;
	win.document.write(fullHtml);
	win.document.close();
}

export async function copyToClipboard(raw: string): Promise<void> {
	await navigator.clipboard.writeText(raw);
}

export async function exportDocument(doc: ParsedDoc, settings: ReaderSettings, theme: Theme): Promise<void> {
	const title = (doc.frontmatter.title as string | undefined) ?? 'Document';
	const css = buildCSS(settings, theme);

	const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body>
  <main class="prose">
    ${doc.html}
  </main>
</body>
</html>`;

	const blob = new Blob([fullHtml], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${slugify(title)}.html`;
	a.click();
	URL.revokeObjectURL(url);
}

export async function exportDiff(diff: ParsedDiff, settings: ReaderSettings, theme: Theme): Promise<void> {
	const css = buildCSS(settings, theme);
	const filesHtml = diff.files
		.map((f) => {
			const hunksHtml = f.hunks
				.map((h) => {
					const linesHtml = h.lines
						.map((l) => {
							const cls =
								l.type === 'addition'
									? 'diff-add'
									: l.type === 'deletion'
										? 'diff-del'
										: 'diff-ctx';
							const content = l.tokens
								? l.tokens
										.map((t) =>
											t.changed
												? `<mark class="tok-${l.type === 'addition' ? 'add' : 'del'}">${escapeHtml(t.value)}</mark>`
												: escapeHtml(t.value)
										)
										.join('')
								: escapeHtml(l.content);
							return `<div class="dl ${cls}"><code>${content}</code></div>`;
						})
						.join('');
					return `<div class="hunk">${linesHtml}</div>`;
				})
				.join('<hr class="hunk-sep">');

			const name = f.path.split('/').pop() ?? f.path;
			const dir = f.path.includes('/') ? f.path.slice(0, f.path.lastIndexOf('/') + 1) : '';
			return `<section id="${escapeHtml(f.id)}"><h2><span class="dir">${escapeHtml(dir)}</span>${escapeHtml(name)}</h2><div class="hunks">${hunksHtml}</div></section>`;
		})
		.join('');

	const diffCss = `
.diff-add { border-left: 3px solid oklch(0.55 0.14 145); }
.diff-del { border-left: 3px solid oklch(0.52 0.16 25); }
.diff-ctx { opacity: 0.65; }
.dl { display: flex; }
.dl code { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; padding: 0.1em 1rem; white-space: pre-wrap; word-break: break-all; flex: 1; }
.hunk { border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; margin-bottom: 1rem; }
.hunk-sep { border: none; border-top: 1px dashed #e0e0e0; margin: 0.5rem 0; }
.tok-add { background: oklch(0.88 0.08 145 / 0.3); border-radius: 2px; }
.tok-del { background: oklch(0.88 0.10 25 / 0.25); border-radius: 2px; text-decoration: line-through; }
h2 { font-family: monospace; font-size: 1rem; padding-top: 2rem; border-top: 1px solid #e0e0e0; margin: 2rem 0 0.75rem; }
.dir { opacity: 0.5; }
`;

	const fullHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Diff — ${diff.files.length} files changed</title>
  <style>${css}${diffCss}</style>
</head>
<body>
  <main>
    <p style="color:#666;margin-bottom:2rem">${diff.files.length} files &middot; +${diff.totalAdditions} &minus;${diff.totalDeletions}</p>
    ${filesHtml}
  </main>
</body>
</html>`;

	const blob = new Blob([fullHtml], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'diff.html';
	a.click();
	URL.revokeObjectURL(url);
}
