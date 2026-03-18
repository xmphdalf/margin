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
	import { storageGet, storageSet, KEYS } from '$lib/utils/storage.js';
	import type { Theme, ReaderSettings, Bookmark, ReadingMode } from '$lib/types.js';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// ── Hydrate from localStorage on mount ──────────────────────────────────
	onMount(() => {
		// 1. Theme (already partially applied by anti-flash script in app.html)
		const savedTheme = storageGet<Theme>(KEYS.theme, 'light');
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

		// 5. Remove transition suppression class after first paint
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove('no-transitions');
			});
		});
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
