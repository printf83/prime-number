import {
	createNumberProgressEmitter,
	isProbablyPrime,
	progressDivNumber,
} from "./common";

(function () {
	const progress = createNumberProgressEmitter((value) => {
		postMessage({ type: "progress", data: value });
	});

	function progressDiv(max: number, div = 100): number {
		return progressDivNumber(max, div);
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [num, pr] = e.data as [number, number];

			if (isProbablyPrime(BigInt(num))) {
				postMessage({
					type: "progress",
					data: { progress: 100, prime: true },
				});
				postMessage({ type: "data", data: [1, num] });
			} else {
				postMessage({
					type: "progress",
					data: { progress: 0, prime: false, factors: [1] },
				});
				const result: number[] = [1];
				const max = Math.sqrt(num);
				const min = 2;

				if (pr === 1) {
					const prDiv = progressDiv(max);

					for (let x = min; x <= max; x++) {
						if (num % x === 0) {
							const pair = [x, num / x];
							result.push(...pair);
							postMessage({
								type: "progress",
								data: {
									progress: Math.floor((x / max) * 100),
									prime: false,
									factors: pair,
								},
							});
						}
						progress(x, max, prDiv);
					}
				} else {
					for (let x = min; x <= max; x++) {
						if (num % x === 0) {
							const pair = [x, num / x];
							result.push(...pair);
							postMessage({
								type: "progress",
								data: {
									progress: 0,
									prime: false,
									factors: pair,
								},
							});
						}
					}
				}

				result.push(num);
				const uniqueResult = Array.from(new Set(result));
				uniqueResult.sort((a, b) => a - b);

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
