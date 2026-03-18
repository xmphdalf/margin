/**
 * URL utilities for the URL fetch input panel.
 */

export function isValidUrl(s: string): boolean {
	try {
		const url = new URL(s);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Auto-convert github.com blob URLs to raw.githubusercontent.com equivalents.
 * github.com/<user>/<repo>/blob/<ref>/<path> → raw.githubusercontent.com/<user>/<repo>/<ref>/<path>
 */
export function normalizeGitHubUrl(url: string): string {
	try {
		const u = new URL(url);
		if (u.hostname === 'github.com') {
			// /user/repo/blob/ref/path/to/file.md
			const match = u.pathname.match(/^\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
			if (match) {
				return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}`;
			}
		}
	} catch {}
	return url;
}

/**
 * Fetch Markdown from a public URL.
 * Throws with a user-friendly message on failure.
 */
export async function fetchMarkdown(url: string): Promise<string> {
	const normalized = normalizeGitHubUrl(url);
	let res: Response;
	try {
		res = await fetch(normalized);
	} catch {
		throw new Error('Network error — could not reach that URL.');
	}
	if (!res.ok) {
		throw new Error(`Request failed: HTTP ${res.status} ${res.statusText}`);
	}
	const text = await res.text();
	if (text.trim().length === 0) {
		throw new Error('The URL returned an empty document.');
	}
	return text;
}
