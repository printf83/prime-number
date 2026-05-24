import { state } from "../state";
import { formatNumber, formatTime, genId } from "../utils";
import {
	genTooltip,
	monitorRenderTime,
	secTimer,
	setInnerHtml,
	updateProgress,
} from "../dom";
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

let currentTooltipWorkerJob: WorkerJob | null = null;
let currentTooltipTimerCancel: (() => void) | null = null;

export function hideTooltip(): void {
	if (currentTooltipTimerCancel) {
		currentTooltipTimerCancel();
		currentTooltipTimerCancel = null;
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

		const foundFactorPairs = new Map<number | bigint, number | bigint>();

		function initTooltipFactorTable(): void {
			setInnerHtml(
				"tooltip_factors",
				`<small>It can be divided with</small><div class="scrollable"><table class="prime-divisors"><tbody id="tooltip_factors_body"></tbody></table></div>`,
			);
		}

		function appendTooltipFactorRow(
			divisor: number | bigint,
			quotient: number | bigint,
		): void {
			const factorBody = document.getElementById(
				"tooltip_factors_body",
			) as HTMLElement | null;
			if (!factorBody) {
				return;
			}
			const row = `<tr><td>÷</td><td>${formatNumber(divisor)}</td><td>=</td><td>${formatNumber(
				quotient,
			)}</td></tr>`;
			factorBody.insertAdjacentHTML("beforeend", row);
		}

		const timerId = genId();
		const progressId = genId();
		genTooltip(
			target,
			`
			<h3>${formatNumber(num)}</h3>
			<div id="tooltip_status">Checking ${timerIndicator(timerId)}</div>
			<div id="tooltip_factors"></div>
			${loading4()}<br/>
			${progressIndicator(progressId)}
			`,
		);
		initTooltipFactorTable();
		if (currentTooltipTimerCancel) {
			currentTooltipTimerCancel();
		}
		currentTooltipTimerCancel = secTimer(timerId, 1);

		monitorRenderTime("tooltip", "tooltip_time", "tooltip_time");
		currentTooltipWorkerJob = {
			script: "singleprime",
			params: [num, state.pr],
		};
		runWorker(
			"singleprime",
			[num, state.pr],
			function (e) {
				if (e) {
					state.result = e;
					if (state.result) {
						currentTooltipWorkerJob = {
							script: "factor",
							params: [state.result, num, state.ot, state.pr],
						};
						runWorker(
							"factor",
							[state.result, num, state.ot, state.pr],
							function (e) {
								const singlePrimeMethod =
									getSinglePrimeMethod();
								if (state.result.length === 2) {
									genTooltip(
										target,
										`<h3>${formatNumber(state.result[state.result.length - 1])}</h3><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${e}</small><br/><small>Using ${singlePrimeMethod}</small><br/><span id="tooltip_time">${loading2}</span>`,
									);
								} else {
									genTooltip(
										target,
										`<h3>${formatNumber(state.result[state.result.length - 1])}</h3><b class="font-danger">Is NOT a prime number</b><br/><small>It can be divided with <br/>${e}</small><br/><small>Using ${singlePrimeMethod}</small><br/><span id="tooltip_time">${loading2}</span>`,
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
								`<b class="font-success">Is a prime number</b>`,
							);
						} else {
							updateTooltipStatus(
								`<b class="font-danger">Is NOT a prime number</b>`,
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
