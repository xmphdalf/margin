<script lang="ts">
	import { onMount } from 'svelte';
	import { differState } from '$lib/state/differ.svelte.js';
	import { settingsState } from '$lib/state/settings.svelte.js';
	import { themeState } from '$lib/state/theme.svelte.js';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import ProgressBar from '$lib/components/reader/ProgressBar.svelte';
	import DiffView from '$lib/components/diff/DiffView.svelte';
	import DiffToc from '$lib/components/diff/DiffToc.svelte';

	const diff = $derived(differState.parsedDiff);

	let mode = $state<'normal' | 'focus'>('normal');
	let activeFileId = $state('');
	let skimMode = $state(false);
	let showExportMenu = $state(false);

	$effect(() => {
		if (mode === 'focus') showExportMenu = false;
	});

	const pageTitle = $derived(
		diff ? `${diff.files.length} file${diff.files.length !== 1 ? 's' : ''} changed — Margin` : 'Diff — Margin'
	);

	async function handleExportHtml() {
		if (!diff) return;
		showExportMenu = false;
		const { exportDiff } = await import('$lib/export.js');
		await exportDiff(diff, settingsState.value, themeState.current);
	}

	function navigateFile(dir: 1 | -1) {
		if (!diff) return;
		const ids = diff.files.map((f) => f.id);
		const current = ids.indexOf(activeFileId);
		const next = current + dir;
		if (next < 0 || next >= ids.length) return;
		const el = document.getElementById(ids[next]);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
	}

	onMount(() => {
		function handleKey(e: KeyboardEvent) {
			const tag = (e.target as Element).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			if (e.key === 's' || e.key === 'S') {
				e.preventDefault();
				skimMode = !skimMode;
			}
			if (e.key === 'j' || e.key === 'J') navigateFile(1);
			if (e.key === 'k' || e.key === 'K') navigateFile(-1);
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div data-mode={mode} class="diff-shell">
	<ProgressBar />

	<SiteHeader showHomeLink={true}>
		{#snippet tools()}
			<div class="export-wrap">
				<button
					onclick={() => { showExportMenu = !showExportMenu; }}
					aria-label="Export options"
					aria-expanded={showExportMenu}
					class="tool-btn"
					class:active={showExportMenu}
					title="Export"
					disabled={!diff}
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
					</menu>
				{/if}
			</div>
			<button
				onclick={() => { mode = mode === 'focus' ? 'normal' : 'focus'; }}
				aria-label={mode === 'focus' ? 'Exit focus mode' : 'Enter focus mode'}
				aria-pressed={mode === 'focus'}
				class="tool-btn"
				class:active={mode === 'focus'}
				title="Focus mode"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="3"/>
					<path d="M3 12h1m16 0h1M12 3v1m0 16v1"/>
				</svg>
			</button>
		{/snippet}
	</SiteHeader>

	{#if diff}
		<div class="diff-layout">
			<DiffToc files={diff.files} {activeFileId} />
			<DiffView {diff} {activeFileId} {skimMode} onActiveFileChange={(id) => { activeFileId = id; }} />
		</div>
	{/if}

	<div class="key-hints" aria-hidden="true">
		<span>S <span class="hint-label">skim</span></span>
		<span>J <span class="hint-label">next</span></span>
		<span>K <span class="hint-label">prev</span></span>
	</div>
</div>

<style>
	.diff-shell {
		min-height: 100vh;
		background-color: var(--color-surface);
		transition: background-color 400ms ease;
	}

	.diff-layout {
		display: flex;
		gap: 2rem;
		max-width: 1100px;
		margin: 0 auto;
		padding: 3rem 1.5rem 0;
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

	/* Focus mode */
	[data-mode='focus'] :global(.site-header) {
		opacity: 0;
		pointer-events: none;
		transition: opacity 400ms ease;
	}

	[data-mode='focus'] .key-hints {
		opacity: 0;
	}

	/* Keystroke hints */
	.key-hints {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		gap: 1rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		opacity: 0.35;
		pointer-events: none;
		transition: opacity 400ms ease;
		z-index: 10;
	}

	.key-hints:hover {
		opacity: 0.7;
	}

	.hint-label {
		opacity: 0.6;
		margin-left: 0.2em;
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
		min-width: 10rem;
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

	@media (max-width: 720px) {
		.diff-layout {
			flex-direction: column;
			padding-top: 2rem;
		}
	}
</style>
