<script lang="ts">
	import { untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { DiffFile, DiffLine, DiffToken } from '$lib/types.js';

	interface Props {
		file: DiffFile;
		activeFileId?: string;
		skimMode?: boolean;
	}

	let { file, activeFileId = '', skimMode = false }: Props = $props();

	let expanded = $state(untrack(() => !file.isGenerated));

	function basename(path: string): string {
		return path.split('/').pop() ?? path;
	}

	function dirname(path: string): string {
		const parts = path.split('/');
		return parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
	}

	// Total changed lines across all hunks
	const changedCount = $derived(
		file.hunks.reduce(
			(acc, hunk) => acc + hunk.lines.filter((l) => l.type !== 'context').length,
			0
		)
	);

	function lineClass(line: DiffLine): string {
		if (line.type === 'addition') return 'diff-line diff-line-addition';
		if (line.type === 'deletion') return 'diff-line diff-line-deletion';
		return 'diff-line diff-line-context';
	}
</script>

<section
	class="file-chapter"
	class:inactive={!!activeFileId && activeFileId !== file.id}
	id={file.id}
	aria-label="File: {file.path}"
>
	<header class="file-header">
		<div class="file-title">
			{#if file.status === 'renamed' && file.oldPath}
				<span class="file-dir">{dirname(file.oldPath)}</span><span class="file-name">{basename(file.oldPath)}</span>
				<span class="rename-arrow" aria-label="renamed to">→</span>
				<span class="file-dir">{dirname(file.path)}</span><span class="file-name">{basename(file.path)}</span>
			{:else}
				<span class="file-dir">{dirname(file.path)}</span><span class="file-name">{basename(file.path)}</span>
			{/if}
		</div>
		<div class="file-meta">
			{#if file.additions > 0}
				<span class="meta-add">+{file.additions}</span>
			{/if}
			{#if file.deletions > 0}
				<span class="meta-del">−{file.deletions}</span>
			{/if}
			{#if file.isGenerated}
				<button
					class="expand-btn"
					onclick={() => (expanded = !expanded)}
					aria-expanded={expanded}
				>
					{expanded ? 'collapse' : `${changedCount} changes — show`}
				</button>
			{/if}
		</div>
	</header>

	{#if !skimMode && expanded}
		<div class="hunks" transition:fade={{ duration: 180 }}>
			{#each file.hunks as hunk, hi}
				{#if hi > 0}
					<div class="hunk-gap" role="separator" aria-hidden="true"></div>
				{/if}
				<div class="hunk">
					{#each hunk.lines as line}
						<div class={lineClass(line)}>
							<span class="gutter" aria-hidden="true"></span>
							<code class="line-content" class:diff-highlighted={!!line.highlightedHtml}>
								{#if line.highlightedHtml}
									{@html line.highlightedHtml}
								{:else if line.tokens}
									{#each line.tokens as token}
										{#if token.changed}
											<mark class="diff-token {line.type === 'addition' ? 'diff-token-add' : 'diff-token-del'}">{token.value}</mark>
										{:else}
											{token.value}
										{/if}
									{/each}
								{:else}
									{line.content}
								{/if}
							</code>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else if !skimMode}
		<div class="collapsed-notice" transition:fade={{ duration: 180 }}>
			<button class="expand-btn-inline" onclick={() => (expanded = true)}>
				{basename(file.path)} — {changedCount} lines changed — show
			</button>
		</div>
	{/if}
</section>

<style>
	.file-chapter {
		margin-bottom: 8rem;
		scroll-margin-top: 4.5rem;
		transition: opacity 500ms ease;
	}

	.file-chapter.inactive {
		opacity: 0.4;
	}

	.file-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 3.5rem;
		border-top: 1px solid var(--color-border);
		margin-bottom: 1rem;
		flex-wrap: wrap;
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: var(--color-surface);
		box-shadow: 0 1px 0 var(--color-border);
		transition: background-color 400ms ease;
	}

	.file-title {
		font-family: var(--font-mono);
		font-size: 1rem;
		font-weight: 500;
		color: var(--color-ink);
		display: flex;
		align-items: baseline;
		gap: 0;
		flex-wrap: wrap;
	}

	.file-dir {
		color: var(--color-ink-muted);
		font-weight: 400;
	}

	.file-name {
		color: var(--color-ink);
	}

	.rename-arrow {
		margin: 0 0.5rem;
		color: var(--color-ink-muted);
		font-family: var(--font-sans);
	}

	.file-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.meta-add {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--diff-add-gutter);
		font-family: var(--font-mono);
	}

	.meta-del {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--diff-del-gutter);
		font-family: var(--font-mono);
	}

	.expand-btn {
		font-size: 0.75rem;
		color: var(--color-accent);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	/* ─── Hunks ─── */
	.hunks {
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
	}

	.hunk {
		display: flex;
		flex-direction: column;
	}

	.hunk-gap {
		height: 1px;
		background-color: var(--color-border);
		margin: 0.5rem 0;
	}

	/* ─── Lines ─── */
	.diff-line {
		display: flex;
		align-items: stretch;
		min-height: 1.6em;
	}

	.diff-line-context .gutter {
		background-color: transparent;
		border-left: 3px solid transparent;
	}

	.diff-line-addition .gutter {
		background-color: transparent;
		border-left: 3px solid var(--diff-add-gutter);
	}

	.diff-line-deletion .gutter {
		background-color: transparent;
		border-left: 3px solid var(--diff-del-gutter);
	}

	.gutter {
		width: 3px;
		flex-shrink: 0;
	}

	.line-content {
		flex: 1;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.6;
		padding: 0.1em 1rem;
		white-space: pre-wrap;
		word-break: break-all;
		color: var(--color-ink);
		background: none;
		border: none;
	}

	.diff-line-context .line-content {
		opacity: 0.65;
	}

	/* Word-level token highlights */
	.diff-token {
		border-radius: 2px;
		padding: 0 1px;
	}

	.diff-token-add {
		background-color: var(--diff-add-token);
	}

	.diff-token-del {
		background-color: var(--diff-del-token);
		text-decoration: line-through;
	}

	/* Collapsed state */
	.collapsed-notice {
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
	}

	.expand-btn-inline {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: color 200ms ease;
	}

	.expand-btn-inline:hover {
		color: var(--color-ink);
	}
</style>
