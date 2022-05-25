onmessage = function (e) {
	try {
		let data = e.data[0];
		let combine_type = e.data[1];
		let result = null;
		if (combine_type === 0) {
			result = data.join(`</div><div class="d-flex">`);
		} else {
			result = data.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
		}

		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
