<script lang="ts">
	import type { ParsedDiff } from '$lib/types.js';

	interface Props {
		diff: ParsedDiff;
		onBegin: () => void;
		onSkim: () => void;
	}

	let { diff, onBegin, onSkim }: Props = $props();

	const { meta, files, totalAdditions, totalDeletions } = $derived(diff);

	function kindMark(status: string): string {
		if (status === 'added') return '+ new';
		if (status === 'deleted') return '- removed';
		return 'modified';
	}
</script>

<section class="m-syn" aria-label="Diff summary">
	<div class="m-syn-eyebrow">
		<span class="eyebrow-mono">git diff</span>
		<span class="m-dot" aria-hidden="true">·</span>
		<span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
	</div>

	<h1 class="m-syn-title">{meta.title}</h1>

	<div class="m-syn-meta">
		<span class="m-breath">{meta.breath}</span>
		<span class="m-dot" aria-hidden="true">·</span>
		<span><span class="m-add">+{totalAdditions}</span></span>
		<span><span class="m-del">-{totalDeletions}</span></span>
	</div>

	<p class="m-syn-note">{meta.editorsNote}</p>

	<div class="m-syn-files">
		<div class="m-syn-files-label">in this read</div>
		<ol class="m-syn-list">
			{#each files as file, i}
				<li class:is-generated={file.isGenerated}>
					<span class="m-syn-n">{String(i + 1).padStart(2, '0')}</span>
					<span class="m-syn-p">{file.path}</span>
					<span class="m-syn-c">
						<span class="m-add">+{file.additions}</span>
						<span class="m-del">-{file.deletions}</span>
					</span>
				</li>
			{/each}
		</ol>
	</div>

	<div class="m-syn-acts">
		<button class="m-syn-go" onclick={onBegin}>
			begin reading <span aria-hidden="true">↓</span>
		</button>
		<button class="m-syn-skim" onclick={onSkim}>or just skim</button>
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

	.eyebrow-mono {
		font-family: var(--font-mono);
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

	.m-add { color: var(--color-add); }
	.m-del { color: var(--color-del); }

	.m-syn-note {
		font-family: var(--font-serif);
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--color-ink);
		margin: 0 0 4rem;
		text-wrap: pretty;
	}

	.m-syn-files-label {
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
		grid-template-columns: 2.5rem 1fr auto;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.875rem 0;
		border-bottom: 1px solid var(--color-border);
		transition: border-color 400ms ease;
	}

	.m-syn-list li.is-generated {
		opacity: 0.45;
	}

	.m-syn-n {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}

	.m-syn-p {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-ink);
		word-break: break-all;
	}

	.m-syn-c {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		display: flex;
		gap: 0.375rem;
		flex-shrink: 0;
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

	.m-syn-skim {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		background: none;
		border: none;
		cursor: pointer;
		transition: color 200ms ease;
	}

	.m-syn-skim:hover { color: var(--color-ink); }

	@media (max-width: 600px) {
		.m-syn {
			margin-top: 4rem;
			padding: 0 1.25rem 8rem;
		}
	}
</style>
