function getSqrt(value) {
	if (value < 2n) {
		return value;
	}

	if (value < 16n) {
		return BigInt(Math.floor(Math.sqrt(Number(value))));
	}

	if (value < 1n << 52n) {
		var x1 = BigInt(Math.floor(Math.sqrt(Number(value)))) - 3n;
	} else {
		var x1 = (1n << 52n) - 2n;
	}

	let x0 = -1n;
	while (x0 !== x1 && x0 !== x1 - 1n) {
		x0 = x1;
		x1 = (value / x0 + x0) >> 1n;
	}
	return x0;
}

function isPrime(num) {
	if (num == 2n || num == 3n) return true;
	if (num <= 1n || num % 2n == 0n || num % 3n == 0n) return false;
	for (let i = 5n; i * i <= num; i += 6n) if (num % i == 0n || num % (i + 2n) == 0n) return false;
	return true;
}

onmessage = function (e) {
	try {
		let num = e.data[0];

		if (isPrime(num)) {
			postMessage([1n, num]);
		} else {
			let result = [1n];
			let max = getSqrt(num);
			let min = 2n;
			for (let x = min; x <= max; x++) {
				if (num % x === 0n) {
					result.push(x);
					result.push(num / x);
				}
			}

			result.push(num);

			result = [...new Set(result)];
			result.sort((a, b) => {
				if (a > b) {
					return 1;
				} else if (a < b) {
					return -1;
				} else {
					return 0;
				}
			});

			postMessage(result);
		}
	} catch (err) {
		postMessage(err);
	}
};
