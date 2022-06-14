function isPrime(num) {
	if (num == 2 || num == 3) return true;
	if (num <= 1 || num % 2 == 0 || num % 3 == 0) return false;
	for (let i = 5; i * i <= num; i += 6) if (num % i == 0 || num % (i + 2) == 0) return false;
	return true;
}

onmessage = function (e) {
	try {
		let num = e.data[0];

		if (isPrime(num)) {
			postMessage([1, num]);
		} else {
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
		}
	} catch (err) {
		postMessage(err);
	}
};
