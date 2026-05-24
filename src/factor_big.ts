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

	function renderFactorRows(
		data: bigint[],
		num: bigint,
		pr: number,
		progressEmitter: (x: bigint, max: bigint, div: bigint) => void,
	): string {
		const tmp: string[] = [];
		const max = BigInt(
			Math.floor(data.length > 2 ? data.length / 2 : data.length),
		);
		const prDiv = pr === 1 ? progressDiv(max) : 0n;

		for (let x = 0n; x < max; x++) {
			tmp.push(`
                    <tr>
                        <td>÷</td>
                        <td>${formatNumber(data[Number(x)])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / BigInt(data[Number(x)]))}</td>
                    </tr>
                `);
			if (pr === 1) {
				progressEmitter(x, max, prDiv);
			}
		}

		return `<tbody>${tmp.join("")}</tbody>`;
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

				const rows = renderFactorRows(data, num, pr, progress);

				result = `<div class="scrollable"><table>${rows}</table></div>`;
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
