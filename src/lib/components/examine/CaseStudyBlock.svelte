<script lang="ts">
	import type { CaseStudy } from '$lib/types.js';
	import { renderCaseStudyMarkdown } from '$lib/caseStudyMarkdown.js';

	interface Props {
		caseStudy: CaseStudy;
	}

	let { caseStudy }: Props = $props();

	let expanded = $state(false);

	const html = $derived(renderCaseStudyMarkdown(caseStudy.body));
</script>

<div class="case-study">
	<button class="case-study-toggle" aria-expanded={expanded} onclick={() => (expanded = !expanded)}>
		<svg
			class="chevron"
			class:open={expanded}
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="9 18 15 12 9 6" />
		</svg>
		Case study · {caseStudy.title}
	</button>

	{#if expanded}
		<div class="case-study-body">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</div>
	{/if}
</div>

<style>
	.case-study {
		display: flex;
		flex-direction: column;
	}

	.case-study-toggle {
		display: inline-flex;
		align-items: baseline;
		gap: 0.5rem;
		align-self: flex-start;
		text-align: left;
		max-width: 100%;
		overflow-wrap: break-word;
		min-width: 0;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-ink-muted);
		background: transparent;
		border: none;
		padding: 0.2rem 0;
		cursor: pointer;
		transition: color 300ms ease;
	}

	.case-study-toggle:hover {
		color: var(--color-ink);
	}

	.case-study-toggle:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
	}

	.chevron {
		transition: transform 300ms ease;
		flex-shrink: 0;
		position: relative;
		top: 1px;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.case-study-body {
		margin-top: 0.875rem;
		padding: 0.25rem 0 0.25rem 1rem;
		border-left: 2px solid var(--color-border);
		animation: case-study-in 300ms ease;
	}

	@keyframes case-study-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.case-study-body :global(p) {
		font-size: calc(var(--prose-size, 1.125rem) * 0.875);
		line-height: var(--prose-lh, 1.65);
		color: var(--color-ink-muted);
		margin: 0 0 0.875em;
		/* Long URLs or unbroken tokens in scenario text must never widen the column */
		overflow-wrap: break-word;
	}

	.case-study-body :global(h1),
	.case-study-body :global(h2),
	.case-study-body :global(h3),
	.case-study-body :global(h4) {
		font-size: calc(var(--prose-size, 1.125rem) * 0.9375);
		line-height: var(--prose-lh, 1.65);
		font-weight: 600;
		color: var(--color-ink);
		margin: 1.25em 0 0.5em;
	}

	.case-study-body :global(ul),
	.case-study-body :global(ol) {
		font-size: calc(var(--prose-size, 1.125rem) * 0.875);
		line-height: var(--prose-lh, 1.65);
		color: var(--color-ink-muted);
		margin: 0 0 0.875em;
		padding-left: 1.25em;
	}

	.case-study-body :global(li) {
		margin: 0 0 0.25em;
	}

	.case-study-body :global(li > ul),
	.case-study-body :global(li > ol) {
		margin-top: 0.25em;
		margin-bottom: 0;
	}

	.case-study-body :global(strong) {
		color: var(--color-ink);
		font-weight: 600;
	}

	.case-study-body :global(a) {
		color: var(--color-accent);
	}

	.case-study-body :global(:first-child) {
		margin-top: 0;
	}

	.case-study-body :global(:last-child) {
		margin-bottom: 0;
	}
</style>
