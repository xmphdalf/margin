<script lang="ts">
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import { base } from '$app/paths';

	interface Props {
		showHomeLink?: boolean;
		tools?: import('svelte').Snippet;
	}

	let { showHomeLink = false, tools }: Props = $props();
</script>

<header class="site-header">
	<div class="header-inner">
		<a href="{base}/" class="wordmark" aria-label="Margin — home">
			margin
		</a>

		<div class="header-actions">
			{#if showHomeLink}
				<a href="{base}/" class="home-link">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<polyline points="15 18 9 12 15 6"/>
					</svg>
					New document
				</a>
			{/if}
			{#if tools}
				{@render tools()}
			{/if}
			<ThemeToggle />
		</div>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 40;
		background-color: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		transition: background-color 400ms ease, border-color 400ms ease;
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 90rem;
		margin: 0 auto;
		padding: 0 1.5rem;
		height: 3rem;
	}

	.wordmark {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		font-weight: 500;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		text-decoration: none;
		transition: opacity 200ms ease;
	}

	.wordmark:hover {
		opacity: 0.7;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.home-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		text-decoration: none;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: color 200ms ease, background-color 200ms ease;
	}

	.home-link:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}
</style>
