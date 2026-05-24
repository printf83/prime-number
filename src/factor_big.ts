import { createBigIntProgressEmitter, progressDivBigInt } from "./common";

(function () {
	const progress = createBigIntProgressEmitter((value) => {
		postMessage({ type: "progress", data: value });
	});

	function progressDiv(max: bigint, div = 100n): bigint {
		return progressDivBigInt(max, div);
	}

	function formatNumber(num: bigint): string {
		if (num === 0n || num) {
			return num.toLocaleString("en-US");
		}

		return `<span class="font-danger">Error!</span>`;
	}

	self.onmessage = function (e: MessageEvent<unknown>): void {
		try {
			const [data, num, os, pr] = e.data as [
				bigint[],
				bigint,
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
				const max = BigInt(
					Math.floor(data.length > 2 ? data.length / 2 : data.length),
				);

				if (pr === 1) {
					const prDiv = progressDiv(max);

					for (let x = 0n; x < max; x++) {
						tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[Number(x)])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / BigInt(data[Number(x)]))}</td>
                    </tr>
                `);
						progress(x, max, prDiv);
					}
				} else {
					for (let x = 0n; x < max; x++) {
						tmp.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${formatNumber(data[Number(x)])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / BigInt(data[Number(x)]))}</td>
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
