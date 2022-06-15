onmessage = function (e) {
	let data = e.data[0];
	let min = e.data[1];
	let col = e.data[3];
	let os = e.data[4];

	let tmp = [];
	let result = null;
	if (os === 0) {
		//gen array list
		let row = [];
		for (x = 0n; x < data.length; x++) {
			row.push(data[x] === 1 ? `<i>${x + min}</i>` : `<b>${x + min}</b>`);

			if ((x + 1n) % col === 0n) {
				tmp.push(row.join(""));
				row = [];
			}
		}

		if (row.length > 0n) {
			tmp.push(row.join(""));
		}

		result = tmp.join(`</div><div class="d-flex">`);
	} else {
		//gen array list
		for (x = 0n; x < data.length; x++) {
			if (data[x] === 1) {
				tmp.push(x + min);
			}
		}

		//combine
		result = tmp.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
	}

	postMessage(result);
};
