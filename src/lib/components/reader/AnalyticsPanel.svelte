<script lang="ts">
	import { analyticsState } from '$lib/state/analytics.svelte.js';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = false, onClose }: Props = $props();

	const session = $derived(analyticsState.currentSession);
	const allSessions = $derived(analyticsState.sessions);

	const totalTimeMs = $derived(allSessions.reduce((s, x) => s + x.timeSpentMs, 0));
	const totalWords = $derived(allSessions.reduce((s, x) => s + x.wordsRead, 0));

	function formatTime(ms: number): string {
		const mins = Math.round(ms / 60000);
		if (mins < 1) return '<1m';
		if (mins < 60) return `${mins}m`;
		return `${Math.floor(mins / 60)}h ${mins % 60}m`;
	}

	function formatWords(n: number): string {
		if (n < 1000) return String(n);
		return `${(n / 1000).toFixed(1)}k`;
	}
</script>

{#if open}
	<aside class="analytics-panel" aria-label="Reading analytics">
		<div class="panel-header">
			<h2 class="panel-title">Analytics</h2>
			<button onclick={onClose} aria-label="Close analytics" class="close-btn">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>

		<section class="stat-section">
			<p class="section-label">This session</p>
			{#if session}
				<div class="stat-grid">
					<div class="stat">
						<span class="stat-value">{formatTime(session.timeSpentMs)}</span>
						<span class="stat-name">reading</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatWords(session.wordsRead)}</span>
						<span class="stat-name">words read</span>
					</div>
					<div class="stat">
						<span class="stat-value">{session.sectionsCompleted}</span>
						<span class="stat-name">sections done</span>
					</div>
				</div>
			{:else}
				<p class="empty-msg">No active session.</p>
			{/if}
		</section>

		{#if allSessions.length > 0}
			<section class="stat-section">
				<p class="section-label">All time</p>
				<div class="stat-grid">
					<div class="stat">
						<span class="stat-value">{allSessions.length}</span>
						<span class="stat-name">sessions</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatTime(totalTimeMs)}</span>
						<span class="stat-name">total time</span>
					</div>
					<div class="stat">
						<span class="stat-value">{formatWords(totalWords)}</span>
						<span class="stat-name">words read</span>
					</div>
				</div>
			</section>
		{/if}
	</aside>
{/if}

<style>
	.analytics-panel {
		position: fixed;
		top: 3rem;
		right: 0;
		width: 280px;
		height: calc(100vh - 3rem);
		background-color: var(--color-surface);
		border-left: 1px solid var(--color-border);
		overflow-y: auto;
		z-index: 40;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
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

	.close-btn:hover {
		color: var(--color-ink);
	}

	.stat-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.stat-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.625rem 0.5rem;
		background-color: var(--color-surface-alt);
		border-radius: 6px;
		text-align: center;
	}

	.stat-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-ink);
		line-height: 1;
	}

	.stat-name {
		font-size: 0.6875rem;
		color: var(--color-ink-muted);
		line-height: 1.2;
	}

	.empty-msg {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		margin: 0;
	}
</style>
