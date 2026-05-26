export type PerformanceWithMemory = Performance & {
	memory?: {
		usedJSHeapSize: number;
		totalJSHeapSize: number;
	};
};

export const state = {
	big: 0,
	result: [] as (number | bigint)[] | Uint8Array,
	primeFound: 0,
	min: 999999999900000 as number | bigint,
	max: 999999999999999 as number | bigint,
	columns: 6 as number | bigint,
	showPrimeOnly: false,
	showCalculation: true,
	singleNumber: 999999999900070 as number | bigint,
	showProgress: true,
};

declare global {
	interface Window {
		showStart: () => void;
		onShowCalculationChange: () => void;
		onShowProgressChange: () => void;
		onBigIntModeChange: (val: string | number) => void;
		calcRangePrime: () => void;
		showRangePrimeOutput: () => void;
		showTooltip: (e: Event) => void;
	}
}
