<script lang="ts">
	import { readerState } from '$lib/state/reader.svelte.js';
	import { settingsState } from '$lib/state/settings.svelte.js';
	import { themeState } from '$lib/state/theme.svelte.js';
	import { base } from '$app/paths';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import ProgressBar from '$lib/components/reader/ProgressBar.svelte';
	import ReaderView from '$lib/components/reader/ReaderView.svelte';
	import ReadingModeBar from '$lib/components/reader/ReadingModeBar.svelte';
	import BookmarkList from '$lib/components/reader/BookmarkList.svelte';
	import TypographyControls from '$lib/components/settings/TypographyControls.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	const doc = $derived(readerState.doc);

	let showBookmarks = $state(false);
	let showSettings = $state(false);

	// Close panels when focus mode is active
	$effect(() => {
		if (readerState.mode === 'focus') {
			showBookmarks = false;
			showSettings = false;
		}
	});

	const pageTitle = $derived(
		doc?.frontmatter?.title ? `${doc.frontmatter.title} — Margin` : 'Reading — Margin'
	);

	async function handleExport() {
		if (!doc) return;
		const { exportDocument } = await import('$lib/export.js');
		await exportDocument(doc, settingsState.value, themeState.current);
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div data-mode={readerState.mode} class="read-shell">
	<!-- Progress bar — fixed at top -->
	<ProgressBar />

	<!-- Site header — SiteHeader handles the left side; tool buttons slot into header via portal-like approach -->
	<SiteHeader showHomeLink={true}>
		{#snippet tools()}
			<a href="{base}/present/" class="tool-btn" title="Present" aria-label="Presentation mode">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="2" y="3" width="20" height="14" rx="2"/>
					<line x1="8" y1="21" x2="16" y2="21"/>
					<line x1="12" y1="17" x2="12" y2="21"/>
				</svg>
			</a>
			<button
				onclick={handleExport}
				aria-label="Export as HTML"
				class="tool-btn"
				title="Export as HTML"
				disabled={!doc}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
			</button>
			<button
				onclick={() => { showSettings = !showSettings; showBookmarks = false; }}
				aria-label="Typography settings"
				aria-pressed={showSettings}
				class="tool-btn"
				class:active={showSettings}
				title="Typography settings"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="3"/>
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
				</svg>
			</button>
			<button
				onclick={() => { showBookmarks = !showBookmarks; showSettings = false; }}
				aria-label="Bookmarks"
				aria-pressed={showBookmarks}
				class="tool-btn"
				class:active={showBookmarks}
				title="Bookmarks"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
				</svg>
				{#if readerState.bookmarks.length > 0}
					<span class="bookmark-count" aria-label="{readerState.bookmarks.length} bookmarks">
						{readerState.bookmarks.length}
					</span>
				{/if}
			</button>
		{/snippet}
	</SiteHeader>

	<!-- Main reading area -->
	{#if doc}
		<ReaderView {doc} />
	{/if}

	<!-- Reading mode switcher — floating bottom right -->
	<ReadingModeBar />

	<!-- Side panels -->
	<TypographyControls open={showSettings} onClose={() => (showSettings = false)} />
	<BookmarkList open={showBookmarks} onClose={() => (showBookmarks = false)} />
</div>

<style>
	.read-shell {
		min-height: 100vh;
		background-color: var(--color-surface);
		transition: background-color 400ms ease;
	}

	.tool-btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: transparent;
		color: var(--color-ink-muted);
		border-radius: 6px;
		cursor: pointer;
		transition: color 200ms ease, background-color 200ms ease;
	}

	.tool-btn:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}

	.tool-btn.active {
		color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.tool-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.bookmark-count {
		position: absolute;
		top: 0;
		right: 0;
		min-width: 1rem;
		height: 1rem;
		background-color: var(--color-accent);
		color: white;
		font-size: 0.6rem;
		font-weight: 700;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.2rem;
	}

	/* Focus mode: hide all chrome */
	[data-mode='focus'] :global(.site-header) {
		opacity: 0;
		pointer-events: none;
		transition: opacity 400ms ease;
	}

	/* Focus mode: dim mode bar, reveal on hover — Escape also exits */
	[data-mode='focus'] :global(.mode-bar) {
		opacity: 0.2;
		transition: opacity 400ms ease;
	}

	[data-mode='focus'] :global(.mode-bar:hover) {
		opacity: 1;
	}
</style>
