// var totalLoop = 0;
let result = [];
let min = 1;
let max = 99999;
let col = 6;
let os = 1;
let ot = 1;
let snum = 1;

const header = `<h2>Prime Number Checker</h2>`;
const header2 = `<h2>Prime Number List</h2>`;
const errorHeader = `<h2 class="font-danger">Error!</h2>`;
const btnTryAgain = `<button onclick="showStart()">Try Again</button>`;
const btnShowResult = `<button onclick="showRangePrimeOutput()">Show Result</button>`;
const btnScrollBottom = `<button onclick="doScrollTo(1)">Bottom</button>`;
const btnScrollTop = `<button onclick="doScrollTo(0)">Top</button>`;
const loading = ``; //`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
const loading2 = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
const loading3 = `<div class="lds-ring-big"><div></div><div></div><div></div><div></div></div>`;
const memoryLabel = `<div><small id="mem"></small></div>`;
const bg = `<ul class="bg-bubbles"><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>`;

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
		// setTimeout(function () {
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
		// }, 100);
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
		// setTimeout(function () {
		callback();
		// }, 0);
	}
}

function genUI(html, callback) {
	// setTimeout(function () {
	let frag = document.createElement("div");
	frag.id = "root";
	frag.innerHTML = `
		<br/>
		${html}
		<br/>
		`;

	let dom = document.getElementById("root");
	if (dom) {
		dom.replaceWith(frag);
	}

	runCallback(callback);
	// }, 0);
}

function showSinglePrimeOutput(html, callback) {
	// setTimeout(function () {
	let elem = document.getElementById("num_result");
	if (elem) {
		elem.innerHTML = html;
	}

	runCallback(callback);
	// }, 0);
}

function genTooltip(target, html) {
	let frag = document.createElement("div");
	frag.id = "tooltip";
	frag.innerHTML = html;

	let dom = document.getElementById("tooltip");
	dom.replaceWith(frag);

	let rect = target.getBoundingClientRect();
	const tooltip_container = document.getElementById("tooltip_container");
	tooltip_container.style.top = `${rect.top + window.scrollY - 5}px`;
	tooltip_container.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
	tooltip_container.style.display = "block";
}

function formatNumber(num) {
	return num.toLocaleString("en-US");
}

function formatTime(num) {
	if (num > 1000) {
		return (parseFloat(num.toFixed(1)) / 1000).toLocaleString("en-US") + "s";
	} else {
		return parseFloat(num.toFixed(1)).toLocaleString("en-US") + "ms";
	}
}

function formatList(num) {
	return num.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
}

function setInnerHtml(id, html) {
	if (id) {
		let elem = document.getElementById(id);
		if (elem) {
			elem.innerHTML = html;
		}
	}
}

function calcSinglePrime() {
	let currentNum = parseInt(document.getElementById("num").value);
	if (currentNum > 0) {
		if (currentNum !== snum) {
			showSinglePrimeOutput(`${loading}Checking${loading2}`);
			snum = currentNum;

			// setTimeout(function () {
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
									if (result.length === 2) {
										showSinglePrimeOutput(
											`<h4>${formatNumber(
												result[result.length - 1]
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
									<h4>${formatNumber(result[result.length - 1])}</h4><b class="font-danger">Is NOT a prime number</b><br/><small>It can${
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
			// }, 0);
		}
	} else {
		showSinglePrimeOutput(`Number must more than 0`);
	}
}

function showStart() {
	hideTooltip();

	genUI(
		`
		${header}
		<div class="form-group"><label for="num">Number : </label><input type="number" id="num" value="${snum}" onchange="calcSinglePrime()" onkeyup="calcSinglePrime()"/></div>
		<div class="form-group"><div id="num_result"></div></div>
		<div class="form-group"><label for="ot" class="radio"><input type="checkbox" id="ot" name="ot" onchange="ot_onchange()" ${
			ot !== 0 ? ` checked="checked"` : ""
		}/> Show Calculation</label></div>

		${header2}

		<div class="form-group"><label for="min">Min : </label><input type="number" id="min" value="${min}"/></div>
		<div class="form-group"><label for="max">Max : </label><input type="number" id="max" value="${max}"/></div>
		<div class="form-group"><label for="os_1" class="radio"><input type="radio" id="os_1" name="os" value="0" onchange="os_onchange()" ${
			os === 0 ? ` checked="checked"` : ""
		}/> Show All</label></div>
		<div class="form-group"><label for="os_2" class="radio"><input type="radio" id="os_2" name="os" value="1" onchange="os_onchange()" ${
			os !== 0 ? ` checked="checked"` : ""
		}/> Prime Only</label></div>
		<div class="form-group" id="col_container"><label for="col">Col : </label><input type="number" id="col" value="${col}"/></div><br/>
		<button onclick="calcRangePrime()">Start Calculate Prime</button>
		
		
	`,
		function () {
			snum = 0;
			os_onchange();
			setTimeout(function () {
				calcSinglePrime();
			}, 100);
		}
	);
}

function ot_onchange() {
	ot = document.getElementById("ot").checked ? 1 : 0;
	snum = 0;
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
	min = parseInt(document.getElementById("min").value);
	max = parseInt(document.getElementById("max").value);
	col = parseInt(document.getElementById("col").value);
	os = parseInt(getRadioValue("os"), 10);
	ot = document.getElementById("ot").checked ? 1 : 0;

	if (max > 0 && col > 0) {
		if (min > 0 && min <= max) {
			if (window.Worker) {
				genUI(
					`
						${header}
						${loading} Finding prime number in <b>${formatNumber(max)}</b> numbers${loading2}<br/>
						${loading3}<br/><br/>
						${btnTryAgain}
					`,
					function () {
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
								${header}
								We found <b>${formatNumber(primeFound)} prime number</b> between <b>${formatNumber(min)}</b> and <b>${formatNumber(
										max
									)}</b> in <b>${formatTime(
										processTime
									)}</b>.<br/><br/>${btnShowResult} ${btnTryAgain}
							`);
								} else {
									genUI(`${errorHeader}Fail to find prime number<br/><br/>${btnTryAgain}`);
								}
							},
							function (e) {
								genUI(`${errorHeader}Fail to find prime number. ${e.message}<br/><br/>${btnTryAgain}`);
							}
						);
					}
				);
			} else {
				genUI(`${errorHeader}Web Worker not available<br/><br/>${btnTryAgain}`);
			}
		} else {
			genUI(`${errorHeader}Min must be a positive integer and less or equal with Max<br/><br/>${btnTryAgain}`);
		}
	} else {
		genUI(`${errorHeader}Max and Col must be a positive integer<br/><br/>${btnTryAgain}`);
	}
}

function mw(max) {
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

function showRangePrimeOutput() {
	genUI(
		`
		${header}${loading} 
		Generating <b> ${formatNumber(os === 0 ? max - min + 1 : result.length)} number</b> into your browser${loading2} <br/>
		${loading3}`,
		function () {
			monitorRenderTime("root", "multiple_time_1", "multiple_time_2");
			let isLong = os === 0 ? result.length / col > 50 : result.length > 1000;

			runWorker(
				"joinresult",
				[result, min, max, col, os],
				function (e) {
					if (e.data) {
						genUI(`
							${header}
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
						genUI(`${errorHeader}Fail to combine result<br/>${btnTryAgain}`);
					}
				},
				function (e) {
					genUI(`${errorHeader}Fail to combine result. ${e.message}<br/>${btnTryAgain}`);
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
		const num = parseInt(target.innerText);

		genTooltip(target, `<h3>${formatNumber(num)}</h3> ${loading} Checking${loading2}`);

		// setTimeout(function () {
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
		// }, 0);
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

	wk = new Worker(`${script}.js`);
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
	const u_num = urlParams.get("num");
	const u_min = urlParams.get("min");
	const u_max = urlParams.get("max");
	const u_col = urlParams.get("col");
	const u_os = urlParams.get("os");
	const u_ot = urlParams.get("ot");

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

	if (u_os) {
		os = parseInt(u_os, 10);
	}

	if (u_ot) {
		ot = parseInt(u_ot, 10);
	}
}

function getMemory() {
	setTimeout(function () {
		let t = window.performance.memory;
		let d = document.getElementById("mem");

		d.innerHTML = `Memory usage <b>${parseInt((t.usedJSHeapSize / t.totalJSHeapSize) * 100, 10)}% | ${parseInt(
			t.usedJSHeapSize / 1024 / 1024,
			10
		)}Mb</b>`;
		getMemory();
	}, 100);
}

getParam();
showStart();

if (window.performance && window.performance.memory) {
	getMemory();
}
