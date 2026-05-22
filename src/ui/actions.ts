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
	showSinglePrimeOutput,
	updateProgress,
} from "../dom";
import { runWorker, stopWorker } from "../workers";
import {
	btnScrollBottom,
	btnScrollTop,
	btnShowResult,
	btnTryAgain,
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

export function calcSinglePrime(): void {
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
		if (currentNum !== state.snum) {
			const timerId = genId();
			const progressId = state.pr ? genId() : null;

			showSinglePrimeOutput(`
				Checking ${timerIndicator(timerId)}
				${loading4()}<br/>
				${progressIndicator(progressId)} 
				`);
			secTimer(timerId, 1);

			state.snum = currentNum;

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
								},
								function (e) {
									showSinglePrimeOutput(
										`Fail to find prime number. ${e}`,
									);
								},
							);
						} else {
							showSinglePrimeOutput(`Fail to find prime number`);
						}
					} else {
						showSinglePrimeOutput(`Fail to find prime number`);
					}
				},
				function (e) {
					showSinglePrimeOutput(`Fail to find prime number. ${e}`);
				},
				function (e) {
					updateProgress(progressId, e);
				},
			);
		}
	} else {
		showSinglePrimeOutput(`Number must more than 0`);
	}
}

export function showStart(): void {
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
		${ctlButton("btn-start-calc", "Start Calculate Prime")}
		`,
		function () {
			attachShowStartEvents({
				calcSinglePrime,
				calcRangePrime,
				ot_onchange,
				pr_onchange,
				big_onchange,
				os_onchange,
			});
			os_onchange();
			setTimeout(function () {
				state.snum = state.big ? 0n : 0;
				calcSinglePrime();
			}, 100);
		},
	);
}

export function ot_onchange(): void {
	state.ot = (document.getElementById("ot") as HTMLInputElement).checked
		? 1
		: 0;
	state.snum = state.big ? 0n : 0;
	calcSinglePrime();
}

export function pr_onchange(): void {
	state.pr = (document.getElementById("pr") as HTMLInputElement).checked
		? 1
		: 0;
}

export function os_onchange(): void {
	const val = parseInt(getRadioValue("os") ?? "0", 10);
	const colContainer = document.getElementById("col_container");

	if (colContainer) {
		colContainer.style.display = val === 0 ? "grid" : "none";
	}
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
		state.pr = 0;
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
    let zero: number | bigint = 0;

    if (state.big) {
        const minElement = document.getElementById("min") as HTMLInputElement | null;
        const maxElement = document.getElementById("max") as HTMLInputElement | null;
        const colElement = document.getElementById("col") as HTMLInputElement | null;
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
                        doScrollTo,
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
        const minElement = document.getElementById("min") as HTMLInputElement | null;
        const maxElement = document.getElementById("max") as HTMLInputElement | null;
        const colElement = document.getElementById("col") as HTMLInputElement | null;
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
                        doScrollTo,
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
    state.ot = ((document.getElementById("ot") as HTMLInputElement) || { checked: false }).checked ? 1 : 0;

    if (state.min === null || state.max === null || state.col === null) {
        genUI(
            `${errorHeader()}Please enter valid range values<br/><br/>${btnTryAgain}`,
            function () {
                attachShowRangePrimeEvents({
                    showStart,
                    showRangePrimeOutput,
                    showTooltip,
                    big_onchange: big_onchange,
                    doScrollTo,
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
                ${btnTryAgain}
                `,
                    function () {
                        secTimer(timerId, 1);
                        const start = window.performance.now();

                        runWorker(
                            "prime",
                            [state.min, state.max, state.pr],
                            function (e) {
                                if (e) {
                                    const payload = e;
                                    state.result = payload.result;
                                    state.primeFound = payload.count;
                                    const processTime = window.performance.now() - start;

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
                                                doScrollTo,
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
                                                doScrollTo,
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
                                            doScrollTo,
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
                            doScrollTo,
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
                        doScrollTo,
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
                    doScrollTo,
                });
            },
        );
    }
}
function mw(maxValue: number | bigint) {
	if (state.big) {
		switch (true) {
			case maxValue <= 9n:
				return 0;
			case maxValue <= 99n:
				return 1;
			case maxValue <= 999n:
				return 2;
			case maxValue <= 9999n:
				return 3;
			case maxValue <= 99999n:
				return 4;
			case maxValue <= 999999n:
				return 5;
			case maxValue <= 9999999n:
				return 6;
			default:
				return 7;
		}
	}

	switch (true) {
		case maxValue <= 9:
			return 0;
		case maxValue <= 99:
			return 1;
		case maxValue <= 999:
			return 2;
		case maxValue <= 9999:
			return 3;
		case maxValue <= 99999:
			return 4;
		case maxValue <= 999999:
			return 5;
		case maxValue <= 9999999:
			return 6;
		default:
			return 7;
	}
}

export function showRangePrimeOutput(): void {
	const timerId = genId();
	const progressId = state.pr ? genId() : null;

	genUI(
		`
		${header()} 
		Generating <b> ${formatNumber(
			state.os === 0
				? state.big
					? (state.max as bigint) - (state.min as bigint) + 1n
					: (state.max as number) - (state.min as number) + 1
				: state.result.length,
		)} number</b> into your browser  ${timerIndicator(timerId)}
		${loading4()}<br/>
		${progressIndicator(progressId)}<br/>
		${loading3}<br/><br/>
		${btnTryAgain}
		`,
		function () {
			attachShowRangePrimeEvents({
				showStart,
				showRangePrimeOutput,
				showTooltip,
				big_onchange: big_onchange,
				doScrollTo,
			});
			secTimer(timerId, 1);
			monitorRenderTime("root", "multiple_time_1", "multiple_time_2");
			const isLong =
				state.os === 0
					? state.big
						? BigInt(state.result.length) / (state.col as bigint) >
							50n
						: state.result.length / (state.col as number) > 50
					: state.result.length > 1000;
			runWorker(
				"joinresult",
				[
					state.result,
					state.min,
					state.max,
					state.col,
					state.os,
					state.pr,
				],
				function (e) {
					if (e) {
						genUI(
							`
							${header()}
							${isLong ? `${btnTryAgain} ${btnScrollBottom}<br/><br/><small id="multiple_time_1">${loading2}</small><br/><br/>` : ``}
							<div class="result_container">
								<div class="result${state.os === 0 ? ` mw-${mw(state.max)}` : ""}">
									${e}
								</div>
							</div><br/>
							<small id="multiple_time_2">${loading2}</small><br/><br/>
							${btnTryAgain} ${isLong ? btnScrollTop : ""}
							`,
							() =>
								attachShowRangePrimeEvents({
									showStart,
									showRangePrimeOutput,
									showTooltip,
									big_onchange: big_onchange,
									doScrollTo,
								}),
						);
					} else {
						genUI(
							`${errorHeader()}Fail to combine result<br/>${btnTryAgain}`,
							() =>
								attachShowRangePrimeEvents({
									showStart,
									showRangePrimeOutput,
									showTooltip,
									big_onchange: big_onchange,
									doScrollTo,
								}),
						);
					}
				},
				function (e) {
					genUI(
						`${errorHeader()}Fail to combine result. ${e}<br/><br/>${btnTryAgain}`,
					);
				},
				function (e) {
					updateProgress(progressId, e);
				},
			);
		},
	);
}

export function hideTooltip(): void {
	const tooltip_container = document.getElementById("tooltip_container");
	if (tooltip_container) {
		tooltip_container.style.display = "none";
		tooltip_container.setAttribute("aria-hidden", "true");
	}

	stopWorker();
}

export function showTooltip(e: Event): void {
	const target = e.target as HTMLElement | null;
	if (
		target?.parentNode instanceof HTMLElement &&
		target.parentNode.classList.contains("d-flex")
	) {
		const num = state.big
			? BigInt(target.innerText)
			: parseInt(target.innerText);

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
								} else {
									genTooltip(
										target,
										`<h3>${formatNumber(state.result[state.result.length - 1])}</h3><b class="font-danger">Is NOT a prime number</b><br/><small>It can be divided with <br/>${e}</small><br/><span id="tooltip_time">${loading2}</span>`,
									);
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
					}
				} else {
					genTooltip(target, `Fail to find prime number`);
				}
			},
			function (e) {
				genTooltip(target, `Fail to find prime number. ${e}`);
			},
			function (e) {
				updateProgress(progressId, e);
			},
		);
	} else {
		hideTooltip();
	}
}

export function doScrollTo(location: number): void {
	if (location === 1) {
		window.scrollTo(0, document.body.scrollHeight);
	} else {
		window.scrollTo(0, 0);
	}
}

export { getParamFromUrl as getParam };
