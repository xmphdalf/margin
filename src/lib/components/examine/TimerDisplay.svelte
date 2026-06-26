<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		startedAt: number;
	}

	let { startedAt }: Props = $props();

	let now = $state(Date.now());

	onMount(() => {
		const id = setInterval(() => {
			now = Date.now();
		}, 1000);
		return () => clearInterval(id);
	});

	const label = $derived.by(() => {
		const totalSeconds = Math.max(0, Math.floor((now - startedAt) / 1000));
		const m = Math.floor(totalSeconds / 60);
		const s = totalSeconds % 60;
		return `${m}:${String(s).padStart(2, '0')}`;
	});
</script>

<span class="timer" aria-label="Elapsed time {label}">{label}</span>

<style>
	.timer {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-ink-muted);
	}
</style>
