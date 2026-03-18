<script lang="ts">
	interface Props {
		onSubmit: (raw: string) => void;
		loading?: boolean;
	}

	let { onSubmit, loading = false }: Props = $props();

	let dragOver = $state(false);
	let error = $state('');

	function readFile(file: File) {
		if (!file.name.endsWith('.md') && !file.name.endsWith('.txt') && !file.name.endsWith('.markdown')) {
			error = 'Please upload a .md, .markdown, or .txt file.';
			return;
		}
		error = '';
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			if (text?.trim()) onSubmit(text);
		};
		reader.readAsText(file);
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) readFile(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file) readFile(file);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}
</script>

<div
	class="upload-panel"
	class:drag-over={dragOver}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	role="region"
	aria-label="File upload area"
>
	<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="upload-icon" aria-hidden="true">
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
		<polyline points="17 8 12 3 7 8"/>
		<line x1="12" y1="3" x2="12" y2="15"/>
	</svg>

	<p class="upload-label">Drop a <code>.md</code> file here</p>
	<p class="upload-sub">or</p>

	<label class="file-label">
		<input
			type="file"
			accept=".md,.markdown,.txt"
			onchange={handleFileInput}
			disabled={loading}
			class="file-input"
		/>
		Browse files
	</label>

	{#if error}
		<p class="upload-error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.upload-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 320px;
		border: 2px dashed var(--color-border);
		border-radius: 12px;
		padding: 2.5rem;
		transition: border-color 200ms ease, background-color 200ms ease;
		text-align: center;
	}

	.upload-panel.drag-over {
		border-color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.upload-icon {
		color: var(--color-ink-muted);
		margin-bottom: 0.5rem;
	}

	.upload-label {
		font-size: 1rem;
		color: var(--color-ink);
		margin: 0;
	}

	.upload-label code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		background-color: var(--color-code-bg);
		padding: 0.1em 0.3em;
		border-radius: 3px;
	}

	.upload-sub {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.file-label {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1.25rem;
		background-color: var(--color-surface-alt);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 0.875rem;
		color: var(--color-ink);
		cursor: pointer;
		transition: border-color 200ms ease, background-color 200ms ease;
	}

	.file-label:hover {
		border-color: var(--color-accent);
		background-color: var(--color-surface);
	}

	.file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
	}

	.upload-error {
		font-size: 0.875rem;
		color: oklch(0.55 0.18 25);
		margin: 0.5rem 0 0;
	}
</style>
