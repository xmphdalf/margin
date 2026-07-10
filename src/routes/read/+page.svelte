<script lang="ts">
	import { onMount } from 'svelte';
	import { readerState } from '$lib/state/reader.svelte.js';
	import { settingsState } from '$lib/state/settings.svelte.js';
	import { themeState } from '$lib/state/theme.svelte.js';
	import { base } from '$app/paths';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import ProgressBar from '$lib/components/reader/ProgressBar.svelte';
	import ReaderSynopsis from '$lib/components/reader/ReaderSynopsis.svelte';
	import ReaderView from '$lib/components/reader/ReaderView.svelte';
	import ReadingModeBar from '$lib/components/reader/ReadingModeBar.svelte';
	import BookmarkList from '$lib/components/reader/BookmarkList.svelte';
	import AnalyticsPanel from '$lib/components/reader/AnalyticsPanel.svelte';
	import TypographyControls from '$lib/components/settings/TypographyControls.svelte';
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';

	const doc = $derived(readerState.doc);

	type View = 'synopsis' | 'read';
	let view = $state<View>('synopsis');

	let showBookmarks = $state(false);
	let showSettings = $state(false);
	let showAnalytics = $state(false);
	let showExportMenu = $state(false);
	let bookmarkSaved = $state(false);

	// Close panels when focus mode is active
	$effect(() => {
		if (readerState.mode === 'focus') {
			showBookmarks = false;
			showSettings = false;
			showAnalytics = false;
			showExportMenu = false;
		}
	});

	function addBookmark() {
		const headingId = readerState.activeHeading;
		if (!headingId || !doc) return;
		const entry = doc.toc.find((e) => e.id === headingId);
		if (!entry) return;
		readerState.addBookmark({
			id: crypto.randomUUID(),
			headingId,
			headingText: entry.text,
			createdAt: Date.now()
		});
		bookmarkSaved = true;
		setTimeout(() => (bookmarkSaved = false), 1500);
	}

	const pageTitle = $derived(
		doc?.frontmatter?.title ? `${doc.frontmatter.title} — xMargin` : 'Reading — xMargin'
	);

	onMount(() => {
		function handleKey(e: KeyboardEvent) {
			const tag = (e.target as Element).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			if (view === 'synopsis' && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault();
				view = 'read';
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	async function handleExportHtml() {
		if (!doc) return;
		showExportMenu = false;
		const { exportDocument } = await import('$lib/export.js');
		await exportDocument(doc, settingsState.value, themeState.current);
	}

	async function handlePrint() {
		if (!doc) return;
		showExportMenu = false;
		const { printDocument } = await import('$lib/export.js');
		await printDocument(doc, settingsState.value, themeState.current);
	}

	async function handleCopy() {
		const raw = readerState.rawMarkdown;
		if (!raw) return;
		showExportMenu = false;
		const { copyToClipboard } = await import('$lib/export.js');
		await copyToClipboard(raw);
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div data-mode={readerState.mode} class="read-shell">
	<!-- Progress bar — fixed at top -->
	<ProgressBar />

	<!-- Site header — SiteHeader handles the left side; tool buttons slot into header via portal-like approach -->
	<SiteHeader showHomeLink={true} homeLinkHref="{base}/?mode=markdown">
		{#snippet tools()}
			<a href="{base}/present/" class="tool-btn" title="Present" aria-label="Presentation mode">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="2" y="3" width="20" height="14" rx="2"/>
					<line x1="8" y1="21" x2="16" y2="21"/>
					<line x1="12" y1="17" x2="12" y2="21"/>
				</svg>
			</a>
			<div class="export-wrap">
				<button
					onclick={() => { showExportMenu = !showExportMenu; }}
					aria-label="Export options"
					aria-expanded={showExportMenu}
					class="tool-btn"
					class:active={showExportMenu}
					title="Export"
					disabled={!doc}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="7 10 12 15 17 10"/>
						<line x1="12" y1="15" x2="12" y2="3"/>
					</svg>
				</button>
				{#if showExportMenu}
					<menu class="export-menu" role="menu">
						<li role="none">
							<button role="menuitem" onclick={handleExportHtml} class="export-item">
								Export HTML
							</button>
						</li>
						<li role="none">
							<button role="menuitem" onclick={handlePrint} class="export-item">
								Print / Save as PDF
							</button>
						</li>
						<li role="none">
							<button role="menuitem" onclick={handleCopy} class="export-item">
								Copy Markdown
							</button>
						</li>
					</menu>
				{/if}
			</div>
			<button
				onclick={() => { showAnalytics = !showAnalytics; showSettings = false; showBookmarks = false; showExportMenu = false; }}
				aria-label="Reading analytics"
				aria-pressed={showAnalytics}
				class="tool-btn"
				class:active={showAnalytics}
				title="Reading analytics"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="20" x2="18" y2="10"/>
					<line x1="12" y1="20" x2="12" y2="4"/>
					<line x1="6" y1="20" x2="6" y2="14"/>
				</svg>
			</button>
			<button
				onclick={() => { showSettings = !showSettings; showBookmarks = false; showAnalytics = false; showExportMenu = false; }}
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
				onclick={addBookmark}
				aria-label={bookmarkSaved ? 'Bookmark saved' : 'Bookmark current section'}
				class="tool-btn"
				class:saved={bookmarkSaved}
				title="Bookmark current section"
				disabled={!doc || !readerState.activeHeading}
			>
				{#if bookmarkSaved}
					<!-- Checkmark — transient saved confirmation -->
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
					</svg>
				{/if}
			</button>
			<button
				onclick={() => { showBookmarks = !showBookmarks; showSettings = false; showAnalytics = false; showExportMenu = false; }}
				aria-label="Bookmarks"
				aria-pressed={showBookmarks}
				class="tool-btn"
				class:active={showBookmarks}
				title="Bookmarks"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="8" y1="6" x2="21" y2="6"/>
					<line x1="8" y1="12" x2="21" y2="12"/>
					<line x1="8" y1="18" x2="21" y2="18"/>
					<line x1="3" y1="6" x2="3.01" y2="6"/>
					<line x1="3" y1="12" x2="3.01" y2="12"/>
					<line x1="3" y1="18" x2="3.01" y2="18"/>
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
		{#if view === 'synopsis'}
			<ReaderSynopsis {doc} onBegin={() => { view = 'read'; }} />
		{:else}
			<ReaderView {doc} />
			<ReadingModeBar />
			<TypographyControls open={showSettings} onClose={() => (showSettings = false)} />
			<BookmarkList open={showBookmarks} onClose={() => (showBookmarks = false)} />
			<AnalyticsPanel open={showAnalytics} onClose={() => (showAnalytics = false)} />
		{/if}
	{/if}
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

	.tool-btn.saved {
		color: oklch(0.55 0.15 145);
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

	@media (hover: none) {
		[data-mode='focus'] :global(.mode-bar) {
			opacity: 0.6;
		}
	}

	.export-wrap {
		position: relative;
	}

	.export-menu {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		box-shadow: 0 4px 16px oklch(0 0 0 / 0.1);
		padding: 0.25rem;
		margin: 0;
		list-style: none;
		z-index: 50;
		min-width: 11rem;
		transition: background-color 400ms ease, border-color 400ms ease;
	}

	.export-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		color: var(--color-ink);
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: background-color 200ms ease;
		white-space: nowrap;
	}

	.export-item:hover {
		background-color: var(--color-surface-alt);
	}

	.export-item:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}
</style>
