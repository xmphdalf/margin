<script lang="ts">
	import type { ParsedDiff } from '$lib/types.js';

	interface Props {
		diff: ParsedDiff;
	}

	let { diff }: Props = $props();

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
	}

	function basename(path: string): string {
		return path.split('/').pop() ?? path;
	}

	function dirname(path: string): string {
		const parts = path.split('/');
		return parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
	}

	const statusLabel: Record<string, string> = {
		added: 'added',
		deleted: 'deleted',
		renamed: 'renamed',
		modified: ''
	};
</script>

<div class="synopsis">
	<p class="synopsis-summary">
		<span class="summary-count">{diff.files.length} file{diff.files.length !== 1 ? 's' : ''}</span>
		<span class="summary-sep">·</span>
		<span class="summary-add">+{diff.totalAdditions}</span>
		<span class="summary-sep">·</span>
		<span class="summary-del">−{diff.totalDeletions}</span>
	</p>

	<ol class="synopsis-list" role="list">
		{#each diff.synopsis as entry}
			<li class="synopsis-entry" class:generated={entry.isGenerated}>
				<a
					href="#{entry.fileId}"
					onclick={(e) => { e.preventDefault(); scrollTo(entry.fileId); }}
					class="entry-path"
				>
					<span class="entry-dir">{dirname(entry.path)}</span><span class="entry-name">{basename(entry.path)}</span>
				</a>
				{#if statusLabel[entry.status]}
					<span class="entry-status status-{entry.status}">{statusLabel[entry.status]}</span>
				{/if}
				{#if entry.note}
					<span class="entry-note">{entry.note}</span>
				{/if}
				{#if entry.isGenerated}
					<span class="entry-generated">auto-generated</span>
				{/if}
			</li>
		{/each}
	</ol>
</div>

<style>
	.synopsis {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--color-border);
	}

	.synopsis-summary {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		font-size: 0.9375rem;
		margin: 0 0 1.25rem;
		color: var(--color-ink-muted);
	}

	.summary-count {
		font-weight: 600;
		color: var(--color-ink);
	}

	.summary-sep {
		opacity: 0.4;
	}

	.summary-add {
		color: var(--diff-add-gutter);
		font-weight: 500;
	}

	.summary-del {
		color: var(--diff-del-gutter);
		font-weight: 500;
	}

	.synopsis-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.synopsis-entry {
		display: flex;
		align-items: baseline;
		gap: 0.625rem;
		padding: 0.3rem 0;
		flex-wrap: wrap;
	}

	.synopsis-entry.generated {
		opacity: 0.45;
	}

	.entry-path {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-ink);
		text-decoration: none;
		transition: color 200ms ease;
	}

	.entry-path:hover {
		color: var(--color-accent);
	}

	.entry-dir {
		color: var(--color-ink-muted);
	}

	.entry-name {
		color: var(--color-ink);
	}

	.entry-status {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 0.1em 0.5em;
		border-radius: 100px;
		border: 1px solid currentColor;
		line-height: 1.6;
	}

	.status-added   { color: var(--diff-add-gutter); }
	.status-deleted { color: var(--diff-del-gutter); }
	.status-renamed { color: var(--color-ink-muted); }

	.entry-note {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		font-style: italic;
		font-family: var(--font-serif);
	}

	.entry-generated {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		font-style: italic;
	}
</style>
