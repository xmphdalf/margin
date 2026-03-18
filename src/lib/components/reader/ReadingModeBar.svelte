<script lang="ts">
	import { readerState } from '$lib/state/reader.svelte.js';
	import type { ReadingMode } from '$lib/types.js';

	const modes: { id: ReadingMode; label: string; title: string }[] = [
		{ id: 'book', label: 'B', title: 'Book mode — focused reading' },
		{ id: 'study', label: 'S', title: 'Study mode — TOC always visible' },
		{ id: 'focus', label: 'F', title: 'Focus mode — distraction free' }
	];
</script>

<nav class="mode-bar" aria-label="Reading mode">
	{#each modes as mode}
		<button
			onclick={() => readerState.setMode(mode.id)}
			aria-label={mode.title}
			aria-pressed={readerState.mode === mode.id}
			title={mode.title}
			class="mode-btn"
			class:active={readerState.mode === mode.id}
		>
			{mode.label}
		</button>
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
</style>
