<script lang="ts">
	import DiffPastePanel from './DiffPastePanel.svelte';
	import DiffUploadPanel from './DiffUploadPanel.svelte';
	import DiffUrlPanel from './DiffUrlPanel.svelte';

	type Tab = 'paste' | 'upload' | 'url';

	interface Props {
		onSubmit: (raw: string) => Promise<void> | void;
	}

	let { onSubmit }: Props = $props();

	let activeTab = $state<Tab>('paste');
	let loading = $state(false);

	async function handleSubmit(raw: string) {
		loading = true;
		try {
			await onSubmit(raw);
		} finally {
			loading = false;
		}
	}

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'paste', label: 'Paste diff' },
		{ id: 'upload', label: '.patch file' },
		{ id: 'url', label: 'PR URL' }
	];
</script>

<div class="input-container">
	<div class="input-tabs" role="tablist" aria-label="Diff input method">
		{#each tabs as tab}
			<button
				role="tab"
				aria-selected={activeTab === tab.id}
				aria-controls="diff-panel-{tab.id}"
				id="diff-tab-{tab.id}"
				onclick={() => (activeTab = tab.id)}
				class="tab-btn"
				class:active={activeTab === tab.id}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="tab-content">
		<div
			id="diff-panel-paste"
			role="tabpanel"
			aria-labelledby="diff-tab-paste"
			hidden={activeTab !== 'paste'}
		>
			{#if activeTab === 'paste'}
				<DiffPastePanel onSubmit={handleSubmit} {loading} />
			{/if}
		</div>

		<div
			id="diff-panel-upload"
			role="tabpanel"
			aria-labelledby="diff-tab-upload"
			hidden={activeTab !== 'upload'}
		>
			{#if activeTab === 'upload'}
				<DiffUploadPanel onSubmit={handleSubmit} {loading} />
			{/if}
		</div>

		<div
			id="diff-panel-url"
			role="tabpanel"
			aria-labelledby="diff-tab-url"
			hidden={activeTab !== 'url'}
		>
			{#if activeTab === 'url'}
				<DiffUrlPanel onSubmit={handleSubmit} {loading} />
			{/if}
		</div>
	</div>
</div>

<style>
	.input-container {
		width: 100%;
		max-width: 680px;
		margin: 0 auto;
	}

	.input-tabs {
		display: flex;
		gap: 0;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.25rem;
	}

	.tab-btn {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		margin-bottom: -1px;
		cursor: pointer;
		transition: color 200ms ease, border-color 200ms ease;
	}

	.tab-btn:hover {
		color: var(--color-ink);
	}

	.tab-btn.active {
		color: var(--color-ink);
		border-bottom-color: var(--color-accent);
		font-weight: 500;
	}

	.tab-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: -2px;
	}

	.tab-content {
		width: 100%;
	}
</style>
