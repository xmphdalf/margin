<script lang="ts">
	import type { CaseStudy } from '$lib/types.js';

	interface Props {
		caseStudy: CaseStudy;
	}

	let { caseStudy }: Props = $props();

	let expanded = $state(false);

	const paragraphs = $derived(
		caseStudy.body
			.split(/\n\s*\n/)
			.map((p) => p.trim())
			.filter(Boolean)
	);
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
			{#each paragraphs as paragraph}
				<p>{paragraph}</p>
			{/each}
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

	.case-study-body p {
		font-size: calc(var(--prose-size, 1.125rem) * 0.875);
		line-height: var(--prose-lh, 1.65);
		color: var(--color-ink-muted);
		margin: 0 0 0.875em;
		/* Long URLs or unbroken tokens in scenario text must never widen the column */
		overflow-wrap: break-word;
	}

	.case-study-body p:last-child {
		margin-bottom: 0;
	}
</style>
