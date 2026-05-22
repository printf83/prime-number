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

	function bigintSqrt(value: bigint): bigint {
		if (value < 0n) {
			throw new Error("Square root of negative numbers is not supported");
		}
		if (value < 2n) {
			return value;
		}

		let x0 = value;
		let x1 = (value >> 1n) + 1n;

		while (x1 < x0) {
			x0 = x1;
			x1 = (value / x1 + x1) >> 1n;
		}

		return x0;
	}

	function simpleSieve(limit: number): number[] {
		const sieve = new Uint8Array(limit + 1);
		sieve.fill(1);

		if (limit >= 0) {
			sieve[0] = 0;
		}
		if (limit >= 1) {
			sieve[1] = 0;
		}

		const primes: number[] = [];
		for (let p = 2; p <= limit; p++) {
			if (sieve[p]) {
				primes.push(p);
				const step = p * p;
				if (step <= limit) {
					for (let j = step; j <= limit; j += p) {
						sieve[j] = 0;
					}
				}
			}
		}

		return primes;
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [min, max, pr] = e.data as [bigint, bigint, number];

			const length = Number(max - min + 1n);
			const result = new Uint8Array(length);
			result.fill(1);

			if (min <= 1n) {
				for (let n = min; n <= (max < 1n ? max : 1n); n++) {
					result[Number(n - min)] = 0;
				}
			}

			const limit = bigintSqrt(max);
			const basePrimes = simpleSieve(Number(limit));
			const totalSteps = BigInt(basePrimes.length) + 1n;
			const prDiv = progressDiv(totalSteps);

			for (let i = 0; i < basePrimes.length; i++) {
				const p = BigInt(basePrimes[i]);
				let start = p * p;
				const from = ((min + p - 1n) / p) * p;
				if (from > start) {
					start = from;
				}

				for (let n = start; n <= max; n += p) {
					result[Number(n - min)] = 0;
				}

				if (pr === 1) {
					progress(BigInt(i + 1), totalSteps, prDiv);
				}
			}

			if (pr === 1) {
				progress(totalSteps, totalSteps, prDiv);
			}

			const count = Array.from(result).reduce(
				(acc, value) => acc + value,
				0,
			);

			postMessage({
				type: "data",
				data: { result, count },
			});
		} catch (err) {
			postMessage(err);
		}
	};
})();
