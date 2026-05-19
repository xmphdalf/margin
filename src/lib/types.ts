export type Theme = 'light' | 'dark' | 'sepia';
export type ReadingMode = 'book' | 'focus' | 'study' | 'story';
export type FontFamily = 'serif' | 'sans';
export type Measure = 'narrow' | 'default' | 'wide';

export interface TocEntry {
	id: string;
	text: string;
	depth: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface Frontmatter {
	title?: string;
	author?: string;
	date?: string;
	description?: string;
	[key: string]: unknown;
}

export interface ParsedDoc {
	html: string;
	toc: TocEntry[];
	/** Math.ceil(wordCount / 238) */
	readingTime: number;
	wordCount: number;
	frontmatter: Frontmatter;
	hasMath: boolean;
	hasCode: boolean;
}

export interface ReaderSettings {
	/** rem value, e.g. 1.125 = 18px */
	fontSize: number;
	fontFamily: FontFamily;
	/** e.g. 1.75 */
	lineHeight: number;
	/** maps to 60ch / 68ch / 80ch */
	measure: Measure;
}

export interface Bookmark {
	id: string;
	headingId: string;
	headingText: string;
	createdAt: number;
}

export interface ReadingPosition {
	scrollY: number;
	headingId: string;
	savedAt: number;
}

// ─── Git Diff types ───────────────────────────────────────────────────────────

export interface DiffMeta {
	/** Derived title: filename, short list, or "N files changed" */
	title: string;
	/** Estimated reading time, e.g. "~4 min" */
	breath: string;
	/** One-sentence prose summary of the overall change set */
	editorsNote: string;
}

export interface ParsedDiff {
	files: DiffFile[];
	totalAdditions: number;
	totalDeletions: number;
	synopsis: SynopsisEntry[];
	meta: DiffMeta;
}

export interface DiffFile {
	id: string;
	path: string;
	oldPath?: string;
	status: 'added' | 'deleted' | 'modified' | 'renamed';
	additions: number;
	deletions: number;
	isGenerated: boolean;
	/** Prose sentence describing what changed in this file */
	synopsis: string;
	hunks: DiffHunk[];
}

export interface DiffHunk {
	/** The @@ ... @@ context line, cleaned of @@ markers */
	header: string;
	lines: DiffLine[];
}

export interface DiffLine {
	type: 'context' | 'addition' | 'deletion';
	content: string;
	/** Old file line number (present on context and deletion lines) */
	oldLine?: number;
	/** New file line number (present on context and addition lines) */
	newLine?: number;
	tokens?: DiffToken[];
	highlightedHtml?: string;
}

export interface DiffToken {
	value: string;
	changed: boolean;
}

export interface SynopsisEntry {
	fileId: string;
	path: string;
	status: DiffFile['status'];
	note?: string;
	isGenerated: boolean;
}
