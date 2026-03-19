/**
 * Reading session analytics — local only, never transmitted.
 *
 * Tracks words read, time spent, and sections completed per session.
 * Sessions are persisted to localStorage (max 50, oldest evicted).
 */

export interface ReadingSession {
	docHash: string;
	startedAt: number;
	wordsRead: number;
	timeSpentMs: number;
	sectionsCompleted: number;
}

let currentSession = $state<ReadingSession | null>(null);
let sessions = $state<ReadingSession[]>([]);

export const analyticsState = {
	get currentSession() {
		return currentSession;
	},
	get sessions() {
		return sessions;
	},

	startSession(docHash: string) {
		currentSession = {
			docHash,
			startedAt: Date.now(),
			wordsRead: 0,
			timeSpentMs: 0,
			sectionsCompleted: 0
		};
	},

	updateProgress(scrollProgress: number, totalWords: number, sectionsCompleted: number) {
		if (!currentSession) return;
		currentSession = {
			...currentSession,
			wordsRead: Math.round(totalWords * scrollProgress),
			timeSpentMs: Date.now() - currentSession.startedAt,
			sectionsCompleted
		};
	},

	endSession() {
		if (!currentSession) return;
		sessions = [...sessions, currentSession].slice(-50);
		currentSession = null;
	},

	setSessions(saved: ReadingSession[]) {
		sessions = saved;
	}
};
