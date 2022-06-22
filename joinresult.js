onmessage = function (e) {
	try {
		let data = e.data[0];
		let min = e.data[1];
		let col = e.data[3];
		let os = e.data[4];
		let pr = e.data[5];

		let max = data.length;
		let tmp = [];
		let result = null;
		if (os === 0) {
			//gen array list
			let row = [];

			if (pr === 1) {
				let prIndex = max > 3000 ? Math.floor(max / 3000) : 3000;
				for (x = 0; x < max; x++) {
					row.push(data[x] === 1 ? `<i>${x + min}</i>` : `<b>${x + min}</b>`);

					if ((x + 1) % col === 0) {
						tmp.push(row.join(""));
						row = [];
					}

					if (x % prIndex === 0) {
						//progress
						postMessage({
							type: "progress",
							data: (x / max) * 100,
						});
					}
				}
			} else {
				for (x = 0; x < max; x++) {
					row.push(data[x] === 1 ? `<i>${x + min}</i>` : `<b>${x + min}</b>`);

					if ((x + 1) % col === 0) {
						tmp.push(row.join(""));
						row = [];
					}
				}
			}

			if (row.length > 0) {
				tmp.push(row.join(""));
			}

			result = `<div class="d-flex">${tmp.join(`</div><div class="d-flex">`)}</div>`;
		} else {
			//gen array list
			if (pr === 1) {
				let prIndex = max > 3000 ? Math.floor(max / 3000) : 3000;
				for (x = 0; x < max; x++) {
					if (data[x] === 1) {
						tmp.push(x + min);
					}

					if (x % prIndex === 0) {
						//progress
						postMessage({
							type: "progress",
							data: (x / max) * 100,
						});
					}
				}
			} else {
				for (x = 0; x < max; x++) {
					if (data[x] === 1) {
						tmp.push(x + min);
					}
				}
			}

			//combine
			result = `<small>${tmp.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}</small>`;
		}

		postMessage({
			type: "data",
			data: result,
		});
	} catch (err) {
		postMessage(err);
	}
};
