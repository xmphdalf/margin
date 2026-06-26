<script lang="ts">
	import { examineState } from '$lib/state/examine.svelte.js';
	import { goto } from '$app/navigation';
	import { base, resolve } from '$app/paths';
	import SiteHeader from '$lib/components/layout/SiteHeader.svelte';
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

<SiteHeader showHomeLink={true} homeLinkLabel="new set" homeLinkHref="{base}/?mode=examine" />

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
		max-width: 680px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
		min-height: calc(100vh - 3rem);
	}
</style>
