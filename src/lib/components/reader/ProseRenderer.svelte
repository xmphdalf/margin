<script lang="ts">
	import { onMount } from 'svelte';
	import { themeState } from '$lib/state/theme.svelte.js';
	import type { ParsedDoc } from '$lib/types.js';

	interface Props {
		doc: ParsedDoc;
	}

	let { doc }: Props = $props();

	// Lazy-load KaTeX CSS only when document contains math (self-hosted via Vite chunk)
	onMount(() => {
		if (!doc.hasMath) return;
		import('$lib/katex-css.js');
	});

	// Mermaid — lazy-loaded, theme-aware, re-renders on app theme change.
	// Plain let vars (not $state) so the $effect below only tracks themeState.current.
	let mermaidRef: Awaited<typeof import('mermaid')>['default'] | null = null;
	let diagramData: Array<{ container: HTMLDivElement; source: string }> = [];

	function getMermaidTheme(t: string): 'default' | 'dark' | 'neutral' {
		if (t === 'dark') return 'dark';
		if (t === 'sepia') return 'neutral';
		return 'default';
	}

	onMount(async () => {
		const codeEls = [...document.querySelectorAll('code.language-mermaid')];
		if (codeEls.length === 0) return;

		const { default: mermaid } = await import('mermaid');
		mermaidRef = mermaid;
		mermaid.initialize({ startOnLoad: false, theme: getMermaidTheme(themeState.current) });

		for (const el of codeEls) {
			const parent = el.parentElement;
			if (!parent) continue;
			const code = el.textContent ?? '';
			const container = document.createElement('div');
			container.className = 'mermaid-diagram';
			try {
				const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).slice(2)}`, code);
				container.innerHTML = svg;
				parent.replaceWith(container);
				diagramData.push({ container, source: code });
			} catch {
				// Invalid diagram — leave as plain code block
			}
		}
	});

	// Re-render diagrams when the app theme changes
	$effect(() => {
		const theme = themeState.current; // tracked dependency
		if (!mermaidRef || diagramData.length === 0) return;
		mermaidRef.initialize({ startOnLoad: false, theme: getMermaidTheme(theme) });
		for (const { container, source } of diagramData) {
			mermaidRef
				.render(`mermaid-${Math.random().toString(36).slice(2)}`, source)
				.then(({ svg }) => {
					container.innerHTML = svg;
				})
				.catch(() => {});
		}
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
