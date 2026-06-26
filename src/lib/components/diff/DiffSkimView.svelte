<script lang="ts">
	import type { ParsedDiff } from '$lib/types.js';

	interface Props {
		diff: ParsedDiff;
		onRead: () => void;
	}

	let { diff, onRead }: Props = $props();
</script>

<section class="m-skim" aria-label="Skim view">
	<header class="m-skim-h">
		<div class="m-skim-l">skim</div>
		<h2 class="m-skim-t">{diff.meta.title}</h2>
		<p class="m-skim-sub">what's in this read, in prose only</p>
	</header>

	<ol class="m-skim-list">
		{#each diff.files as file, i}
			<li class="m-skim-item" class:is-generated={file.isGenerated}>
				<div class="m-skim-n">{String(i + 1).padStart(2, '0')}</div>
				<div class="m-skim-content">
					<div class="m-skim-p">{file.path}</div>
					<p class="m-skim-s">{file.synopsis}</p>
				</div>
			</li>
		{/each}
	</ol>

	<div class="m-skim-foot">
		<button class="m-syn-go" onclick={onRead}>
			read the bodies <span aria-hidden="true">↓</span>
		</button>
	</div>
</section>

<style>
	.m-skim {
		max-width: 40rem;
		margin: 6rem auto;
		padding: 0 2rem 6rem;
		animation: m-rise 700ms ease both;
	}

	@keyframes m-rise {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.m-skim-h {
		margin-bottom: 3rem;
	}

	.m-skim-l {
		font-family: var(--font-sans);
		text-transform: lowercase;
		letter-spacing: 0.06em;
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		margin-bottom: 0.5rem;
	}

	.m-skim-t {
		font-family: var(--font-serif);
		font-weight: 500;
		font-size: 2.25rem;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		margin: 0.25rem 0 0.5rem;
	}

	.m-skim-sub {
		color: var(--color-ink-muted);
		font-family: var(--font-serif);
		font-style: italic;
		margin: 0;
	}

	.m-skim-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.m-skim-item {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr);
		gap: 1.25rem;
		padding: 1.75rem 0;
		border-bottom: 1px solid var(--color-border);
		transition: border-color 400ms ease;
	}

	.m-skim-item.is-generated {
		opacity: 0.45;
	}

	.m-skim-n {
		font-family: var(--font-mono);
		color: var(--color-ink-muted);
		font-size: 0.75rem;
		padding-top: 0.25rem;
	}

	.m-skim-p {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-ink);
		margin-bottom: 0.5rem;
		word-break: break-all;
	}

	.m-skim-s {
		font-family: var(--font-serif);
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--color-ink);
		margin: 0;
		text-wrap: pretty;
	}

	.m-skim-foot {
		margin-top: 3.5rem;
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

	@media (max-width: 600px) {
		.m-skim {
			margin-top: 3rem;
			padding: 0 1.25rem 4rem;
		}
	}
</style>
