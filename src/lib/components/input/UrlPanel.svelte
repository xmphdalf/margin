<script lang="ts">
	import { isValidUrl, fetchMarkdown } from '$lib/utils/url.js';

	interface Props {
		onSubmit: (raw: string) => void;
		loading?: boolean;
	}

	let { onSubmit, loading = false }: Props = $props();

	let url = $state('');
	let error = $state('');
	let fetching = $state(false);

	const isDisabled = $derived(fetching || loading);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const trimmed = url.trim();
		if (!trimmed) return;

		if (!isValidUrl(trimmed)) {
			error = 'Please enter a valid https:// URL.';
			return;
		}

		error = '';
		fetching = true;

		try {
			const text = await fetchMarkdown(trimmed);
			onSubmit(text);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch URL.';
		} finally {
			fetching = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="url-panel">
	<label for="url-input" class="url-label">Public URL to a Markdown file</label>

	<div class="url-row">
		<input
			id="url-input"
			type="url"
			bind:value={url}
			placeholder="https://raw.githubusercontent.com/…"
			disabled={isDisabled}
			class="url-input"
			aria-describedby={error ? 'url-error' : undefined}
		/>
		<button type="submit" disabled={!url.trim() || isDisabled} class="fetch-btn">
			{fetching ? 'Fetching…' : 'Fetch →'}
		</button>
	</div>

	{#if error}
		<p id="url-error" class="url-error" role="alert">{error}</p>
	{/if}

	<p class="url-hint">
		GitHub blob URLs are automatically converted to raw format.
	</p>
</form>

<style>
	.url-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem 0;
	}

	.url-label {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
	}

	.url-row {
		display: flex;
		gap: 0.5rem;
	}

	.url-input {
		flex: 1;
		padding: 0.625rem 0.875rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		outline: none;
		transition: border-color 200ms ease;
	}

	.url-input:focus {
		border-color: var(--color-accent);
	}

	.url-input:disabled {
		opacity: 0.6;
	}

	.fetch-btn {
		padding: 0.625rem 1.25rem;
		background-color: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		transition: opacity 200ms ease;
	}

	.fetch-btn:hover:not(:disabled) {
		opacity: 0.85;
	}

	.fetch-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.fetch-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.url-error {
		font-size: 0.875rem;
		color: oklch(0.55 0.18 25);
		margin: 0;
	}

	.url-hint {
		font-size: 0.8rem;
		color: var(--color-ink-muted);
		margin: 0;
	}
</style>
