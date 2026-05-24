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
import { calcSinglePrimeImpl } from "./singleprime";
import { calcRangePrimeImpl } from "./rangeprime";
import { showRangePrimeOutputImpl } from "./result";
import {
	hideTooltip as hideTooltipImpl,
	showTooltip as showTooltipImpl,
} from "./tooltip";
import {
	ot_onchange,
	pr_onchange,
	os_onchange,
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
		big_onchange,
	});
}

export function showRangePrimeOutput(): void {
	showRangePrimeOutputImpl({
		showStart,
		showTooltip,
		showRangePrimeOutput,
		big_onchange,
	});
}

export function hideTooltip(): void {
	hideTooltipImpl();
}

export function showTooltip(e: Event): void {
	showTooltipImpl(e);
}

export { ot_onchange, pr_onchange, os_onchange, getParamFromUrl };
export { getParamFromUrl as getParam };

export function big_onchange(val: string | number): void {
	state.big = parseInt(String(val), 10);
	showStart();
}

export function showStart(): void {
	stopWorker();
	state.result = [];
	state.countOnly = false;
	state.snum = state.big ? 1n : 1;
	hideTooltip();

	genUI(
		`
		${header()}
		${ctlNumber("num", state.snum, "Number")}
		${ctlTextResult("num_result")}
		${ctlCheckbox("ot", state.ot ? true : false, "Show Calculation")}
		${ctlCheckbox("pr", state.pr ? true : false, "Show Progress")}
		
		${header2()}

		${ctlNumber("min", state.min, "Minimum")}
		${ctlNumber("max", state.max, "Maximum")}

		${ctlRadio("os_1", "os", 0, state.os === 0 ? true : false, "Show All")}
		${ctlRadio("os_2", "os", 1, state.os === 1 ? true : false, "Prime Only")}

		${ctlNumber("col", state.col, "Col", "col_container")}
		${ctlButton("btn-start-calc", "Start Calculate Prime")}
		`,
		function () {
			attachShowStartEvents({
				calcSinglePrime,
				calcRangePrime,
				ot_onchange,
				pr_onchange,
				big_onchange,
				os_onchange,
			});
			os_onchange();
			calcSinglePrime();
		},
	);
}
