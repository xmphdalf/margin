// This route is client-only — content lives in in-memory state (examineState).
// On hard refresh, attempts to restore a question set + session from localStorage
// before redirecting home, mirroring /read's +page.ts exactly.
export const ssr = false;
export const prerender = false;

import { redirect } from '@sveltejs/kit';
import { examineState } from '$lib/state/examine.svelte.js';
import { storageGet, KEYS } from '$lib/utils/storage.js';
import type { ExamineSession } from '$lib/types.js';

export async function load(): Promise<{ restored: boolean }> {
	let restored = false;

	if (!examineState.questionSet) {
		const raw = storageGet<string>(KEYS.examineSet, '');
		if (raw) {
			try {
				const { parseQuestionSet } = await import('$lib/examine.js');
				const qs = parseQuestionSet(raw);

				const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
				const session = storageGet<ExamineSession | null>(KEYS.examineSession, null);
				const hasProgress =
					!!session && Object.keys(session.answers).length + session.currentIndex > 0;

				if (session && session.lastSavedAt && session.lastSavedAt >= cutoff) {
					examineState.restoreSession(raw, qs, session);
					restored = hasProgress && !session.finishedAt;
				} else {
					examineState.setQuestionSet(raw, qs);
				}
			} catch {
				// Stored set no longer parses (schema changed, corrupted) — fall through to redirect.
			}
		}
	}

	if (!examineState.questionSet) {
		throw redirect(307, '/');
	}

	return { restored };
}
