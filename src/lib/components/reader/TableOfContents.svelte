<script lang="ts">
	import { onMount } from 'svelte';
	import { readerState } from '$lib/state/reader.svelte.js';
	import { scrollToElement } from '$lib/utils/scroll.js';
	import type { TocEntry } from '$lib/types.js';

	interface Props {
		toc: TocEntry[];
	}

	let { toc }: Props = $props();

	let panelEl = $state<HTMLElement | null>(null);

	// Auto-scroll the sidebar panel to keep the active link visible
	$effect(() => {
		const id = readerState.activeHeading;
		if (!id || !panelEl) return;
		const link = panelEl.querySelector<HTMLElement>(`a[href="#${id}"]`);
		if (!link) return;

		// Scroll only within the panel — never affect the page scroll
		const panelTop = panelEl.scrollTop;
		const panelBottom = panelTop + panelEl.clientHeight;
		const linkTop = link.offsetTop;
		const linkBottom = linkTop + link.offsetHeight;

		if (linkTop < panelTop) {
			panelEl.scrollTo({ top: linkTop - 16, behavior: 'smooth' });
		} else if (linkBottom > panelBottom) {
			panelEl.scrollTo({ top: linkBottom - panelEl.clientHeight + 16, behavior: 'smooth' });
		}
	});

	onMount(() => {
		if (toc.length === 0) return;

		const headingIds = toc.map((t) => t.id);

		// Scroll-based active heading: always pick the last heading
		// whose top edge is above 30% of the viewport height.
		// At the bottom of the page, activate the last heading.
		function updateActive() {
			const atBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

			if (atBottom) {
				const last = headingIds[headingIds.length - 1];
				if (last) readerState.setActiveHeading(last);
				return;
			}

			const threshold = window.innerHeight * 0.3;
			let active = headingIds[0];
			for (const id of headingIds) {
				const el = document.getElementById(id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= threshold) {
					active = id;
				} else {
					break;
				}
			}
			if (active) readerState.setActiveHeading(active);
		}

		window.addEventListener('scroll', updateActive, { passive: true });
		updateActive(); // set initial state

		// Section completion: mark a heading complete when it exits through the top
		const completionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (!e.isIntersecting && e.boundingClientRect.top < 0) {
						readerState.markSectionComplete(e.target.id);
					}
				});
			},
			{ rootMargin: '0px 0px -95% 0px', threshold: 0 }
		);

		headingIds.forEach((id) => {
			const el = document.getElementById(id);
			if (el) completionObserver.observe(el);
		});

		return () => {
			window.removeEventListener('scroll', updateActive);
			completionObserver.disconnect();
		};
	});
</script>

{#if toc.length > 0}
	<nav class="toc-panel" aria-label="Table of contents" bind:this={panelEl}>
		<p class="toc-heading">Contents</p>
		<ol class="toc-list" role="list">
			{#each toc as entry}
				<li class="toc-item toc-depth-{entry.depth}">
					<a
						href="#{entry.id}"
						onclick={(e) => { e.preventDefault(); readerState.setActiveHeading(entry.id); scrollToElement(entry.id); }}
						class="toc-link"
						class:active={readerState.activeHeading === entry.id}
						class:completed={readerState.completedSections.has(entry.id)}
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
		top: 3rem; /* below sticky header */
		width: 220px;
		flex-shrink: 0;
		height: calc(100vh - 3rem);
		overflow-y: auto;
		padding: 2rem 1rem 2rem 0;
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

	.toc-link.completed:not(.active) {
		opacity: 0.5;
	}

	/* Indent by heading depth */
	.toc-depth-1 .toc-link { padding-left: 0.5rem; }
	.toc-depth-2 .toc-link { padding-left: 0.5rem; }
	.toc-depth-3 .toc-link { padding-left: 1.25rem; font-size: 0.75rem; }
	.toc-depth-4 .toc-link { padding-left: 2rem; font-size: 0.75rem; }
	.toc-depth-5 .toc-link,
	.toc-depth-6 .toc-link { padding-left: 2.5rem; font-size: 0.75rem; }
</style>
