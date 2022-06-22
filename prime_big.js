function isPrime(num) {
	if (num == 2n || num == 3n) return true;
	if (num <= 1n || num % 2n == 0n || num % 3n == 0n) return false;
	for (let i = 5n; i * i <= num; i += 6n) if (num % i == 0n || num % (i + 2n) == 0n) return false;
	return true;
}

onmessage = function (e) {
	try {
		let min = e.data[0];
		let max = e.data[1];
		let pr = e.data[2];

		let maxInt = Number(max);

		let result = [];

		// create empty array
		result = new Array(max - min + 1n).fill(0);

		// loop inside array
		if (pr === 1) {
			let prIndex = max > 3000n ? max / 3000n : 3000n;
			for (let x = min; x <= max; x++) {
				if (isPrime(x)) {
					result[x - min] = 1;
				}

				if (x % prIndex === 0n) {
					//progress
					postMessage({
						type: "progress",
						data: (Number(x) / maxInt) * 100,
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
