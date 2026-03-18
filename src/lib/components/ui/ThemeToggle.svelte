<script lang="ts">
	import { themeState } from '$lib/state/theme.svelte.js';
	import type { Theme } from '$lib/types.js';

	const themes: Theme[] = ['light', 'sepia', 'dark'];

	const labels: Record<Theme, string> = {
		light: 'Switch to sepia theme',
		sepia: 'Switch to dark theme',
		dark: 'Switch to light theme'
	};

	function cycle() {
		const idx = themes.indexOf(themeState.current);
		themeState.set(themes[(idx + 1) % themes.length]);
	}
</script>

<button
	onclick={cycle}
	aria-label={labels[themeState.current]}
	title={labels[themeState.current]}
	class="theme-toggle"
>
	{#if themeState.current === 'light'}
		<!-- Sun icon -->
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="5"/>
			<line x1="12" y1="1" x2="12" y2="3"/>
			<line x1="12" y1="21" x2="12" y2="23"/>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
			<line x1="1" y1="12" x2="3" y2="12"/>
			<line x1="21" y1="12" x2="23" y2="12"/>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
		</svg>
	{:else if themeState.current === 'sepia'}
		<!-- Book / warm icon -->
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
			<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
		</svg>
	{:else}
		<!-- Moon icon -->
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: color 200ms ease, background-color 200ms ease;
	}

	.theme-toggle:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
