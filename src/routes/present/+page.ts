export const ssr = false;
export const prerender = false;

import { redirect } from '@sveltejs/kit';
import { readerState } from '$lib/state/reader.svelte.js';

export function load() {
	if (!readerState.doc) {
		throw redirect(307, '/');
	}
}
