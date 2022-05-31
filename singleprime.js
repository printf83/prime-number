onmessage = function (e) {
	try {
		let max = e.data[0];
		let max2 = parseInt(max / 2, 10);
		let min = 1;
		let result = [1];

		for (let x = min; x < max2; x++) {
			if (max % x === 0) {
				result.push(x);
				result.push(max / x);
				max2 = max / x;
			}
		}

		result.push(max);

		result = [...new Set(result)];
		result.sort(function (a, b) {
			return a - b;
		});

		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
