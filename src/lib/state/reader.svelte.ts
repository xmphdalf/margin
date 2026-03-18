/**
 * Reader state — central reactive state shared across all routes.
 *
 * `doc` and `rawMarkdown` are the content source of truth.
 * Home page sets them via setDoc(); /read and /present read them.
 * On hard refresh, the redirect in +page.ts sends the user back to /.
 */
import type { ReadingMode, ParsedDoc, Bookmark } from '$lib/types.js';

let mode = $state<ReadingMode>('book');
let activeHeading = $state<string>('');
let scrollProgress = $state(0); // 0–1
let bookmarks = $state<Bookmark[]>([]);
let rawMarkdown = $state('');
let doc = $state<ParsedDoc | null>(null);

export const readerState = {
	get mode() {
		return mode;
	},
	get activeHeading() {
		return activeHeading;
	},
	get scrollProgress() {
		return scrollProgress;
	},
	get bookmarks() {
		return bookmarks;
	},
	get rawMarkdown() {
		return rawMarkdown;
	},
	get doc() {
		return doc;
	},

	setMode(m: ReadingMode) {
		mode = m;
	},
	setActiveHeading(id: string) {
		activeHeading = id;
	},
	setScrollProgress(v: number) {
		scrollProgress = Math.min(1, Math.max(0, v));
	},
	setDoc(raw: string, parsed: ParsedDoc) {
		rawMarkdown = raw;
		doc = parsed;
	},
	clearDoc() {
		rawMarkdown = '';
		doc = null;
	},

	addBookmark(b: Bookmark) {
		// Prevent duplicates, cap at 100 with oldest evicted first
		const filtered = bookmarks.filter((x) => x.id !== b.id);
		bookmarks = [...filtered, b].slice(-100);
	},
	removeBookmark(id: string) {
		bookmarks = bookmarks.filter((b) => b.id !== id);
	},
	setBookmarks(bs: Bookmark[]) {
		bookmarks = bs;
	}
};
