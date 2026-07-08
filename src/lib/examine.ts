/**
 * Examine question-set parsing & grading.
 *
 * Steps: JSON.parse → structural validation → return QuestionSet.
 * Grading is pure and stateless — no side effects, no storage access.
 */
import type { CaseStudy, Question, QuestionSet } from './types.js';

function fail(message: string): never {
	throw new Error(message);
}

/** Parse and validate a raw JSON question set, throwing a descriptive Error on any violation. */
export function parseQuestionSet(raw: string): QuestionSet {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		fail('That doesn\'t look like valid JSON.');
	}

	if (typeof data !== 'object' || data === null) fail('Question set must be a JSON object.');
	const set = data as Partial<QuestionSet>;

	if (!set.metadata?.title) fail('Question set is missing metadata.title.');
	if (!Array.isArray(set.questions) || set.questions.length === 0) {
		fail('Question set must include a non-empty questions array.');
	}

	const questions = set.questions as Question[];

	const caseStudyIds = new Set<string>();
	if (set.caseStudies !== undefined) {
		if (!Array.isArray(set.caseStudies)) fail('caseStudies must be an array.');
		for (const cs of set.caseStudies as CaseStudy[]) {
			if (!cs.id) fail('Every case study needs a unique id.');
			if (caseStudyIds.has(cs.id)) fail(`Duplicate case study id: "${cs.id}".`);
			caseStudyIds.add(cs.id);
			if (!cs.title) fail(`Case study "${cs.id}" is missing a title.`);
			if (!cs.body) fail(`Case study "${cs.id}" is missing a body.`);
		}
	}

	const ids = new Set<string>();
	const numbers: number[] = [];
	for (const q of questions) {
		if (!q.id) fail('Every question needs a unique id.');
		if (ids.has(q.id)) fail(`Duplicate question id: "${q.id}".`);
		ids.add(q.id);
		numbers.push(q.number);

		if (!q.content?.stem) fail(`Question "${q.id}" is missing content.stem.`);

		if (q.caseStudyId && !caseStudyIds.has(q.caseStudyId)) {
			fail(`Question "${q.id}" references an unknown case study: "${q.caseStudyId}".`);
		}

		if (q.type === 'true-false') {
			if (q.content.correct !== 'true' && q.content.correct !== 'false') {
				fail(`Question "${q.id}" (true-false) needs content.correct to be "true" or "false".`);
			}
		} else if (q.type === 'multiple-choice' || q.type === 'multiple-choice-multiple-correct') {
			const options = q.content.options;
			if (!options || options.length === 0) {
				fail(`Question "${q.id}" needs at least one option.`);
			}
			const correctCount = options.filter((o) => o.isCorrect).length;
			if (correctCount === 0) fail(`Question "${q.id}" has no option marked isCorrect.`);
			if (q.type === 'multiple-choice-multiple-correct' && q.content.correctCount !== correctCount) {
				fail(`Question "${q.id}": correctCount (${q.content.correctCount}) doesn't match the number of isCorrect options (${correctCount}).`);
			}
		} else {
			fail(`Question "${q.id}" has an unknown type: "${q.type}".`);
		}
	}

	const sorted = [...numbers].sort((a, b) => a - b);
	const sequential = sorted.every((n, i) => n === i + 1);
	if (!sequential) fail('Question numbers must be sequential, starting at 1.');

	return set as QuestionSet;
}

/** The case study a question belongs to, or undefined for standalone questions. */
export function caseStudyFor(set: QuestionSet, question: Question): CaseStudy | undefined {
	if (!question.caseStudyId) return undefined;
	return set.caseStudies?.find((cs) => cs.id === question.caseStudyId);
}

/** How many options must be selected before an answer can be revealed/submitted. */
export function requiredSelectionCount(question: Question): number {
	if (question.type === 'multiple-choice-multiple-correct') {
		return question.content.correctCount ?? 1;
	}
	return 1;
}

/** Toggle a single key into/out of the current selection, respecting single- vs multi-select. */
export function toggleSelection(
	question: Question,
	current: string | string[] | undefined,
	key: string
): string | string[] {
	if (question.type === 'multiple-choice-multiple-correct') {
		const arr = Array.isArray(current) ? current : [];
		return arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];
	}
	return key;
}

/** Grade a single answer against its question. Pure — no side effects. */
export function isAnswerCorrect(question: Question, selected: string | string[]): boolean {
	if (question.type === 'true-false') {
		return selected === question.content.correct;
	}

	const correctKeys = new Set(
		(question.content.options ?? []).filter((o) => o.isCorrect).map((o) => o.key)
	);

	if (question.type === 'multiple-choice-multiple-correct') {
		const sel = Array.isArray(selected) ? selected : [selected];
		return sel.length === correctKeys.size && sel.every((k) => correctKeys.has(k));
	}

	// multiple-choice (single correct)
	return !Array.isArray(selected) && correctKeys.has(selected);
}

/** Static, hand-written example covering all three question types — display-only, never parsed. */
export const SAMPLE_QUESTION_SET_JSON = `{
  "metadata": {
    "id": "sample-set",
    "title": "Sample Question Set",
    "totalQuestions": 3
  },
  "caseStudies": [
    {
      "id": "cs-1",
      "title": "Margin at a Glance",
      "body": "Margin is a reader-first Markdown web application.\\n\\n## Architecture\\n\\n- Runs entirely as a static site\\n- No backend, no accounts, no tracking\\n\\n## Design Tokens\\n\\nColor is defined with the **oklch** color space throughout."
    }
  ],
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "type": "multiple-choice",
      "caseStudyId": "cs-1",
      "content": {
        "stem": "Which token system does Margin use for color?",
        "options": [
          { "key": "A", "text": "Tailwind defaults", "isCorrect": false, "explanation": "Margin defines its own semantic tokens." },
          { "key": "B", "text": "oklch semantic tokens", "isCorrect": true, "explanation": "Three-layer token system, oklch throughout." }
        ]
      }
    },
    {
      "id": "q2",
      "number": 2,
      "type": "multiple-choice-multiple-correct",
      "content": {
        "stem": "Which of these are Margin reading modes? (choose 2)",
        "correctCount": 2,
        "options": [
          { "key": "A", "text": "Book", "isCorrect": true, "explanation": "A core reading mode." },
          { "key": "B", "text": "Arcade", "isCorrect": false, "explanation": "Not a Margin mode." },
          { "key": "C", "text": "Focus", "isCorrect": true, "explanation": "A core reading mode." }
        ]
      }
    },
    {
      "id": "q3",
      "number": 3,
      "type": "true-false",
      "content": {
        "stem": "Margin shows a percentage score after an exam.",
        "correct": "false",
        "explanation": "Examine reports counts honestly — never a percentage or grade."
      }
    }
  ]
}`;
