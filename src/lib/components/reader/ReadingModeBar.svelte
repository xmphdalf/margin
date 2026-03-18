<script lang="ts">
	import { readerState } from '$lib/state/reader.svelte.js';
	import type { ReadingMode } from '$lib/types.js';
	import { onMount } from 'svelte';

	const modes: { id: ReadingMode; label: string; tooltip: string }[] = [
		{ id: 'book', label: 'B', tooltip: 'Book' },
		{ id: 'study', label: 'S', tooltip: 'Study' },
		{ id: 'focus', label: 'F', tooltip: 'Focus' }
	];

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && readerState.mode === 'focus') {
				readerState.setMode('book');
			}
		}
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<nav class="mode-bar" aria-label="Reading mode">
	{#if readerState.mode === 'focus'}
		<span class="esc-hint" aria-label="Press Escape to exit focus mode">Esc</span>
	{/if}
	{#each modes as mode}
		<div class="mode-wrap">
			<button
				onclick={() => readerState.setMode(mode.id)}
				aria-label="{mode.tooltip} mode"
				aria-pressed={readerState.mode === mode.id}
				class="mode-btn"
				class:active={readerState.mode === mode.id}
			>
				{mode.label}
			</button>
			<span class="tooltip" aria-hidden="true">{mode.tooltip}</span>
		</div>
	{/each}
</nav>

<style>
	.mode-bar {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.25rem;
		box-shadow: 0 2px 8px oklch(0 0 0 / 0.08);
		z-index: 30;
		transition: background-color 400ms ease, border-color 400ms ease;
	}

	.mode-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.tooltip {
		position: absolute;
		right: calc(100% + 0.5rem);
		top: 50%;
		transform: translateY(-50%);
		background-color: var(--color-ink);
		color: var(--color-surface);
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transition: opacity 150ms ease;
	}

	.mode-wrap:hover .tooltip {
		opacity: 1;
	}

	.mode-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 6px;
		background: transparent;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: color 200ms ease, background-color 200ms ease;
	}

	.mode-btn:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}

	.mode-btn.active {
		color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.mode-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.esc-hint {
		display: block;
		text-align: center;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--color-ink-muted);
		padding: 0.2rem 0.25rem 0.1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 0.1rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.tooltip {
			transition: none;
		}
	}
</style>
