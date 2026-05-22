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
			const [min, max, pr] = e.data as [number, number, number];

			const length = max - min + 1;
			const result = new Array(length).fill(0);

			if (pr === 1) {
				const prDiv = progressDiv(length);

				for (let x = min; x <= max; x++) {
					if (isPrime(x)) {
						result[x - min] = 1;
					}
					progress(x - min + 1, length, prDiv);
				}

				progress(length, length, prDiv);
			} else {
				for (let x = min; x <= max; x++) {
					if (isPrime(x)) {
						result[x - min] = 1;
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
