export const ssr = false;
export const prerender = false;

import { redirect } from '@sveltejs/kit';
import { differState } from '$lib/state/differ.svelte.js';
import { storageGet, KEYS } from '$lib/utils/storage.js';

export async function load() {
	if (!differState.parsedDiff) {
		const raw = storageGet<string>(KEYS.diffContent, '');
		if (raw) {
			const { parseDiffRaw } = await import('$lib/diff.js');
			const parsed = await parseDiffRaw(raw);
			differState.setDiff(raw, parsed);
		}
	}
	if (!differState.parsedDiff) {
		throw redirect(307, '/');
	}
}
