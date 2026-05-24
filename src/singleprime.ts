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

	function isPrime(num: number): boolean {
		if (num === 2 || num === 3) return true;
		if (num <= 1 || num % 2 === 0 || num % 3 === 0) return false;
		for (let i = 5; i * i <= num; i += 6) {
			if (num % i === 0 || num % (i + 2) === 0) return false;
		}
		return true;
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [num, pr] = e.data as [number, number];

			if (isPrime(num)) {
				postMessage({ type: "data", data: [1, num] });
			} else {
				const result: number[] = [1];
				const max = Math.sqrt(num);
				const min = 2;

				if (pr === 1) {
					const prDiv = progressDiv(max);

					for (let x = min; x <= max; x++) {
						if (num % x === 0) {
							result.push(x);
							result.push(num / x);
						}
						progress(x, max, prDiv);
					}
				} else {
					for (let x = min; x <= max; x++) {
						if (num % x === 0) {
							result.push(x);
							result.push(num / x);
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
