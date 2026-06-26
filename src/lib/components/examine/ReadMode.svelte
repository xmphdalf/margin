<script lang="ts">
	import type { Question } from '$lib/types.js';
	import QuestionCard from './QuestionCard.svelte';
	import QuestionOptions from './QuestionOptions.svelte';

	interface Props {
		questions: Question[];
	}

	let { questions }: Props = $props();
</script>

<div class="read-mode">
	<p class="browsing">Browsing {questions.length} question{questions.length === 1 ? '' : 's'}</p>

	{#each questions as question, i}
		{#if i > 0}<div class="rule"></div>{/if}
		<div class="question-block">
			<QuestionCard {question} />
			<QuestionOptions {question} revealed />
		</div>
	{/each}
</div>

<style>
	.read-mode {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.browsing {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.question-block {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.rule {
		height: 1px;
		background-color: var(--color-border);
	}
</style>
