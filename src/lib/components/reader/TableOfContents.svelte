<script lang="ts">
	import { onMount } from 'svelte';
	import { readerState } from '$lib/state/reader.svelte.js';
	import { scrollToElement } from '$lib/utils/scroll.js';
	import type { TocEntry } from '$lib/types.js';

	interface Props {
		toc: TocEntry[];
	}

	let { toc }: Props = $props();

	onMount(() => {
		if (toc.length === 0) return;

		const headingIds = toc.map((t) => t.id);
		const intersecting = new Map<string, IntersectionObserverEntry>();

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						intersecting.set(e.target.id, e);
					} else {
						intersecting.delete(e.target.id);
					}
				});

				// Pick the topmost intersecting heading
				const sorted = [...intersecting.values()].sort(
					(a, b) => a.boundingClientRect.top - b.boundingClientRect.top
				);

				if (sorted.length > 0) {
					readerState.setActiveHeading(sorted[0].target.id);
				}
			},
			{ rootMargin: '-40% 0px -55% 0px', threshold: 0 }
		);

		// Observe headings in the article
		headingIds.forEach((id) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		// Always clean up — prevents leaks across SvelteKit navigations
		return () => observer.disconnect();
	});
</script>

{#if toc.length > 0}
	<nav class="toc-panel" aria-label="Table of contents">
		<p class="toc-heading">Contents</p>
		<ol class="toc-list" role="list">
			{#each toc as entry}
				<li class="toc-item toc-depth-{entry.depth}">
					<a
						href="#{entry.id}"
						onclick={(e) => { e.preventDefault(); scrollToElement(entry.id); }}
						class="toc-link"
						class:active={readerState.activeHeading === entry.id}
						aria-current={readerState.activeHeading === entry.id ? 'location' : undefined}
					>
						{entry.text}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
{/if}

<style>
	.toc-panel {
		position: sticky;
		top: 3.5rem;
		width: 220px;
		flex-shrink: 0;
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
		padding-right: 1rem;
		align-self: flex-start;
	}

	.toc-heading {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-ink-muted);
		margin: 0 0 0.625rem;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.toc-link {
		display: block;
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--color-ink-muted);
		text-decoration: none;
		padding: 0.2rem 0.5rem;
		border-left: 2px solid transparent;
		border-radius: 0 4px 4px 0;
		transition: color 300ms ease, border-color 300ms ease, background-color 200ms ease;
	}

	.toc-link:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}

	.toc-link.active {
		color: var(--color-accent);
		border-left-color: var(--color-accent);
	}

	/* Indent by heading depth */
	.toc-depth-1 .toc-link { padding-left: 0.5rem; }
	.toc-depth-2 .toc-link { padding-left: 0.5rem; }
	.toc-depth-3 .toc-link { padding-left: 1.25rem; font-size: 0.75rem; }
	.toc-depth-4 .toc-link { padding-left: 2rem; font-size: 0.75rem; }
	.toc-depth-5 .toc-link,
	.toc-depth-6 .toc-link { padding-left: 2.5rem; font-size: 0.75rem; }
</style>
