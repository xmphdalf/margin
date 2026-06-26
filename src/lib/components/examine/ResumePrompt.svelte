<script lang="ts">
	import { examineState } from '$lib/state/examine.svelte.js';

	interface Props {
		onContinue: () => void;
		onStartFresh: () => void;
	}

	let { onContinue, onStartFresh }: Props = $props();

	const session = $derived(examineState.session!);
	const total = $derived(session.selectedRange.to - session.selectedRange.from + 1);
	const modeLabel = $derived(session.mode.charAt(0).toUpperCase() + session.mode.slice(1));

	const savedAgo = $derived.by(() => {
		if (!session.lastSavedAt) return '';
		const minutes = Math.round((Date.now() - session.lastSavedAt) / 60000);
		if (minutes < 1) return 'just now';
		return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
	});
</script>

<div class="resume-prompt">
	<p class="resume-title">{session.setTitle}</p>
	<p class="resume-detail">
		You were on Q {String(session.currentIndex + 1).padStart(2, '0')} of {total} in "{modeLabel}" mode.
		{#if savedAgo}Last saved {savedAgo}.{/if}
	</p>
	<div class="resume-actions">
		<button class="resume-link" onclick={onContinue}>
			Continue from Q {String(session.currentIndex + 1).padStart(2, '0')}
		</button>
		<button class="resume-link" onclick={onStartFresh}>Start fresh</button>
	</div>
</div>

<style>
	.resume-prompt {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: center;
		padding: 3rem 1.5rem;
	}

	.resume-title {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		color: var(--color-ink);
		margin: 0;
	}

	.resume-detail {
		font-size: 0.9375rem;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.resume-actions {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin-top: 0.5rem;
	}

	.resume-link {
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		color: var(--color-accent);
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.25rem 0.1rem;
		border-bottom: 1px dashed var(--color-accent);
		transition: opacity 200ms ease;
	}

	.resume-link:hover {
		opacity: 0.75;
	}

	.resume-link:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
