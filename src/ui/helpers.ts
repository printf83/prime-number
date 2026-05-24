import { state } from "../state";
import { getRadioValue } from "../dom";

export function ot_onchange(): void {
	state.ot = (document.getElementById("ot") as HTMLInputElement).checked
		? 1
		: 0;
	state.snum = state.big ? 1n : 1;
}

export function pr_onchange(): void {
	state.pr = (document.getElementById("pr") as HTMLInputElement).checked
		? 1
		: 0;
}

export function os_onchange(): void {
	parseInt(getRadioValue("os") ?? "0", 10);
}

export function getParamFromUrl(): void {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const u_big = urlParams.get("big");
	const u_pr = urlParams.get("pr");
	const u_num = urlParams.get("num");
	const u_min = urlParams.get("min");
	const u_max = urlParams.get("max");
	const u_col = urlParams.get("col");
	const u_os = urlParams.get("os");
	const u_ot = urlParams.get("ot");

	if (u_big) {
		state.big = parseInt(u_big, 10);
	} else {
		state.big = 0;
	}

	if (u_pr) {
		state.pr = parseInt(u_pr, 10);
	} else {
		state.pr = 1;
	}

	if (state.big) {
		if (u_num) {
			state.snum = BigInt(u_num);
		}

		if (u_min) {
			state.min = BigInt(u_min);
		}

		if (u_max) {
			state.max = BigInt(u_max);
		}

		if (u_col) {
			state.col = BigInt(u_col);
		}
	} else {
		if (u_num) {
			state.snum = parseInt(u_num);
		}

		if (u_min) {
			state.min = parseInt(u_min);
		}

		if (u_max) {
			state.max = parseInt(u_max);
		}

		if (u_col) {
			state.col = parseInt(u_col);
		}
	}

	if (u_os) {
		state.os = parseInt(u_os, 10);
	}

	if (u_ot) {
		state.ot = parseInt(u_ot, 10);
	}
}
