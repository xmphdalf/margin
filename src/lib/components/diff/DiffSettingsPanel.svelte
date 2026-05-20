<script lang="ts">
	interface Props {
		open?: boolean;
		onClose?: () => void;
		softness: 'off' | 'soft' | 'strong';
		density: 'tight' | 'normal' | 'airy';
		prefixMode: 'loud' | 'quiet' | 'bare';
		showSpine: boolean;
		showKeystrokes: boolean;
		showMarginalia: boolean;
		onSoftness: (v: 'off' | 'soft' | 'strong') => void;
		onDensity: (v: 'tight' | 'normal' | 'airy') => void;
		onPrefixMode: (v: 'loud' | 'quiet' | 'bare') => void;
		onShowSpine: (v: boolean) => void;
		onShowKeystrokes: (v: boolean) => void;
		onShowMarginalia: (v: boolean) => void;
	}

	let {
		open = false,
		onClose,
		softness,
		density,
		prefixMode,
		showSpine,
		showKeystrokes,
		showMarginalia,
		onSoftness,
		onDensity,
		onPrefixMode,
		onShowSpine,
		onShowKeystrokes,
		onShowMarginalia
	}: Props = $props();
</script>

{#if open}
	<aside class="settings-panel" aria-label="Reader settings">
		<div class="panel-header">
			<h2 class="panel-title">Reader</h2>
			<button onclick={onClose} aria-label="Close reader settings" class="close-btn">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>

		<!-- Reading line -->
		<fieldset class="control-group">
			<legend class="control-label">Reading line</legend>
			<div class="chip-row">
				{#each ['off', 'soft', 'strong'] as opt}
					<button
						class="chip"
						class:active={softness === opt}
						onclick={() => onSoftness(opt as typeof softness)}
					>{opt}</button>
				{/each}
			</div>
		</fieldset>

		<!-- Breath -->
		<fieldset class="control-group">
			<legend class="control-label">Breath</legend>
			<div class="chip-row">
				{#each ['tight', 'normal', 'airy'] as opt}
					<button
						class="chip"
						class:active={density === opt}
						onclick={() => onDensity(opt as typeof density)}
					>{opt}</button>
				{/each}
			</div>
		</fieldset>

		<!-- Diff lines -->
		<fieldset class="control-group">
			<legend class="control-label">Diff lines</legend>
			<div class="chip-row">
				{#each ['loud', 'quiet', 'bare'] as opt}
					<button
						class="chip"
						class:active={prefixMode === opt}
						onclick={() => onPrefixMode(opt as typeof prefixMode)}
					>{opt}</button>
				{/each}
			</div>
		</fieldset>

		<!-- Periphery toggles -->
		<fieldset class="control-group">
			<legend class="control-label">Periphery</legend>
			<div class="toggle-stack">
				<label class="toggle-row">
					<input
						type="checkbox"
						checked={showSpine}
						onchange={(e) => onShowSpine((e.target as HTMLInputElement).checked)}
					/>
					<span>Spine</span>
				</label>
				<label class="toggle-row">
					<input
						type="checkbox"
						checked={showKeystrokes}
						onchange={(e) => onShowKeystrokes((e.target as HTMLInputElement).checked)}
					/>
					<span>Keystroke hints</span>
				</label>
				<label class="toggle-row">
					<input
						type="checkbox"
						checked={showMarginalia}
						onchange={(e) => onShowMarginalia((e.target as HTMLInputElement).checked)}
					/>
					<span>Marginalia</span>
				</label>
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

	/* fieldset reset */
	.control-group {
		border: none;
		padding: 0;
		margin: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.control-label {
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		font-weight: 500;
	}

	/* Chip row */
	.chip-row {
		display: flex;
		gap: 0.375rem;
	}

	.chip {
		flex: 1;
		padding: 0.375rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: transparent;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
		text-align: center;
	}

	.chip:hover {
		color: var(--color-ink);
		border-color: var(--color-accent);
	}

	.chip.active {
		color: var(--color-accent);
		border-color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	/* Toggle rows */
	.toggle-stack {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: color 200ms ease;
	}

	.toggle-row:hover { color: var(--color-ink); }

	.toggle-row input[type="checkbox"] {
		accent-color: var(--color-accent);
		width: 0.9rem;
		height: 0.9rem;
		cursor: pointer;
	}
</style>
