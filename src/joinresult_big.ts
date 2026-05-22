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

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [data, min, , col, os, pr] = e.data as [
				number[],
				bigint,
				bigint,
				bigint,
				number,
				number,
			];

			const max = BigInt(data.length);
			const tmp: string[] = [];
			let result: string | null = null;

			const prDiv = progressDiv(max);

			if (os === 0) {
				let row: string[] = [];

				if (pr === 1) {
					for (let x = 0n; x < max; x++) {
						row.push(
							data[Number(x)] === 1
								? `<i>${x + min}</i>`
								: `<b>${x + min}</b>`,
						);

						if ((x + 1n) % col === 0n) {
							tmp.push(row.join(""));
							row = [];
						}

						progress(x, max, prDiv);
					}
				} else {
					for (let x = 0n; x < max; x++) {
						row.push(
							data[Number(x)] === 1
								? `<i>${x + min}</i>`
								: `<b>${x + min}</b>`,
						);

						if ((x + 1n) % col === 0n) {
							tmp.push(row.join(""));
							row = [];
						}
					}
				}

				if (row.length > 0) {
					tmp.push(row.join(""));
				}

				result = `<div class="d-flex">${tmp.join(`</div><div class="d-flex">`)}</div>`;
			} else {
				if (pr === 1) {
					for (let x = 0n; x < max; x++) {
						if (data[Number(x)] === 1) {
							tmp.push(String(x + min));
						}
						progress(x, max, prDiv);
					}
				} else {
					for (let x = 0n; x < max; x++) {
						if (data[Number(x)] === 1) {
							tmp.push(String(x + min));
						}
					}
				}

				result = `<small>${tmp.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}</small>`;
			}

			postMessage({ type: "data", data: result });
		} catch (err) {
			postMessage(err);
		}
	};
})();
