<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { differState } from '$lib/state/differ.svelte.js';
	import { settingsState } from '$lib/state/settings.svelte.js';
	import { themeState } from '$lib/state/theme.svelte.js';
	import { storageGet, storageSet } from '$lib/utils/storage.js';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import ProgressBar from '$lib/components/reader/ProgressBar.svelte';
	import DiffSynopsis from '$lib/components/diff/DiffSynopsis.svelte';
	import DiffSkimView from '$lib/components/diff/DiffSkimView.svelte';
	import DiffSingleHunk from '$lib/components/diff/DiffSingleHunk.svelte';
	import DiffFileChapter from '$lib/components/diff/DiffFileChapter.svelte';
	import DiffSettingsPanel from '$lib/components/diff/DiffSettingsPanel.svelte';

	const diff = $derived(differState.parsedDiff);

	// ─── View state ───────────────────────────────────────────────────────────────
	type View = 'synopsis' | 'read' | 'skim' | 'single';
	let view = $state<View>('synopsis');
	let singleIdx = $state(0);
	let activeHunkIdx = $state(0);

	// ─── Reader preferences (persisted) ──────────────────────────────────────────
	let softness = $state<'off' | 'soft' | 'strong'>('soft');
	let density = $state<'tight' | 'normal' | 'airy'>('normal');
	let prefixMode = $state<'loud' | 'quiet' | 'bare'>('loud');
	let showSpine = $state(false);
	let showKeystrokes = $state(true);
	let showMarginalia = $state(false);
	let showSettings = $state(false);
	let showExportMenu = $state(false);

	// Per-file marginalia notes (in-memory only)
	let notes = $state<Record<string, string>>({});

	// ─── Computed ─────────────────────────────────────────────────────────────────
	const pageTitle = $derived(
		diff
			? `${diff.meta.title} — xMargin`
			: 'Diff — xMargin'
	);

	const hunkStarts = $derived(
		diff
			? diff.files.map((_, i) =>
					diff.files.slice(0, i).reduce((n, f) => n + f.hunks.length, 0)
			  )
			: ([] as number[])
	);

	const flatHunkCount = $derived(diff ? diff.files.reduce((n, f) => n + f.hunks.length, 0) : 0);

	let spinePercent = $state(0);

	// ─── Persist/restore preferences ─────────────────────────────────────────────
	onMount(() => {
		const saved = storageGet<{
			softness?: 'off' | 'soft' | 'strong';
			density?: 'tight' | 'normal' | 'airy';
			prefixMode?: 'loud' | 'quiet' | 'bare';
			showSpine?: boolean;
			showKeystrokes?: boolean;
			showMarginalia?: boolean;
		}>('xmargin-diff-prefs', {});
		if (saved.softness) softness = saved.softness;
		if (saved.density) density = saved.density;
		if (saved.prefixMode) prefixMode = saved.prefixMode;
		if (typeof saved.showSpine === 'boolean') showSpine = saved.showSpine;
		if (typeof saved.showKeystrokes === 'boolean') showKeystrokes = saved.showKeystrokes;
		if (typeof saved.showMarginalia === 'boolean') showMarginalia = saved.showMarginalia;
	});

	$effect(() => {
		storageSet('xmargin-diff-prefs', {
			softness,
			density,
			prefixMode,
			showSpine,
			showKeystrokes,
			showMarginalia
		});
	});

	// ─── Active hunk tracker (scroll-based, read view only) ──────────────────────
	$effect(() => {
		if (view !== 'read') return;

		function tick() {
			const mid = window.innerHeight * 0.42;
			const hunks = document.querySelectorAll<HTMLElement>('[data-hunk-idx]');
			let best = 0;
			let bestDist = Infinity;
			hunks.forEach((el) => {
				const r = el.getBoundingClientRect();
				const c = r.top + r.height / 2;
				const d = Math.abs(c - mid);
				if (d < bestDist) {
					bestDist = d;
					best = parseInt(el.dataset.hunkIdx ?? '0', 10);
				}
			});
			activeHunkIdx = best;

			// Spine progress
			const h = document.documentElement;
			const max = h.scrollHeight - h.clientHeight;
			spinePercent = max > 0 ? h.scrollTop / max : 0;
		}

		tick();
		window.addEventListener('scroll', tick, { passive: true });
		window.addEventListener('resize', tick);
		return () => {
			window.removeEventListener('scroll', tick);
			window.removeEventListener('resize', tick);
		};
	});

	// ─── Navigate to a hunk by index ─────────────────────────────────────────────
	function navigateHunk(dir: 1 | -1) {
		const next = Math.max(0, Math.min(flatHunkCount - 1, activeHunkIdx + dir));
		const el = document.querySelector<HTMLElement>(`[data-hunk-idx="${next}"]`);
		el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
	onMount(() => {
		function handleKey(e: KeyboardEvent) {
			const tag = (e.target as Element).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;

			if (view === 'read') {
				if (e.key === 'j' || e.key === 'J') {
					e.preventDefault();
					navigateHunk(1);
				} else if (e.key === 'k' || e.key === 'K') {
					e.preventDefault();
					navigateHunk(-1);
				} else if (e.key === 's' || e.key === 'S') {
					e.preventDefault();
					view = 'skim';
				} else if (e.key === 'o' || e.key === 'O') {
					e.preventDefault();
					singleIdx = activeHunkIdx;
					view = 'single';
				} else if (e.key === 'Escape') {
					view = 'synopsis';
				}
			} else if (view === 'skim') {
				if (e.key === 's' || e.key === 'S' || e.key === 'Escape') {
					view = 'read';
				} else if (e.key === 'o' || e.key === 'O') {
					e.preventDefault();
					singleIdx = 0;
					view = 'single';
				}
			} else if (view === 'synopsis') {
				if (e.key === 's' || e.key === 'S') {
					e.preventDefault();
					view = 'skim';
				} else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					view = 'read';
				}
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});


	// Close export menu when settings opens and vice versa
	$effect(() => {
		if (showSettings) showExportMenu = false;
	});
	$effect(() => {
		if (showExportMenu) showSettings = false;
	});

	// Close export menu on outside click
	$effect(() => {
		if (!showExportMenu) return;
		function onOutside(e: MouseEvent) {
			if (!(e.target as Element).closest('.export-wrap')) showExportMenu = false;
		}
		document.addEventListener('click', onOutside);
		return () => document.removeEventListener('click', onOutside);
	});

	// ─── Export ───────────────────────────────────────────────────────────────────
	async function handleExportHtml() {
		if (!diff) return;
		showExportMenu = false;
		const { exportDiff } = await import('$lib/export.js');
		await exportDiff(diff, settingsState.value, themeState.current);
	}


</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div
	class="diff-shell"
	data-softness={softness}
	data-prefix-mode={prefixMode}
	data-density={density}
>
	<ProgressBar />

	<SiteHeader showHomeLink={true} homeLinkLabel="new" homeLinkHref="{base}/?mode=gitdiff">
		{#snippet tools()}
			<!-- Skim toggle -->
			<button
				class="tool-btn"
				class:active={view === 'skim'}
				onclick={() => { view = view === 'skim' ? 'read' : 'skim'; }}
				aria-label={view === 'skim' ? 'Exit skim' : 'Skim view'}
				aria-pressed={view === 'skim'}
				title="Skim (S)"
				disabled={!diff}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h16"/>
				</svg>
			</button>

			<!-- Single-hunk toggle -->
			<button
				class="tool-btn"
				class:active={view === 'single'}
				onclick={() => { view = view === 'single' ? 'read' : 'single'; }}
				aria-label={view === 'single' ? 'Exit one-hunk mode' : 'One hunk at a time'}
				aria-pressed={view === 'single'}
				title="One hunk"
				disabled={!diff}
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="5" y="9" width="14" height="6" rx="1"/>
					<path d="M3 5h18M3 19h18"/>
				</svg>
			</button>

			<!-- Export — same download icon as the reader page -->
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

			<!-- Settings — same circle-arcs icon as the reader page -->
			<button
				onclick={() => { showSettings = !showSettings; }}
				aria-label="Reader settings"
				aria-pressed={showSettings}
				class="tool-btn"
				class:active={showSettings}
				title="Reader settings"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="3"/>
					<path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
				</svg>
			</button>
		{/snippet}
	</SiteHeader>

	<DiffSettingsPanel
		open={showSettings}
		onClose={() => { showSettings = false; }}
		{softness}
		{density}
		{prefixMode}
		{showSpine}
		{showKeystrokes}
		{showMarginalia}
		onSoftness={(v) => { softness = v; }}
		onDensity={(v) => { density = v; }}
		onPrefixMode={(v) => { prefixMode = v; }}
		onShowSpine={(v) => { showSpine = v; }}
		onShowKeystrokes={(v) => { showKeystrokes = v; }}
		onShowMarginalia={(v) => { showMarginalia = v; }}
	/>

	<main class="m-main">
		{#if diff}
			{#if view === 'synopsis'}
				<DiffSynopsis
					{diff}
					onBegin={() => { view = 'read'; }}
					onSkim={() => { view = 'skim'; }}
				/>
			{:else if view === 'skim'}
				<DiffSkimView
					{diff}
					onRead={() => { view = 'read'; }}
				/>
			{:else if view === 'single'}
				<DiffSingleHunk
					{diff}
					idx={singleIdx}
					onIdx={(i) => { singleIdx = i; }}
					onExit={() => { view = 'read'; }}
				/>
			{:else}
				<!-- Read view -->
				<article class="m-read">
					{#each diff.files as file, i (file.id)}
						<DiffFileChapter
							{file}
							hunkStart={hunkStarts[i]}
							{activeHunkIdx}
							{softness}
							{showMarginalia}
							note={notes[file.id] ?? ''}
							onNoteChange={(n) => { notes = { ...notes, [file.id]: n }; }}
						/>
					{/each}

					<div class="m-end" aria-hidden="true">
						<p class="m-end-word">end.</p>
					</div>
				</article>
			{/if}
		{/if}
	</main>

	<!-- Spine: 1px track with scroll position mark on right edge -->
	{#if view === 'read' && showSpine && diff}
		<div class="m-spine" aria-hidden="true">
			<div class="m-spine-track"></div>
			<div class="m-spine-mark" style="top: calc({spinePercent * 100}% - 14px)"></div>
		</div>
	{/if}

	<!-- Keystroke hints — visible on all views except single-hunk (which has its own) -->
	{#if showKeystrokes && diff && view !== 'single'}
		{@const isRead = view === 'read'}
		{@const isSkim = view === 'skim'}
		<div class="m-keys" role="group" aria-label="Keyboard shortcuts">
			<button
				class="m-key"
				class:m-key-on={isSkim}
				onclick={() => { view = isSkim ? 'read' : 'skim'; }}
				aria-pressed={isSkim}
			>
				<kbd>S</kbd><span>skim</span>
			</button>
			<button
				class="m-key"
				onclick={() => { singleIdx = activeHunkIdx; view = 'single'; }}
				disabled={!diff?.files.some(f => f.hunks.length > 0)}
			>
				<kbd>O</kbd><span>one hunk</span>
			</button>
			<button
				class="m-key"
				onclick={() => navigateHunk(1)}
				disabled={!isRead}
			>
				<kbd>J</kbd><span>next</span>
			</button>
			<button
				class="m-key"
				onclick={() => navigateHunk(-1)}
				disabled={!isRead}
			>
				<kbd>K</kbd><span>prev</span>
			</button>
		</div>
	{/if}
</div>

<style>
	.diff-shell {
		min-height: 100vh;
		background-color: var(--color-surface);
		transition: background-color 400ms ease;
		position: relative;

		/* Density: inter-file breathing room */
		--m-breath: 8rem;
	}

	.diff-shell[data-density="tight"]  { --m-breath: 4rem; }
	.diff-shell[data-density="normal"] { --m-breath: 8rem; }
	.diff-shell[data-density="airy"]   { --m-breath: 12rem; }

	/* Prefix mode: controls line background tints and sign visibility */
	.diff-shell[data-prefix-mode="bare"] :global(.m-sign) { opacity: 0 !important; }
	.diff-shell[data-prefix-mode="bare"] :global(.m-line-add) { background: transparent; }
	.diff-shell[data-prefix-mode="bare"] :global(.m-line-del) { background: transparent; }
	.diff-shell[data-prefix-mode="quiet"] :global(.m-line-add) { background: transparent; }
	.diff-shell[data-prefix-mode="quiet"] :global(.m-line-del) { background: transparent; }
	.diff-shell[data-prefix-mode="quiet"] :global(.m-line-add .m-sign) { opacity: 0.55; }
	.diff-shell[data-prefix-mode="quiet"] :global(.m-line-del .m-sign) { opacity: 0.55; }

	.m-main {
		width: 100%;
	}

	/* Read view article */
	.m-read {
		display: block;
		padding-top: 2rem;
	}

	/* End page */
	.m-end {
		min-height: 70vh;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-bottom: 22vh;
	}

	.m-end-word {
		font-family: var(--font-serif);
		font-style: italic;
		color: var(--color-ink-muted);
		opacity: 0.55;
		font-size: 1rem;
		letter-spacing: 0.02em;
		margin: 0;
	}

	/* Spine */
	.m-spine {
		position: fixed;
		top: 4.5rem;
		bottom: 2rem;
		right: 1rem;
		width: 1px;
		pointer-events: none;
		z-index: 5;
	}

	.m-spine-track {
		position: absolute;
		inset: 0;
		background: var(--color-border);
		opacity: 0.45;
	}

	.m-spine-mark {
		position: absolute;
		right: -3px;
		width: 7px;
		height: 28px;
		background: var(--color-accent);
		border-radius: 2px;
		opacity: 0.85;
		transition: top 100ms linear;
	}

	/* Keystroke bar */
	.m-keys {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.375rem;
		background: color-mix(in oklch, var(--color-surface) 92%, transparent);
		backdrop-filter: blur(6px);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		opacity: 0.35;
		transition: opacity 300ms ease, background-color 400ms ease, border-color 400ms ease;
		z-index: 6;
	}

	.m-keys:hover { opacity: 1; }

	.m-key {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.625rem;
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		background: none;
		border: none;
		cursor: pointer;
		transition: color 200ms ease, background-color 200ms ease;
	}

	.m-key:hover { background: var(--color-surface-alt); color: var(--color-ink); }
	.m-key:disabled { opacity: 0.35; cursor: default; }

	.m-key-on {
		color: var(--color-accent);
		background: var(--color-surface-alt);
	}

	.m-key kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		font-size: 0.6875rem;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		background: var(--color-surface);
		color: inherit;
		transition: background-color 400ms ease, border-color 400ms ease;
	}

	/* Header tool buttons */
	.tool-btn {
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
		position: relative;
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

	.tool-btn:disabled {
		opacity: 0.35;
		cursor: default;
	}

	/* Export dropdown — matches the reader page */
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

	@media (max-width: 600px) {
		.m-keys { display: none; }
		.m-spine { display: none; }
	}
</style>
