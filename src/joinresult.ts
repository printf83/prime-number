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

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [data, min, , col, os, pr] = e.data as [
				number[] | Uint8Array,
				number,
				number,
				number,
				number,
				number,
			];

			const max = data.length;
			const tmp: string[] = [];
			let result: string | null = null;

			const prDiv = progressDiv(max);

			if (os === 0) {
				let row: string[] = [];

				if (pr === 1) {
					for (let x = 0; x < max; x++) {
						row.push(
							data[x] === 1
								? `<i>${x + min}</i>`
								: `<b>${x + min}</b>`,
						);

						if ((x + 1) % col === 0) {
							tmp.push(row.join(""));
							row = [];
						}

						progress(x, max, prDiv);
					}
				} else {
					for (let x = 0; x < max; x++) {
						row.push(
							data[x] === 1
								? `<i>${x + min}</i>`
								: `<b>${x + min}</b>`,
						);

						if ((x + 1) % col === 0) {
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
					for (let x = 0; x < max; x++) {
						if (data[x] === 1) {
							tmp.push(String(x + min));
						}

						progress(x, max, prDiv);
					}
				} else {
					for (let x = 0; x < max; x++) {
						if (data[x] === 1) {
							tmp.push(String(x + min));
						}
					}
				}

				result = `<small>${tmp.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}</small>`;
			}

			postMessage({ type: "data", data: result });
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
