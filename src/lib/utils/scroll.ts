/**
 * Smoothly scroll to a heading by its id.
 * scroll-margin-top on headings handles any fixed header offset.
 */
export function scrollToElement(id: string): void {
	const el = document.getElementById(id);
	if (!el) return;
	el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Returns the current scroll progress as a value between 0 and 1.
 */
export function getScrollProgress(): number {
	const el = document.documentElement;
	const scrollable = el.scrollHeight - el.clientHeight;
	if (scrollable <= 0) return 1;
	return Math.min(1, Math.max(0, el.scrollTop / scrollable));
}
