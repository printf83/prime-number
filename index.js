// var totalLoop = 0;
let result = [];
let min = 1;
let max = 99999;
let col = 6;
let os = 1;
let snum = 1;

function addResizeListener(elem, fun) {
	let id;
	let style = getComputedStyle(elem);
	let wid = style.width;
	let hei = style.height;
	id = requestAnimationFrame(test);
	function test() {
		setTimeout(function () {
			let newStyle = getComputedStyle(elem);
			if (wid !== newStyle.width || hei !== newStyle.height) {
				fun();
				wid = newStyle.width;
				hei = newStyle.height;
			} else {
				id = requestAnimationFrame(test);
			}
		}, 0);
	}
}

function showOutput(html, callback) {
	setTimeout(function () {
		let frag = document.createElement("div");
		frag.id = "root";
		frag.innerHTML = `${html}${memoryLabel}`;

		let dom = document.getElementById("root");
		if (dom) {
			dom.replaceWith(frag);
		}

		if (typeof callback === "function") {
			setTimeout(function () {
				callback();
			}, 0);
		}
	}, 0);
}

function showOutputNum(html, callback) {
	setTimeout(function () {
		document.getElementById("num_result").innerHTML = html;
		if (typeof callback === "function") {
			setTimeout(function () {
				callback();
			}, 0);
		}
	}, 0);
}

function showTooltip(target, html) {
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
const btnShowResult = `<button onclick="showResult()">Show Result</button>`;
const loading = ``; //`<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;
const loading2 = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
const memoryLabel = ``; //`<div><small id="mem"></small></div>`;

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

function monitorTime(target, outputid1, outputid2) {
	let monitor_start = window.performance.now();
	addResizeListener(target, function () {
		let monitor_end = window.performance.now() - monitor_start;
		let monitor_length = formatTime(monitor_end);

		if (outputid1) {
			let elem = document.getElementById(outputid1);
			if (elem) {
				elem.innerHTML = `Complete in ${monitor_length}`;
			}
		}

		if (outputid2) {
			let elem = document.getElementById(outputid2);
			if (elem) {
				elem.innerHTML = `Complete in ${monitor_length}`;
			}
		}
	});
}

function checkSingleNumber() {
	let currentNum = parseInt(document.getElementById("num").value);
	if (currentNum > 0) {
		if (currentNum !== snum) {
			showOutputNum(`${loading}Checking${loading2}`);
			snum = currentNum;

			setTimeout(function () {
				monitorTime(document.getElementById("root"), "single_time_1", "single_time_2");

				let wk = new Worker("singleprime.js");
				wk.postMessage([snum]);
				wk.onmessage = function (e) {
					if (e.data) {
						result = e.data;
						if (result) {
							if (result.length === 2) {
								showOutputNum(
									`<span class="font-success">${snum} is a prime number</span><br/><small>It can only be divided with <br/>${formatList(
										result
									)}</small><br/><br/><small id="single_time_2"></small>`
								);
							} else {
								if (result.length > 30) {
									showOutputNum(
										`<small id="single_time_1"></small><br/><br/><span>${snum} is <u class="font-danger">NOT</u> a prime number</span><br/><small>It can only be divided with <br/>${formatList(
											result
										)}</small><br/><br/><small id="single_time_2"></small>`
									);
								} else {
									showOutputNum(
										`<span>${snum} is <u class="font-danger">NOT</u> a prime number</span><br/><small>It can only be divided with <br/>${formatList(
											result
										)}</small><br/><br/><small id="single_time_2"></small>`
									);
								}
							}
						} else {
							showOutputNum(`Fail to find prime number`);
						}
					} else {
						showOutputNum(`Fail to find prime number`);
					}
				};
			}, 0);
		}
	} else {
		showOutputNum(`Number must more than 0`);
	}
}

function showStart() {
	const tooltip_container = document.getElementById("tooltip_container");
	if (tooltip_container) {
		tooltip_container.style.display = "none";
	}

	showOutput(
		`
		${header}
		<div class="form-group"><label for="num">Number : </label><input type="number" id="num" value="${snum}" onchange="checkSingleNumber()" onkeyup="checkSingleNumber()"/></div>
		<div class="form-group"><div id="num_result"></div></div>

		${header2}

		<div class="form-group"><label for="min">Min : </label><input type="number" id="min" value="${min}"/></div>
		<div class="form-group"><label for="max">Max : </label><input type="number" id="max" value="${max}"/></div>
		<div class="form-group"><label for="os_1" class="radio"><input type="radio" id="os_1" name="os" value="0" onchange="output_style_onchange()" ${
			os === 0 ? ` checked="checked"` : ""
		}/> Show All</label></div>
		<div class="form-group"><label for="os_2" class="radio"><input type="radio" id="os_2" name="os" value="1" onchange="output_style_onchange()" ${
			os !== 0 ? ` checked="checked"` : ""
		}/> Prime Only</label></div>
		<div class="form-group" id="col_container"><label for="col">Col : </label><input type="number" id="col" value="${col}"/></div>
		<button onclick="startCalc()">Start Calculate Prime</button><br/><br/>
		<div><small>The limit is <b>${formatNumber(Number.MAX_SAFE_INTEGER)}</b> and your <b>device memory</b></small></div>
		<div><small>View on <a href="https://github.com/printf83/factor">GitHub</a></small></div>
		
	`,
		function () {
			snum = 0;
			output_style_onchange();
			checkSingleNumber();
		}
	);
}

function output_style_onchange() {
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

function startCalc() {
	min = parseInt(document.getElementById("min").value, 10);
	max = parseInt(document.getElementById("max").value, 10);
	col = parseInt(document.getElementById("col").value, 10);
	os = parseInt(getRadioValue("os"), 10);

	if (max > 0 && col > 0) {
		if (min > 0 && min <= max) {
			if (window.Worker) {
				showOutput(
					`
						${header}
						${loading} Finding prime number in <b>${formatNumber(max)}</b> numbers${loading2}
					`,
					function () {
						let start = window.performance.now();

						let wk = new Worker("prime.js");
						wk.postMessage([min, max, col, os]);
						wk.onmessage = function (e) {
							if (e.data) {
								result = e.data.result;
								primeFound = e.data.count;

								let processTime = window.performance.now() - start;

								showOutput(`
								${header}
								We found <b>${formatNumber(primeFound)} prime number</b> between <b>${formatNumber(min)}</b> and <b>${formatNumber(
									max
								)}</b> in <b>${formatTime(processTime)}</b>.<br/>${btnShowResult} ${btnTryAgain}
							`);
							} else {
								showOutput(`${errorHeader}Fail to find prime number<br/>${btnTryAgain}`);
							}
						};
					}
				);
			} else {
				showOutput(`${errorHeader}Web Worker not available<br/>${btnTryAgain}`);
			}
		} else {
			showOutput(`${errorHeader}Min must be a positive integer and less or equal with Max<br/>${btnTryAgain}`);
		}
	} else {
		showOutput(`${errorHeader}Max and Col must be a positive integer<br/>${btnTryAgain}`);
	}
}

let render_start = 0;

function showResult() {
	showOutput(
		`${header}${loading} Generating <b>${formatNumber(max - min + 1)} number</b> into your browser${loading2}`,
		function () {
			monitorTime(document.getElementById("root"), "multiple_time_1", "multiple_time_2");

			let wk = new Worker("joinresult.js");
			wk.postMessage([result, os]);
			wk.onmessage = function (e) {
				if (e.data) {
					if (os === 0) {
						showOutput(`
									${header}${btnTryAgain}<br/><br/>
									${e.data.length > 1000 ? `<small id="multiple_time_1"></small><br/><br/>` : ``}
									<div class="result_container">
										<div class="result" onclick="showInfo(event)">
											<div class="d-flex">${e.data}</div></div>
										</div>
									</div><br/>
									<small id="multiple_time_2"></small><br/><br/>
									${btnTryAgain}
									`);
					} else {
						showOutput(`
									${header}${btnTryAgain}<br/><br/>
									${e.data.length > 1000 ? `<small id="multiple_time_1"></small><br/><br/>` : ``}
									<div class="result_container">
										<div class="result">
											<small>${e.data}</small>
										</div>
									</div><br/>
									<small id="multiple_time_2"></small><br/><br/>
									${btnTryAgain}
									`);
					}
				} else {
					showOutput(`${errorHeader}Fail to combine result<br/>${btnTryAgain}`);
				}
			};
		}
	);
}

function showInfo(e) {
	if (e.target && e.target.parentNode.classList.contains("d-flex")) {
		const target = e.target;
		const num = parseInt(target.innerText, 10);

		showTooltip(target, `<h3>${num}</h3> ${loading} Checking${loading2}`);

		setTimeout(function () {
			let wk = new Worker("singleprime.js");
			wk.postMessage([num]);
			wk.onmessage = function (e) {
				if (e.data) {
					result = e.data;
					if (result) {
						if (result.length === 2) {
							showTooltip(
								target,
								`<h3>${num}</h3><b class="font-success">Is a prime number</b><br/><small>It can only be divided with <br/>${formatList(
									result
								)}</small>`
							);
						} else {
							showTooltip(
								target,
								`<h3>${num}</h3><b>Is <u class="font-danger">NOT</u> a prime number</b><br/><small>It can be divided with <br/>${formatList(
									result
								)}</small>`
							);
						}
					} else {
						showTooltip(target, `Fail to find prime number`);
					}
				} else {
					showTooltip(target, `Fail to find prime number`);
				}
			};
		}, 0);
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

	if (u_num) {
		snum = parseInt(u_num, 10);
	}

	if (u_min) {
		min = parseInt(u_min, 10);
	}

	if (u_max) {
		max = parseInt(u_max, 10);
	}

	if (u_col) {
		col = parseInt(u_col, 10);
	}

	if (u_os) {
		os = parseInt(u_os, 10);
	}
}

getParam();
showStart();
