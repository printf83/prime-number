// var totalLoop = 0;
let result = [];
let min = 1n;
let max = 99999n;
let col = 6;
let os = 1;
let snum = 1n;
let DEBUG = false;

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

			setInnerHtml(outputid1, `Complete in ${sduration}`);
			setInnerHtml(outputid2, `Complete in ${sduration}`);
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
		
		${html}
		<br/><br/>
		<div><small>The limit is <b>${formatNumber(Number.MAX_SAFE_INTEGER)}</b> and your <b>device memory</b></small></div>
		<div><small>View on <a href="https://github.com/printf83/factor">GitHub</a></small></div>${memoryLabel}
		
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
	// let currentNum = parseInt(document.getElementById("num").value,10);
	let currentNum = BigInt(document.getElementById("num").value);
	if (currentNum > 0n) {
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
							if (result.length === 2) {
								showSinglePrimeOutput(
									`<h4>${formatNumber(
										result[result.length - 1]
									)}</h4><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${formatList(
										result
									)}</small><br/><br/><small id="single_time_1">${loading2}</small>`
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
									} be divided with <br/>${formatList(
										result
									)}</small><br/><br/><small id="single_time_2">${loading2}</small>`
								);
							}
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

		${header2}

		<div class="form-group"><label for="min">Min : </label><input type="number" id="min" value="${min}"/></div>
		<div class="form-group"><label for="max">Max : </label><input type="number" id="max" value="${max}"/></div>
		<div class="form-group"><label for="os_1" class="radio"><input type="radio" id="os_1" name="os" value="0" onchange="os_onchange()" ${
			os === 0 ? ` checked="checked"` : ""
		}/> Show All</label></div>
		<div class="form-group"><label for="os_2" class="radio"><input type="radio" id="os_2" name="os" value="1" onchange="os_onchange()" ${
			os !== 0 ? ` checked="checked"` : ""
		}/> Prime Only</label></div>
		<div class="form-group" id="col_container"><label for="col">Col : </label><input type="number" id="col" value="${col}"/></div>
		<button onclick="calcRangePrime()">Start Calculate Prime</button>
		
		
	`,
		function () {
			snum = 0n;
			os_onchange();
			calcSinglePrime();
		}
	);
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
	// min = parseInt(document.getElementById("min").value, 10);
	// max = parseInt(document.getElementById("max").value, 10);
	// col = parseInt(document.getElementById("col").value, 10);

	min = BigInt(document.getElementById("min").value);
	max = BigInt(document.getElementById("max").value);
	col = BigInt(document.getElementById("col").value);

	os = parseInt(getRadioValue("os"), 10);

	if (max > 0n && col > 0n) {
		if (min > 0n && min <= max) {
			if (window.Worker) {
				genUI(
					`
						${header}
						${loading} Finding prime number in <b>${formatNumber(max)}</b> numbers${loading2}<br/>
						${loading3}
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
									)}</b> in <b>${formatTime(processTime)}</b>.<br/>${btnShowResult} ${btnTryAgain}
							`);
								} else {
									genUI(`${errorHeader}Fail to find prime number<br/>${btnTryAgain}`);
								}
							},
							function (e) {
								genUI(`${errorHeader}Fail to find prime number. ${e.message}<br/>${btnTryAgain}`);
							}
						);
					}
				);
			} else {
				genUI(`${errorHeader}Web Worker not available<br/>${btnTryAgain}`);
			}
		} else {
			genUI(`${errorHeader}Min must be a positive integer and less or equal with Max<br/>${btnTryAgain}`);
		}
	} else {
		genUI(`${errorHeader}Max and Col must be a positive integer<br/>${btnTryAgain}`);
	}
}

function mw(max) {
	switch (true) {
		case max <= 99n:
			return 0;
		case max <= 999n:
			return 1;
		case max <= 9999n:
			return 2;
		case max <= 99999n:
			return 3;
		case max <= 999999n:
			return 4;
		case max <= 9999999n:
			return 5;
		case max <= 99999999n:
			return 6;
		default:
			return 7;
	}
}

function showRangePrimeOutput() {
	genUI(
		`${header}${loading} Generating <b>${formatNumber(max - min + 1n)} number</b> into your browser${loading2}<br/>
		${loading3}`,
		function () {
			monitorRenderTime("root", "multiple_time_1", "multiple_time_2");

			runWorker(
				"joinresult",
				[result, min, max, col, os],
				function (e) {
					if (e.data) {
						if (os === 0) {
							genUI(`
									${header}${btnTryAgain} ${btnScrollBottom}<br/><br/>
									${e.data.length > 1000 ? `<small id="multiple_time_1">${loading2}</small><br/><br/>` : ``}
									<div class="result_container" onclick="showTooltip(event)">
										<div class="result mw-${mw(max)}">
											<div class="d-flex">${e.data}</div></div>
										</div>
									</div><br/>
									<small id="multiple_time_2">${loading2}</small><br/><br/>
									${btnTryAgain} ${btnScrollTop}
									`);
						} else {
							genUI(`
									${header}${btnTryAgain} ${btnScrollBottom}<br/><br/>
									${e.data.length > 1000 ? `<small id="multiple_time_1">${loading2}</small><br/><br/>` : ``}
									<div class="result_container">
										<div class="result">
											<small>${e.data}</small>
										</div>
									</div><br/>
									<small id="multiple_time_2">${loading2}</small><br/><br/>
									${btnTryAgain} ${btnScrollTop}
									`);
						}
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
}
function showTooltip(e) {
	if (e.target && e.target.parentNode.classList.contains("d-flex")) {
		const target = e.target;
		// const num = parseInt(target.innerText, 10);
		const num = BigInt(target.innerText);

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
						if (result.length === 2) {
							genTooltip(
								target,
								`<h3>${formatNumber(
									result[result.length - 1]
								)}</h3><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${formatList(
									result
								)}</small><br/><span id="tooltip_time">${loading2}</span>`
							);
						} else {
							genTooltip(
								target,
								`<h3>${formatNumber(
									result[result.length - 1]
								)}</h3><b class="font-danger">Is NOT a prime number</b><br/><small>It can be divided with <br/>${formatList(
									result
								)}</small><br/><span id="tooltip_time">${loading2}</span>`
							);
						}
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

function runWorker(script, params, callback, errcallback) {
	if (DEBUG) {
		runWorkerDebug(script, params, callback, errcallback);
	} else {
		runWorkerProduction(script, params, callback, errcallback);
	}
}

var wk = null;
function runWorkerProduction(script, params, callback, errcallback) {
	if (wk !== null) {
		wk.terminate();
		wk = null;
	}

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

function runWorkerDebug(script, params, callback, errcallback) {
	let wkD = new Worker(`${script}.js`);
	wkD.postMessage(params);
	wkD.onmessage = function (e) {
		if (typeof callback === "function") {
			callback(e);
		}
	};

	wkD.onerror = function (e) {
		if (typeof errcallback === "function") {
			errcallback(e);
		}
	};
}

function getParam() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const u_num = urlParams.get("num");
	const u_min = urlParams.get("min");
	const u_max = urlParams.get("max");
	const u_col = urlParams.get("col");
	const u_os = urlParams.get("os");

	// if (u_num) {
	// 	snum = parseInt(u_num, 10);
	// }

	// if (u_min) {
	// 	min = parseInt(u_min, 10);
	// }

	// if (u_max) {
	// 	max = parseInt(u_max, 10);
	// }

	// if (u_col) {
	// 	col = parseInt(u_col, 10);
	// }

	if (u_os) {
		os = parseInt(u_os, 10);
	}

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
}

function getMemory() {
	setTimeout(function () {
		let t = window.performance.memory;
		let d = document.getElementById("mem");

		d.innerHTML = `Memory usage <b>${parseInt((t.usedJSHeapSize / t.jsHeapSizeLimit) * 100, 10)}% | ${parseInt(
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
