import { ReasoningEffort } from '$lib/enums';
import type { ReasoningEffortLevel } from '$lib/types';

/**
 * Built-in reasoning effort levels for a native llama.cpp server (used as the
 * fallback when the proxy supplies no per-model reasoning metadata). Remote
 * providers drive their own effort list from `/props` instead.
 */
export const REASONING_EFFORT_LEVELS: ReasoningEffortLevel[] = [
	{ value: 'off', label: 'Off', isOff: true },
	{ value: ReasoningEffort.LOW, label: 'Low' },
	{ value: ReasoningEffort.MEDIUM, label: 'Medium' },
	{ value: ReasoningEffort.HIGH, label: 'High' },
	{ value: ReasoningEffort.MAX, label: 'Max', hasInfo: true }
];
