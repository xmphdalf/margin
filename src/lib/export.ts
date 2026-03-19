/**
 * Export the current document as a self-contained static HTML file.
 * Dynamically imported — never included in the initial bundle.
 */
import type { ParsedDoc, ReaderSettings, Theme } from './types.js';

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
