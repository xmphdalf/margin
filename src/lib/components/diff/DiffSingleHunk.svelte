<script lang="ts">
	import { onMount } from 'svelte';
	import type { ParsedDiff, DiffHunk as DiffHunkType, DiffFile } from '$lib/types.js';

	interface FlatHunk {
		hunk: DiffHunkType;
		file: DiffFile;
	}

	interface Props {
		diff: ParsedDiff;
		idx: number;
		onIdx: (i: number) => void;
		onExit: () => void;
	}

	let { diff, idx, onIdx, onExit }: Props = $props();

	const flat = $derived<FlatHunk[]>(
		diff.files.flatMap((file) => file.hunks.map((hunk) => ({ hunk, file })))
	);

	const cur = $derived(flat[idx % flat.length]);
	const total = $derived(flat.length);

	function sign(type: string): string {
		if (type === 'addition') return '+';
		if (type === 'deletion') return '-';
		return ' ';
	}

	onMount(() => {
		function handleKey(e: KeyboardEvent) {
			const tag = (e.target as Element).tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;
			if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
				e.preventDefault();
				onIdx((idx + 1) % total);
			} else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
				e.preventDefault();
				onIdx((idx - 1 + total) % total);
			} else if (e.key === 'Escape') {
				onExit();
			} else if (e.key === 'r' || e.key === 'R') {
				onIdx(Math.floor(Math.random() * total));
			}
		}
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});
</script>

<section class="m-single" aria-label="Single hunk view">
	{#if cur}
		<div class="m-single-mast">
			<div class="m-single-where">
				<span class="m-single-n">{String(idx + 1).padStart(2, '0')}</span>
				<span>of {String(total).padStart(2, '0')}</span>
			</div>
			<h3 class="m-single-path">{cur.file.path}</h3>
			<p class="m-single-syn">{cur.file.synopsis}</p>
		</div>

		<div class="m-hunk">
			{#if cur.hunk.header}
				<header class="m-hunk-h" aria-label="hunk context">{cur.hunk.header}</header>
			{/if}
			<div class="m-hunk-body">
				{#each cur.hunk.lines as line}
					<div class="m-line m-line-{line.type === 'addition' ? 'add' : line.type === 'deletion' ? 'del' : 'ctx'}">
						<span class="m-ln" aria-hidden="true">{line.oldLine ?? ''}</span>
						<span class="m-ln" aria-hidden="true">{line.newLine ?? ''}</span>
						<span class="m-sign" aria-hidden="true">{sign(line.type)}</span>
						<span class="m-code">
							{#if line.highlightedHtml}
								{@html line.highlightedHtml}
							{:else if line.tokens}
								{#each line.tokens as token}
									{#if token.changed}
										<mark class="diff-tok diff-tok-{line.type === 'addition' ? 'add' : 'del'}">{token.value}</mark>
									{:else}
										{token.value}
									{/if}
								{/each}
							{:else}
								{line.content || ' '}
							{/if}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="m-single-keys" aria-hidden="true">
			<span><kbd>space</kbd> next</span>
			<span><kbd>K</kbd> prev</span>
			<span><kbd>R</kbd> random</span>
			<span><kbd>esc</kbd> back</span>
		</div>
	{/if}
</section>

<style>
	.m-single {
		max-width: 60rem;
		margin: 0 auto;
		min-height: calc(100vh - 3rem);
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 6rem 2rem;
		animation: m-rise 500ms ease both;
	}

	@keyframes m-rise {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.m-single-mast {
		max-width: 36rem;
		margin: 0 auto 3rem;
		width: 100%;
	}

	.m-single-where {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.m-single-n { color: var(--color-ink); }

	.m-single-path {
		font-family: var(--font-mono);
		font-weight: 400;
		font-size: 1rem;
		margin: 0 0 0.625rem;
		color: var(--color-ink);
	}

	.m-single-syn {
		font-family: var(--font-serif);
		font-style: italic;
		font-size: 1rem;
		color: var(--color-ink-muted);
		margin: 0;
		text-wrap: pretty;
	}

	/* Hunk block */
	.m-hunk {
		padding: 0;
		transition: none;
	}

	.m-hunk-h {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.04em;
		color: var(--color-ink-muted);
		opacity: 0.5;
		padding-bottom: 0.625rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;
	}

	.m-hunk-body {
		font-family: var(--font-mono);
		font-size: 0.84rem;
		line-height: 1.7;
	}

	/* Lines */
	.m-line {
		display: grid;
		grid-template-columns: 2.5rem 2.5rem 1.25rem minmax(0, 1fr);
		align-items: baseline;
		padding: 0 0.25rem;
		white-space: pre-wrap;
	}

	.m-ln {
		color: var(--color-ink-muted);
		opacity: 0.35;
		font-size: 0.75rem;
		text-align: right;
		padding-right: 0.75rem;
		user-select: none;
		font-variant-numeric: tabular-nums;
	}

	.m-sign {
		color: var(--color-ink-muted);
		opacity: 0.35;
		text-align: center;
	}

	.m-code { color: var(--color-ink); overflow-wrap: anywhere; }

	.m-line-add {
		background: color-mix(in oklch, var(--color-add-tint) 60%, transparent);
		border-radius: 2px;
	}
	.m-line-add .m-sign { color: var(--color-add); opacity: 1; }
	.m-line-add .m-code { color: color-mix(in oklch, var(--color-add) 70%, var(--color-ink)); }

	.m-line-del {
		background: color-mix(in oklch, var(--color-del-tint) 60%, transparent);
		border-radius: 2px;
	}
	.m-line-del .m-sign { color: var(--color-del); opacity: 1; }
	.m-line-del .m-code {
		color: color-mix(in oklch, var(--color-del) 60%, var(--color-ink));
		text-decoration: line-through;
		text-decoration-color: color-mix(in oklch, var(--color-del) 35%, transparent);
		text-decoration-thickness: 1px;
	}

	/* Word-level tokens */
	.diff-tok {
		border-radius: 2px;
		padding: 0 1px;
	}
	.diff-tok-add { background-color: var(--diff-add-token); }
	.diff-tok-del {
		background-color: var(--diff-del-token);
		text-decoration: line-through;
	}

	/* Keystroke hints */
	.m-single-keys {
		display: flex;
		gap: 1.5rem;
		justify-content: center;
		margin-top: 3.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}

	.m-single-keys kbd {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		padding: 0.0625rem 0.375rem;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		background: var(--color-surface-alt);
		margin-right: 0.375rem;
	}
</style>
