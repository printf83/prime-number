import { state } from "../state";
import { formatNumber, formatTime, genId } from "../utils";
import {
	genTooltip,
	monitorRenderTime,
	secTimer,
	updateProgress,
} from "../dom";
import { runWorker } from "../workers";
import {
	loading2,
	loading4,
	progressIndicator,
	timerIndicator,
} from "./builders";

function getSinglePrimeMethod(): string {
	return "Miller-Rabin";
}

export function hideTooltip(): void {
	const tooltip_container = document.getElementById("tooltip_container");
	const tooltipWasVisible =
		tooltip_container &&
		getComputedStyle(tooltip_container).display !== "none" &&
		tooltip_container.getAttribute("aria-hidden") !== "true";

	if (tooltip_container) {
		tooltip_container.style.display = "none";
		tooltip_container.setAttribute("aria-hidden", "true");
	}

	if (tooltipWasVisible) {
		// do not stop the worker working on the background tooltip check
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

		const timerId = genId();
		const progressId = genId();
		genTooltip(
			target,
			`
			<h3>${formatNumber(num)}</h3> Checking ${timerIndicator(timerId)}
			${loading4()}<br/>
			${progressIndicator(progressId)}
			`,
		);
		secTimer(timerId, 1);

		monitorRenderTime("tooltip", "tooltip_time", "tooltip_time");
		runWorker(
			"singleprime",
			[num, state.pr],
			function (e) {
				if (e) {
					state.result = e;
					if (state.result) {
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
			function (e) {
				if (typeof e === "object" && e !== null && "progress" in e) {
					updateProgress(progressId, e.progress);
				} else {
					updateProgress(progressId, e as number);
				}
			},
		);
	} else {
		hideTooltip();
	}
}
