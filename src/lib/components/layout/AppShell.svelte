<script lang="ts">
	/**
	 * AppShell — the hydration and persistence hub.
	 *
	 * ALL browser API access (localStorage, document) lives here.
	 * State modules hold only reactive values; effects run here.
	 */
	import { onMount } from 'svelte';
	import { themeState } from '$lib/state/theme.svelte.js';
	import { settingsState, DEFAULT_SETTINGS, MEASURE_MAP } from '$lib/state/settings.svelte.js';
	import { readerState } from '$lib/state/reader.svelte.js';
	import { analyticsState } from '$lib/state/analytics.svelte.js';
	import { storageGet, storageSet, KEYS, hashDoc, purgeExpiredPositions } from '$lib/utils/storage.js';
	import { getScrollProgress } from '$lib/utils/scroll.js';
	import type { Theme, ReaderSettings, Bookmark, ReadingMode, ReadingPosition } from '$lib/types.js';
	import type { ReadingSession } from '$lib/state/analytics.svelte.js';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// ── Hydrate from localStorage on mount ──────────────────────────────────
	onMount(() => {
		// 1. Theme — fall back to system preference when no stored value exists
		const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		const savedTheme = storageGet<Theme | null>(KEYS.theme, null) ?? systemTheme;
		themeState.set(savedTheme);

		// 2. Settings
		const savedSettings = storageGet<Partial<ReaderSettings>>(KEYS.settings, {});
		settingsState.update({ ...DEFAULT_SETTINGS, ...savedSettings });

		// 3. Bookmarks
		const savedBookmarks = storageGet<Bookmark[]>(KEYS.bookmarks, []);
		readerState.setBookmarks(savedBookmarks);

		// 4. Reading mode
		const savedMode = storageGet<ReadingMode>(KEYS.mode, 'book');
		readerState.setMode(savedMode);

		// 5. Restore reading position for current document (if any)
		const raw = readerState.rawMarkdown;
		if (raw) {
			const hash = hashDoc(raw);
			const pos = storageGet<ReadingPosition | null>(KEYS.position(hash), null);
			if (pos && Date.now() - pos.savedAt < 90 * 24 * 60 * 60 * 1000) {
				requestAnimationFrame(() => {
					window.scrollTo({ top: pos.scrollY, behavior: 'instant' });
				});
			}
		}

		// 6. Purge expired positions at idle
		if ('requestIdleCallback' in window) {
			requestIdleCallback(purgeExpiredPositions);
		} else {
			setTimeout(purgeExpiredPositions, 2000);
		}

		// 7. Track scroll progress + save reading position on scroll
		let saveTimer: ReturnType<typeof setTimeout>;
		function handleScroll() {
			// Always update scroll progress in state (for "N min left", etc.)
			readerState.setScrollProgress(getScrollProgress());

			// Debounced position persistence
			clearTimeout(saveTimer);
			saveTimer = setTimeout(() => {
				const currentRaw = readerState.rawMarkdown;
				if (!currentRaw) return;
				const pos: ReadingPosition = {
					scrollY: window.scrollY,
					headingId: readerState.activeHeading,
					savedAt: Date.now()
				};
				storageSet(KEYS.position(hashDoc(currentRaw)), pos);
			}, 1000);
		}
		window.addEventListener('scroll', handleScroll, { passive: true });

		// 8. Analytics — load saved sessions; start/end sessions on doc changes
		const savedSessions = storageGet<ReadingSession[]>('margin-analytics-v1', []);
		analyticsState.setSessions(savedSessions);

		// Start a session if a doc is already loaded
		const currentRawForAnalytics = readerState.rawMarkdown;
		if (currentRawForAnalytics) {
			analyticsState.startSession(hashDoc(currentRawForAnalytics));
		}

		// End session when page hides (tab switch, close)
		function handlePageHide() {
			analyticsState.endSession();
			storageSet('margin-analytics-v1', analyticsState.sessions);
		}
		window.addEventListener('pagehide', handlePageHide);

		// 9. Remove no-transitions class after first paint
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove('no-transitions');
			});
		});

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('pagehide', handlePageHide);
			clearTimeout(saveTimer);
		};
	});

	// ── Persist theme changes ────────────────────────────────────────────────
	$effect(() => {
		const t = themeState.current;
		storageSet(KEYS.theme, t);
		document.documentElement.setAttribute('data-theme', t);
		if (t === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	// ── Persist settings changes ─────────────────────────────────────────────
	$effect(() => {
		storageSet(KEYS.settings, settingsState.value);
	});

	// ── Persist bookmarks changes ────────────────────────────────────────────
	$effect(() => {
		storageSet(KEYS.bookmarks, readerState.bookmarks);
	});

	// ── Persist reading mode changes ─────────────────────────────────────────
	$effect(() => {
		storageSet(KEYS.mode, readerState.mode);
	});

	// ── Persist analytics sessions ───────────────────────────────────────────
	$effect(() => {
		if (analyticsState.sessions.length > 0) {
			storageSet('margin-analytics-v1', analyticsState.sessions);
		}
	});

	// ── Computed CSS vars from settings ─────────────────────────────────────
	const shellStyle = $derived(
		[
			`--prose-size: ${settingsState.value.fontSize}rem`,
			`--prose-lh: ${settingsState.value.lineHeight}`,
			`--prose-measure: ${MEASURE_MAP[settingsState.value.measure]}`,
			`font-family: ${settingsState.value.fontFamily === 'serif' ? 'var(--font-serif)' : 'var(--font-sans)'}`
		].join('; ')
	);
</script>

<!-- Skip to content link for keyboard / screen reader users -->
<a href="#main-content" class="sr-only focus:not-sr-only skip-link">
	Skip to content
</a>

<div style={shellStyle} class="app-shell">
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.skip-link {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		z-index: 9999;
		padding: 0.5rem 1rem;
		background-color: var(--color-accent);
		color: white;
		border-radius: 4px;
		text-decoration: none;
		font-size: 0.875rem;
	}

	.app-shell {
		min-height: 100vh;
		background-color: var(--color-surface);
		color: var(--color-ink);
	}
</style>
