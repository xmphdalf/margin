/**
 * Typography / display settings state.
 * Defaults provide an excellent reading experience out of the box.
 */
import type { ReaderSettings } from '$lib/types.js';

export const DEFAULT_SETTINGS: ReaderSettings = {
	fontSize: 1.125, // 18px
	fontFamily: 'serif',
	lineHeight: 1.75,
	measure: 'default' // 68ch
};

let s = $state<ReaderSettings>({ ...DEFAULT_SETTINGS });

export const settingsState = {
	get value() {
		return s;
	},
	update(patch: Partial<ReaderSettings>) {
		s = { ...s, ...patch };
	},
	reset() {
		s = { ...DEFAULT_SETTINGS };
	}
};

/** Map measure token to actual ch value for inline CSS */
export const MEASURE_MAP: Record<ReaderSettings['measure'], string> = {
	narrow: '60ch',
	default: '68ch',
	wide: '80ch'
};
