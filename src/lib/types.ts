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
