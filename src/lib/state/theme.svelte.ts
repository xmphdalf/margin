/**
 * Theme state — pure reactive value.
 * DOM sync and localStorage persistence live in AppShell.svelte only.
 */
import type { Theme } from '$lib/types.js';

let current = $state<Theme>('light');

export const themeState = {
	get current() {
		return current;
	},
	set(t: Theme) {
		current = t;
	}
};
