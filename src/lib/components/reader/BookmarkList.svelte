<script lang="ts">
	import { readerState } from '$lib/state/reader.svelte.js';
	import { scrollToElement } from '$lib/utils/scroll.js';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = false, onClose }: Props = $props();

	function jumpTo(headingId: string) {
		scrollToElement(headingId);
		onClose?.();
	}

	function formatDate(ts: number) {
		return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(ts));
	}
</script>

{#if open}
	<aside
		class="bookmark-panel settings-panel"
		aria-label="Bookmarks"
	>
		<div class="panel-header">
			<h2 class="panel-title">Bookmarks</h2>
			<button onclick={onClose} aria-label="Close bookmarks" class="close-btn">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18"/>
					<line x1="6" y1="6" x2="18" y2="18"/>
				</svg>
			</button>
		</div>

		{#if readerState.bookmarks.length === 0}
			<p class="empty-msg">No bookmarks yet.</p>
		{:else}
			<ul class="bookmark-list" role="list">
				{#each [...readerState.bookmarks].reverse() as bm}
					<li class="bookmark-item">
						<button
							onclick={() => jumpTo(bm.headingId)}
							class="bookmark-jump"
							title="Jump to: {bm.headingText}"
						>
							{bm.headingText}
						</button>
						<span class="bookmark-date">{formatDate(bm.createdAt)}</span>
						<button
							onclick={() => readerState.removeBookmark(bm.id)}
							aria-label="Remove bookmark: {bm.headingText}"
							class="bookmark-remove"
						>
							<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<line x1="18" y1="6" x2="6" y2="18"/>
								<line x1="6" y1="6" x2="18" y2="18"/>
							</svg>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</aside>
{/if}

<style>
	.bookmark-panel {
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
		gap: 0.75rem;
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

	.empty-msg {
		font-size: 0.875rem;
		color: var(--color-ink-muted);
		margin: 0;
	}

	.bookmark-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.bookmark-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 6px;
		transition: background-color 200ms ease;
	}

	.bookmark-item:hover {
		background-color: var(--color-surface-alt);
	}

	.bookmark-jump {
		flex: 1;
		text-align: left;
		font-size: 0.875rem;
		color: var(--color-ink);
		background: transparent;
		border: none;
		cursor: pointer;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: 0;
	}

	.bookmark-date {
		font-size: 0.75rem;
		color: var(--color-ink-muted);
		flex-shrink: 0;
	}

	.bookmark-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: none;
		background: transparent;
		color: var(--color-ink-muted);
		cursor: pointer;
		border-radius: 3px;
		opacity: 0;
		transition: opacity 200ms ease, color 200ms ease;
		flex-shrink: 0;
	}

	.bookmark-item:hover .bookmark-remove {
		opacity: 1;
	}

	.bookmark-remove:hover {
		color: oklch(0.55 0.18 25);
	}
</style>
