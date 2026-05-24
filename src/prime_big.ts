import {
	createBigIntProgressEmitter,
	isProbablyPrime,
	progressDivBigInt,
	simpleSieve,
} from "./common";

(function () {
	let count = 0;
	const progress = createBigIntProgressEmitter((value) => {
		postMessage({
			type: "progress",
			data: { progress: Number(value), count },
		});
	});

	function progressDiv(max: bigint, div = 100n): bigint {
		return progressDivBigInt(max, div);
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

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [min, max, pr] = e.data as [bigint, bigint, number];

			const rangeSize = max - min + 1n;
			const chunkSize = 1000000n;
			const maxFullResults = 2000000n;
			const returnFullResults = rangeSize <= maxFullResults;
			const smallRangeThreshold = 1000n;
			if (rangeSize <= smallRangeThreshold) {
				count = 0;
				const result = returnFullResults
					? new Uint8Array(Number(rangeSize))
					: new Uint8Array(0);
				if (returnFullResults) {
					result.fill(0);
				}

				const prDiv = progressDiv(rangeSize);
				for (let i = 0n; i < rangeSize; i += 1n) {
					const n = min + i;
					if (n > 1n && isProbablyPrime(n)) {
						count += 1;
						if (returnFullResults) {
							result[Number(i)] = 1;
						}
					}
					if (pr === 1) {
						progress(i + 1n, rangeSize, prDiv);
					}
				}

				if (pr === 1) {
					progress(rangeSize, rangeSize, prDiv);
				}

				postMessage({
					type: "data",
					data: { result, count, countOnly: !returnFullResults },
				});
				return;
			}
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

			count = 0;
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
