import { state } from "../state";
import {
	formatNumber,
	formatTime,
	genId,
	parseBigIntInput,
	parseIntInput,
} from "../utils";
import {
	genTooltip,
	genUI,
	getRadioValue,
	monitorRenderTime,
	secTimer,
	setInnerHtml,
	showSinglePrimeOutput,
	updateProgress,
} from "../dom";
import { runWorker, stopWorker } from "../workers";
import {
	btnShowResult,
	btnTryAgain,
	btnCancel,
	btnScrollFirst,
	btnScrollPrev10,
	btnScrollPrev,
	btnScrollNext,
	btnScrollNext10,
	btnScrollLast,
	ctlButton,
	ctlCheckbox,
	ctlNumber,
	ctlRadio,
	ctlTextResult,
	errorHeader,
	header,
	header2,
	loading2,
	loading3,
	loading4,
	timerIndicator,
	progressIndicator,
} from "./builders";
import { attachShowRangePrimeEvents, attachShowStartEvents } from "./events";

let tooltipOutsideClickListenerAdded = false;
let tooltipOutsideClickListener: ((event: Event) => void) | null = null;

export function calcSinglePrime(): void {
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

		showSinglePrimeOutput(`
				Checking ${timerIndicator(timerId)}
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

								if (state.result.length === 2) {
									showSinglePrimeOutput(
										`<h4>${formatNumber(lastNumber)}</h4><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${e}</small><small id="single_time_1">${loading2}</small>`,
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
									} be divided with <br/>${e}</small><br/><small id="single_time_2">${loading2}</small>`,
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
			function (e) {
				updateProgress(progressId, e);
			},
		);
	} else {
		showSinglePrimeOutput(`Number must more than 0`);
	}
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
		${ctlNumber("max_rows", state.maxRows as number, "Max render rows")}
		${ctlButton("btn-start-calc", "Start Calculate Prime")}
		`,
		function () {
			attachShowStartEvents({
				calcSinglePrime,
				calcRangePrime,
				ot_onchange,
				pr_onchange,
				big_onchange,
				maxRows_onchange,
				os_onchange,
			});
			os_onchange();
			calcSinglePrime();
		},
	);
}

export function ot_onchange(): void {
	state.ot = (document.getElementById("ot") as HTMLInputElement).checked
		? 1
		: 0;
	state.snum = state.big ? 1n : 1;
	calcSinglePrime();
}

export function pr_onchange(): void {
	state.pr = (document.getElementById("pr") as HTMLInputElement).checked
		? 1
		: 0;
}

export function maxRows_onchange(): void {
	const maxRowsElement = document.getElementById(
		"max_rows",
	) as HTMLInputElement | null;
	const maxRowsValue = parseIntInput(maxRowsElement?.value ?? "");

	if (maxRowsValue !== null && maxRowsValue > 0) {
		state.maxRows = maxRowsValue;
	}
}

export function os_onchange(): void {
	parseInt(getRadioValue("os") ?? "0", 10);
}

export function big_onchange(val: string | number): void {
	state.big = parseInt(String(val), 10);
	showStart();
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

export function calcRangePrime(): void {
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
						big_onchange: big_onchange,
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
						big_onchange: big_onchange,
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
					big_onchange: big_onchange,
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

				genUI(
					`
                ${header()}
                Finding prime number in <b>${formatNumber(
					state.big
						? (state.max as bigint) - (state.min as bigint) + 1n
						: (state.max as number) - (state.min as number) + 1,
				)}</b> numbers ${timerIndicator(timerId)}
                ${loading4()}<br/>
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
									state.countOnly =
										payload.countOnly === true;
									const processTime =
										window.performance.now() - start;

									genUI(
										`
                                    ${header()}
                                    We found <b>${formatNumber(state.primeFound)} prime number</b> between <b>${formatNumber(state.min)}</b> and <b>${formatNumber(state.max)}</b> in <b>${formatTime(processTime)}</b>.<br/><br/>${btnShowResult} ${btnTryAgain}
                                    `,
										function () {
											attachShowRangePrimeEvents({
												showStart,
												showRangePrimeOutput,
												showTooltip,
												big_onchange: big_onchange,
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
												big_onchange: big_onchange,
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
											big_onchange: big_onchange,
										});
									},
								);
							},
							function (e) {
								updateProgress(progressId, e);
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
							big_onchange: big_onchange,
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
						big_onchange: big_onchange,
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
					big_onchange: big_onchange,
				});
			},
		);
	}
}
export function showRangePrimeOutput(): void {
	const resultArray = state.result as number[] | Uint8Array;
	const visibleCount = state.os === 0 ? resultArray.length : state.primeFound;
	const col = Math.max(
		1,
		state.big ? Number(state.col as bigint) : Number(state.col as number),
	);
	const maxRows = state.maxRows || 200000;

	if (state.countOnly) {
		genUI(
			`
			${header()} 
			Found <b>${formatNumber(state.primeFound)} prime number${
				state.primeFound === 1 ? "" : "s"
			}</b> between <b>${formatNumber(state.min)}</b> and <b>${formatNumber(state.max)}</b>.<br/>
			The range is too large to render in this browser. Narrow the range to see the primes.<br/><br/>
			${btnTryAgain}
			`,
			function () {
				attachShowRangePrimeEvents({
					showStart,
					showRangePrimeOutput,
					showTooltip,
					big_onchange: big_onchange,
				});
			},
		);
		return;
	}

	const primeValues: Array<number | bigint> = [];
	if (state.os === 1) {
		for (let index = 0; index < resultArray.length; index++) {
			if (resultArray[index] === 1) {
				primeValues.push(
					state.big
						? (state.min as bigint) + BigInt(index)
						: (state.min as number) + index,
				);
			}
		}
	}

	const totalRows =
		state.os === 0
			? Math.ceil(resultArray.length / col)
			: Math.ceil(primeValues.length / col);

	const recordBytes =
		resultArray instanceof Uint8Array
			? resultArray.byteLength
			: resultArray.length * 8;
	console.debug(
		"[PrimeDebug] Result in memory:",
		"records=",
		resultArray.length,
		"totalRows=",
		totalRows,
		"visibleCount=",
		visibleCount,
		"primeFound=",
		state.primeFound,
		"col=",
		col,
		"bytes=",
		recordBytes,
		"mode=",
		state.os === 1 ? "prime-only" : "all",
	);

	if (totalRows > maxRows) {
		genUI(
			`
			${header()} 
			Too many results to render safely in the browser.<br/>
			Reduce the range or use a smaller column count, or increase the Max render rows setting on the start page.<br/>
			Current limit: <b>${formatNumber(maxRows)}</b> rows.<br/>
			Current count: <b>${formatNumber(totalRows)}</b> rows.<br/><br/>
			${btnTryAgain}
			`,
			function () {
				attachShowRangePrimeEvents({
					showStart,
					showRangePrimeOutput,
					showTooltip,
					big_onchange: big_onchange,
				});
			},
		);
		return;
	}

	genUI(
		`
		${header()} 
		Showing <b>${formatNumber(visibleCount)} numbers</b> in a scrollable view.<br/>
		Scroll to render items as they come into view.
		<div class="result_container">
			<div class="result-viewport">
				<div class="result-inner"></div>
			</div>
		</div>
		<div class="result-scroll-controls">
			${btnScrollFirst}${btnScrollPrev10}${btnScrollPrev}${btnTryAgain}${btnScrollNext}${btnScrollNext10}${btnScrollLast}
		</div>
		`,
		function () {
			attachShowRangePrimeEvents({
				showStart,
				showRangePrimeOutput,
				showTooltip,
				big_onchange: big_onchange,
			});

			if (!tooltipOutsideClickListenerAdded) {
				tooltipOutsideClickListener = function (event: Event) {
					const target = event.target as Node | null;
					const tooltipContainer = document.getElementById(
						"tooltip_container",
					) as HTMLElement | null;
					const resultContainer = document.querySelector(
						".result_container",
					) as HTMLElement | null;

					if (
						tooltipContainer?.contains(target) ||
						resultContainer?.contains(target)
					) {
						return;
					}

					hideTooltip();
				};
				document.addEventListener(
					"pointerdown",
					tooltipOutsideClickListener,
					true,
				);
				document.addEventListener(
					"click",
					tooltipOutsideClickListener,
					true,
				);
				tooltipOutsideClickListenerAdded = true;
			}

			const viewport = document.querySelector(
				".result-viewport",
			) as HTMLElement | null;
			const inner = document.querySelector(
				".result-inner",
			) as HTMLElement | null;

			if (!viewport || !inner) {
				return;
			}

			let rowHeight = 30;

			function getValue(index: number): number | bigint {
				return state.big
					? (state.min as bigint) + BigInt(index)
					: (state.min as number) + index;
			}

			function measureRowHeight(): number {
				const sample = document.createElement("div");
				sample.style.visibility = "hidden";
				sample.style.position = "relative";
				sample.style.width = "100%";
				sample.innerHTML = renderRow(0);
				inner!.appendChild(sample);
				const height = Math.ceil(sample.getBoundingClientRect().height);
				inner!.removeChild(sample);
				return Math.max(30, height);
			}

			rowHeight = measureRowHeight();
			inner.style.height = `${totalRows * rowHeight}px`;

			const content = document.createElement("div");
			content.className = "result-content";
			content.style.position = "absolute";
			content.style.left = "0";
			content.style.top = "0";
			content.style.width = "100%";
			inner.appendChild(content);

			function renderRow(row: number): string {
				const start = row * col;
				const items: string[] = [];

				if (state.os === 1) {
					for (
						let index = start;
						index < Math.min(primeValues.length, start + col);
						index++
					) {
						const value = primeValues[index];
						items.push(
							`<span class="result-item prime">${formatNumber(value)}</span>`,
						);
					}
				} else {
					for (
						let index = start;
						index < Math.min(resultArray.length, start + col);
						index++
					) {
						const value = getValue(index);
						items.push(
							`<span class="result-item ${
								resultArray[index] === 1 ? "prime" : "composite"
							}">${formatNumber(value)}</span>`,
						);
					}
				}

				return `<div class="result-row">${items.join("")}</div>`;
			}

			function render(): void {
				if (!viewport || !inner) {
					return;
				}
				const scrollTop = viewport.scrollTop;
				const firstRow = Math.max(
					0,
					Math.floor(scrollTop / rowHeight) - 5,
				);
				const visibleRows = Math.min(
					totalRows,
					Math.ceil(viewport.clientHeight / rowHeight) + 10,
				);
				const lastRow = Math.min(totalRows, firstRow + visibleRows);

				let html = "";
				for (let row = firstRow; row < lastRow; row++) {
					html += renderRow(row);
				}

				content.style.transform = `translateY(${firstRow * rowHeight}px)`;
				content.innerHTML = html;
			}

			const view = viewport;

			function clampScroll(value: number): number {
				return Math.min(
					Math.max(value, 0),
					Math.max(0, view.scrollHeight - view.clientHeight),
				);
			}

			function scrollBy(delta: number): void {
				view.scrollTop = clampScroll(view.scrollTop + delta);
			}

			function scrollByPercent(factor: number): void {
				scrollBy(
					Math.round(
						(view.scrollHeight - view.clientHeight) * factor,
					),
				);
			}

			const btnScrollFirst = document.getElementById(
				"btn-scroll-first",
			) as HTMLButtonElement | null;
			const btnScrollPrev10 = document.getElementById(
				"btn-scroll-prev10",
			) as HTMLButtonElement | null;
			const btnScrollPrev = document.getElementById(
				"btn-scroll-prev",
			) as HTMLButtonElement | null;
			const btnScrollNext = document.getElementById(
				"btn-scroll-next",
			) as HTMLButtonElement | null;
			const btnScrollNext10 = document.getElementById(
				"btn-scroll-next10",
			) as HTMLButtonElement | null;
			const btnScrollLast = document.getElementById(
				"btn-scroll-last",
			) as HTMLButtonElement | null;

			function updateScrollButtons(): void {
				const atTop = view.scrollTop <= 0;
				const atBottom =
					view.scrollTop >= clampScroll(view.scrollHeight);

				if (btnScrollFirst) {
					btnScrollFirst.disabled = atTop;
				}
				if (btnScrollPrev10) {
					btnScrollPrev10.disabled = atTop;
				}
				if (btnScrollPrev) {
					btnScrollPrev.disabled = atTop;
				}
				if (btnScrollNext) {
					btnScrollNext.disabled = atBottom;
				}
				if (btnScrollNext10) {
					btnScrollNext10.disabled = atBottom;
				}
				if (btnScrollLast) {
					btnScrollLast.disabled = atBottom;
				}
			}

			if (btnScrollFirst) {
				btnScrollFirst.addEventListener("click", () => {
					view.scrollTop = 0;
					updateScrollButtons();
				});
			}

			if (btnScrollLast) {
				btnScrollLast.addEventListener("click", () => {
					view.scrollTop = clampScroll(view.scrollHeight);
					updateScrollButtons();
				});
			}

			if (btnScrollPrev10) {
				btnScrollPrev10.addEventListener("click", () => {
					scrollByPercent(-0.1);
					updateScrollButtons();
				});
			}

			if (btnScrollNext10) {
				btnScrollNext10.addEventListener("click", () => {
					scrollByPercent(0.1);
					updateScrollButtons();
				});
			}

			if (btnScrollPrev) {
				btnScrollPrev.addEventListener("click", () => {
					scrollBy(-view.clientHeight);
					updateScrollButtons();
				});
			}

			if (btnScrollNext) {
				btnScrollNext.addEventListener("click", () => {
					scrollBy(view.clientHeight);
					updateScrollButtons();
				});
			}

			viewport.addEventListener("scroll", () => {
				render();
				updateScrollButtons();
			});

			render();
			updateScrollButtons();
		},
	);
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
		stopWorker();
	}

	if (tooltipOutsideClickListener !== null) {
		document.removeEventListener(
			"pointerdown",
			tooltipOutsideClickListener,
			true,
		);
		document.removeEventListener(
			"click",
			tooltipOutsideClickListener,
			true,
		);
		tooltipOutsideClickListener = null;
		tooltipOutsideClickListenerAdded = false;
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
								if (state.result.length === 2) {
									genTooltip(
										target,
										`<h3>${formatNumber(state.result[state.result.length - 1])}</h3><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${e}</small><br/><span id="tooltip_time">${loading2}</span>`,
									);
									updateTooltipTimeLabel();
								} else {
									genTooltip(
										target,
										`<h3>${formatNumber(state.result[state.result.length - 1])}</h3><b class="font-danger">Is NOT a prime number</b><br/><small>It can be divided with <br/>${e}</small><br/><span id="tooltip_time">${loading2}</span>`,
									);
									updateTooltipTimeLabel();
								}
							},
							function (e) {
								showSinglePrimeOutput(
									`Fail to find prime number. ${e}`,
								);
							},
							function (e) {
								updateProgress(progressId, e);
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
				updateProgress(progressId, e);
			},
		);
	} else {
		hideTooltip();
	}
}

export { getParamFromUrl as getParam };
