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
	errorResult,
	header,
	loading3,
	loading4,
	progressIndicator,
	currentCountIndicator,
	btnShowResult,
	rangePrimeSummaryHtml,
	rangePrimeTooHugeHtml,
	timerIndicator,
} from "./builders";

interface RangePrimeCallbacks {
	showStart: () => void;
	showRangePrimeOutput: () => void;
	showTooltip: (e: Event) => void;
	onBigIntModeChange: (val: string | number) => void;
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

export let currentRangePrimeTimerCancel: (() => void) | null = null;

export function cleanupRangePrimeTimer(): void {
	if (currentRangePrimeTimerCancel) {
		currentRangePrimeTimerCancel();
		currentRangePrimeTimerCancel = null;
	}
}

export function calcRangePrimeImpl(callbacks: RangePrimeCallbacks): void {
	cleanupRangePrimeTimer();
	const { showStart, showRangePrimeOutput, showTooltip, onBigIntModeChange } =
		callbacks;
	stopWorker();
	let zero: number | bigint = 0;

	if (state.big) {
		const minElement = document.getElementById(
			"searchFrom",
		) as HTMLInputElement | null;
		const maxElement = document.getElementById(
			"searchTo",
		) as HTMLInputElement | null;
		const colElement = document.getElementById(
			"resultColumns",
		) as HTMLInputElement | null;
		const minValue = parseBigIntInput(minElement?.value ?? "");
		const maxValue = parseBigIntInput(maxElement?.value ?? "");
		const colValue = parseBigIntInput(colElement?.value ?? "");

		if (minValue === null || maxValue === null || colValue === null) {
			genUI(
				errorResult("Please enter valid range values"),
				function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						onBigIntModeChange,
					});
				},
			);
			return;
		}

		state.min = minValue;
		state.max = maxValue;
		state.columns = colValue;
		zero = 0n;
	} else {
		const minElement = document.getElementById(
			"searchFrom",
		) as HTMLInputElement | null;
		const maxElement = document.getElementById(
			"searchTo",
		) as HTMLInputElement | null;
		const colElement = document.getElementById(
			"resultColumns",
		) as HTMLInputElement | null;
		const minValue = parseIntInput(minElement?.value ?? "");
		const maxValue = parseIntInput(maxElement?.value ?? "");
		const colValue = parseIntInput(colElement?.value ?? "");

		if (minValue === null || maxValue === null || colValue === null) {
			genUI(
				errorResult("Please enter valid range values"),
				function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						onBigIntModeChange,
					});
				},
			);
			return;
		}

		state.min = minValue;
		state.max = maxValue;
		state.columns = colValue;
		zero = 0;
	}

	state.showPrimeOnly =
		parseInt(getRadioValue("showPrimeOnly") ?? "0", 10) === 1;
	state.showCalculation = (
		(document.getElementById("showCalculation") as HTMLInputElement) || {
			checked: false,
		}
	).checked;

	if (state.min === null || state.max === null || state.columns === null) {
		genUI(errorResult("Please enter valid range values"), function () {
			attachShowRangePrimeEvents({
				showStart,
				showRangePrimeOutput,
				showTooltip,
				onBigIntModeChange,
			});
		});
		return;
	}

	if (state.max > zero && state.columns > zero) {
		if (state.min > zero && state.min <= state.max) {
			if (window.Worker) {
				const timerId = genId();
				const progressId = state.showProgress ? genId() : null;
				const currentCountId = genId();

				genUI(
					`
                ${header()}
                Finding prime number in <b>${formatNumber(
					state.big
						? (state.max as bigint) - (state.min as bigint) + 1n
						: (state.max as number) - (state.min as number) + 1,
				)}</b> numbers ${timerIndicator(timerId)}
                ${loading4()}
				${currentCountIndicator(currentCountId)}
                ${progressIndicator(progressId)}
                ${loading3}
                ${btnCancel}
                `,
					function () {
						if (currentRangePrimeTimerCancel) {
							currentRangePrimeTimerCancel();
						}
						currentRangePrimeTimerCancel = secTimer(timerId, 1);
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
							[state.min, state.max, Number(state.showProgress)],
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
										const container =
											document.getElementById(
												"container",
											);
										if (container) {
											container.classList.add("result");
										}
										genUI(
											`${rangePrimeTooHugeHtml(
												formatNumber(state.primeFound),
												formatNumber(state.min),
												formatNumber(state.max),
												formatTime(processTime),
												method,
											)}${btnTryAgain}`,
											function () {
												attachShowRangePrimeEvents({
													showStart,
													showRangePrimeOutput,
													showTooltip,
													onBigIntModeChange,
												});
											},
										);
										return;
									}

									const container =
										document.getElementById("container");
									if (container) {
										container.classList.add("result");
									}
									genUI(
										`${rangePrimeSummaryHtml(
											formatNumber(state.primeFound),
											formatNumber(state.min),
											formatNumber(state.max),
											formatTime(processTime),
											method,
										)}<div>${btnShowResult} ${btnTryAgain}</div>`,
										function () {
											attachShowRangePrimeEvents({
												showStart,
												showRangePrimeOutput,
												showTooltip,
												onBigIntModeChange,
											});
										},
									);
								} else {
									genUI(
										errorResult("Fail to find prime number"),
										function () {
											attachShowRangePrimeEvents({
												showStart,
												showRangePrimeOutput,
												showTooltip,
												onBigIntModeChange,
											});
										},
									);
								}
							},
							function (e) {
								genUI(
									errorResult(
										`Fail to find prime number. ${e}`,
									),
									function () {
										attachShowRangePrimeEvents({
											showStart,
											showRangePrimeOutput,
											showTooltip,
											onBigIntModeChange,
										});
									},
								);
							},
							function (e: unknown) {
								if (
									typeof e === "object" &&
									e !== null &&
									"count" in e
								) {
									const detail = e as {
										count: number;
										progress: number;
									};
									updateCurrentCount(
										currentCountId,
										detail.count,
									);
									if (progressId !== null) {
										updateProgress(
											progressId,
											detail.progress,
										);
									}
								} else {
									updateProgress(progressId, e as number);
								}
							},
						);
					},
				);
			} else {
				genUI(errorResult("Web Worker not available"), function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						onBigIntModeChange,
					});
				});
			}
		} else {
			genUI(
				errorResult(
					"Min must be a positive integer and less or equal with Max",
				),
				function () {
					attachShowRangePrimeEvents({
						showStart,
						showRangePrimeOutput,
						showTooltip,
						onBigIntModeChange,
					});
				},
			);
		}
	} else {
		genUI(
			errorResult("Max and Col must be a positive integer"),
			function () {
				attachShowRangePrimeEvents({
					showStart,
					showRangePrimeOutput,
					showTooltip,
					onBigIntModeChange,
				});
			},
		);
	}
}
