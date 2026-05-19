<script lang="ts">
	import { onMount } from 'svelte';
	import type { ParsedDiff } from '$lib/types.js';
	import DiffSynopsis from './DiffSynopsis.svelte';
	import DiffFileChapter from './DiffFileChapter.svelte';

	interface Props {
		diff: ParsedDiff;
		activeFileId?: string;
		skimMode?: boolean;
		onActiveFileChange?: (id: string) => void;
	}

	let { diff, activeFileId = '', skimMode = false, onActiveFileChange }: Props = $props();

	onMount(() => {
		const fileIds = diff.files.map((f) => f.id);
		if (fileIds.length === 0) return;

		function updateActive() {
			const atBottom =
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

			if (atBottom) {
				onActiveFileChange?.(fileIds[fileIds.length - 1]);
				return;
			}

			const threshold = window.innerHeight * 0.3;
			let active = fileIds[0];
			for (const id of fileIds) {
				const el = document.getElementById(id);
				if (!el) continue;
				if (el.getBoundingClientRect().top <= threshold) active = id;
				else break;
			}
			if (active) onActiveFileChange?.(active);
		}

		window.addEventListener('scroll', updateActive, { passive: true });
		updateActive();
		return () => window.removeEventListener('scroll', updateActive);
	});
</script>

<article class="diff-view">
	<DiffSynopsis {diff} />
	{#each diff.files as file (file.id)}
		<DiffFileChapter {file} {activeFileId} {skimMode} />
	{/each}
	<div class="diff-end" aria-hidden="true"></div>
</article>

<style>
	.diff-view {
		flex: 1;
		min-width: 0;
		padding: 2rem 0 0;
	}

	.diff-end {
		height: 12rem;
	}
</style>
