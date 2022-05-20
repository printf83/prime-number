// var totalLoop = 0;
let result = [];
let max = 9999;
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

function showStart() {
	document.getElementById("root").innerHTML = `
	
	<div class="form-group"><label for="max">Max : </label><input type="number" id="max" value="${max}"/></div>
	<div class="form-group"><label for="col">Col : </label><input type="number" id="col" value="${col}"/></div>
	<button onclick="startCalc()">Start Calculate Prime</button>
	`;
}

function startCalc() {
	max = parseInt(document.getElementById("max").value);
	col = parseInt(document.getElementById("col").value);

	if (max > 0 && col > 0) {
		if (window.Worker) {
			document.getElementById("root").innerHTML = `Find prime number in <b>${max.toLocaleString(
				"en-US"
			)}</b> numbers...`;

			setTimeout(function () {
				let start = window.performance.now();

				let wk = new Worker("prime.js");
				wk.postMessage([max, col]);
				wk.onmessage = function (e) {
					result = e.data;

					let end = window.performance.now();
					document.getElementById("root").innerHTML = `We found <b>${result.length.toLocaleString(
						"en-US"
					)} prime</b> inside <b>${max.toLocaleString("en-US")} numbers</b> in <b>${parseFloat(
						(end - start).toFixed(1)
					).toLocaleString(
						"en-US"
					)}ms</b>.<br/><button onclick="showResult()">Show Result</button> <button onclick="showStart()">Try Again</button>`;
				};
			}, 1);
		} else {
			document.getElementById(
				"root"
			).innerHTML = `Web Worker not available.<br/><button onclick="showStart()">Try Again</button>`;
		}
	} else {
		document.getElementById(
			"root"
		).innerHTML = `Max and Col must be a positive integer.<br/><button onclick="showStart()">Try Again</button>`;
	}
}

let render_start = 0;
let render_end = 0;

function showResult() {
	document.getElementById("root").innerHTML = `Please wait. Generating <b>${max.toLocaleString(
		"en-US"
	)}</b> result into your browser...`;

	render_start = window.performance.now();
	let root = document.getElementById("root");
	addResizeListener(root, function () {
		render_end = window.performance.now();
		let genLength = parseFloat((render_end - render_start).toFixed(1)).toLocaleString("en-US");

		document.getElementById("speed_label1").innerHTML = `This list generated in ${genLength}ms`;
		document.getElementById("speed_label2").innerHTML = `This list generated in ${genLength}ms`;
	});

	setTimeout(
		function (root) {
			root.innerHTML = `
        <button onclick="showStart()">Try Again</button><br/>
        <small id="speed_label1"></small>
		<div class="result_container">
		<div class="result">
        <div class="d-flex">${result.join(`</div><div class="d-flex">`)}</div></div>
		</div>
		</div>
        <small id="speed_label2"></small><br/>
        <button onclick="showStart()">Try Again</button>`;
		},
		1,
		root
	);
}

showStart();
