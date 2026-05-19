<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { parseMarkdown } from '$lib/markdown.js';
	import { readerState } from '$lib/state/reader.svelte.js';
	import { differState } from '$lib/state/differ.svelte.js';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import MarkdownInput from '$lib/components/input/MarkdownInput.svelte';
	import DiffInput from '$lib/components/input/DiffInput.svelte';

	let error = $state('');
	let showModeDropdown = $state(false);
	let activeMode = $state<'markdown' | 'gitdiff'>('markdown');

	onMount(() => {
		const mode = new URLSearchParams(window.location.search).get('mode');
		if (mode === 'gitdiff') activeMode = 'gitdiff';
	});

	async function handleSubmit(raw: string) {
		error = '';
		try {
			const doc = await parseMarkdown(raw);
			readerState.setDoc(raw, doc);
			goto(resolve('/read/'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to parse document.';
		}
	}

	async function handleDiffSubmit(raw: string) {
		error = '';
		try {
			const { parseDiffRaw } = await import('$lib/diff.js');
			const parsed = await parseDiffRaw(raw);
			differState.setDiff(raw, parsed);
			goto(resolve('/diff/'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to parse diff.';
		}
	}

	$effect(() => {
		if (!showModeDropdown) return;
		function onOutsideClick(e: MouseEvent) {
			if (!(e.target as Element).closest('.mode-selector')) {
				showModeDropdown = false;
			}
		}
		document.addEventListener('click', onOutsideClick);
		return () => document.removeEventListener('click', onOutsideClick);
	});
</script>

<svelte:head>
	<title>Margin</title>
	<meta name="description" content="A reader-first Markdown web application. Paste, upload, or fetch any Markdown and read it in a calm, immersive layout." />
</svelte:head>

<SiteHeader />

<main class="home-main" id="main-content">
	<div class="home-hero">
		<h1 class="hero-title">margin</h1>
		<div class="hero-sub">
			A quiet place to read
			<span class="mode-selector">
				<button
					class="mode-trigger"
					class:open={showModeDropdown}
					onclick={(e) => { e.stopPropagation(); showModeDropdown = !showModeDropdown; }}
					aria-haspopup="true"
					aria-expanded={showModeDropdown}
				>
					{#if activeMode === 'markdown'}
					<span><span class="md-cap">M</span>ark<span class="md-cap">D</span>own</span>
				{:else}
					<span class="trigger-mono"><span class="diff-git">git </span><span class="md-cap">diff</span></span>
				{/if}
					<svg class="trigger-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<polyline points="6 9 12 15 18 9"/>
					</svg>
				</button>
				{#if showModeDropdown}
					<div class="mode-dropdown">
						<button
							class="mode-option"
							class:mode-option--active={activeMode === 'markdown'}
							onclick={() => { activeMode = 'markdown'; showModeDropdown = false; }}
						>
							<span class="option-name option-name--serif"><span class="md-cap">M</span>ark<span class="md-cap">D</span>own</span>
							<span class="option-desc">Read prose, essays &amp; long-form notes</span>
						</button>
						<div class="option-rule" role="separator"></div>
						<button
							class="mode-option"
							class:mode-option--active={activeMode === 'gitdiff'}
							onclick={() => { activeMode = 'gitdiff'; showModeDropdown = false; }}
						>
							<span class="option-name option-name--mono"><span class="diff-git">git </span><span class="md-cap">diff</span></span>
							<span class="option-desc">Read code changes, beautifully</span>
						</button>
					</div>
				{/if}
			</span>.
		</div>
	</div>

	<div class="input-wrap">
		{#if activeMode === 'markdown'}
			<div transition:fade={{ duration: 180 }}>
				<MarkdownInput onSubmit={handleSubmit} />
			</div>
		{:else}
			<div transition:fade={{ duration: 180 }}>
				<DiffInput onSubmit={handleDiffSubmit} />
			</div>
		{/if}
	</div>

	{#if error}
		<p class="home-error" role="alert">{error}</p>
	{/if}
</main>

<style>
	.home-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4rem 1.5rem 6rem;
		gap: 2.5rem;
		min-height: calc(100vh - 3rem);
	}

	.home-hero {
		text-align: center;
	}

	.hero-title {
		font-family: var(--font-serif);
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		color: var(--color-ink);
		margin: 0 0 0.5rem;
	}

	.hero-sub {
		font-size: 1rem;
		color: var(--color-ink-muted);
		margin: 0;
		display: flex;
		align-items: baseline;
		gap: 0.3em;
		flex-wrap: wrap;
		justify-content: center;
	}

	/* ── Mode selector (trigger + dropdown anchor) ── */
	.mode-selector {
		position: relative;
		display: inline-flex;
	}

	.mode-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.2em;
		background: none;
		border: none;
		border-bottom: 1px dashed var(--color-accent);
		padding: 0 0 1px;
		font-size: inherit;
		font-family: var(--font-serif);
		font-style: italic;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: color 200ms ease;
		line-height: inherit;
	}

	.trigger-mono {
		font-family: var(--font-mono);
		font-style: normal;
		font-size: 0.9375em;
	}

	.mode-trigger:hover,
	.mode-trigger.open {
		color: var(--color-ink);
	}

	.mode-trigger:hover .diff-git,
	.mode-trigger.open .diff-git {
		color: var(--color-ink);
	}

	.mode-trigger:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
		border-radius: 2px;
	}

	.md-cap {
		color: var(--color-accent);
	}

	.diff-git {
		color: var(--color-ink-muted);
		transition: color 200ms ease;
	}

	.mode-option:hover .diff-git {
		color: var(--color-ink);
	}

	.trigger-chevron {
		color: var(--color-accent);
		transition: transform 300ms ease;
		flex-shrink: 0;
	}

	.mode-trigger.open .trigger-chevron {
		transform: rotate(180deg);
	}

	/* ── Dropdown card ── */
	.mode-dropdown {
		position: absolute;
		top: calc(100% + 0.875rem);
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 20px;
		padding: 0.5rem;
		box-shadow:
			0 8px 32px oklch(0 0 0 / 0.1),
			0 2px 8px oklch(0 0 0 / 0.06);
		min-width: 300px;
		z-index: 60;
		animation: dropdown-in 220ms cubic-bezier(0.4, 0, 0.2, 1);
		transition: background-color 400ms ease, border-color 400ms ease;
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.mode-option {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.875rem 1.125rem;
		border-radius: 14px;
		width: 100%;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: background-color 200ms ease;
	}

	.mode-option:hover {
		background-color: var(--color-surface-alt);
	}

	.mode-option--active {
		background-color: var(--color-surface-alt);
	}

	.option-name {
		font-size: 1.0625rem;
		font-weight: 500;
		color: var(--color-ink);
		line-height: 1.2;
	}

	.option-name--serif {
		font-family: var(--font-serif);
		font-style: italic;
	}

	.option-name--mono {
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		font-weight: 400;
		font-style: normal;
	}

	/* Inside the dropdown option, "git " should be full ink — not muted */
	.option-name .diff-git {
		color: inherit;
	}

	.option-desc {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		line-height: 1.45;
		transition: color 200ms ease;
	}

	.mode-option:hover .option-desc {
		color: var(--color-ink-muted);
	}

	.option-rule {
		height: 1px;
		background-color: var(--color-border);
		margin: 0.25rem 0.5rem;
		transition: background-color 400ms ease;
	}

	.input-wrap {
		width: 100%;
		max-width: 680px;
	}

	.home-error {
		font-size: 0.875rem;
		color: oklch(0.55 0.18 25);
		text-align: center;
	}
</style>
