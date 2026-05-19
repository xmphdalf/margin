<script lang="ts">
	import { onMount } from 'svelte';
	import type { DiffFile } from '$lib/types.js';

	interface Props {
		file: DiffFile;
		hunkStart: number;
		activeHunkIdx: number;
		softness: 'off' | 'soft' | 'strong';
		showMarginalia?: boolean;
		note?: string;
		onNoteChange?: (note: string) => void;
	}

	let {
		file,
		hunkStart,
		activeHunkIdx,
		softness,
		showMarginalia = false,
		note = '',
		onNoteChange
	}: Props = $props();

	let mastEl = $state<HTMLElement | null>(null);
	let dim = $state(false);
	let marginaliaFocused = $state(false);

	function kindMark(status: DiffFile['status']): string {
		if (status === 'added') return '+ new';
		if (status === 'deleted') return '- removed';
		if (status === 'renamed') return 'renamed';
		return 'modified';
	}

	function sign(type: string): string {
		if (type === 'addition') return '+';
		if (type === 'deletion') return '-';
		return ' ';
	}

	// "Dim, not check": after 4s of dwell the masthead fades
	onMount(() => {
		if (!mastEl) return;
		let timer: ReturnType<typeof setTimeout>;
		let dwelt = false;
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting && !dwelt) {
						timer = setTimeout(() => {
							dwelt = true;
							dim = true;
						}, 4000);
					} else if (!e.isIntersecting) {
						clearTimeout(timer);
					}
				});
			},
			{ threshold: 0.3 }
		);
		obs.observe(mastEl);
		return () => {
			obs.disconnect();
			clearTimeout(timer);
		};
	});

	// Debounce note changes to parent
	let noteTimer: ReturnType<typeof setTimeout>;
	function handleNoteInput(e: Event) {
		const val = (e.target as HTMLTextAreaElement).value;
		clearTimeout(noteTimer);
		noteTimer = setTimeout(() => onNoteChange?.(val), 300);
	}
</script>

<section class="m-file" class:m-file-dwelt={dim} id={file.id} aria-label="File: {file.path}" bind:this={mastEl}>
	<div class="m-file-mast">
		<div class="m-file-mark" aria-hidden="true">{kindMark(file.status)}</div>
		<h2 class="m-file-path">
			{#if file.status === 'renamed' && file.oldPath}
				{file.oldPath} <span class="rename-arrow" aria-label="renamed to">→</span> {file.path}
			{:else}
				{file.path}
			{/if}
		</h2>
		{#if file.synopsis}
			<p class="m-file-syn">{file.synopsis}</p>
		{/if}
		<div class="m-file-meta">
			<span><span class="m-add">+{file.additions}</span></span>
			<span><span class="m-del">-{file.deletions}</span></span>
			<span class="m-dot" aria-hidden="true">·</span>
			<span>{file.hunks.length} {file.hunks.length === 1 ? 'hunk' : 'hunks'}</span>
		</div>
	</div>

	<div class="m-hunks">
		{#each file.hunks as hunk, i}
			{@const globalIdx = hunkStart + i}
			{@const isActive = globalIdx === activeHunkIdx}
			<section
				class="m-hunk m-soft-{softness}"
				class:m-hunk-active={isActive}
				class:m-hunk-resting={!isActive}
				data-hunk-idx={globalIdx}
				aria-label="Hunk {i + 1}"
			>
				{#if hunk.header}
					<header class="m-hunk-h" aria-label="hunk context">{hunk.header}</header>
				{/if}
				<div class="m-hunk-body">
					{#each hunk.lines as line}
						{@const lineKind = line.type === 'addition' ? 'add' : line.type === 'deletion' ? 'del' : 'ctx'}
						<div class="m-line m-line-{lineKind}">
							<span class="m-ln" aria-hidden="true">{line.oldLine ?? ''}</span>
							<span class="m-ln" aria-hidden="true">{line.newLine ?? ''}</span>
							<span class="m-sign" aria-hidden="true">{sign(line.type)}</span>
							<span class="m-code">
								{#if line.highlightedHtml}
									{@html line.highlightedHtml}
								{:else if line.tokens}
									{#each line.tokens as token}
										{#if token.changed}
											<mark class="diff-tok diff-tok-{lineKind === 'add' ? 'add' : 'del'}">{token.value}</mark>
										{:else}
											{token.value}
										{/if}
									{/each}
								{:else}
									{line.content || ' '}
								{/if}
							</span>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>

	{#if showMarginalia}
		<aside class="m-margin" class:m-margin-on={marginaliaFocused || !!note}>
			<label class="m-margin-l" for="note-{file.id}">marginalia</label>
			<textarea
				id="note-{file.id}"
				class="m-margin-t"
				value={note}
				placeholder="a line for yourself, kept on this machine only"
				oninput={handleNoteInput}
				onfocus={() => (marginaliaFocused = true)}
				onblur={() => (marginaliaFocused = false)}
				rows={2}
			></textarea>
		</aside>
	{/if}
</section>

<style>
	.m-file {
		position: relative;
		padding-top: var(--m-breath, 8rem);
		scroll-margin-top: 3.5rem;
	}

	.m-file:first-child {
		padding-top: 5rem;
	}

	.m-file-mast {
		max-width: 36rem;
		margin: 0 auto 3.5rem;
		padding: 0 2rem;
		transition: opacity 1200ms ease;
	}

	.m-file-dwelt .m-file-path {
		color: var(--color-ink-muted);
	}

	.m-file-mark {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		text-transform: lowercase;
		letter-spacing: 0.08em;
		color: var(--color-ink-muted);
		margin-bottom: 0.75rem;
	}

	.m-file-path {
		font-family: var(--font-mono);
		font-weight: 400;
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
		color: var(--color-ink);
		margin: 0 0 0.75rem;
		word-break: break-all;
		transition: color 1200ms ease;
	}

	.rename-arrow {
		color: var(--color-ink-muted);
		font-family: var(--font-sans);
	}

	.m-file-syn {
		font-family: var(--font-serif);
		font-size: 1rem;
		line-height: 1.7;
		color: var(--color-ink-muted);
		margin: 0 0 1.25rem;
		text-wrap: pretty;
	}

	.m-file-meta {
		display: flex;
		gap: 0.625rem;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}

	.m-add { color: var(--color-add); }
	.m-del { color: var(--color-del); }
	.m-dot { opacity: 0.5; }

	/* Hunks container */
	.m-hunks {
		display: flex;
		flex-direction: column;
		gap: 4.5rem;
	}

	.m-hunk {
		max-width: 60rem;
		margin: 0 auto;
		padding: 0 1.5rem;
		width: 100%;
		transition: opacity 700ms ease, filter 700ms ease;
	}

	/* Reading-line softness */
	.m-soft-soft.m-hunk-resting  { opacity: 0.45; }
	.m-soft-soft.m-hunk-active   { opacity: 1; }
	.m-soft-strong.m-hunk-resting { opacity: 0.22; filter: blur(0.25px); }
	.m-soft-strong.m-hunk-active  { opacity: 1; }
	.m-soft-off.m-hunk-resting   { opacity: 1; }

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

	/* Lines: 4-column grid */
	.m-line {
		display: grid;
		grid-template-columns: 2.5rem 2.5rem 1.25rem 1fr;
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
		user-select: none;
	}

	.m-code { color: var(--color-ink); }

	/* Addition row */
	.m-line-add {
		background: color-mix(in oklch, var(--color-add-tint) 60%, transparent);
		border-radius: 2px;
	}
	.m-line-add .m-sign { color: var(--color-add); opacity: 1; }
	.m-line-add .m-code { color: color-mix(in oklch, var(--color-add) 70%, var(--color-ink)); }

	/* Deletion row */
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

	/* Context lines slightly dimmed */
	.m-line-ctx .m-code { opacity: 0.65; }

	/* Word-level diff tokens */
	.diff-tok {
		border-radius: 2px;
		padding: 0 1px;
	}
	.diff-tok-add { background-color: var(--diff-add-token); }
	.diff-tok-del {
		background-color: var(--diff-del-token);
		text-decoration: line-through;
	}

	/* Marginalia */
	.m-margin {
		max-width: 36rem;
		margin: 4rem auto 0;
		padding: 0 2rem;
		opacity: 0.45;
		transition: opacity 300ms ease;
	}

	.m-margin-on,
	.m-margin:hover { opacity: 1; }

	.m-margin-l {
		display: block;
		font-family: var(--font-sans);
		text-transform: lowercase;
		letter-spacing: 0.06em;
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		margin-bottom: 0.5rem;
	}

	.m-margin-t {
		width: 100%;
		background: transparent;
		border: 0;
		border-bottom: 1px dashed var(--color-border);
		resize: vertical;
		color: var(--color-ink);
		font-family: var(--font-serif);
		font-size: 1rem;
		font-style: italic;
		line-height: 1.6;
		padding: 0.25rem 0;
		outline: none;
	}

	.m-margin-t::placeholder {
		color: var(--color-ink-muted);
		opacity: 0.6;
		font-style: italic;
	}

	.m-margin-t:focus {
		border-bottom-color: var(--color-accent);
	}

	@media (max-width: 720px) {
		.m-file-mast { padding: 0 1.25rem; }
		.m-hunk { padding: 0 1rem; }
		.m-line { grid-template-columns: 1.75rem 1.75rem 1rem 1fr; }
	}
</style>
