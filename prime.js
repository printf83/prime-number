function isPrime(num) {
	if (num == 2 || num == 3) return true;
	if (num <= 1 || num % 2 == 0 || num % 3 == 0) return false;
	for (let i = 5; i * i <= num; i += 6) if (num % i == 0 || num % (i + 2) == 0) return false;
	return true;
}

onmessage = function (e) {
	try {
		let min = e.data[0];
		let max = e.data[1];
		let pr = e.data[2];

		let result = [];

		// create empty array
		result = new Array(max - min + 1).fill(0);

		// loop inside array
		if (pr === 1) {
			let prIndex = max > 3000 ? Math.floor(max / 3000) : 3000;
			for (let x = min; x <= max; x++) {
				if (isPrime(x)) {
					result[x - min] = 1;
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
			for (let x = min; x <= max; x++) {
				if (isPrime(x)) {
					result[x - min] = 1;
				}
			}
		}

		// return result
		postMessage({
			type: "data",
			data: {
				result: result,
				count: result.filter((x) => x === 1).length,
			},
		});
	} catch (err) {
		postMessage(err);
	}
};
