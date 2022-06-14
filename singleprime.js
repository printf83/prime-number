onmessage = function (e) {
	try {
		let num = e.data[0];

		let result = [1];
		let max = Math.sqrt(num);
		let min = 2;
		for (let x = min; x <= max; x++) {
			if (num % x === 0) {
				result.push(x);
				result.push(num / x);
			}
		}

		result.push(num);

		result = [...new Set(result)];
		result.sort(function (a, b) {
			return a - b;
		});

		postMessage(result);
	} catch (err) {
		postMessage(err);
	}
};
