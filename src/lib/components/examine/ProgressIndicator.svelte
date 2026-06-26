<script lang="ts">
	interface Props {
		count: number;
		currentIndex: number;
		answeredIndices: Set<number>;
	}

	let { count, currentIndex, answeredIndices }: Props = $props();
</script>

<div
	class="progress-bar"
	role="progressbar"
	aria-valuenow={currentIndex + 1}
	aria-valuemin={1}
	aria-valuemax={count}
	aria-label="Question {currentIndex + 1} of {count}"
>
	{#each { length: count } as _, i}
		<span class="progress-dot" class:answered={answeredIndices.has(i)} class:current={i === currentIndex}></span>
	{/each}
</div>

<style>
	.progress-bar {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.progress-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-border);
		transition: background-color 200ms ease, transform 200ms ease;
	}

	.progress-dot.answered {
		background: var(--color-accent);
	}

	.progress-dot.current {
		background: var(--color-ink);
		transform: scale(1.3);
		box-shadow: 0 0 0 3px var(--color-surface), 0 0 0 5px var(--color-ink);
	}
</style>
