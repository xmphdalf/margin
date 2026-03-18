<script lang="ts">
	import { readerState } from '$lib/state/reader.svelte.js';
	import { parseMarkdown } from '$lib/markdown.js';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	interface Slide {
		html: string;
		notes: string;
	}

	let slides = $state<Slide[]>([]);
	let current = $state(0);
	let isFullscreen = $state(false);

	// Parse slides from rawMarkdown on mount
	onMount(async () => {
		const raw = readerState.rawMarkdown;
		if (!raw) return;

		// Split on horizontal rule (slide delimiter)
		const chunks = raw.split(/\n---\n/);

		const parsed = await Promise.all(
			chunks.map(async (chunk) => {
				// Extract speaker notes (<!-- notes: ... --> comments)
				const notesMatch = chunk.match(/<!--\s*notes?:\s*([\s\S]*?)\s*-->/i);
				const notes = notesMatch?.[1]?.trim() ?? '';
				const content = chunk.replace(/<!--\s*notes?:\s*[\s\S]*?\s*-->/gi, '').trim();
				const doc = await parseMarkdown(content);
				return { html: doc.html, notes };
			})
		);

		slides = parsed.filter((s) => s.html.trim().length > 0);
	});

	function prev() {
		if (current > 0) current--;
	}

	function next() {
		if (current < slides.length - 1) current++;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
			e.preventDefault();
			next();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
			e.preventDefault();
			prev();
		} else if (e.key === 'Escape' && isFullscreen) {
			document.exitFullscreen?.();
		}
	}

	async function toggleFullscreen() {
		if (!document.fullscreenElement) {
			await document.documentElement.requestFullscreen();
			isFullscreen = true;
		} else {
			await document.exitFullscreen();
			isFullscreen = false;
		}
	}
</script>

<svelte:head>
	<title>Presentation — Margin</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="present-shell">
	<!-- Minimal top bar -->
	<nav class="present-nav" aria-label="Presentation controls">
		<a href="{base}/read/" class="back-link">← Back to reading</a>
		<div class="nav-center">
			{#if slides.length > 0}
				<span class="slide-count" aria-live="polite">
					{current + 1} / {slides.length}
				</span>
			{/if}
		</div>
		<button onclick={toggleFullscreen} class="fs-btn" aria-label="Toggle fullscreen">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				{#if isFullscreen}
					<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0 2-2h3M3 16h3a2 2 0 0 0 2 2v3"/>
				{:else}
					<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
				{/if}
			</svg>
		</button>
	</nav>

	<!-- Slide area -->
	<main class="slide-area" id="main-content">
		{#if slides.length === 0}
			<div class="loading-state">
				<p>Loading slides…</p>
			</div>
		{:else}
			<div
				class="slide"
				role="region"
				aria-label="Slide {current + 1} of {slides.length}"
			>
				<div class="slide-content prose">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html slides[current].html}
				</div>
			</div>
		{/if}
	</main>

	<!-- Navigation arrows -->
	<div class="slide-nav" aria-label="Slide navigation">
		<button
			onclick={prev}
			disabled={current === 0}
			aria-label="Previous slide"
			class="nav-arrow"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<polyline points="15 18 9 12 15 6"/>
			</svg>
		</button>
		<button
			onclick={next}
			disabled={current === slides.length - 1}
			aria-label="Next slide"
			class="nav-arrow"
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<polyline points="9 18 15 12 9 6"/>
			</svg>
		</button>
	</div>
</div>

<style>
	.present-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: var(--color-surface);
	}

	.present-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.back-link {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		text-decoration: none;
		transition: color 200ms ease;
	}

	.back-link:hover {
		color: var(--color-ink);
	}

	.nav-center {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}

	.slide-count {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
	}

	.fs-btn {
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
		transition: color 200ms ease;
	}

	.fs-btn:hover {
		color: var(--color-ink);
	}

	.slide-area {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3rem 4rem;
		overflow: hidden;
	}

	.loading-state {
		color: var(--color-ink-muted);
		font-size: 0.875rem;
	}

	.slide {
		width: 100%;
		max-width: 800px;
		max-height: 100%;
		overflow-y: auto;
	}

	.slide-content {
		font-size: clamp(1rem, 2vw, 1.5rem);
		line-height: 1.65;
	}

	.slide-nav {
		display: flex;
		justify-content: center;
		gap: 1rem;
		padding: 1rem;
		flex-shrink: 0;
	}

	.nav-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: transparent;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: color 200ms ease, border-color 200ms ease, background-color 200ms ease;
	}

	.nav-arrow:hover:not(:disabled) {
		color: var(--color-ink);
		border-color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.nav-arrow:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.nav-arrow:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
