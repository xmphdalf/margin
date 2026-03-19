/**
 * Margin Markdown Pipeline
 *
 * Parses raw Markdown into HTML + metadata using the unified ecosystem.
 *
 * Pipeline order (do not reorder):
 * remark-parse → remark-gfm → remark-frontmatter → remark-math →
 * remark-smartypants → [extractToc] → [extractFrontmatter] →
 * remark-rehype → rehype-slug → rehype-autolink-headings →
 * rehype-katex → @shikijs/rehype → rehype-stringify
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMath from 'remark-math';
import remarkSmartypants from 'remark-smartypants';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import { parse as parseYaml } from 'yaml';
import type { Plugin } from 'unified';
import type { Root as MdastRoot, Heading, Code, Text, Parent } from 'mdast';
import type { Root as HastRoot, Element } from 'hast';
import type { VFile } from 'vfile';
import type { ParsedDoc, TocEntry, Frontmatter } from './types.js';

// ─── Custom remark plugins ────────────────────────────────────────────────────

/** Extract TOC from MDAST headings (before remark-rehype, never from DOM). */
function extractTocPlugin() {
	return (tree: MdastRoot, file: VFile) => {
		const slugger = new GithubSlugger();
		const toc: TocEntry[] = [];

		visit(tree, 'heading', (node: Heading) => {
			const text = toString(node);
			const id = slugger.slug(text);
			toc.push({ id, text, depth: node.depth as TocEntry['depth'] });
		});

		(file.data as Record<string, unknown>).toc = toc;
	};
}

/** Parse YAML frontmatter node into structured data. */
function extractFrontmatterPlugin() {
	return (tree: MdastRoot, file: VFile) => {
		visit(tree, 'yaml', (node: { type: 'yaml'; value: string }) => {
			try {
				const fm = parseYaml(node.value) as Frontmatter;
				(file.data as Record<string, unknown>).frontmatter = fm ?? {};
			} catch {
				(file.data as Record<string, unknown>).frontmatter = {};
			}
		});
	};
}

/**
 * Add loading="lazy" decoding="async" to all <img> elements.
 * Runs on the HAST tree after remark-rehype.
 */
function rehypeLazyImages(): (tree: HastRoot) => void {
	return (tree: HastRoot) => {
		visit(tree as Parameters<typeof visit>[0], 'element', (node: Element) => {
			if (node.tagName === 'img') {
				node.properties = node.properties ?? {};
				node.properties['loading'] = 'lazy';
				node.properties['decoding'] = 'async';
			}
		});
	};
}

/**
 * Transform [[Link Text]] wikilink syntax into cross-reference hint spans.
 * Runs on the MDAST tree before remark-rehype.
 */
function remarkWikilinks(): (tree: MdastRoot) => void {
	return (tree: MdastRoot) => {
		visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
			if (!node.value.includes('[[') || !parent || index == null) return;

			const parts = node.value.split(/(\[\[[^\]]+\]\])/);
			if (parts.length === 1) return;

			const newNodes = parts
				.filter((p) => p.length > 0)
				.map((part) => {
					const match = /^\[\[([^\]]+)\]\]$/.exec(part);
					if (match) {
						const ref = match[1]
							.replace(/&/g, '&amp;')
							.replace(/"/g, '&quot;')
							.replace(/</g, '&lt;')
							.replace(/>/g, '&gt;');
						return {
							type: 'html' as const,
							value: `<span class="wikilink" title="Cross-reference: ${ref}">${match[1]}</span>`
						};
					}
					return { type: 'text' as const, value: part };
				});

			parent.children.splice(index, 1, ...(newNodes as MdastRoot['children']));
		});
	};
}

// ─── Detection helpers ────────────────────────────────────────────────────────

function detectMathAndCode(tree: MdastRoot): { hasMath: boolean; hasCode: boolean } {
	let hasMath = false;
	let hasCode = false;

	visit(tree, (node) => {
		if (node.type === 'math' || node.type === 'inlineMath') hasMath = true;
		if (node.type === 'code' || node.type === 'inlineCode') hasCode = true;
	});

	return { hasMath, hasCode };
}

function countWords(raw: string): number {
	return raw.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Shiki lazy singleton ─────────────────────────────────────────────────────

let shikiImported = false;

async function ensureShiki() {
	if (!shikiImported) {
		// Lazy-import so Shiki is never in the initial bundle
		const { createHighlighter } = await import('shiki');
		// Store on globalThis so the singleton persists across calls in the browser
		if (!(globalThis as Record<string, unknown>).__marginShiki) {
			(globalThis as Record<string, unknown>).__marginShiki = await createHighlighter({
				themes: ['github-light', 'vitesse-dark'],
				langs: [] // languages loaded on demand per document
			});
		}
		shikiImported = true;
	}
	return (globalThis as Record<string, unknown>).__marginShiki as Awaited<
		ReturnType<typeof import('shiki').createHighlighter>
	>;
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Parse raw Markdown into a `ParsedDoc`.
 * Safe to call in the browser (all imports are lazy or ESM).
 */
export async function parseMarkdown(raw: string): Promise<ParsedDoc> {
	// Collect detection flags and word count from raw text
	const wordCount = countWords(raw);
	const readingTime = Math.ceil(wordCount / 238);

	// Collect code languages for Shiki pre-loading
	const codeLangs: string[] = [];

	// Build processor. We collect flags and langs in the detection pass.
	// We can't easily do two passes with the async Shiki plugin, so we use
	// @shikijs/rehype only if there are code blocks (lazy loaded).
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkFrontmatter, ['yaml'])
		.use(remarkMath)
		.use(remarkSmartypants as Plugin)
		.use(extractTocPlugin)
		.use(extractFrontmatterPlugin)
		.use(remarkWikilinks)
		// Detection plugin — runs at MDAST stage, collects flags
		.use(() => (tree: MdastRoot) => {
			visit(tree, (node) => {
				if (node.type === 'code') {
					const lang = (node as Code).lang;
					if (lang && !codeLangs.includes(lang)) codeLangs.push(lang);
				}
			});
		})
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, {
			behavior: 'append',
			properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
			content: { type: 'text', value: '#' }
		})
		.use(rehypeKatex)
		.use(rehypeLazyImages as unknown as Plugin)
		.use(rehypeStringify, { allowDangerousHtml: true });

	const file = await processor.process(raw);
	const data = file.data as {
		toc?: TocEntry[];
		frontmatter?: Frontmatter;
	};

	// Run detection on the raw tree (separate lightweight pass)
	const detectionTree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(raw);
	const { hasMath, hasCode } = detectMathAndCode(detectionTree as MdastRoot);

	let html = String(file);

	// Apply Shiki syntax highlighting if code blocks are present
	if (hasCode && codeLangs.length > 0) {
		try {
			const highlighter = await ensureShiki();
			// Load any missing languages
			for (const lang of codeLangs) {
				try {
					await highlighter.loadLanguage(lang as Parameters<typeof highlighter.loadLanguage>[0]);
				} catch {
					// Unknown language — skip, Shiki will fall back to plain text
				}
			}
			// Re-process with Shiki using the rehype plugin
			const { default: rehypeShiki } = await import('@shikijs/rehype');
			const shikiProcessor = unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(remarkFrontmatter, ['yaml'])
				.use(remarkMath)
				.use(remarkSmartypants as Plugin)
				.use(extractTocPlugin)
				.use(extractFrontmatterPlugin)
				.use(remarkWikilinks)
				.use(remarkRehype, { allowDangerousHtml: true })
				.use(rehypeSlug)
				.use(rehypeAutolinkHeadings, {
					behavior: 'append',
					properties: { className: ['heading-anchor'], ariaHidden: 'true', tabIndex: -1 },
					content: { type: 'text', value: '#' }
				})
				.use(rehypeKatex)
				.use(rehypeShiki, {
					themes: { light: 'github-light', dark: 'vitesse-dark' },
					defaultColor: false // CRITICAL: emit CSS vars, not hardcoded colors
				})
				.use(rehypeLazyImages as unknown as Plugin)
				.use(rehypeStringify, { allowDangerousHtml: true });

			const shikiFile = await shikiProcessor.process(raw);
			html = String(shikiFile);
		} catch (e) {
			// Shiki failed — use the non-highlighted HTML we already have
			console.warn('[margin] Shiki highlighting failed, using plain code blocks:', e);
		}
	}

	return {
		html,
		toc: data.toc ?? [],
		readingTime,
		frontmatter: data.frontmatter ?? {},
		hasMath,
		hasCode
	};
}
