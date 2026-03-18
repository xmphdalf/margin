<script lang="ts">
	interface Props {
		onSubmit: (raw: string) => void;
		loading?: boolean;
	}

	let { onSubmit, loading = false }: Props = $props();

	let value = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		const trimmed = value.trim();
		if (trimmed) onSubmit(trimmed);
	}

	function handleKeydown(e: KeyboardEvent) {
		// Ctrl/Cmd + Enter to submit
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			const trimmed = value.trim();
			if (trimmed) onSubmit(trimmed);
		}
	}
</script>

<form onsubmit={handleSubmit} class="paste-panel">
	<label for="markdown-input" class="sr-only">Paste your Markdown here</label>
	<textarea
		id="markdown-input"
		bind:value
		onkeydown={handleKeydown}
		placeholder="Paste your Markdown here...&#10;&#10;# Hello World&#10;&#10;Start typing or paste content to begin reading."
		spellcheck="false"
		autocomplete="off"
		class="paste-textarea"
		disabled={loading}
	></textarea>
	<div class="paste-footer">
		<span class="hint">⌘ + Enter to read</span>
		<button
			type="submit"
			disabled={!value.trim() || loading}
			class="read-btn"
		>
			{loading ? 'Loading…' : 'Read →'}
		</button>
	</div>
</form>

<style>
	.paste-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		height: 100%;
	}

	.paste-textarea {
		flex: 1;
		width: 100%;
		min-height: 320px;
		padding: 1rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		resize: vertical;
		outline: none;
		transition: border-color 200ms ease;
	}

	.paste-textarea:focus {
		border-color: var(--color-accent);
	}

	.paste-textarea::placeholder {
		color: var(--color-ink-muted);
		font-family: var(--font-sans);
		font-size: 0.875rem;
	}

	.paste-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.paste-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.hint {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
	}

	.read-btn {
		padding: 0.5rem 1.25rem;
		background-color: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 200ms ease;
	}

	.read-btn:hover:not(:disabled) {
		opacity: 0.85;
	}

	.read-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.read-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
