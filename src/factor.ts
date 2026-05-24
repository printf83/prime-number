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

	function formatNumber(num: number): string {
		if (num === 0 || num) {
			return num.toLocaleString("en-US");
		}

		return `<span class="font-danger">Error!</span>`;
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [data, num, os, pr] = e.data as [
				number[],
				number,
				number,
				number,
			];

			let result: string | null = null;
			if (os === 0) {
				result = data
					.join(", ")
					.replace(/, ((?:.(?!, ))+)$/, " and $1");
			} else {
				const tmp: string[] = [];
				const max =
					data.length > 2 ? Math.floor(data.length / 2) : data.length;

				if (pr === 1) {
					const prDiv = progressDiv(max);

					for (let x = 0; x < max; x++) {
						tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[x])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / data[x])}</td>
                    </tr>
                `);
						progress(x, max, prDiv);
					}
				} else {
					for (let x = 0; x < max; x++) {
						tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[x])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / data[x])}</td>
                    </tr>
                `);
					}
				}

				result = `<div class="scrollable"><table>${tmp.join("")}</table></div>`;
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
