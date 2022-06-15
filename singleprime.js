// function isPrime(num) {
// 	if (num == 2 || num == 3) return true;
// 	if (num <= 1 || num % 2 == 0 || num % 3 == 0) return false;
// 	for (let i = 5; i * i <= num; i += 6) if (num % i == 0 || num % (i + 2) == 0) return false;
// 	return true;
// }

function isPrime(num) {
	if (num === 2n || num === 3n) return true;
	if (num <= 1n || num % 2n === 0n || num % 3n === 0n) return false;
	for (let i = 5n; i * i <= num; i += 6n) if (num % i === 0n || num % (i + 2n) === 0n) return false;
	return true;
}

// function sqrt(value) {
// 	if (value < 0n) {
// 		throw "square root of negative numbers is not supported";
// 	}

// 	if (value < 2n) {
// 		return value;
// 	}

// 	function newtonIteration(n, x0) {
// 		const x1 = (n / x0 + x0) >> 1n;
// 		if (x0 === x1 || x0 === x1 - 1n) {
// 			return x0;
// 		}
// 		return newtonIteration(n, x1);
// 	}

// 	return newtonIteration(value, 1n);
// }

function rootNth(val, k = 2n) {
	let o = 0n; // old approx value
	let x = val;
	let limit = 100;

	while (x ** k !== k && x !== o && --limit) {
		o = x;
		x = ((k - 1n) * x + val / x ** (k - 1n)) / k;
	}

	return x;
}

onmessage = function (e) {
	let num = e.data[0];

	if (isPrime(num)) {
		postMessage([1n, num]);
	} else {
		let result = [1n];
		let max = rootNth(num); //sqrt(num);
		let min = 2n;
		for (let x = min; x <= max; x++) {
			if (num % x === 0n) {
				result.push(x);
				result.push(num / x);
			}
		}

		result.push(num);

		result = [...new Set(result)];
		result.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

		postMessage(result);
	}
};
