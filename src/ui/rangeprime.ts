import { state } from "../state";
import {
	formatNumber,
	formatTime,
	genId,
	parseBigIntInput,
	parseIntInput,
} from "../utils";
import {
	genUI,
	getRadioValue,
	secTimer,
	updateCurrentCount,
	updateProgress,
} from "../dom";
import { runWorker, stopWorker } from "../workers";
import { attachShowRangePrimeEvents } from "./events";
import {
	btnTryAgain,
	btnCancel,
	errorHeader,
	header,
	loading3,
	loading4,
	progressIndicator,
	currentCountIndicator,
	btnShowResult,
	timerIndicator,
} from "./builders";

interface RangePrimeCallbacks {
	showStart: () => void;
	showRangePrimeOutput: () => void;
	showTooltip: (e: Event) => void;
	big_onchange: (val: string | number) => void;
}

function getRangePrimeMethod(
	min: number | bigint,
	max: number | bigint,
): string {
	if (typeof min === "bigint" && typeof max === "bigint") {
		const rangeSize = max - min + 1n;
		return rangeSize <= 1000n ? "Miller-Rabin" : "Segmented Sieve";
	}
	return "Segmented Sieve";
}

export function calcRangePrimeImpl(callbacks: RangePrimeCallbacks): void {
	const { showStart, showRangePrimeOutput, showTooltip, big_onchange } =
		callbacks;
	stopWorker();
	let zero: number | bigint = 0;

	if (state.big) {
		const minElement = document.getElementById(
			"min",
		) as HTMLInputElement | null;
		const maxElement = document.getElementById(
			"max",
		) as HTMLInputElement | null;
		const colElement = document.getElementById(
			"col",
		) as HTMLInputElement | null;
		const minValue = parseBigIntInput(minElement?.value ?? "");
		const maxValue = parseBigIntInput(maxElement?.value ?? "");
		const colValue = parseBigIntInput(colElement?.value ?? "");

		if (minValue === null || maxValue === null || colValue === null) {
			genUI(
				`${errorHeader()}Please enter valid range values<br/><br/>${btnTryAgain}`,
				function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						big_onchange,
					});
				},
			);
			return;
		}

		state.min = minValue;
		state.max = maxValue;
		state.col = colValue;
		zero = 0n;
	} else {
		const minElement = document.getElementById(
			"min",
		) as HTMLInputElement | null;
		const maxElement = document.getElementById(
			"max",
		) as HTMLInputElement | null;
		const colElement = document.getElementById(
			"col",
		) as HTMLInputElement | null;
		const minValue = parseIntInput(minElement?.value ?? "");
		const maxValue = parseIntInput(maxElement?.value ?? "");
		const colValue = parseIntInput(colElement?.value ?? "");

		if (minValue === null || maxValue === null || colValue === null) {
			genUI(
				`${errorHeader()}Please enter valid range values<br/><br/>${btnTryAgain}`,
				function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						big_onchange,
					});
				},
			);
			return;
		}

		state.min = minValue;
		state.max = maxValue;
		state.col = colValue;
		zero = 0;
	}

	state.os = parseInt(getRadioValue("os") ?? "0", 10);
	state.ot = (
		(document.getElementById("ot") as HTMLInputElement) || {
			checked: false,
		}
	).checked
		? 1
		: 0;

	if (state.min === null || state.max === null || state.col === null) {
		genUI(
			`${errorHeader()}Please enter valid range values<br/><br/>${btnTryAgain}`,
			function () {
				attachShowRangePrimeEvents({
					showStart,
					showRangePrimeOutput,
					showTooltip,
					big_onchange,
				});
			},
		);
		return;
	}

	if (state.max > zero && state.col > zero) {
		if (state.min > zero && state.min <= state.max) {
			if (window.Worker) {
				const timerId = genId();
				const progressId = state.pr ? genId() : null;
				const currentCountId = genId();

				genUI(
					`
                ${header()}
                Finding prime number in <b>${formatNumber(
					state.big
						? (state.max as bigint) - (state.min as bigint) + 1n
						: (state.max as number) - (state.min as number) + 1,
				)}</b> numbers ${timerIndicator(timerId)}
                ${loading4()}<br/>
				${currentCountIndicator(currentCountId)}<br/>
                ${progressIndicator(progressId)}<br/>
                ${loading3}<br/><br/>
                ${btnCancel}
                `,
					function () {
						secTimer(timerId, 1);
						const start = window.performance.now();

						const btnCancelElement = document.getElementById(
							"btn-cancel",
						) as HTMLButtonElement | null;
						if (btnCancelElement) {
							btnCancelElement.addEventListener("click", () => {
								stopWorker();
								showStart();
							});
						}

						runWorker(
							"prime",
							[state.min, state.max, state.pr],
							function (e) {
								if (e) {
									const payload = e;
									state.result = payload.result;
									state.primeFound = payload.count;
									const processTime =
										window.performance.now() - start;
									const method = getRangePrimeMethod(
										state.min,
										state.max,
									);

									if (payload.resultTooHuge) {
										genUI(
											`
                                    ${header()}
                                    We found <b>${formatNumber(state.primeFound)} prime number</b> between <b>${formatNumber(state.min)}</b> and <b>${formatNumber(state.max)}</b> in <b>${formatTime(processTime)}</b> using <b>${method}</b>.<br/>
                                    The range is too large to render in this browser. Narrow the range to see the primes.<br/><br/>${btnTryAgain}
                                    `,
											function () {
												attachShowRangePrimeEvents({
													showStart,
													showRangePrimeOutput,
													showTooltip,
													big_onchange,
											});
											},
										);
										return;
									}

									genUI(
										`
                                    ${header()}
                                    We found <b>${formatNumber(state.primeFound)} prime number</b> between <b>${formatNumber(state.min)}</b> and <b>${formatNumber(state.max)}</b> in <b>${formatTime(processTime)}</b> using <b>${method}</b>.<br/><br/>${btnShowResult} ${btnTryAgain}
                                    `,
										function () {
											attachShowRangePrimeEvents({
												showStart,
												showRangePrimeOutput,
												showTooltip,
												big_onchange,
											});
										},
									);
								} else {
									genUI(
										`${errorHeader()}Fail to find prime number<br/><br/>${btnTryAgain}`,
										function () {
											attachShowRangePrimeEvents({
												showStart,
												showRangePrimeOutput,
												showTooltip,
												big_onchange,
											});
										},
									);
								}
							},
							function (e) {
								genUI(
									`${errorHeader()}Fail to find prime number. ${e}<br/><br/>${btnTryAgain}`,
									function () {
										attachShowRangePrimeEvents({
											showStart,
											showRangePrimeOutput,
											showTooltip,
											big_onchange,
										});
									},
								);
							},
							function (e) {
								if (
									typeof e === "object" &&
									e !== null &&
									"count" in e
								) {
									updateCurrentCount(currentCountId, e.count);
									updateProgress(progressId, e.progress);
								} else {
									updateProgress(progressId, e as number);
								}
							},
						);
					},
				);
			} else {
				genUI(
					`${errorHeader()}Web Worker not available<br/><br/>${btnTryAgain}`,
					function () {
						attachShowRangePrimeEvents({
							showStart,
							showRangePrimeOutput,
							showTooltip,
							big_onchange,
						});
					},
				);
			}
		} else {
			genUI(
				`${errorHeader()}Min must be a positive integer and less or equal with Max<br/><br/>${btnTryAgain}`,
				function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						big_onchange,
					});
				},
			);
		}
	} else {
		genUI(
			`${errorHeader()}Max and Col must be a positive integer<br/><br/>${btnTryAgain}`,
			function () {
				attachShowRangePrimeEvents({
					showStart,
					showRangePrimeOutput,
					showTooltip,
					big_onchange,
				});
			},
		);
	}
}
