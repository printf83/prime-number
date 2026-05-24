import { createNumberProgressEmitter, progressDivNumber } from "./common";
import { formatNumber } from "./utils";

(function () {
	const progress = createNumberProgressEmitter((value) => {
		postMessage({ type: "progress", data: value });
	});

	function renderFactorRows(
		data: number[],
		num: number,
		pr: number,
		progressEmitter: (x: number, max: number, div: number) => void,
	): string {
		const tmp: string[] = [];
		const max = data.length > 2 ? Math.floor(data.length / 2) : data.length;
		const prDiv = pr === 1 ? progressDivNumber(max) : 0;

		for (let x = 0; x < max; x++) {
			tmp.push(`
                    <tr>
                        <td>÷</td>
                        <td>${formatNumber(data[x])}</td>
                        <td>=</td>
                        <td>${formatNumber(num / data[x])}</td>
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
