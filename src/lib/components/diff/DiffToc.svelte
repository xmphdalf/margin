<script lang="ts">
	import { onMount } from 'svelte';
	import type { DiffFile } from '$lib/types.js';

	interface Props {
		files: DiffFile[];
		activeFileId?: string;
	}

	let { files, activeFileId = '' }: Props = $props();

	let panelEl = $state<HTMLElement | null>(null);

	// Auto-scroll sidebar to keep the active file link visible
	$effect(() => {
		const id = activeFileId;
		if (!id || !panelEl) return;
		const link = panelEl.querySelector<HTMLElement>(`a[href="#${id}"]`);
		if (!link) return;
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

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
	}

	// Status dot color via CSS class
	function statusClass(status: DiffFile['status']): string {
		return `status-${status}`;
	}

	// Show only the filename, not the full path
	function basename(path: string): string {
		return path.split('/').pop() ?? path;
	}
</script>

{#if files.length > 0}
	<nav class="toc-panel" aria-label="Files changed" bind:this={panelEl}>
		<p class="toc-heading">Files changed</p>
		<ol class="toc-list" role="list">
			{#each files as file}
				<li class="toc-item">
					<a
						href="#{file.id}"
						onclick={(e) => { e.preventDefault(); scrollTo(file.id); }}
						class="toc-link"
						class:active={activeFileId === file.id}
						class:generated={file.isGenerated}
						aria-current={activeFileId === file.id ? 'location' : undefined}
						title={file.path}
					>
						<span class="status-dot {statusClass(file.status)}" aria-hidden="true"></span>
						<span class="file-name">{basename(file.path)}</span>
					</a>
				</li>
			{/each}
		</ol>
	</nav>
{/if}

<style>
	.toc-panel {
		position: sticky;
		top: 3rem;
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
		display: flex;
		align-items: center;
		gap: 0.4rem;
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
		color: var(--color-ink);
		border-left-color: var(--color-accent);
	}

	.toc-link.generated {
		opacity: 0.45;
	}

	.file-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.status-added    { background-color: var(--diff-add-gutter); }
	.status-deleted  { background-color: var(--diff-del-gutter); }
	.status-modified { background-color: var(--color-accent); }
	.status-renamed  { background-color: var(--color-ink-muted); }
</style>
