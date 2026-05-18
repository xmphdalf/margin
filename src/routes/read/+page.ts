// This route is client-only — content lives in in-memory state (readerState.doc).
// On hard refresh, attempts to restore from localStorage before redirecting home.
export const ssr = false;
export const prerender = false;

import { redirect } from '@sveltejs/kit';
import { readerState } from '$lib/state/reader.svelte.js';
import { storageGet, KEYS } from '$lib/utils/storage.js';

export async function load() {
	if (!readerState.doc) {
		const raw = storageGet<string>(KEYS.content, '');
		if (raw) {
			const { parseMarkdown } = await import('$lib/markdown.js');
			const parsed = await parseMarkdown(raw);
			readerState.setDoc(raw, parsed);
		}
	}
	if (!readerState.doc) {
		throw redirect(307, '/');
	}
}
