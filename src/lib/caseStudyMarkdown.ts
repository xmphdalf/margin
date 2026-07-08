/**
 * Renders a case study `body` as Markdown into HTML.
 *
 * Scoped down from the main pipeline (src/lib/markdown.ts) — case studies
 * never need math, code highlighting, slugged headings, or wikilinks, and
 * this file must stay independent of examine.ts, which is imported on the
 * home page (pulling remark/rehype into examine.ts would leak this whole
 * pipeline into the home-page bundle).
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

/** PDF-extracted case studies commonly use glyph bullets instead of markdown list syntax. */
function normalizeBullets(body: string): string {
	return body.replace(/^[ \t]*[•‣·][ \t]+/gm, '- ');
}

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify);

/** Pure — no state, no side effects. Safe to call from a $derived. */
export function renderCaseStudyMarkdown(body: string): string {
	return String(processor.processSync(normalizeBullets(body)));
}
