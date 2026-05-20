<script lang="ts">
	import type { ParsedDoc } from '$lib/types.js';

	interface Props {
		doc: ParsedDoc;
		onBegin: () => void;
	}

	let { doc, onBegin }: Props = $props();

	const title = $derived(
		(doc.frontmatter.title as string | undefined) ||
		doc.toc.find(e => e.depth === 1)?.text ||
		'Untitled'
	);

	const author = $derived(doc.frontmatter.author as string | undefined);
	const date = $derived(doc.frontmatter.date as string | undefined);
	const description = $derived(doc.frontmatter.description as string | undefined);

	// h1 and h2 only, cap at 10
	const sections = $derived(doc.toc.filter(e => e.depth <= 2).slice(0, 10));
	const hasSections = $derived(sections.length > 1);

	const wordStr = $derived(
		doc.wordCount >= 1000
			? `${(doc.wordCount / 1000).toFixed(1)}k`
			: String(doc.wordCount)
	);

	const note = $derived(
		description ||
		(hasSections
			? `${wordStr} words across ${sections.length} sections.`
			: `${wordStr} words.`)
	);
</script>

<section class="m-syn" aria-label="Document overview">
	<div class="m-syn-eyebrow">
		<span>markdown</span>
		<span class="m-dot" aria-hidden="true">·</span>
		<span>{wordStr} words</span>
	</div>

	<h1 class="m-syn-title">{title}</h1>

	<div class="m-syn-meta">
		{#if author}
			<span class="m-syn-author">{author}</span>
			<span class="m-dot" aria-hidden="true">·</span>
		{/if}
		{#if date}
			<span class="m-syn-date">{date}</span>
			<span class="m-dot" aria-hidden="true">·</span>
		{/if}
		<span class="m-breath">~{doc.readingTime} min read</span>
	</div>

	<p class="m-syn-note">{note}</p>

	{#if hasSections}
		<div class="m-syn-toc">
			<div class="m-syn-toc-label">in this read</div>
			<ol class="m-syn-list">
				{#each sections as entry, i}
					<li class:indent={entry.depth === 2}>
						<span class="m-syn-n">{String(i + 1).padStart(2, '0')}</span>
						<span class="m-syn-p">{entry.text}</span>
					</li>
				{/each}
			</ol>
		</div>
	{/if}

	<div class="m-syn-acts">
		<button class="m-syn-go" onclick={onBegin}>
			begin reading <span aria-hidden="true">↓</span>
		</button>
	</div>
</section>

<style>
	.m-syn {
		max-width: 38rem;
		margin: 8rem auto 0;
		padding: 0 2rem 14rem;
		animation: m-rise 700ms ease both;
	}

	@keyframes m-rise {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.m-syn-eyebrow {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		letter-spacing: 0.02em;
		margin-bottom: 0.75rem;
	}

	.m-dot {
		color: var(--color-ink-muted);
		opacity: 0.5;
	}

	.m-syn-title {
		font-family: var(--font-serif);
		font-weight: 500;
		font-size: clamp(2rem, 4vw, 2.75rem);
		letter-spacing: -0.02em;
		line-height: 1.15;
		margin: 0 0 0.5rem;
		color: var(--color-ink);
		text-wrap: balance;
	}

	.m-syn-meta {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
		color: var(--color-ink-muted);
		font-size: 0.9rem;
		margin-bottom: 3rem;
	}

	.m-breath {
		font-family: var(--font-serif);
		font-style: italic;
	}

	.m-syn-author,
	.m-syn-date {
		font-family: var(--font-serif);
		font-style: italic;
	}

	.m-syn-note {
		font-family: var(--font-serif);
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--color-ink);
		margin: 0 0 4rem;
		text-wrap: pretty;
	}

	.m-syn-toc-label {
		font-family: var(--font-sans);
		text-transform: lowercase;
		letter-spacing: 0.06em;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		margin-bottom: 1rem;
	}

	.m-syn-list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--color-border);
	}

	.m-syn-list li {
		display: grid;
		grid-template-columns: 2.5rem 1fr;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.875rem 0;
		border-bottom: 1px solid var(--color-border);
		transition: border-color 400ms ease;
	}

	.m-syn-list li.indent {
		padding-left: 1.25rem;
		opacity: 0.7;
	}

	.m-syn-n {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}

	.m-syn-p {
		font-family: var(--font-serif);
		font-size: 0.9375rem;
		color: var(--color-ink);
		word-break: break-word;
	}

	.m-syn-acts {
		margin-top: 3.5rem;
		display: flex;
		gap: 2rem;
		align-items: baseline;
	}

	.m-syn-go {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		color: var(--color-accent);
		border-bottom: 1px dashed var(--color-accent);
		padding-bottom: 2px;
		background: none;
		border-top: none;
		border-left: none;
		border-right: none;
		cursor: pointer;
		transition: opacity 200ms ease;
	}

	.m-syn-go:hover { opacity: 0.7; }

	.m-syn-go:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 3px;
		border-radius: 2px;
	}

	@media (max-width: 600px) {
		.m-syn {
			margin-top: 4rem;
			padding: 0 1.25rem 8rem;
		}
	}
</style>
