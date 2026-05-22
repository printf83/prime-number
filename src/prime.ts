(function () {
	let lastProgress = 0;

	function progress(x: number, max: number, div: number): void {
		if (x % div === 0) {
			const curProgress = Math.floor((x / max) * 100);
			if (lastProgress !== curProgress) {
				lastProgress = curProgress;
				postMessage({ type: "progress", data: curProgress });
			}
		}
	}

	function progressDiv(max: number, div = 100): number {
		return max > div ? Math.floor(max / div) : div;
	}

	function simpleSieve(limit: number): number[] {
		const sieve = new Uint8Array(limit + 1);
		sieve.fill(1);
		if (limit >= 0) sieve[0] = 0;
		if (limit >= 1) sieve[1] = 0;

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
			const [min, max, pr] = e.data as [number, number, number];

			const length = max - min + 1;
			const result = new Uint8Array(length);
			result.fill(1);

			if (min <= 1) {
				for (let n = min; n <= Math.min(max, 1); n++) {
					result[n - min] = 0;
				}
			}

			const limit = Math.floor(Math.sqrt(max));
			const basePrimes = simpleSieve(limit);
			const totalSteps = basePrimes.length + 1;
			const prDiv = progressDiv(totalSteps);

			for (let i = 0; i < basePrimes.length; i++) {
				const p = basePrimes[i];
				let start = Math.max(p * p, Math.ceil(min / p) * p);
				if (start < min) {
					start += p;
				}

				for (let n = start; n <= max; n += p) {
					result[n - min] = 0;
				}

				if (pr === 1) {
					progress(i + 1, totalSteps, prDiv);
				}
			}

			if (pr === 1) {
				progress(totalSteps, totalSteps, prDiv);
			}

			const count = result.reduce((acc, value) => acc + value, 0);

			postMessage({
				type: "data",
				data: { result, count },
			});
		} catch (err) {
			postMessage(err);
		}
	};
})();
