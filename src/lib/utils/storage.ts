/**
 * Safe localStorage wrappers — all calls are SSR-guarded and try/catch
 * wrapped (Safari Private Browsing throws on setItem).
 */

export function storageGet<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try {
		const v = localStorage.getItem(key);
		return v !== null ? (JSON.parse(v) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function storageSet(key: string, value: unknown): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Safari private mode, storage quota exceeded — fail silently
	}
}

export function storageRemove(key: string): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(key);
	} catch {}
}

/** Namespaced storage keys — all xmargin data lives under 'xmargin-*' */
export const KEYS = {
	theme: 'xmargin-theme',
	settings: 'xmargin-settings-v1',
	bookmarks: 'xmargin-bookmarks',
	mode: 'xmargin-mode',
	content: 'xmargin-content-v1',
	diffContent: 'xmargin-diff-v1',
	examineSet: 'xmargin-examine-set-v1',
	examineSession: 'xmargin-examine-session-v1',
	position: (hash: string) => `xmargin-position-${hash}`
} satisfies Record<string, string | ((hash: string) => string)>;

/**
 * djb2 hash of raw Markdown text — used to key reading positions per document.
 * Returns a base-36 string.
 */
export function hashDoc(raw: string): string {
	let h = 5381;
	for (let i = 0; i < raw.length; i++) {
		h = ((h << 5) + h) ^ raw.charCodeAt(i);
	}
	return (h >>> 0).toString(36);
}

/**
 * Purge reading-position entries older than 90 days.
 * Safe to call at idle — fails silently if localStorage is unavailable.
 */
export function purgeExpiredPositions(): void {
	if (typeof window === 'undefined') return;
	try {
		const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
		const toRemove: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith('xmargin-position-')) {
				const raw = localStorage.getItem(key);
				if (raw) {
					const pos = JSON.parse(raw) as { savedAt?: number };
					if (!pos.savedAt || pos.savedAt < cutoff) toRemove.push(key);
				}
			}
		}
		toRemove.forEach((k) => localStorage.removeItem(k));
	} catch {}
}
