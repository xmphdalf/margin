<script lang="ts">
	import { readerState } from '$lib/state/reader.svelte.js';
	import { onMount } from 'svelte';

	// Check if CSS scroll-driven animations are supported
	let useCSS = $state(false);

	onMount(() => {
		useCSS = CSS.supports('animation-timeline', 'scroll()');
	});
</script>

<div class="progress-bar-wrap" aria-hidden="true">
	{#if useCSS}
		<div class="progress-bar progress-bar--css"></div>
	{:else}
		<div
			class="progress-bar progress-bar--js"
			style="width: {readerState.scrollProgress * 100}%"
		></div>
	{/if}
</div>

<style>
	.progress-bar-wrap {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 2px;
		z-index: 50;
		background: transparent;
	}

	.progress-bar {
		height: 100%;
		background-color: var(--color-accent);
	}

	/* CSS Scroll-Driven Animation (Chrome 115+, Safari 26+) */
	@keyframes grow {
		from { width: 0% }
		to { width: 100% }
	}

	.progress-bar--css {
		animation: grow linear;
		animation-timeline: scroll(root block);
		animation-duration: auto;
	}

	/* JS-driven fallback */
	.progress-bar--js {
		transition: width 100ms linear;
	}
</style>
