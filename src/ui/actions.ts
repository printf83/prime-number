import { state } from "../state";
import { genUI } from "../dom";
import { stopWorker } from "../workers";
import { attachShowStartEvents } from "./events";
import {
	ctlButton,
	ctlCheckbox,
	ctlNumber,
	ctlRadio,
	ctlTextResult,
	header,
	header2,
} from "./builders";
import { calcSinglePrimeImpl, cleanupSinglePrimeTimers } from "./singleprime";
import { calcRangePrimeImpl, cleanupRangePrimeTimer } from "./rangeprime";
import {
	showRangePrimeOutputImpl,
	cleanupResultResizeListener,
	cleanupResultUI,
} from "./result";
import {
	hideTooltip as hideTooltipImpl,
	showTooltip as showTooltipImpl,
} from "./tooltip";
import {
	onShowCalculationChange,
	onShowProgressChange,
	onShowPrimeOnlyChange,
	getParamFromUrl,
} from "./helpers";

export function calcSinglePrime(): void {
	calcSinglePrimeImpl();
}

export function calcRangePrime(): void {
	calcRangePrimeImpl({
		showStart,
		showRangePrimeOutput,
		showTooltip,
		onBigIntModeChange: onBigIntModeChange,
	});
}

export function showRangePrimeOutput(): void {
	showRangePrimeOutputImpl({
		showStart,
		showTooltip,
		showRangePrimeOutput,
		onBigIntModeChange: onBigIntModeChange,
	});
}

export function hideTooltip(): void {
	hideTooltipImpl();
}

export function showTooltip(e: Event): void {
	showTooltipImpl(e);
}

export {
	onShowCalculationChange,
	onShowProgressChange,
	onShowPrimeOnlyChange,
	getParamFromUrl,
};
export { getParamFromUrl as getParam };

export function onBigIntModeChange(val: string | number): void {
	state.big = parseInt(String(val), 10);
	showStart();
}

let currentShowStartCleanup: (() => void) | null = null;

export function showStart(): void {
	const container = document.getElementById("container");
	if (container) {
		container.classList.remove("result");
	}
	currentShowStartCleanup?.();
	currentShowStartCleanup = null;
	cleanupResultUI();
	cleanupSinglePrimeTimers();
	cleanupRangePrimeTimer();
	stopWorker();
	state.result = [];
	hideTooltip();

	genUI(
		`
		${header()}
		${ctlNumber("singleNumber", state.singleNumber, "Number")}
		${ctlTextResult("singleNumberResult")}
		${ctlCheckbox("showCalculation", state.showCalculation ? true : false, "Show Calculation")}
		${ctlCheckbox("showProgress", state.showProgress ? true : false, "Show Progress")}
		
		${header2()}

		${ctlNumber("searchFrom", state.min, "Search From")}
		${ctlNumber("searchTo", state.max, "Search To")}

		${ctlRadio("showPrimeOnly_1", "showPrimeOnly", 0, state.showPrimeOnly ? false : true, "Show All")}
		${ctlRadio("showPrimeOnly_2", "showPrimeOnly", 1, state.showPrimeOnly ? true : false, "Prime Only")}

		${ctlNumber("resultColumns", state.columns, "Result Columns", "col_container")}
		${ctlButton("btn-start-calc", "Start Calculate Prime")}
		`,
		function () {
			currentShowStartCleanup = attachShowStartEvents({
				calcSinglePrime,
				calcRangePrime,
				onShowCalculationChange,
				onShowProgressChange,
				onBigIntModeChange,
				onShowPrimeOnlyChange,
			});
			onShowPrimeOnlyChange();
			calcSinglePrime();
		},
	);
}
