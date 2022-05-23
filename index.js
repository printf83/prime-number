// var totalLoop = 0;
let result = [];
let max = 99999;
let col = 6;

function addResizeListener(elem, fun) {
	let id;
	let style = getComputedStyle(elem);
	let wid = style.width;
	let hei = style.height;
	id = requestAnimationFrame(test);
	function test() {
		let newStyle = getComputedStyle(elem);
		if (wid !== newStyle.width || hei !== newStyle.height) {
			fun();
			wid = newStyle.width;
			hei = newStyle.height;
		}
		id = requestAnimationFrame(test);
	}
}

function showOutput(id, html) {
	let frag = document.createElement("div");
	frag.id = html ? id : "root";
	frag.innerHTML = `${html ? html : id}`;

	let dom = document.getElementById(html ? id : "root");
	dom.replaceWith(frag);
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

const header = `<h2>Prime Calculator</h2>`;
const errorHeader = `<h2 class="font-danger">Error!</h2>`;
const btnTryAgain = `<button onclick="showStart()">Try Again</button>`;
const btnShowResult = `<button onclick="showResult()">Show Result</button>`;
const loading = `<div class="lds-ring"><div></div><div></div><div></div><div></div></div>`;

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

function showStart() {
	const tooltip_container = document.getElementById("tooltip_container");
	if (tooltip_container) {
		tooltip_container.style.display = "none";
	}

	showOutput(`
		${header}
		
		<div class="form-group"><label for="max">Max : </label><input type="number" id="max" value="${max}"/></div>
		<div class="form-group"><label for="col">Col : </label><input type="number" id="col" value="${col}"/></div>
		<button onclick="startCalc()">Start Calculate Prime</button><br/><br/>
		<small>The limit is <b>${formatNumber(Number.MAX_SAFE_INTEGER)}</b> and your device memory.</small>
	`);
}

function startCalc() {
	max = parseInt(document.getElementById("max").value);
	col = parseInt(document.getElementById("col").value);

	if (max > 0 && col > 0) {
		if (window.Worker) {
			showOutput(`
				${header}
				${loading} Find prime number in <b>${formatNumber(max)}</b> numbers...
			`);

			setTimeout(function () {
				let start = window.performance.now();

				let wk = new Worker("prime.js");
				wk.postMessage([max, col]);
				wk.onmessage = function (e) {
					if (e.data) {
						result = e.data.result;
						primeFound = e.data.count;

						let processTime = window.performance.now() - start;

						showOutput(`
						${header}
						We found <b>${formatNumber(primeFound)} prime</b> inside <b>${formatNumber(max)} numbers</b> in <b>${formatTime(
							processTime
						)}</b>.<br/>${btnShowResult} ${btnTryAgain}
					`);
					} else {
						showOutput(`${errorHeader}Fail to find prime number<br/>${btnTryAgain}`);
					}
				};
			}, 0);
		} else {
			showOutput(`${errorHeader}Web Worker not available<br/>${btnTryAgain}`);
		}
	} else {
		showOutput(`${errorHeader}Max and Col must be a positive integer<br/>${btnTryAgain}`);
	}
}

let render_start = 0;

function showResult() {
	showOutput(`${header}${loading} Generating <b>${formatNumber(max)}</b> result into your browser...`);

	setTimeout(function () {
		render_start = window.performance.now();
		let root = document.getElementById("root");
		addResizeListener(root, function () {
			let renderEnd = window.performance.now() - render_start;
			let genLength = formatTime(renderEnd);

			showOutput(`speed_label1`, `This list generated in ${genLength}`);
			showOutput(`speed_label2`, `This list generated in ${genLength}`);
		});

		showOutput(`${header}${btnTryAgain}<br/><br/>
				<div id="speed_label1"></div><br/>
				<div class="result_container">
					<div class="result" onclick="showInfo(event)">
						<div class="d-flex">${result.join(`</div><div class="d-flex">`)}</div></div>
					</div>
				</div><br/>
				<div id="speed_label2"></div><br/>
				${btnTryAgain}`);
	}, 0);
}

function showInfo(e) {
	if (e.target && e.target.parentNode.classList.contains("d-flex")) {
		const target = e.target;
		const num = parseInt(target.innerText, 10);

		showTooltip(target, `<h3>${num}</h3> ${loading} Checking...`);

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

showStart();
