<script lang="ts">
	import type { ExamineMode, QuestionSet } from '$lib/types.js';

	interface Props {
		questionSet: QuestionSet;
		onBegin: (range: { from: number; to: number }, mode: ExamineMode, timerEnabled: boolean) => void;
	}

	let { questionSet, onBegin }: Props = $props();

	const total = $derived(questionSet.questions.length);

	const RANGE_CHUNK = 25;
	const presets = $derived.by(() => {
		const chunks: { from: number; to: number }[] = [];
		for (let start = 1; start <= total; start += RANGE_CHUNK) {
			chunks.push({ from: start, to: Math.min(start + RANGE_CHUNK - 1, total) });
		}
		return chunks;
	});

	type RangeChoice = 'all' | number | 'custom';
	let rangeChoice = $state<RangeChoice>('all');
	let customFrom = $state(1);
	let customTo = $state(1);
	let mode = $state<ExamineMode>('examine');
	let timerEnabled = $state(false);

	const selectedRange = $derived.by(() => {
		if (rangeChoice === 'all') return { from: 1, to: total };
		if (rangeChoice === 'custom') return { from: customFrom, to: customTo };
		return presets[rangeChoice];
	});

	const rangeValid = $derived(
		selectedRange.from >= 1 &&
			selectedRange.to <= total &&
			selectedRange.from <= selectedRange.to
	);
</script>

<div class="setup">
	<h1 class="set-title">{questionSet.metadata.title}</h1>
	<p class="set-count">{total} question{total === 1 ? '' : 's'} available</p>

	<fieldset class="control-group">
		<legend class="control-label">What would you like to examine?</legend>
		<div class="chip-row">
			<button class="chip" class:active={rangeChoice === 'all'} onclick={() => (rangeChoice = 'all')}>
				All ({total})
			</button>
			{#each presets as preset, i}
				<button class="chip" class:active={rangeChoice === i} onclick={() => (rangeChoice = i)}>
					{preset.from}–{preset.to}
				</button>
			{/each}
			<button class="chip" class:active={rangeChoice === 'custom'} onclick={() => (rangeChoice = 'custom')}>
				Custom
			</button>
		</div>
		{#if rangeChoice === 'custom'}
			<div class="custom-range">
				<label class="custom-field">
					From
					<input type="number" min="1" max={total} bind:value={customFrom} />
				</label>
				<label class="custom-field">
					To
					<input type="number" min="1" max={total} bind:value={customTo} />
				</label>
			</div>
		{/if}
	</fieldset>

	<fieldset class="control-group">
		<legend class="control-label">Select a mode</legend>
		<div class="chip-row">
			{#each [{ id: 'read', label: 'Read' }, { id: 'reflect', label: 'Reflect' }, { id: 'examine', label: 'Examine' }] as opt}
				<button
					class="chip"
					aria-pressed={mode === opt.id}
					class:active={mode === opt.id}
					onclick={() => (mode = opt.id as ExamineMode)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</fieldset>

	{#if mode === 'examine'}
		<label class="toggle-row">
			<input type="checkbox" bind:checked={timerEnabled} />
			<span>Show an optional timer</span>
		</label>
	{/if}

	<button
		class="nav-button primary"
		disabled={!rangeValid}
		onclick={() => onBegin(selectedRange, mode, timerEnabled)}
	>
		Begin »
	</button>
</div>

<style>
	.setup {
		max-width: var(--prose-measure, 68ch);
		margin: 0 auto;
		padding: 3rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.set-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 500;
		color: var(--color-ink);
		margin: 0;
	}

	.set-count {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.control-group {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.control-label {
		font-size: 0.875rem;
		color: var(--color-ink);
		font-weight: 500;
		padding: 0;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chip {
		padding: 0.5rem 0.875rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: transparent;
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
		cursor: pointer;
		transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
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

	.chip:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.custom-range {
		display: flex;
		gap: 1rem;
	}

	.custom-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: var(--color-ink-muted);
	}

	.custom-field input {
		width: 5rem;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background-color: var(--color-surface);
		color: var(--color-ink);
		font-family: var(--font-sans);
		font-size: 0.875rem;
	}

	.custom-field input:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
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

	.toggle-row:hover {
		color: var(--color-ink);
	}

	.toggle-row input[type='checkbox'] {
		accent-color: var(--color-accent);
		width: 0.9rem;
		height: 0.9rem;
		cursor: pointer;
	}

	.nav-button {
		align-self: flex-start;
		font-family: var(--font-sans);
		font-size: 0.9375rem;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: var(--color-surface);
		color: var(--color-ink);
		cursor: pointer;
		transition: border-color 200ms ease, background-color 200ms ease, opacity 200ms ease;
	}

	.nav-button.primary {
		background: var(--color-ink);
		color: var(--color-surface);
		border-color: var(--color-ink);
	}

	.nav-button.primary:hover:not(:disabled) {
		opacity: 0.85;
	}

	.nav-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.nav-button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
