onmessage = function (e) {
	try {
		let data = e.data[0];
		let result = data.join(`</div><div class="d-flex">`);
		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
