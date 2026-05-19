import type { ParsedDiff } from '$lib/types.js';

let _rawDiff = $state('');
let _parsedDiff = $state<ParsedDiff | null>(null);

export const differState = {
	get rawDiff() {
		return _rawDiff;
	},
	get parsedDiff() {
		return _parsedDiff;
	},

	setDiff(raw: string, parsed: ParsedDiff) {
		_rawDiff = raw;
		_parsedDiff = parsed;
	},
	clearDiff() {
		_rawDiff = '';
		_parsedDiff = null;
	}
};
