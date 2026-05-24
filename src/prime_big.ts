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
		if (limit >= 2) {
			primes.push(2);
		}

		const maxP = Math.floor(Math.sqrt(limit));
		for (let p = 3; p <= limit; p += 2) {
			if (sieve[p]) {
				primes.push(p);
				if (p <= maxP) {
					const step = p * p;
					for (let j = step; j <= limit; j += 2 * p) {
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

			const rangeSize = max - min + 1n;
			const chunkSize = 1000000n;
			const maxFullResults = 2000000n;
			const returnFullResults = rangeSize <= maxFullResults;

			const limit = bigintSqrt(max);
			if (limit > BigInt(Number.MAX_SAFE_INTEGER)) {
				throw new Error("Range too large to compute base primes");
			}

			const limitNumber = Number(limit);
			if (!Number.isSafeInteger(limitNumber) || limitNumber > 20000000) {
				throw new Error("Range is too large to compute in the browser");
			}

			const basePrimes = simpleSieve(limitNumber);
			const totalChunks = (rangeSize + chunkSize - 1n) / chunkSize;
			const prDiv = progressDiv(totalChunks);

			let count = 0;
			const result = returnFullResults
				? new Uint8Array(Number(rangeSize))
				: new Uint8Array(0);
			if (returnFullResults) {
				result.fill(1);
			}

			let chunkIndex = 0n;
			for (
				let chunkStart = min;
				chunkStart <= max;
				chunkStart += chunkSize, chunkIndex += 1n
			) {
				const chunkEnd =
					max < chunkStart + chunkSize - 1n
						? max
						: chunkStart + chunkSize - 1n;
				const chunkLength = Number(chunkEnd - chunkStart + 1n);
				const chunk = new Uint8Array(chunkLength);
				chunk.fill(1);

				if (chunkStart <= 1n) {
					const stop = chunkEnd < 1n ? chunkEnd : 1n;
					for (let n = chunkStart; n <= stop; n++) {
						chunk[Number(n - chunkStart)] = 0;
					}
				}

				for (let i = 0; i < basePrimes.length; i++) {
					const p = BigInt(basePrimes[i]);
					let start = p * p;
					const from = ((chunkStart + p - 1n) / p) * p;
					if (from > start) {
						start = from;
					}
					if (start < chunkStart) {
						start += p;
					}

					for (let n = start; n <= chunkEnd; n += p) {
						chunk[Number(n - chunkStart)] = 0;
					}
				}

				for (let i = 0; i < chunkLength; i++) {
					count += chunk[i];
				}

				if (returnFullResults) {
					result.set(chunk, Number(chunkStart - min));
				}

				if (pr === 1) {
					progress(chunkIndex + 1n, totalChunks, prDiv);
				}
			}

			if (pr === 1) {
				progress(totalChunks, totalChunks, prDiv);
			}

			postMessage({
				type: "data",
				data: { result, count, countOnly: !returnFullResults },
			});
		} catch (err) {
			postMessage({
				type: "error",
				error: String(
					err && typeof err === "object" && "message" in err
						? (err as Error).message
						: err,
				),
			});
		}
	};
})();
