// var totalLoop = 0;
let result = [];
let max = 99;
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
	setTimeout(function () {
		let frag = document.createElement("div");
		frag.id = html ? id : "root";
		frag.innerHTML = html ? html : id;

		let dom = document.getElementById(html ? id : "root");
		dom.replaceWith(frag);
	}, 0);
}

function showTooltip(html) {
	let frag = document.createElement("div");
	frag.id = "tooltip";
	frag.innerHTML = html;

	let dom = document.getElementById("tooltip");
	dom.replaceWith(frag);
}

const btnTryAgain = `<button onclick="showStart()">Try Again</button>`;
const btnShowResult = `<button onclick="showResult()">Show Result</button>`;

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

function showStart() {
	// const tooltip = document.getElementById("tooltip");
	// tooltip.style.display = "none";

	showOutput(`
		<div class="form-group"><label for="max">Max : </label><input type="number" id="max" value="${max}"/></div>
		<div class="form-group"><label for="col">Col : </label><input type="number" id="col" value="${col}"/></div>
		<button onclick="startCalc()">Start Calculate Prime</button>
	`);
}

function startCalc() {
	max = parseInt(document.getElementById("max").value);
	col = parseInt(document.getElementById("col").value);

	if (max > 0 && col > 0) {
		if (window.Worker) {
			showOutput(`
				Find prime number in <b>${formatNumber(max)}</b> numbers...
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
						We found <b>${formatNumber(primeFound)} prime</b> inside <b>${formatNumber(max)} numbers</b> in <b>${formatTime(
							processTime
						)}</b>.<br/>${btnShowResult} ${btnTryAgain}
					`);
					} else {
						showOutput(`Fail to find prime number<br/>${btnTryAgain}`);
					}
				};
			}, 0);
		} else {
			showOutput(`Web Worker not available<br/>${btnTryAgain}`);
		}
	} else {
		showOutput(`Max and Col must be a positive integer<br/>${btnTryAgain}`);
	}
}

let render_start = 0;

function showResult() {
	showOutput(`Please wait. Generating <b>${formatNumber(max)}</b> result into your browser...`);

	render_start = window.performance.now();
	let root = document.getElementById("root");
	addResizeListener(root, function () {
		let renderEnd = window.performance.now() - render_start;
		let genLength = formatTime(renderEnd);

		showOutput(`speed_label1`, `This list generated in ${genLength}`);
		showOutput(`speed_label2`, `This list generated in ${genLength}`);
	});

	showOutput(`${btnTryAgain}<br/><br/>
				<div id="speed_label1"></div><br/>
				<div class="result_container">
					<div class="result" onclick="showInfo(event)">
						<div class="d-flex">${result.join(`</div><div class="d-flex">`)}</div></div>
					</div>
				</div><br/>
				<div id="speed_label2"></div><br/>
				${btnTryAgain}`);
}

function showInfo(e) {
	if (
		e.path &&
		e.path.length >= 3 &&
		e.path[1].classList.contains("d-flex") &&
		e.path[2].classList.contains("result")
	) {
		const target = e.path[0];
		let rect = target.getBoundingClientRect();

		setTimeout(function () {
			let num = parseInt(e.path[0].innerText, 10);
			let wk = new Worker("singleprime.js");
			wk.postMessage([num]);
			wk.onmessage = function (e) {
				if (e.data) {
					result = e.data;
					console.log(result);
					if (result) {
						if (result.length > 2) {
							showTooltip(
								`<b>${num}</b><br/>Is NOT a prime<br/><small>${num} can be divided with <br/>${result.join(
									", "
								)}</small>`
							);
						} else {
							showTooltip(
								`<b>${num}</b><br/>Is a prime<br/><small>${num} can only be divided with <br/>${result.join(
									", "
								)}</small>`
							);
						}
					} else {
						showTooltip(`Fail to find prime number`);
					}
				} else {
					showTooltip(`Fail to find prime number`);
				}
				const tooltip = document.getElementById("tooltip");
				tooltip.style.top = `${rect.top - 90 + window.scrollY}px`;
				tooltip.style.left = `${rect.left + +window.scrollX}px`;
				// tooltip.style.display = "block";
			};
		}, 0);
	}
}

showStart();
