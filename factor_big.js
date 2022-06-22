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
			let mid = data.length > 2 ? parseInt(data.length / 2, 10) : data.length;
			//gen array list
			for (x = 0; x < mid; x++) {
				tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[x])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / BigInt(data[x]))}</td>
                    </tr>
                `);

				if (pr === 1) {
					//progress
					postMessage({
						type: "progress",
						data: (x / mid) * 100,
					});
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
