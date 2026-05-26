import { getMemory } from "./dom";
import { PerformanceWithMemory } from "./state";
import {
	calcRangePrime,
	getParam,
	onBigIntModeChange,
	onShowCalculationChange,
	onShowProgressChange,
	showRangePrimeOutput,
	showStart,
	showTooltip,
} from "./ui";

window.showStart = showStart;
window.onShowCalculationChange = onShowCalculationChange;
window.onShowProgressChange = onShowProgressChange;
window.onBigIntModeChange = onBigIntModeChange;
window.calcRangePrime = calcRangePrime;
window.showRangePrimeOutput = showRangePrimeOutput;
window.showTooltip = showTooltip;

getParam();
showStart();

if ((window.performance as PerformanceWithMemory).memory) {
	getMemory();
}
