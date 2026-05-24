import {
	createBigIntProgressEmitter,
	isProbablyPrime,
	progressDivBigInt,
} from "./common";

(function () {
	const progress = createBigIntProgressEmitter((value) => {
		postMessage({ type: "progress", data: value });
	});

	function progressDiv(max: bigint, div = 100n): bigint {
		return progressDivBigInt(max, div);
	}

	function getSqrt(value: bigint): bigint {
		if (value < 2n) {
			return value;
		}

		if (value < 16n) {
			return BigInt(Math.floor(Math.sqrt(Number(value))));
		}

		let x1: bigint;
		if (value < 1n << 52n) {
			x1 = BigInt(Math.floor(Math.sqrt(Number(value)))) - 3n;
		} else {
			x1 = (1n << 52n) - 2n;
		}

		let x0 = -1n;
		while (x0 !== x1 && x0 !== x1 - 1n) {
			x0 = x1;
			x1 = (value / x0 + x0) >> 1n;
		}
		return x0;
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [num, pr] = e.data as [bigint, number];

			if (isProbablyPrime(num)) {
				postMessage({ type: "data", data: [1n, num] });
			} else {
				const result: bigint[] = [1n];
				const max = getSqrt(num);
				const min = 2n;

				if (pr === 1) {
					const prDiv = progressDiv(max);

					for (let x = min; x <= max; x += 1n) {
						if (num % x === 0n) {
							result.push(x);
							result.push(num / x);
						}
						progress(x, max, prDiv);
					}
				} else {
					for (let x = min; x <= max; x += 1n) {
						if (num % x === 0n) {
							result.push(x);
							result.push(num / x);
						}
					}
				}

				result.push(num);
				const uniqueResult = Array.from(new Set(result));
				uniqueResult.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

				postMessage({ type: "data", data: uniqueResult });
			}
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
