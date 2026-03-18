// This route is client-only — content lives in in-memory state (readerState.doc).
// On hard refresh, state is null → redirect to home.
export const ssr = false;
export const prerender = false;

import { redirect } from '@sveltejs/kit';
import { readerState } from '$lib/state/reader.svelte.js';

export function load() {
	if (!readerState.doc) {
		throw redirect(307, '/');
	}
}
