let lastProgress = 0;
function progress(x, max, div) {
	if (x % div === 0n) {
		let curProgress = (x / max) * 100n;
		if (lastProgress !== curProgress) {
			lastProgress = curProgress;

			//progress
			postMessage({
				type: "progress",
				data: Number(curProgress),
			});
		}
	}
}

function progressDiv(max, div) {
	div = div ? div : 3000n;
	return max > div ? max / div : div;
}

onmessage = function (e) {
	try {
		let data = e.data[0];
		let min = e.data[1];
		let col = e.data[3];
		let os = e.data[4];
		let pr = e.data[5];

		let max = BigInt(data.length);
		let tmp = [];
		let result = null;

		let prDiv = progressDiv(max);

		if (os === 0) {
			//gen array list

			let row = [];
			if (pr === 1) {
				for (x = 0n; x < max; x++) {
					row.push(data[x] === 1 ? `<i>${x + min}</i>` : `<b>${x + min}</b>`);

					if ((x + 1n) % col === 0n) {
						tmp.push(row.join(""));
						row = [];
					}

					progress(x, max, prDiv);
				}
			} else {
				for (x = 0n; x < max; x++) {
					row.push(data[x] === 1 ? `<i>${x + min}</i>` : `<b>${x + min}</b>`);

					if ((x + 1n) % col === 0n) {
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
				let prIndex = max > 3000n ? max / 3000n : 3000n;
				for (x = 0n; x < max; x++) {
					if (data[x] === 1) {
						tmp.push(x + min);
					}

					progress(x, max, prDiv);
				}
			} else {
				for (x = 0n; x < max; x++) {
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
