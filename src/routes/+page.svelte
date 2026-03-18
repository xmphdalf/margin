<script lang="ts">
	import { goto } from '$app/navigation';
	import { parseMarkdown } from '$lib/markdown.js';
	import { readerState } from '$lib/state/reader.svelte.js';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import MarkdownInput from '$lib/components/input/MarkdownInput.svelte';

	let error = $state('');

	async function handleSubmit(raw: string) {
		error = '';
		try {
			const doc = await parseMarkdown(raw);
			readerState.setDoc(raw, doc);
			goto('/read/');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to parse document.';
		}
	}
</script>

<svelte:head>
	<title>Margin — Read Markdown beautifully</title>
	<meta name="description" content="A reader-first Markdown web application. Paste, upload, or fetch any Markdown and read it in a calm, immersive layout." />
</svelte:head>

<SiteHeader />

<main class="home-main" id="main-content">
	<div class="home-hero">
		<h1 class="hero-title">margin</h1>
		<p class="hero-sub">A quiet place to read Markdown.</p>
	</div>

	<div class="input-wrap">
		<MarkdownInput onSubmit={handleSubmit} />
	</div>

	{#if error}
		<p class="home-error" role="alert">{error}</p>
	{/if}
</main>

<style>
	.home-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4rem 1.5rem 6rem;
		gap: 2.5rem;
		min-height: calc(100vh - 3rem);
	}

	.home-hero {
		text-align: center;
	}

	.hero-title {
		font-family: var(--font-serif);
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		color: var(--color-ink);
		margin: 0 0 0.5rem;
	}

	.hero-sub {
		font-size: 1rem;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.input-wrap {
		width: 100%;
		max-width: 680px;
	}

	.home-error {
		font-size: 0.875rem;
		color: oklch(0.55 0.18 25);
		text-align: center;
	}
</style>
