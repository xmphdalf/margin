<script lang="ts">
	import { onMount } from 'svelte';
	import type { ParsedDoc } from '$lib/types.js';

	interface Props {
		doc: ParsedDoc;
	}

	let { doc }: Props = $props();

	// Lazy-load KaTeX CSS only when document contains math
	onMount(() => {
		if (!doc.hasMath) return;

		const id = 'katex-css';
		if (document.getElementById(id)) return; // already loaded

		const link = document.createElement('link');
		link.id = id;
		link.rel = 'stylesheet';
		link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
		document.head.appendChild(link);
	});

	// Lazy-load and initialize Mermaid for diagram blocks
	onMount(async () => {
		const diagrams = document.querySelectorAll('code.language-mermaid');
		if (diagrams.length === 0) return;

		const { default: mermaid } = await import('mermaid');
		mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

		diagrams.forEach(async (el) => {
			const parent = el.parentElement;
			if (!parent) return;
			const code = el.textContent ?? '';
			const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).slice(2)}`, code);
			const wrapper = document.createElement('div');
			wrapper.className = 'mermaid-diagram';
			wrapper.innerHTML = svg;
			parent.replaceWith(wrapper);
		});
	});
</script>

<article id="main-content" class="prose" tabindex="-1">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html doc.html}
</article>

<style>
	article {
		outline: none;
	}

	/* Mermaid diagram container */
	:global(.mermaid-diagram) {
		max-width: 100%;
		overflow-x: auto;
		margin: 1.5em 0;
	}

	:global(.mermaid-diagram svg) {
		max-width: 100%;
		height: auto;
	}
</style>
