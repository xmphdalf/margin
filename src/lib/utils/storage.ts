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

/** Namespaced storage keys — all margin data lives under 'margin-*' */
export const KEYS = {
	theme: 'margin-theme',
	settings: 'margin-settings-v1',
	bookmarks: 'margin-bookmarks',
	mode: 'margin-mode'
} as const;
