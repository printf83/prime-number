import { state } from "../state";
import { formatNumber, formatTime, genId } from "../utils";
import {
	genTooltip,
	monitorRenderTime,
	secTimer,
	setInnerHtml,
	attachNumberCopyHandler,
	initPrimeFactorTable,
	appendPrimeFactorRow,
	updateProgress,
} from "../dom";
import {
	createPrimeResultHtml,
	factorTableHtml,
	tooltipDivisorMessageHtml,
	tooltipTimeHtml,
} from "./builders";
import { runWorker, stopWorkerIfCurrentJob, WorkerJob } from "../workers";
import {
	loading2,
	loading4,
	progressIndicator,
	timerIndicator,
} from "./builders";

function getSinglePrimeMethod(): string {
	return "Miller-Rabin";
}

function isInsideTooltipOrResult(target: HTMLElement | null): boolean {
	if (!target) {
		return false;
	}

	const tooltipContainer = document.getElementById("tooltip_container");
	if (tooltipContainer && tooltipContainer.contains(target)) {
		return true;
	}

	return target.closest(".result-item") instanceof HTMLElement;
}

document.addEventListener("click", (event) => {
	const clicked = event.target as HTMLElement | null;
	if (!isInsideTooltipOrResult(clicked)) {
		hideTooltip();
	}
});

let currentTooltipWorkerJob: WorkerJob | null = null;
let currentTooltipTimerCancel: (() => void) | null = null;
let currentTooltipRenderTimeCancel: (() => void) | null = null;

export function hideTooltip(): void {
	if (currentTooltipTimerCancel) {
		currentTooltipTimerCancel();
		currentTooltipTimerCancel = null;
	}
	if (currentTooltipRenderTimeCancel) {
		currentTooltipRenderTimeCancel();
		currentTooltipRenderTimeCancel = null;
	}
	const tooltip_container = document.getElementById("tooltip_container");
	const tooltipWasVisible =
		tooltip_container &&
		getComputedStyle(tooltip_container).display !== "none" &&
		tooltip_container.getAttribute("aria-hidden") !== "true";

	if (tooltip_container) {
		tooltip_container.style.display = "none";
		tooltip_container.setAttribute("aria-hidden", "true");
	}

	if (tooltipWasVisible && currentTooltipWorkerJob) {
		stopWorkerIfCurrentJob(
			currentTooltipWorkerJob.script,
			currentTooltipWorkerJob.params,
		);
		currentTooltipWorkerJob = null;
	}
}

export function showTooltip(e: Event): void {
	const clicked = e.target as HTMLElement | null;
	let target: HTMLElement | null = null;

	const closestResult = clicked?.closest(".result-item");
	if (closestResult instanceof HTMLElement) {
		target = closestResult;
	} else if (
		clicked?.parentNode instanceof HTMLElement &&
		clicked.parentNode.classList.contains("d-flex")
	) {
		target = clicked;
	}

	if (target) {
		const rawText = target.innerText.trim().replace(/,/g, "");
		const num = state.big ? BigInt(rawText) : parseInt(rawText, 10);
		const tooltipStart = window.performance.now();

		function updateTooltipTimeLabel(): void {
			const tooltipTimeElem = document.getElementById(
				"tooltip_time",
			) as HTMLElement | null;
			if (tooltipTimeElem) {
				tooltipTimeElem.innerHTML =
					"Complete in " +
					formatTime(window.performance.now() - tooltipStart);
			}
		}

		function updateTooltipStatus(status: string): void {
			setInnerHtml("tooltip_status", status);
		}

		function attachTooltipNumberCopyHandler(value: string): void {
			attachNumberCopyHandler("tooltip_number", value, "tooltip_status");
		}

		const foundFactorPairs = new Map<number | bigint, number | bigint>();

		function initTooltipFactorTable(): void {
			initPrimeFactorTable("tooltip_factors", "tooltip_factors_body");
		}

		function appendTooltipFactorRow(
			divisor: number | bigint,
			quotient: number | bigint,
		): void {
			appendPrimeFactorRow("tooltip_factors_body", divisor, quotient);
		}

		const timerId = genId();
		const progressId = genId();
		genTooltip(
			target,
			`
			<h3 id="tooltip_number" class="clickable-copy" title="Click to copy number">${formatNumber(num)}</h3>
			<div id="tooltip_status">Checking ${timerIndicator(timerId)}</div>
			<div id="tooltip_factors"></div>
			${loading4()}
			${progressIndicator(progressId)}
			`,
		);
		attachTooltipNumberCopyHandler(String(num));
		initTooltipFactorTable();
		if (currentTooltipTimerCancel) {
			currentTooltipTimerCancel();
		}
		currentTooltipTimerCancel = secTimer(timerId, 1);

		if (currentTooltipRenderTimeCancel) {
			currentTooltipRenderTimeCancel();
		}
		currentTooltipRenderTimeCancel = monitorRenderTime(
			"tooltip",
			"tooltip_time",
		);
		currentTooltipWorkerJob = {
			script: "singleprime",
			params: [num, Number(state.showProgress)],
		};
		runWorker(
			"singleprime",
			[num, Number(state.showProgress)],
			function (e) {
				if (e) {
					state.result = e;
					if (state.result) {
						currentTooltipWorkerJob = {
							script: "factor",
							params: [
								state.result,
								num,
								Number(state.showCalculation),
								Number(state.showProgress),
							],
						};
						runWorker(
							"factor",
							[
								state.result,
								num,
								Number(state.showCalculation),
								Number(state.showProgress),
							],
							function (e) {
								const singlePrimeMethod =
									getSinglePrimeMethod();
								const factorHtml = state.showCalculation
									? factorTableHtml(String(e))
									: String(e);
								if (state.result.length === 2) {
									genTooltip(
										target,
										createPrimeResultHtml(
											"h3",
											"tooltip_number",
											formatNumber(
												state.result[
													state.result.length - 1
												],
											),
											true,
											tooltipDivisorMessageHtml(
												factorHtml,
												true,
											),
											singlePrimeMethod,
											tooltipTimeHtml(
												"tooltip_time",
												loading2,
											),
										),
									);
									attachTooltipNumberCopyHandler(
										String(
											state.result[
												state.result.length - 1
											],
										),
									);
								} else {
									genTooltip(
										target,
										createPrimeResultHtml(
											"h3",
											"tooltip_number",
											formatNumber(
												state.result[
													state.result.length - 1
												],
											),
											false,
											tooltipDivisorMessageHtml(
												factorHtml,
												false,
											),
											singlePrimeMethod,
											tooltipTimeHtml(
												"tooltip_time",
												loading2,
											),
										),
									);
									attachTooltipNumberCopyHandler(
										String(
											state.result[
												state.result.length - 1
											],
										),
									);
								}
								updateTooltipTimeLabel();
							},
							function (e) {
								genTooltip(
									target,
									`Fail to find prime number. ${e}`,
								);
							},
						);
					} else {
						genTooltip(target, `Fail to find prime number`);
						updateTooltipTimeLabel();
					}
				} else {
					genTooltip(target, `Fail to find prime number`);
					updateTooltipTimeLabel();
				}
			},
			function (e) {
				genTooltip(target, `Fail to find prime number. ${e}`);
				updateTooltipTimeLabel();
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
							updateTooltipStatus(
								`<div class="font-success">Is a prime number</div>`,
							);
						} else {
							updateTooltipStatus(
								`<div class="font-danger">Is NOT a prime number</div>`,
							);
						}
					}
					if (
						Array.isArray(detail.factors) &&
						detail.factors.length === 2
					) {
						const [divisor, quotient] = detail.factors;
						if (!foundFactorPairs.has(divisor)) {
							foundFactorPairs.set(divisor, quotient);
							appendTooltipFactorRow(divisor, quotient);
						}
					}
				} else {
					updateProgress(progressId, e as number);
				}
			},
		);
	} else {
		hideTooltip();
	}
}
