// var totalLoop = 0;
let big = 0;
let result = [];
let min = 1;
let max = 99999;
let col = 6;
let os = 1;
let ot = 1;
let snum = 1;

function ctlCheckbox(id, checked, onchange, label) {
	return `
	<div class="form-group">
		<label class="checkbox" for="${id}">${label}
			<input type="checkbox" id="${id}" onchange="${onchange}" ${checked ? ` checked="checked"` : ""}/>
			<span class="checkmark"></span>
		</label>
	</div>`;
}

function ctlRadio(id, name, value, checked, onchange, label) {
	return `
	<div class="form-group">
		<label class="radio" for="${id}">${label}
			<input type="radio" id="${id}" name="${name}" value="${value}" onchange="${onchange}" ${
		checked ? ` checked="checked"` : ""
	}/>
			<span class="checkmark"></span>
		</label>
	</div>`;
}

function ctlNumber(id, value, onchange, label, container_id) {
	return `
	<div class="form-group"${container_id ? ` id="${container_id}"` : ""}>
		<label for="${id}">${label} : </label>
		<input type="number" id="${id}" value="${value}"${onchange ? ` onchange="${onchange}" onkeyup="${onchange}"` : ""}/>
	</div>`;
}

function ctlButton(label, onclick) {
	return `<button onclick="${onclick}">${label}</button>`;
}

function ctlTextResult(id) {
	return `<div class="form-group"><div id="${id}"></div></div>`;
}

const bigTitle = ` <sup class="pointer" title="BigInt"><a onclick="big_onchange(0)"><small>&beta;igInt</small></a></sup>`;
const smallTitle = ` <sup class="pointer" title="Number"><a onclick="big_onchange(1)"><small>&#938;nteger</small></a></sup>`;

const header = function () {
	return `<h2>Prime Number Checker${big ? bigTitle : smallTitle}</h2>`;
};
const header2 = function () {
	return `<h2>Prime Number List${big ? bigTitle : smallTitle}</h2>`;
};
const errorHeader = function () {
	return `<h2 class="font-danger">Error!${big ? bigTitle : smallTitle}</h2>`;
};

const timerIndicator = function (id) {
	return `<span id="${id}"></span>`;
};

const btnTryAgain = ctlButton("Try Again", "showStart()");
const btnShowResult = ctlButton("Show Result", "showRangePrimeOutput()");
const btnScrollBottom = ctlButton("Bottom", "doScrollTo(1)");
const btnScrollTop = ctlButton("Top", "doScrollTo(0)");
const loading2 = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
const loading3 = `<div class="lds-ring-big"><div></div><div></div><div></div><div></div></div>`;
const memoryLabel = `<div><small id="mem"></small></div>`;

var monitorID = null;
function addResizeListener(elem, fun) {
	var requestAnimationFrame =
		window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.msRequestAnimationFrame;

	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

	if (monitorID !== null) {
		cancelAnimationFrame(monitorID);
		monitorID = null;
		fun();
	}

	function test() {
		let newStyle = getComputedStyle(elem);
		if (wid !== newStyle.width || hei !== newStyle.height) {
			fun();
			wid = newStyle.width;
			hei = newStyle.height;

			if (monitorID !== null) {
				cancelAnimationFrame(monitorID);
				monitorID = null;
			}
		} else {
			if (monitorID !== null) {
				cancelAnimationFrame(monitorID);
				monitorID = null;
			}

			monitorID = requestAnimationFrame(test);
		}
	}

	let style = getComputedStyle(elem);
	let wid = style.width;
	let hei = style.height;

	monitorID = requestAnimationFrame(test);
}

function monitorRenderTime(target, outputid1, outputid2) {
	let elem = document.getElementById(target);

	if (elem) {
		let start = window.performance.now();
		addResizeListener(elem, function () {
			let duration = window.performance.now() - start;
			let sduration = formatTime(duration);

			setTimeout(function () {
				setInnerHtml(outputid1, `Complete in ${sduration}`);
				setInnerHtml(outputid2, `Complete in ${sduration}`);
			}, 100);
		});
	}
}

function runCallback(callback) {
	if (typeof callback === "function") {
		callback();
	}
}

function genUI(html, callback) {
	setInnerHtml("root", html, callback);
}

function showSinglePrimeOutput(html, callback) {
	setInnerHtml("num_result", html, callback);
}

function genTooltip(target, html) {
	setInnerHtml("tooltip", html, function () {
		let rect = target.getBoundingClientRect();
		const tooltip_container = document.getElementById("tooltip_container");
		tooltip_container.style.top = `${rect.top + window.scrollY - 5}px`;
		tooltip_container.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
		tooltip_container.style.display = "block";
	});
}

function formatNumber(num) {
	if (num) {
		return num.toLocaleString("en-US");
	} else {
		return `<span class="text-danger">Error!</span>`;
	}
}

function formatTime(num) {
	if (num > 1000) {
		num = num / 1000;
		let h = Math.floor(num / 3600);
		let m = Math.floor((num % 3600) / 60);
		let s = Math.floor(num % 3600) % 60;

		let hDisplay = h > 0 ? ` ${h} hrs ` : "";
		let mDisplay = m > 0 ? ` ${m} min ` : "";
		let sDisplay = s > -1 ? `${m > 0 ? s : parseFloat(num.toFixed(1)).toLocaleString("en-US")} sec ` : "";

		return `${hDisplay}${mDisplay}${sDisplay}`;
	} else {
		return `${parseFloat(num.toFixed(1)).toLocaleString("en-US")} ms`;
	}
}

function formatList(num) {
	return num.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
}

function setInnerHtml(id, html, callback) {
	if (id) {
		let dom = document.getElementById(id);
		if (dom) {
			let temp = document.createElement(dom.tagName);
			temp.id = dom.id;
			temp.innerHTML = html;

			dom.replaceWith(temp);

			runCallback(callback);
		}
	}
}

function genId() {
	let s4 = () => {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};
	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function calcSinglePrime() {
	let zero = big ? 0n : 0;
	let currentNum = big
		? BigInt(document.getElementById("num").value)
		: parseInt(document.getElementById("num").value);

	if (currentNum > zero) {
		if (currentNum !== snum) {
			let timerId = genId();
			showSinglePrimeOutput(`Checking ${timerIndicator(timerId)}${loading2}`);
			secTimer(timerId, 1);

			snum = currentNum;

			monitorRenderTime("root", "single_time_1", "single_time_2");

			runWorker(
				"singleprime",
				[snum],
				function (e) {
					if (e.data) {
						result = e.data;
						if (result) {
							runWorker(
								"factor",
								[result, snum, ot],
								function (e) {
									let lastNumber = result[result.length - 1];

									if (result.length === 2) {
										showSinglePrimeOutput(
											`<h4>${formatNumber(
												lastNumber
											)}</h4><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${
												e.data
											}</small><br/><small id="single_time_1">${loading2}</small>`
										);
									} else {
										showSinglePrimeOutput(
											`${
												result.length > 30
													? `<small id="single_time_1">${loading2}</small><br/><br/>`
													: ``
											}
											<h4>${formatNumber(lastNumber)}</h4><b class="font-danger">Is NOT a prime number</b><br/><small>It can${
												result.length === 1 ? ` only` : ``
											} be divided with <br/>${
												e.data
											}</small><br/><small id="single_time_2">${loading2}</small>`
										);
									}
								},
								function (e) {
									showSinglePrimeOutput(`Fail to find prime number. ${e.message}`);
								}
							);
						} else {
							showSinglePrimeOutput(`Fail to find prime number`);
						}
					} else {
						showSinglePrimeOutput(`Fail to find prime number`);
					}
				},
				function (e) {
					showSinglePrimeOutput(`Fail to find prime number. ${e.message}`);
				}
			);
		}
	} else {
		showSinglePrimeOutput(`Number must more than 0`);
	}
}

function showStart() {
	hideTooltip();

	genUI(
		`
		${header()}
		${ctlNumber("num", snum, "calcSinglePrime()", "Number")}
		${ctlTextResult("num_result")}
		${ctlCheckbox("ot", ot ? true : false, "ot_onchange()", "Show Calculation")}
		
		${header2()}

		${ctlNumber("min", min, null, "Min")}
		${ctlNumber("max", max, null, "Max")}

		${ctlRadio("os_1", "os", 0, os === 0 ? true : false, "os_onchange()", "Show All")}
		${ctlRadio("os_2", "os", 1, os === 1 ? true : false, "os_onchange()", "Prime Only")}

		${ctlNumber("col", col, null, "Col", "col_container")}
		${ctlButton("Start Calculate Prime", "calcRangePrime()")}
				
	`,
		function () {
			os_onchange();
			setTimeout(function () {
				snum = big ? 0n : 0;
				calcSinglePrime();
			}, 100);
		}
	);
}

function ot_onchange() {
	ot = document.getElementById("ot").checked ? 1 : 0;
	snum = big ? 0n : 0;
	calcSinglePrime();
}

function os_onchange() {
	let val = parseInt(getRadioValue("os"), 10);
	if (val === 0) {
		document.getElementById("col_container").style.display = "flex";
	} else {
		document.getElementById("col_container").style.display = "none";
	}
}

function big_onchange(val) {
	big = parseInt(val, 10);
	showStart();
}

function getRadioValue(name) {
	var ele = document.getElementsByName(name);

	for (i = 0; i < ele.length; i++) {
		if (ele[i].checked) {
			return ele[i].value;
			break;
		}
	}

	return null;
}

function calcRangePrime() {
	let zero = 0;
	if (big) {
		min = BigInt(document.getElementById("min").value);
		max = BigInt(document.getElementById("max").value);
		col = BigInt(document.getElementById("col").value);
		zero = 0n;
	} else {
		min = parseInt(document.getElementById("min").value);
		max = parseInt(document.getElementById("max").value);
		col = parseInt(document.getElementById("col").value);
		zero = 0;
	}

	os = parseInt(getRadioValue("os"), 10);
	ot = document.getElementById("ot").checked ? 1 : 0;

	if (max > zero && col > zero) {
		if (min > zero && min <= max) {
			if (window.Worker) {
				let timerId = genId();

				genUI(
					`
						${header()}
						 Finding prime number in <b>${formatNumber(max - min + (big ? 1n : 1))}</b> numbers  ${timerIndicator(
						timerId
					)}${loading2}<br/>
						${loading3}<br/><br/>
						${btnTryAgain}
					`,
					function () {
						secTimer(timerId, 1);
						let start = window.performance.now();

						runWorker(
							"prime",
							[min, max],
							function (e) {
								if (e.data) {
									result = e.data.result;
									primeFound = e.data.count;

									let processTime = window.performance.now() - start;

									genUI(`
											${header()}
											We found <b>${formatNumber(primeFound)} prime number</b> between <b>${formatNumber(min)}</b> and <b>${formatNumber(
										max
									)}</b> in <b>${formatTime(
										processTime
									)}</b>.<br/><br/>${btnShowResult} ${btnTryAgain}
										`);
								} else {
									genUI(`${errorHeader()}Fail to find prime number<br/><br/>${btnTryAgain}`);
								}
							},
							function (e) {
								genUI(
									`${errorHeader()}Fail to find prime number. ${e.message}<br/><br/>${btnTryAgain}`
								);
							}
						);
					}
				);
			} else {
				genUI(`${errorHeader()}Web Worker not available<br/><br/>${btnTryAgain}`);
			}
		} else {
			genUI(`${errorHeader()}Min must be a positive integer and less or equal with Max<br/><br/>${btnTryAgain}`);
		}
	} else {
		genUI(`${errorHeader()}Max and Col must be a positive integer<br/><br/>${btnTryAgain}`);
	}
}

function mw(max) {
	if (big) {
		switch (true) {
			case max <= 9n:
				return 0;
			case max <= 99n:
				return 1;
			case max <= 999n:
				return 2;
			case max <= 9999n:
				return 3;
			case max <= 99999n:
				return 4;
			case max <= 999999n:
				return 5;
			case max <= 9999999n:
				return 6;
			default:
				return 7;
		}
	} else {
		switch (true) {
			case max <= 9:
				return 0;
			case max <= 99:
				return 1;
			case max <= 999:
				return 2;
			case max <= 9999:
				return 3;
			case max <= 99999:
				return 4;
			case max <= 999999:
				return 5;
			case max <= 9999999:
				return 6;
			default:
				return 7;
		}
	}
}

function showRangePrimeOutput() {
	let timerId = genId();

	genUI(
		`
		${header()} 
		Generating <b> ${formatNumber(
			os === 0 ? max - min + (big ? 1n : 1) : result.length
		)} number</b> into your browser  ${timerIndicator(timerId)}${loading2} <br/>
		${loading3}<br/><br/>
		${btnTryAgain}
		`,
		function () {
			secTimer(timerId, 1);
			monitorRenderTime("root", "multiple_time_1", "multiple_time_2");
			let isLong =
				os === 0
					? (big ? BigInt(result.length) : result.length) / col > (big ? 50n : 50)
					: result.length > 1000;

			runWorker(
				"joinresult",
				[result, min, max, col, os],
				function (e) {
					if (e.data) {
						genUI(`
							${header()}
							${isLong ? `${btnTryAgain} ${btnScrollBottom}<br/><br/><small id="multiple_time_1">${loading2}</small><br/><br/>` : ``}
							<div class="result_container"${os === 0 ? ` onclick="showTooltip(event)"` : ""}>
								<div class="result${os === 0 ? ` mw-${mw(max)}` : ""}">
									${e.data}
								</div>
							</div><br/>
							<small id="multiple_time_2">${loading2}</small><br/><br/>
							${btnTryAgain} ${isLong ? btnScrollTop : ""}
							`);
					} else {
						genUI(`${errorHeader()}Fail to combine result<br/>${btnTryAgain}`);
					}
				},
				function (e) {
					genUI(`${errorHeader()}Fail to combine result. ${e.message}<br/>${btnTryAgain}`);
				}
			);
		}
	);
}

function hideTooltip() {
	const tooltip_container = document.getElementById("tooltip_container");
	if (tooltip_container) {
		tooltip_container.style.display = "none";
	}

	stopWorker();
}
function showTooltip(e) {
	if (e.target && e.target.parentNode.classList.contains("d-flex")) {
		const target = e.target;
		const num = big ? BigInt(target.innerText) : parseInt(target.innerText);

		let timerId = genId();
		genTooltip(target, `<h3>${formatNumber(num)}</h3> Checking ${timerIndicator(timerId)}${loading2}`);
		secTimer(timerId, 1);

		monitorRenderTime("tooltip", "tooltip_time");
		runWorker(
			"singleprime",
			[num],
			function (e) {
				if (e.data) {
					result = e.data;
					if (result) {
						runWorker(
							"factor",
							[result, num, ot],
							function (e) {
								if (result.length === 2) {
									genTooltip(
										target,
										`<h3>${formatNumber(
											result[result.length - 1]
										)}</h3><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${
											e.data
										}</small><br/><span id="tooltip_time">${loading2}</span>`
									);
								} else {
									genTooltip(
										target,
										`<h3>${formatNumber(
											result[result.length - 1]
										)}</h3><b class="font-danger">Is NOT a prime number</b><br/><small>It can be divided with <br/>${
											e.data
										}</small><br/><span id="tooltip_time">${loading2}</span>`
									);
								}
							},
							function (e) {
								showSinglePrimeOutput(`Fail to find prime number. ${e.message}`);
							}
						);
					} else {
						genTooltip(target, `Fail to find prime number`);
					}
				} else {
					genTooltip(target, `Fail to find prime number`);
				}
			},
			function (e) {
				genTooltip(target, `Fail to find prime number. ${e.message}`);
			}
		);
	} else {
		hideTooltip();
	}
}

function doScrollTo(location) {
	if (location === 1) {
		window.scrollTo(0, document.body.scrollHeight);
	} else {
		window.scrollTo(0, 0);
	}
}

var wk = null;
function runWorker(script, params, callback, errcallback) {
	stopWorker();

	wk = new Worker(`${script}${big ? `_big` : ""}.js`);
	wk.postMessage(params);
	wk.onmessage = function (e) {
		if (typeof callback === "function") {
			this.terminate();
			callback(e);
		}
	};
	wk.onerror = function (e) {
		if (typeof errcallback === "function") {
			this.terminate();
			errcallback(e);
		}
	};
}

function stopWorker() {
	if (wk !== null) {
		wk.terminate();
		wk = null;
	}
}

function getParam() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const u_big = urlParams.get("big");
	const u_num = urlParams.get("num");
	const u_min = urlParams.get("min");
	const u_max = urlParams.get("max");
	const u_col = urlParams.get("col");
	const u_os = urlParams.get("os");
	const u_ot = urlParams.get("ot");

	if (u_big) {
		big = parseInt(u_big, 10);
	} else {
		big = 0;
	}

	if (big) {
		if (u_num) {
			snum = BigInt(u_num);
		}

		if (u_min) {
			min = BigInt(u_min);
		}

		if (u_max) {
			max = BigInt(u_max);
		}

		if (u_col) {
			col = BigInt(u_col);
		}
	} else {
		if (u_num) {
			snum = parseInt(u_num);
		}

		if (u_min) {
			min = parseInt(u_min);
		}

		if (u_max) {
			max = parseInt(u_max);
		}

		if (u_col) {
			col = parseInt(u_col);
		}
	}

	if (u_os) {
		os = parseInt(u_os, 10);
	}

	if (u_ot) {
		ot = parseInt(u_ot, 10);
	}
}

function secTimer(id, d, ms) {
	setTimeout(function () {
		let elem = document.getElementById(id);
		if (elem) {
			d = d ? d : 1;

			let h = Math.floor(d / 3600);
			let m = Math.floor((d % 3600) / 60);
			let s = Math.floor((d % 3600) % 60);

			let hDisplay = h > 0 ? h + " hrs " : "";
			let mDisplay = m > 0 ? m + " min " : "";
			let sDisplay = s > 0 ? s + " sec " : "";

			let text = `${hDisplay}${mDisplay}${sDisplay}`;

			elem.innerHTML = `since ${text} ago `;
			secTimer(id, ++d);
		}
	}, 1000);
}

function getMemory() {
	setTimeout(function () {
		let t = window.performance.memory;
		let d = document.getElementById("mem");

		d.innerHTML = `
			Memory usage <b>
			${parseInt((t.usedJSHeapSize / t.totalJSHeapSize) * 100, 10)}% | 
			${parseInt(t.usedJSHeapSize / 1024 / 1024, 10)}Mb</b>
		`;
		getMemory();
	}, 100);
}

getParam();
showStart();

if (window.performance && window.performance.memory) {
	getMemory();
}
