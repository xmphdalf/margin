<script lang="ts">
	import { settingsState } from '$lib/state/settings.svelte.js';
	import type { FontFamily, Measure } from '$lib/types.js';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = false, onClose }: Props = $props();

	const measures: { value: Measure; label: string }[] = [
		{ value: 'narrow', label: 'Narrow (60ch)' },
		{ value: 'default', label: 'Default (68ch)' },
		{ value: 'wide', label: 'Wide (80ch)' }
	];
</script>

{#if open}
	<aside class="settings-panel" aria-label="Typography settings">
		<div class="panel-header">
			<h2 class="panel-title">Typography</h2>
			<button onclick={onClose} aria-label="Close typography settings" class="close-btn">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>

		<!-- Font family -->
		<fieldset class="control-group control-group--fieldset">
			<legend class="control-label">Font</legend>
			<div class="font-toggle">
				<button
					onclick={() => settingsState.update({ fontFamily: 'serif' })}
					aria-pressed={settingsState.value.fontFamily === 'serif'}
					class="font-btn"
					class:active={settingsState.value.fontFamily === 'serif'}
					style="font-family: var(--font-serif);"
				>
					Serif
				</button>
				<button
					onclick={() => settingsState.update({ fontFamily: 'sans' })}
					aria-pressed={settingsState.value.fontFamily === 'sans'}
					class="font-btn"
					class:active={settingsState.value.fontFamily === 'sans'}
					style="font-family: var(--font-sans);"
				>
					Sans
				</button>
			</div>
		</fieldset>

		<!-- Font size -->
		<div class="control-group">
			<label class="control-label" for="font-size-range">
				Size
				<span class="control-value">{Math.round(settingsState.value.fontSize * 16)}px</span>
			</label>
			<input
				id="font-size-range"
				type="range"
				min="0.875"
				max="1.5"
				step="0.0625"
				value={settingsState.value.fontSize}
				oninput={(e) => settingsState.update({ fontSize: parseFloat((e.target as HTMLInputElement).value) })}
				class="range-input"
				aria-valuetext="{Math.round(settingsState.value.fontSize * 16)}px"
			/>
		</div>

		<!-- Line height -->
		<div class="control-group">
			<label class="control-label" for="line-height-range">
				Line height
				<span class="control-value">{settingsState.value.lineHeight.toFixed(2)}</span>
			</label>
			<input
				id="line-height-range"
				type="range"
				min="1.4"
				max="2.0"
				step="0.05"
				value={settingsState.value.lineHeight}
				oninput={(e) => settingsState.update({ lineHeight: parseFloat((e.target as HTMLInputElement).value) })}
				class="range-input"
			/>
		</div>

		<!-- Column width -->
		<fieldset class="control-group control-group--fieldset">
			<legend class="control-label">Width</legend>
			<div class="measure-options">
				{#each measures as m}
					<button
						onclick={() => settingsState.update({ measure: m.value })}
						aria-pressed={settingsState.value.measure === m.value}
						class="measure-btn"
						class:active={settingsState.value.measure === m.value}
					>
						{m.label}
					</button>
				{/each}
			</div>
		</fieldset>
	</aside>
{/if}

<style>
	.settings-panel {
		position: fixed;
		top: 3rem;
		right: 0;
		width: 260px;
		background-color: var(--color-surface);
		border-left: 1px solid var(--color-border);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		z-index: 40;
		max-height: calc(100vh - 3rem);
		overflow-y: auto;
		transition: background-color 400ms ease, border-color 400ms ease;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.panel-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-ink-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		background: transparent;
		color: var(--color-ink-muted);
		cursor: pointer;
		border-radius: 4px;
		transition: color 200ms ease;
	}

	.close-btn:hover { color: var(--color-ink); }

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* fieldset reset — inherits control-group layout, removes browser chrome */
	.control-group--fieldset {
		border: none;
		padding: 0;
		margin: 0;
		min-width: 0;
	}

	.control-label {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		font-weight: 500;
	}

	.control-value {
		color: var(--color-ink);
		font-weight: 400;
	}

	.font-toggle {
		display: flex;
		gap: 0.5rem;
	}

	.font-btn {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: transparent;
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
	}

	.font-btn:hover {
		color: var(--color-ink);
		border-color: var(--color-accent);
	}

	.font-btn.active {
		color: var(--color-accent);
		border-color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.range-input {
		width: 100%;
		accent-color: var(--color-accent);
		cursor: pointer;
	}

	.measure-options {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.measure-btn {
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: transparent;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		text-align: left;
		transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
	}

	.measure-btn:hover {
		color: var(--color-ink);
		border-color: var(--color-accent);
	}

	.measure-btn.active {
		color: var(--color-accent);
		border-color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}
</style>
