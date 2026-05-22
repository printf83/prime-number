(function () {
	let lastProgress = 0n;

	function progress(x: bigint, max: bigint, div: bigint): void {
		if (x % div === 0n) {
			const curProgress = (x * 100n) / max;
			if (lastProgress !== curProgress) {
				lastProgress = curProgress;
				postMessage({ type: "progress", data: Number(curProgress) });
			}
		}
	}

	function progressDiv(max: bigint, div = 100n): bigint {
		return max > div ? max / div : div;
	}

	function isPrime(num: bigint): boolean {
		if (num === 2n || num === 3n) return true;
		if (num <= 1n || num % 2n === 0n || num % 3n === 0n) return false;
		for (let i = 5n; i * i <= num; i += 6n) {
			if (num % i === 0n || num % (i + 2n) === 0n) return false;
		}
		return true;
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [min, max, pr] = e.data as [bigint, bigint, number];

			const length = Number(max - min + 1n);
			const result = new Array(length).fill(0);

			if (pr === 1) {
				const prDiv = progressDiv(BigInt(length));

				for (let x = min; x <= max; x += 1n) {
					if (isPrime(x)) {
						result[Number(x - min)] = 1;
					}
					progress(x - min + 1n, BigInt(length), prDiv);
				}
			} else {
				for (let x = min; x <= max; x += 1n) {
					if (isPrime(x)) {
						result[Number(x - min)] = 1;
					}
				}
			}

			postMessage({
				type: "data",
				data: { result, count: result.filter((x) => x === 1).length },
			});
		} catch (err) {
			postMessage(err);
		}
	};
})();
