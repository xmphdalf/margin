<script lang="ts">
	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="question-frame">
	{@render children()}
</div>

<style>
	.question-frame {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 2rem;
		animation: question-in 300ms ease-out;
	}

	@keyframes question-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
