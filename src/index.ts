import { getMemory } from "./dom";
import { PerformanceWithMemory } from "./state";
import {
	calcRangePrime,
	getParam,
	big_onchange,
	ot_onchange,
	pr_onchange,
	showRangePrimeOutput,
	showStart,
	showTooltip,
	doScrollTo,
} from "./ui";

window.showStart = showStart;
window.ot_onchange = ot_onchange;
window.pr_onchange = pr_onchange;
window.big_onchange = big_onchange;
window.calcRangePrime = calcRangePrime;
window.showRangePrimeOutput = showRangePrimeOutput;
window.showTooltip = showTooltip;
window.doScrollTo = doScrollTo;

getParam();
showStart();

if ((window.performance as PerformanceWithMemory).memory) {
	getMemory();
}
