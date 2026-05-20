<script lang="ts">
	interface Props {
		onSubmit: (raw: string) => void;
		loading?: boolean;
	}

	let { onSubmit, loading = false }: Props = $props();

	let url = $state('');
	let error = $state('');
	let fetching = $state(false);

	const isDisabled = $derived(fetching || loading);

	// Parse a GitHub PR URL into owner/repo/number
	function parseGitHubPR(input: string): { owner: string; repo: string; number: number } | null {
		const m = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/.exec(input);
		if (!m) return null;
		return { owner: m[1], repo: m[2], number: parseInt(m[3], 10) };
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const trimmed = url.trim();
		if (!trimmed) return;

		error = '';
		fetching = true;

		try {
			const pr = parseGitHubPR(trimmed);
			if (!pr) {
				error = 'Enter a GitHub PR URL — e.g. https://github.com/owner/repo/pull/123';
				return;
			}

			const apiUrl = `https://api.github.com/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}`;
			const res = await fetch(apiUrl, {
				headers: { Accept: 'application/vnd.github.v3.diff' }
			});

			if (res.status === 404) {
				error = 'PR not found. Make sure the repository and PR number are correct.';
				return;
			}
			if (res.status === 403 || res.status === 401) {
				error = 'Private repository — only public PRs are supported.';
				return;
			}
			if (res.status === 429) {
				error = 'GitHub rate limit reached. Try again in a moment or paste the diff directly.';
				return;
			}
			if (!res.ok) {
				error = `GitHub returned ${res.status}. Try pasting the diff directly.`;
				return;
			}

			const text = await res.text();
			if (!text.trim()) {
				error = 'Received an empty diff. The PR may have no changes.';
				return;
			}

			onSubmit(text);
		} catch {
			error = 'Could not reach GitHub. Check your connection or paste the diff directly.';
		} finally {
			fetching = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="url-panel">
	<label for="pr-url-input" class="url-label">GitHub Pull Request URL</label>

	<div class="url-row">
		<input
			id="pr-url-input"
			type="url"
			bind:value={url}
			placeholder="https://github.com/owner/repo/pull/123"
			disabled={isDisabled}
			class="url-input"
			aria-describedby={error ? 'pr-url-error' : undefined}
		/>
		<button type="submit" disabled={!url.trim() || isDisabled} class="fetch-btn">
			{fetching ? 'Fetching…' : 'Fetch →'}
		</button>
	</div>

	{#if error}
		<p id="pr-url-error" class="url-error" role="alert">{error}</p>
	{/if}

	<p class="url-hint">Public GitHub PRs only — no authentication required.</p>
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
