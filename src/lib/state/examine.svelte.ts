/**
 * Examine state — active question set + session, shared across the /examine route.
 *
 * `questionSet` and `rawSet` are the content source of truth, set once a JSON
 * set is parsed. `session` tracks progress through a chosen range/mode and is
 * the only piece persisted across reloads (see AppShell + storage.ts).
 */
import type { ExamineMode, ExamineSession, QuestionSet, UserAnswer } from '$lib/types.js';

let rawSet = $state('');
let questionSet = $state<QuestionSet | null>(null);
let session = $state<ExamineSession | null>(null);

export const examineState = {
	get rawSet() {
		return rawSet;
	},
	get questionSet() {
		return questionSet;
	},
	get session() {
		return session;
	},

	setQuestionSet(raw: string, qs: QuestionSet) {
		rawSet = raw;
		questionSet = qs;
		session = null; // a freshly loaded set clears any prior session
	},

	startSession(
		range: { from: number; to: number },
		mode: ExamineMode,
		timerEnabled: boolean,
		shuffleQuestions = false,
		shuffleOptions = false
	) {
		if (!questionSet) return;
		session = {
			setTitle: questionSet.metadata.title,
			totalQuestions: questionSet.questions.length,
			selectedRange: range,
			mode,
			shuffleQuestions,
			shuffleOptions,
			shuffleSeed: Math.floor(Math.random() * 2 ** 31),
			currentIndex: 0,
			answers: {},
			flagged: [],
			timerEnabled,
			startedAt: Date.now(),
			lastSavedAt: Date.now(),
			finishedAt: null
		};
	},

	selectAnswer(answer: UserAnswer) {
		if (!session) return;
		session = {
			...session,
			answers: { ...session.answers, [answer.questionId]: answer },
			lastSavedAt: Date.now()
		};
	},

	toggleFlag(questionId: string) {
		if (!session) return;
		const flagged = session.flagged.includes(questionId)
			? session.flagged.filter((id) => id !== questionId)
			: [...session.flagged, questionId];
		session = { ...session, flagged, lastSavedAt: Date.now() };
	},

	goTo(index: number) {
		if (!session) return;
		session = { ...session, currentIndex: index, lastSavedAt: Date.now() };
	},

	finishSession() {
		if (!session) return;
		session = { ...session, finishedAt: Date.now(), lastSavedAt: Date.now() };
	},

	restoreSession(raw: string, qs: QuestionSet, sess: ExamineSession) {
		rawSet = raw;
		questionSet = qs;
		session = sess;
	},

	reset() {
		rawSet = '';
		questionSet = null;
		session = null;
	},

	/** Return to setup for the same loaded question set — no re-upload needed. */
	backToSetup() {
		session = null;
	}
};
