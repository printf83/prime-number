export type PerformanceWithMemory = Performance & {
	memory?: {
		usedJSHeapSize: number;
		totalJSHeapSize: number;
	};
};

export const state = {
	big: 0,
	result: [] as (number | bigint)[],
	primeFound: 0,
	min: 1 as number | bigint,
	max: 99999 as number | bigint,
	col: 6 as number | bigint,
	os: 1,
	ot: 1,
	snum: 1 as number | bigint,
	pr: 0,
};

declare global {
	interface Window {
		showStart: () => void;
		ot_onchange: () => void;
		pr_onchange: () => void;
		big_onchange: (val: string | number) => void;
		calcRangePrime: () => void;
		showRangePrimeOutput: () => void;
		showTooltip: (e: Event) => void;
		doScrollTo: (location: number) => void;
	}
}
