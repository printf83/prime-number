let lastProgress = 0n;
function progress(x, max, div) {
	if (x % div === 0n) {
		let curProgress = (x * 100n) / max;
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
	div = div ? div : 100n;
	return max > div ? max / div : div;
}

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
		let result = [];

		let length = max - min + 1n;

		// create empty array
		result = new Array(length).fill(0);

		// loop inside array
		if (pr === 1) {
			let prDiv = progressDiv(length);

			for (let x = min; x <= max; x++) {
				if (isPrime(x)) {
					result[x - min] = 1;
				}

				progress(x - min + 1n, length, prDiv);
			}

			progress(length, length, prDiv);
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
