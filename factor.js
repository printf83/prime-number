function formatNumber(num) {
	return num.toLocaleString("en-US");
}

onmessage = function (e) {
	try {
		let data = e.data[0];
		let num = e.data[1];
		let os = e.data[2];

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
                        <td>${formatNumber(num / data[x])}</td>
                    </tr>
                `);
			}

			//combine
			result = `<div class="scrollable"><table>${tmp.join("")}</table></div>`;
		}

		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
