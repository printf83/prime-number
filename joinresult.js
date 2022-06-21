onmessage = function (e) {
	try {
		let data = e.data[0];
		let min = e.data[1];
		let col = e.data[3];
		let os = e.data[4];

		let tmp = [];
		let result = null;
		if (os === 0) {
			//gen array list
			let row = [];
			for (x = 0; x < data.length; x++) {
				row.push(data[x] === 1 ? `<i>${x + min}</i>` : `<b>${x + min}</b>`);

				if ((x + 1) % col === 0) {
					tmp.push(row.join(""));
					row = [];
				}
			}

			if (row.length > 0) {
				tmp.push(row.join(""));
			}

			result = `<div class="d-flex">${tmp.join(`</div><div class="d-flex">`)}</div>`;
		} else {
			//gen array list
			for (x = 0; x < data.length; x++) {
				if (data[x] === 1) {
					tmp.push(x + min);
				}
			}

			//combine
			result = `<small>${tmp.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}</small>`;
		}

		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
