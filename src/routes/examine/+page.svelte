<script lang="ts">
	import { examineState } from '$lib/state/examine.svelte.js';
	import { goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
	import TypographyControls from '$lib/components/settings/TypographyControls.svelte';
	import ExamineSetup from '$lib/components/examine/ExamineSetup.svelte';
	import ReadMode from '$lib/components/examine/ReadMode.svelte';
	import ReflectMode from '$lib/components/examine/ReflectMode.svelte';
	import ExamineMode from '$lib/components/examine/ExamineMode.svelte';
	import ExamineReview from '$lib/components/examine/ExamineReview.svelte';
	import ResultsView from '$lib/components/examine/ResultsView.svelte';
	import ResumePrompt from '$lib/components/examine/ResumePrompt.svelte';
	import type { ExamineMode as ExamineModeType } from '$lib/types.js';

	let { data }: { data: { restored: boolean } } = $props();

	let resumeDismissed = $state(false);
	let reviewing = $state(false);
	let showSettings = $state(false);

	function handleBegin(range: { from: number; to: number }, mode: ExamineModeType, timerEnabled: boolean) {
		reviewing = false;
		examineState.startSession(range, mode, timerEnabled);
	}

	function handleLoadNewSet() {
		examineState.reset();
		goto(resolve('/'));
	}

	function handleRetake() {
		const session = examineState.session;
		if (!session) return;
		reviewing = false;
		examineState.startSession(session.selectedRange, session.mode, session.timerEnabled);
	}

	type Stage = 'setup' | 'resume' | 'session' | 'review' | 'results';
	const stage = $derived.by((): Stage => {
		if (!examineState.questionSet) return 'setup';
		if (!examineState.session) return 'setup';
		if (examineState.session.finishedAt) return 'results';
		if (data.restored && !resumeDismissed) return 'resume';
		if (reviewing && examineState.session.mode === 'examine') return 'review';
		return 'session';
	});

	const visibleQuestions = $derived.by(() => {
		const qs = examineState.questionSet;
		const session = examineState.session;
		if (!qs || !session) return [];
		return qs.questions
			.filter((q) => q.number >= session.selectedRange.from && q.number <= session.selectedRange.to)
			.sort((a, b) => a.number - b.number);
	});
</script>

<svelte:head>
	<title>Examine — Margin</title>
</svelte:head>

<SiteHeader showHomeLink={true} homeLinkLabel="new set" homeLinkHref="{base}/?mode=examine">
	{#snippet tools()}
		<button
			onclick={() => (showSettings = !showSettings)}
			aria-label="Typography settings"
			aria-pressed={showSettings}
			class="tool-btn"
			class:active={showSettings}
			title="Typography settings"
		>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="3"/>
				<path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
			</svg>
		</button>
	{/snippet}
</SiteHeader>

<TypographyControls open={showSettings} onClose={() => (showSettings = false)} />

<main class="examine-main" id="main-content">
	{#if stage === 'setup' && examineState.questionSet}
		<ExamineSetup questionSet={examineState.questionSet} onBegin={handleBegin} />
	{:else if stage === 'resume'}
		<ResumePrompt
			onContinue={() => (resumeDismissed = true)}
			onStartFresh={() => {
				resumeDismissed = true;
				examineState.startSession(
					examineState.session!.selectedRange,
					examineState.session!.mode,
					examineState.session!.timerEnabled
				);
			}}
		/>
	{:else if stage === 'session' && examineState.session}
		{#if examineState.session.mode === 'read'}
			<ReadMode questions={visibleQuestions} />
		{:else if examineState.session.mode === 'reflect'}
			<ReflectMode questions={visibleQuestions} />
		{:else}
			<ExamineMode questions={visibleQuestions} onReview={() => (reviewing = true)} />
		{/if}
	{:else if stage === 'review'}
		<ExamineReview questions={visibleQuestions} onBack={() => (reviewing = false)} />
	{:else if stage === 'results'}
		<ResultsView questions={visibleQuestions} onRetake={handleRetake} onLoadNewSet={handleLoadNewSet} />
	{/if}
</main>

<style>
	.examine-main {
		max-width: var(--prose-measure, 68ch);
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		min-height: calc(100vh - 3rem);
	}

	.tool-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border: none;
		background: transparent;
		color: var(--color-ink-muted);
		border-radius: 6px;
		cursor: pointer;
		transition: color 200ms ease, background-color 200ms ease;
	}

	.tool-btn:hover {
		color: var(--color-ink);
		background-color: var(--color-surface-alt);
	}

	.tool-btn.active {
		color: var(--color-accent);
		background-color: var(--color-surface-alt);
	}

	.tool-btn:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
