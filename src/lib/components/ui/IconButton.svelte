<script lang="ts">
	interface Props {
		label: string;
		onclick?: () => void;
		active?: boolean;
		title?: string;
		type?: 'button' | 'submit' | 'reset';
		children?: import('svelte').Snippet;
	}

	let { label, onclick, active = false, title, type = 'button', children }: Props = $props();
</script>

<button
	{type}
	aria-label={label}
	aria-pressed={active}
	{title}
	{onclick}
	class="icon-btn"
	class:active
>
	{#if children}
		{@render children()}
	{/if}
</button>

<style>
	.icon-btn {
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
		flex-shrink: 0;
	}

	.icon-btn:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}

	.icon-btn.active {
		color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.icon-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
