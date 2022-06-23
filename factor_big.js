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

function formatNumber(num) {
	if (num) {
		return num.toLocaleString("en-US");
	} else {
		return `<span class="text-danger">Error!</span>`;
	}
}

onmessage = function (e) {
	try {
		let data = e.data[0];
		let num = e.data[1];
		let os = e.data[2];
		let pr = e.data[3];

		let result = null;
		if (os === 0) {
			result = data.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
		} else {
			let tmp = [];
			let max = BigInt(data.length > 2 ? parseInt(data.length / 2, 10) : data.length);
			//gen array list
			if (pr === 1) {
				let prDiv = progressDiv(max);

				for (x = 0n; x < max; x++) {
					tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[x])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / BigInt(data[x]))}</td>
                    </tr>
                `);

					progress(x, max, prDiv);
				}
			} else {
				for (x = 0; x < max; x++) {
					tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[x])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / BigInt(data[x]))}</td>
                    </tr>
                `);
				}
			}

			//combine
			result = `<div class="scrollable"><table>${tmp.join("")}</table></div>`;
		}

		postMessage({
			type: "data",
			data: result,
		});
	} catch (err) {
		postMessage(err);
	}
};
