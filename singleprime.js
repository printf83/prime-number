onmessage = function (e) {
	try {
		let max = e.data[0];
		let min = 1;
		let result = [];

		for (let x = min; x <= max; x++) {
			if (max % x === 0) {
				result.push(x);
			}
		}

		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
