<script lang="ts">
	import PastePanel from './PastePanel.svelte';
	import UploadPanel from './UploadPanel.svelte';
	import UrlPanel from './UrlPanel.svelte';

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
		{ id: 'paste', label: 'Paste' },
		{ id: 'upload', label: 'Upload' },
		{ id: 'url', label: 'URL' }
	];
</script>

<div class="input-container">
	<div class="input-tabs" role="tablist" aria-label="Input method">
		{#each tabs as tab}
			<button
				role="tab"
				aria-selected={activeTab === tab.id}
				aria-controls="panel-{tab.id}"
				id="tab-{tab.id}"
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
			id="panel-paste"
			role="tabpanel"
			aria-labelledby="tab-paste"
			hidden={activeTab !== 'paste'}
		>
			{#if activeTab === 'paste'}
				<PastePanel onSubmit={handleSubmit} {loading} />
			{/if}
		</div>

		<div
			id="panel-upload"
			role="tabpanel"
			aria-labelledby="tab-upload"
			hidden={activeTab !== 'upload'}
		>
			{#if activeTab === 'upload'}
				<UploadPanel onSubmit={handleSubmit} {loading} />
			{/if}
		</div>

		<div
			id="panel-url"
			role="tabpanel"
			aria-labelledby="tab-url"
			hidden={activeTab !== 'url'}
		>
			{#if activeTab === 'url'}
				<UrlPanel onSubmit={handleSubmit} {loading} />
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
