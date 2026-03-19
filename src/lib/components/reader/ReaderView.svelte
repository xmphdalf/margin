<script lang="ts">
	import ProseRenderer from './ProseRenderer.svelte';
	import TableOfContents from './TableOfContents.svelte';
	import { readerState } from '$lib/state/reader.svelte.js';
	import type { ParsedDoc } from '$lib/types.js';

	interface Props {
		doc: ParsedDoc;
	}

	let { doc }: Props = $props();

	// Reading time display — "N min read" at start, "N min left" as you scroll
	const readingTimeLabel = $derived.by((): string => {
		const progress = readerState.scrollProgress;
		const total = doc.readingTime;
		if (progress < 0.05) {
			return total === 1 ? '1 min read' : `${total} min read`;
		}
		const remaining = Math.ceil(total * (1 - progress));
		if (remaining <= 0) return 'Done';
		return remaining === 1 ? '1 min left' : `${remaining} min left`;
	});
</script>

<div class="reader-layout" data-mode={readerState.mode}>
	<!-- TOC sidebar (hidden in book/focus mode, visible in study mode) -->
	{#if readerState.mode !== 'focus'}
		<aside class="toc-sidebar" aria-hidden={readerState.mode !== 'study'}>
			<TableOfContents toc={doc.toc} />
		</aside>
	{/if}

	<!-- Main content column -->
	<main class="content-column">
		<!-- Document header from frontmatter -->
		{#if doc.frontmatter.title || doc.frontmatter.author || doc.frontmatter.date}
			<header class="doc-header">
				{#if doc.frontmatter.title}
					<h1 class="doc-title">{doc.frontmatter.title}</h1>
				{/if}
				<div class="doc-meta">
					{#if doc.frontmatter.author}
						<span class="doc-author">{doc.frontmatter.author}</span>
					{/if}
					{#if doc.frontmatter.date}
						<span class="doc-date">{doc.frontmatter.date}</span>
					{/if}
					<span class="reading-time">{readingTimeLabel}</span>
				</div>
			</header>
		{:else}
			<div class="reading-time-solo" aria-label="Estimated reading time">
				{readingTimeLabel}
			</div>
		{/if}

		<ProseRenderer {doc} />
	</main>
</div>

<style>
	.reader-layout {
		display: flex;
		gap: 3rem;
		max-width: 90rem;
		margin: 0 auto;
		padding: 3rem 2rem 8rem;
		align-items: stretch;
	}

	/* TOC sidebar — rendered in DOM for study mode (fixed position, out of flow) */
	.toc-sidebar {
		display: none;
	}

	[data-mode='study'] .toc-sidebar {
		display: block;
	}

	/* Content column — always centered, width from CSS vars (set by AppShell) */
	.content-column {
		flex: 1;
		min-width: 0;
		max-width: var(--prose-measure, 68ch);
		margin: 0 auto;
		align-self: flex-start;
	}

	[data-mode='study'] .content-column {
		margin: 0;
	}

	.doc-header {
		margin-bottom: 3rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}

	.doc-title {
		font-family: var(--font-serif);
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		margin: 0 0 0.75rem;
	}

	.doc-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: 0.875rem;
		color: var(--color-ink-muted);
	}

	.reading-time-solo {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		margin-bottom: 2rem;
	}

	/* Focus mode — hide doc header meta, keep content */
	[data-mode='focus'] .doc-header {
		border-bottom: none;
		padding-bottom: 0;
	}

	@media (max-width: 768px) {
		.reader-layout {
			padding: 1.5rem 1.25rem 6rem;
			gap: 0;
		}

		.toc-sidebar {
			display: none !important;
		}
	}
</style>
