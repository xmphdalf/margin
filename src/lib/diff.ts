/**
 * Git diff parsing pipeline.
 * Dynamically imported — never in the initial bundle.
 *
 * Steps: parse unified diff → classify files → word-level diff on line pairs
 * → synopsis heuristics → return ParsedDiff.
 */
import type { ParsedDiff, DiffFile, DiffHunk, DiffLine, DiffToken, SynopsisEntry } from './types.js';
import type { Highlighter, BundledLanguage } from 'shiki';

// ─── Generated file patterns ──────────────────────────────────────────────────

const GENERATED: RegExp[] = [
	/package-lock\.json$/,
	/yarn\.lock$/,
	/pnpm-lock\.yaml$/,
	/\.lock$/,
	/\.min\.(js|css)$/,
	/\bdist\//,
	/\bbuild\//,
	/__snapshots__\//,
	/\.snap$/,
	/node_modules\//
];

function isGenerated(path: string): boolean {
	return GENERATED.some((r) => r.test(path));
}

// ─── Anchor slug ──────────────────────────────────────────────────────────────

function slugify(path: string): string {
	return path
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'file';
}

// ─── Word-level diff (custom LCS, no library) ─────────────────────────────────

function tokenize(line: string): string[] {
	return line.match(/\w+|[^\w\s]+|\s+/g) ?? [];
}

function wordDiff(delLine: string, addLine: string): [DiffToken[], DiffToken[]] {
	const a = tokenize(delLine);
	const b = tokenize(addLine);
	const m = a.length;
	const n = b.length;

	// LCS via dynamic programming
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			dp[i][j] =
				a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}

	// Backtrack
	const delTokens: DiffToken[] = [];
	const addTokens: DiffToken[] = [];
	let i = m;
	let j = n;

	while (i > 0 || j > 0) {
		if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
			delTokens.unshift({ value: a[i - 1], changed: false });
			addTokens.unshift({ value: b[j - 1], changed: false });
			i--;
			j--;
		} else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
			addTokens.unshift({ value: b[j - 1], changed: true });
			j--;
		} else {
			delTokens.unshift({ value: a[i - 1], changed: true });
			i--;
		}
	}

	return [delTokens, addTokens];
}

// Pair consecutive del/add lines and annotate with word-level tokens.
function applyWordDiff(lines: DiffLine[]): DiffLine[] {
	const result: DiffLine[] = [];
	let i = 0;

	while (i < lines.length) {
		if (
			lines[i].type === 'deletion' &&
			i + 1 < lines.length &&
			lines[i + 1].type === 'addition'
		) {
			const [delTokens, addTokens] = wordDiff(lines[i].content, lines[i + 1].content);
			result.push({ ...lines[i], tokens: delTokens });
			result.push({ ...lines[i + 1], tokens: addTokens });
			i += 2;
		} else {
			result.push(lines[i]);
			i++;
		}
	}

	return result;
}

// ─── Synopsis heuristics ──────────────────────────────────────────────────────

const RE_FN_ADD = /^\+\s*(export\s+)?(default\s+)?(async\s+)?function\s+(\w+)/;
const RE_FN_DEL = /^-\s*(export\s+)?(default\s+)?(async\s+)?function\s+(\w+)/;
const RE_CLASS_ADD = /^\+\s*(export\s+)?(default\s+)?class\s+(\w+)/;
const RE_CLASS_DEL = /^-\s*(export\s+)?(default\s+)?class\s+(\w+)/;
const RE_IMPORT = /^[+-]\s*(import\s|from\s['"]|require\()/;
const RE_CONFIG = /\.(env|config|rc)(\..*)?$|\.babelrc$|\.eslintrc|tsconfig/i;
const RE_TEST = /\.(test|spec)\.[jt]sx?$|__tests__\//;

function buildNote(file: DiffFile): string | undefined {
	const lines = file.hunks.flatMap((h) =>
		h.lines.map((l) => {
			const p = l.type === 'addition' ? '+' : l.type === 'deletion' ? '-' : ' ';
			return p + l.content;
		})
	);

	for (const line of lines) {
		const m = RE_FN_ADD.exec(line);
		if (m) return `function added: ${m[4]}`;
	}
	for (const line of lines) {
		const m = RE_CLASS_ADD.exec(line);
		if (m) return `class added: ${m[3]}`;
	}
	for (const line of lines) {
		const m = RE_FN_DEL.exec(line);
		if (m) return `function removed: ${m[4]}`;
	}
	for (const line of lines) {
		const m = RE_CLASS_DEL.exec(line);
		if (m) return `class removed: ${m[3]}`;
	}
	if (lines.some((l) => RE_IMPORT.test(l))) return 'dependencies updated';
	if (RE_CONFIG.test(file.path)) return 'config updated';
	if (RE_TEST.test(file.path)) return 'test';

	return undefined;
}

// ─── Language detection ───────────────────────────────────────────────────────

const LANG_MAP: Record<string, string> = {
	ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
	mjs: 'javascript', cjs: 'javascript',
	py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
	java: 'java', kt: 'kotlin', swift: 'swift', cs: 'csharp',
	cpp: 'cpp', c: 'c', h: 'c',
	css: 'css', scss: 'scss', less: 'less',
	html: 'html', svelte: 'svelte', vue: 'vue',
	json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml',
	md: 'markdown', mdx: 'mdx',
	sh: 'bash', bash: 'bash', zsh: 'bash',
	sql: 'sql', graphql: 'graphql',
	dockerfile: 'dockerfile'
};

function detectLang(path: string): string {
	const name = path.split('/').pop() ?? path;
	if (/^dockerfile$/i.test(name)) return 'dockerfile';
	const ext = name.split('.').pop()?.toLowerCase() ?? '';
	return LANG_MAP[ext] ?? 'text';
}

// ─── Shiki singleton (shared with markdown.ts via globalThis) ─────────────────

async function getHighlighter(): Promise<Highlighter> {
	const g = globalThis as Record<string, unknown>;
	if (!g.__marginShiki) {
		const { createHighlighter } = await import('shiki');
		g.__marginShiki = await createHighlighter({
			themes: ['github-light', 'vitesse-dark'],
			langs: []
		});
	}
	return g.__marginShiki as Highlighter;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function parseDiffRaw(raw: string): Promise<ParsedDiff> {
	const { default: parseDiff } = await import('parse-diff');
	const parsed = parseDiff(raw);

	let totalAdditions = 0;
	let totalDeletions = 0;
	const files: DiffFile[] = [];

	for (const pFile of parsed) {
		const to = pFile.to ?? '';
		const from = pFile.from ?? '';

		const path = to === '/dev/null' || to === '' ? from : to;
		const oldPath =
			from && to && from !== to && from !== '/dev/null' && to !== '/dev/null'
				? from
				: undefined;

		let status: DiffFile['status'];
		if (pFile.new || from === '/dev/null') status = 'added';
		else if (pFile.deleted || to === '/dev/null') status = 'deleted';
		else if (oldPath) status = 'renamed';
		else status = 'modified';

		const hunks: DiffHunk[] = pFile.chunks.map((chunk) => {
			const rawLines: DiffLine[] = chunk.changes.map((change) => ({
				type: change.type === 'add' ? 'addition' : change.type === 'del' ? 'deletion' : 'context',
				content: change.content.slice(1) // strip leading +/-/space
			}));
			return { lines: applyWordDiff(rawLines) };
		});

		const file: DiffFile = {
			id: slugify(path),
			path,
			...(oldPath ? { oldPath } : {}),
			status,
			additions: pFile.additions,
			deletions: pFile.deletions,
			isGenerated: isGenerated(path),
			hunks
		};

		totalAdditions += pFile.additions;
		totalDeletions += pFile.deletions;
		files.push(file);
	}

	const synopsis: SynopsisEntry[] = files.map((file) => ({
		fileId: file.id,
		path: file.path,
		status: file.status,
		note: buildNote(file),
		isGenerated: file.isGenerated
	}));

	// ─── Syntax highlighting pass ─────────────────────────────────────────────
	try {
		const highlighter = await getHighlighter();

		// Load all unique languages used in this diff
		const langs = [...new Set(files.map((f) => detectLang(f.path)).filter((l) => l !== 'text'))];
		for (const lang of langs) {
			try {
				await highlighter.loadLanguage(lang as BundledLanguage);
			} catch {
				// Unknown language — skip, lines will fall back to plain text
			}
		}

		// Highlight per-hunk, attach highlightedHtml to non-word-diff lines
		for (const file of files) {
			const lang = detectLang(file.path);
			for (const hunk of file.hunks) {
				const code = hunk.lines.map((l) => l.content).join('\n');
				try {
					const html = highlighter.codeToHtml(code, {
						lang,
						themes: { light: 'github-light', dark: 'vitesse-dark' },
						defaultColor: false
					});
					const lineHtmls = html
						.split('<span class="line">')
						.slice(1)
						.map((chunk) => {
							const end = chunk.lastIndexOf('</span>');
							return end !== -1 ? chunk.slice(0, end) : chunk.trimEnd();
						});
					hunk.lines.forEach((line, i) => {
						if (!line.tokens && lineHtmls[i] !== undefined) {
							line.highlightedHtml = lineHtmls[i];
						}
					});
				} catch {
					// Highlighting failed for this hunk — lines stay as plain text
				}
			}
		}
	} catch {
		// Shiki unavailable — entire diff renders as plain text
	}

	return { files, totalAdditions, totalDeletions, synopsis };
}
