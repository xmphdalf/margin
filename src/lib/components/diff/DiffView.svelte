<!--
  DiffView is no longer used by the diff page.
  The new page implements all views directly.
  Kept here to avoid breaking any stray references.
-->
<script lang="ts">
	import type { ParsedDiff } from '$lib/types.js';

	interface Props {
		diff: ParsedDiff;
	}

	let { diff }: Props = $props();
</script>

<!-- unused -->
