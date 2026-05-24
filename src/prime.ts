import {
	createNumberProgressEmitter,
	progressDivNumber,
	simpleSieve,
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
			const [min, max, pr] = e.data as [number, number, number];

			const rangeSize = max - min + 1;
			const chunkSize = 1000000;
			const maxFullResults = 2000000;
			const returnFullResults = rangeSize <= maxFullResults;

			const limit = Math.floor(Math.sqrt(max));
			const basePrimes = simpleSieve(limit);
			const totalChunks = Math.floor(
				(rangeSize + chunkSize - 1) / chunkSize,
			);
			const prDiv = progressDiv(totalChunks);

			let count = 0;
			const result = returnFullResults
				? new Uint8Array(rangeSize)
				: new Uint8Array(0);
			if (returnFullResults) {
				result.fill(1);
			}

			let chunkIndex = 0;
			for (
				let chunkStart = min;
				chunkStart <= max;
				chunkStart += chunkSize, chunkIndex += 1
			) {
				const chunkEnd = Math.min(max, chunkStart + chunkSize - 1);
				const chunkLength = chunkEnd - chunkStart + 1;
				const chunk = new Uint8Array(chunkLength);
				chunk.fill(1);

				if (chunkStart <= 1) {
					const stop = Math.min(chunkEnd, 1);
					for (let n = chunkStart; n <= stop; n++) {
						chunk[n - chunkStart] = 0;
					}
				}

				for (let i = 0; i < basePrimes.length; i++) {
					const p = basePrimes[i];
					let start = p * p;
					const from = Math.ceil(chunkStart / p) * p;
					if (from > start) {
						start = from;
					}
					if (start < chunkStart) {
						start += p;
					}

					for (let n = start; n <= chunkEnd; n += p) {
						chunk[n - chunkStart] = 0;
					}
				}

				for (let i = 0; i < chunkLength; i++) {
					count += chunk[i];
				}

				if (returnFullResults) {
					result.set(chunk, chunkStart - min);
				}

				if (pr === 1) {
					progress(chunkIndex + 1, totalChunks, prDiv);
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
