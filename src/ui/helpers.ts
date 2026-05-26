import { state } from "../state";
import { getRadioValue } from "../dom";

export function onShowCalculationChange(): void {
	state.showCalculation = (
		document.getElementById("showCalculation") as HTMLInputElement
	).checked;
}

export function onShowProgressChange(): void {
	state.showProgress = (
		document.getElementById("showProgress") as HTMLInputElement
	).checked;
}

export function onShowPrimeOnlyChange(): void {
	state.showPrimeOnly =
		parseInt(getRadioValue("showPrimeOnly") ?? "0", 10) === 1;
}

export function getParamFromUrl(): void {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const u_big = urlParams.get("bigInt") ?? urlParams.get("big");
	const u_pr = urlParams.get("showProgress") ?? urlParams.get("pr");
	const u_num =
		urlParams.get("singleNumber") ??
		urlParams.get("number") ??
		urlParams.get("num");
	const u_min =
		urlParams.get("searchFrom") ??
		urlParams.get("minimum") ??
		urlParams.get("min");
	const u_max =
		urlParams.get("searchTo") ??
		urlParams.get("maximum") ??
		urlParams.get("max");
	const u_col =
		urlParams.get("resultColumns") ??
		urlParams.get("columns") ??
		urlParams.get("col");
	const u_os = urlParams.get("showPrimeOnly") ?? urlParams.get("os");
	const u_ot = urlParams.get("showCalculation") ?? urlParams.get("ot");

	if (u_big) {
		state.big = parseInt(u_big, 10);
	} else {
		state.big = 0;
	}

	if (u_pr) {
		state.showProgress = parseInt(u_pr, 10) === 1;
	}

	if (state.big) {
		if (u_num) {
			state.singleNumber = BigInt(u_num);
		}

		if (u_min) {
			state.min = BigInt(u_min);
		}

		if (u_max) {
			state.max = BigInt(u_max);
		}

		if (u_col) {
			state.columns = BigInt(u_col);
		}
	} else {
		if (u_num) {
			state.singleNumber = parseInt(u_num);
		}

		if (u_min) {
			state.min = parseInt(u_min);
		}

		if (u_max) {
			state.max = parseInt(u_max);
		}

		if (u_col) {
			state.columns = parseInt(u_col);
		}
	}

	if (u_os) {
		state.showPrimeOnly = parseInt(u_os, 10) === 1;
	}

	if (u_ot) {
		state.showCalculation = parseInt(u_ot, 10) === 1;
	}
}
