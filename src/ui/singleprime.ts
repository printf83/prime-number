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
	updateProgress,
} from "../dom";
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

export function calcSinglePrimeImpl(): void {
	stopWorker();
	const zero = state.big ? 0n : 0;
	const numElement = document.getElementById(
		"num",
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
		const progressId = state.pr ? genId() : null;
		const foundFactorPairs = new Map<string, string>();

		showSinglePrimeOutput(`
			<div id="singleprime_status">Checking ${timerIndicator(timerId)}</div>
			<div id="singleprime_factors"></div>
			${loading4()}<br/>
			${progressIndicator(progressId)} 
			`);
		secTimer(timerId, 1);

		state.snum = currentNum;

		const singlePrimeStart = window.performance.now();

		function updateSinglePrimeTimeLabel(): void {
			const timeText = `Complete in ${formatTime(
				window.performance.now() - singlePrimeStart,
			)}`;
			setInnerHtml("single_time_1", timeText);
			setInnerHtml("single_time_2", timeText);
		}

		function updateSinglePrimeStatus(status: string): void {
			setInnerHtml("singleprime_status", status);
		}

		function updateSinglePrimeFactors(): void {
			const entries = Array.from(foundFactorPairs.entries());
			if (entries.length === 0) {
				setInnerHtml("singleprime_factors", "");
				return;
			}
			entries.sort((a, b) => {
				const left = state.big ? BigInt(a[0]) : Number(a[0]);
				const right = state.big ? BigInt(b[0]) : Number(b[0]);
				return left < right ? -1 : left > right ? 1 : 0;
			});
			const rows = entries
				.map(
					([divisor, quotient]) =>
						`<tr><td>÷</td><td>${formatNumber(
							divisor as unknown as number | bigint,
						)}</td><td>=</td><td>${formatNumber(
							quotient as unknown as number | bigint,
						)}</td></tr>`,
				)
				.join("");
			setInnerHtml(
				"singleprime_factors",
				`<small>It can be divided with<div class="scrollable"><table><tbody>${rows}</tbody></table></div></small>`,
			);
		}

		monitorRenderTime("root", "single_time_1", "single_time_2");

		runWorker(
			"singleprime",
			[state.snum, state.pr],
			function (e) {
				if (e) {
					state.result = e;
					if (state.result) {
						runWorker(
							"factor",
							[state.result, state.snum, state.ot, state.pr],
							function (e) {
								const lastNumber =
									state.result[state.result.length - 1];
								const singlePrimeMethod =
									getSinglePrimeMethod();
								if (state.result.length === 2) {
									showSinglePrimeOutput(
										`<h4>${formatNumber(lastNumber)}</h4><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${e}</small><br/><small>Using ${singlePrimeMethod}</small><small id="single_time_1">${loading2}</small>`,
									);
								} else {
									showSinglePrimeOutput(
										`${
											state.result.length > 30
												? `<small id="single_time_1">${loading2}</small><br/><br/>`
												: ``
										}
									<h4>${formatNumber(lastNumber)}</h4><b class="font-danger">Is NOT a prime number</b><br/><small>It can${
										state.result.length === 1 ? ` only` : ``
									} be divided with <br/>${e}</small><br/><small>Using ${singlePrimeMethod}</small><br/><small id="single_time_2">${loading2}</small>`,
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
								`<h4>${formatNumber(currentNum)}</h4><b class="font-success">Is a prime number</b>`,
							);
						} else {
							updateSinglePrimeStatus(
								`<h4>${formatNumber(currentNum)}</h4><b class="font-danger">Is NOT a prime number</b>`,
							);
						}
					}
					if (
						Array.isArray(detail.factors) &&
						detail.factors.length === 2
					) {
						const [divisor, quotient] = detail.factors;
						foundFactorPairs.set(String(divisor), String(quotient));
						updateSinglePrimeFactors();
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
