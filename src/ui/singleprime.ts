import { state } from "../state";
import {
	formatNumber,
	formatTime,
	genId,
	parseBigIntInput,
	parseIntInput,
} from "../utils";
import {
	monitorRenderTime,
	secTimer,
	setInnerHtml,
	showSinglePrimeOutput,
	attachNumberCopyHandler,
	initPrimeFactorTable,
	appendPrimeFactorRow,
	updateProgress,
} from "../dom";
import {
	createPrimeResultHtml,
	createPrimeStatusHtml,
	factorTableHtml,
	singlePrimeInitialOutputHtml,
	singlePrimeDivisorMessageHtml,
	singlePrimeTimeHtml,
} from "./builders";
import { runWorker, stopWorker } from "../workers";
import {
	loading2,
	loading4,
	progressIndicator,
	timerIndicator,
} from "./builders";

function getSinglePrimeMethod(): string {
	return "Miller-Rabin";
}

let currentSinglePrimeTimerCancel: (() => void) | null = null;
let currentSinglePrimeRenderTimeCancel: (() => void) | null = null;

export function cleanupSinglePrimeTimers(): void {
	if (currentSinglePrimeTimerCancel) {
		currentSinglePrimeTimerCancel();
		currentSinglePrimeTimerCancel = null;
	}
	if (currentSinglePrimeRenderTimeCancel) {
		currentSinglePrimeRenderTimeCancel();
		currentSinglePrimeRenderTimeCancel = null;
	}
}

export function calcSinglePrimeImpl(): void {
	cleanupSinglePrimeTimers();
	stopWorker();
	const zero = state.big ? 0n : 0;
	const numElement = document.getElementById(
		"singleNumber",
	) as HTMLInputElement | null;
	const currentNum = state.big
		? parseBigIntInput(numElement?.value ?? "")
		: parseIntInput(numElement?.value ?? "");

	if (currentNum === null) {
		showSinglePrimeOutput(`Please enter a valid number`);
		return;
	}

	if (currentNum > zero) {
		const timerId = genId();
		const progressId = state.showProgress ? genId() : null;
		const foundFactorPairs = new Map<number | bigint, number | bigint>();

		showSinglePrimeOutput(
			singlePrimeInitialOutputHtml(timerId, progressId),
		);
		initSinglePrimeFactorTable();
		if (currentSinglePrimeTimerCancel) {
			currentSinglePrimeTimerCancel();
		}
		currentSinglePrimeTimerCancel = secTimer(timerId, 1);

		state.singleNumber = currentNum;

		const singlePrimeStart = window.performance.now();

		function updateSinglePrimeTimeLabel(): void {
			const timeText = `Complete in ${formatTime(
				window.performance.now() - singlePrimeStart,
			)}`;
			setInnerHtml("single_time", timeText);
		}

		function updateSinglePrimeStatus(status: string): void {
			setInnerHtml("singleprime_status", status);
		}

		function attachSinglePrimeCopyHandler(value: string): void {
			attachNumberCopyHandler("singleprime_number", value);
		}

		function initSinglePrimeFactorTable(): void {
			initPrimeFactorTable(
				"singleprime_factors",
				"singleprime_factors_body",
			);
		}

		function appendSinglePrimeFactorRow(
			divisor: number | bigint,
			quotient: number | bigint,
		): void {
			appendPrimeFactorRow("singleprime_factors_body", divisor, quotient);
		}

		if (currentSinglePrimeRenderTimeCancel) {
			currentSinglePrimeRenderTimeCancel();
		}
		currentSinglePrimeRenderTimeCancel = monitorRenderTime(
			"root",
			"single_time",
		);

		runWorker(
			"singleprime",
			[state.singleNumber, Number(state.showProgress)],
			function (e) {
				if (e) {
					state.result = e;
					if (state.result) {
						runWorker(
							"factor",
							[
								state.result,
								state.singleNumber,
								Number(state.showCalculation),
								Number(state.showProgress),
							],
							function (e) {
								const lastNumber =
									state.result[state.result.length - 1];
								const singlePrimeMethod =
									getSinglePrimeMethod();
								const factorHtml = state.showCalculation
									? factorTableHtml(String(e))
									: String(e);
								if (state.result.length === 2) {
									showSinglePrimeOutput(
										createPrimeResultHtml(
											"h4",
											"singleprime_number",
											formatNumber(lastNumber),
											true,
											singlePrimeDivisorMessageHtml(
												factorHtml,
												true,
											),
											singlePrimeMethod,
											"",
										),
									);
									attachSinglePrimeCopyHandler(
										String(lastNumber),
									);
								} else {
									showSinglePrimeOutput(
										createPrimeResultHtml(
											"h4",
											"singleprime_number",
											formatNumber(lastNumber),
											false,
											singlePrimeDivisorMessageHtml(
												factorHtml,
												state.result.length === 1,
											),
											singlePrimeMethod,
											singlePrimeTimeHtml(
												"single_time",
												loading2,
											),
										),
									);
									attachSinglePrimeCopyHandler(
										String(lastNumber),
									);
								}
								updateSinglePrimeTimeLabel();
							},
							function (e) {
								showSinglePrimeOutput(
									`Fail to find prime number. ${e}`,
								);
							},
						);
					} else {
						showSinglePrimeOutput(`Fail to find prime number`);
						updateSinglePrimeTimeLabel();
					}
				} else {
					showSinglePrimeOutput(`Fail to find prime number`);
					updateSinglePrimeTimeLabel();
				}
			},
			function (e) {
				showSinglePrimeOutput(`Fail to find prime number. ${e}`);
				updateSinglePrimeTimeLabel();
			},
			function (e: unknown) {
				if (typeof e === "object" && e !== null && "progress" in e) {
					const detail = e as {
						progress: number;
						prime?: boolean;
						factors?: (number | bigint)[];
					};
					updateProgress(progressId, detail.progress);
					if (typeof detail.prime === "boolean") {
						if (detail.prime) {
							updateSinglePrimeStatus(
								createPrimeStatusHtml(
									"h4",
									"singleprime_number",
									formatNumber(currentNum),
									true,
								),
							);
							attachSinglePrimeCopyHandler(String(currentNum));
						} else {
							updateSinglePrimeStatus(
								createPrimeStatusHtml(
									"h4",
									"singleprime_number",
									formatNumber(currentNum),
									false,
								),
							);
							attachSinglePrimeCopyHandler(String(currentNum));
						}
					}
					if (
						Array.isArray(detail.factors) &&
						detail.factors.length === 2
					) {
						const [divisor, quotient] = detail.factors;
						if (!foundFactorPairs.has(divisor)) {
							foundFactorPairs.set(divisor, quotient);
							appendSinglePrimeFactorRow(divisor, quotient);
						}
					}
				} else {
					updateProgress(progressId, e as number);
				}
			},
		);
	} else {
		showSinglePrimeOutput(`Number must more than 0`);
	}
}
