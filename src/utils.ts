export function formatNumber(num: number | bigint): string {
	if (num === 0 || num) {
		return num.toLocaleString("en-US");
	}

	return `<span class="font-danger">Error!</span>`;
}

export function parseIntInput(value: string): number | null {
	const n = parseInt(value, 10);
	return Number.isNaN(n) ? null : n;
}

export function parseBigIntInput(value: string): bigint | null {
	if (typeof value !== "string" || value.trim() === "") {
		return 0n;
	}

	try {
		return BigInt(value);
	} catch {
		return null;
	}
}

export function formatTime(num: number): string {
	if (num > 1000) {
		num = num / 1000;
		const h = Math.floor(num / 3600);
		const m = Math.floor((num % 3600) / 60);
		const s = Math.floor(num % 3600) % 60;

		const hDisplay = h > 0 ? `${h} hrs` : null;
		const mDisplay = m > 0 ? `${m} min` : null;
		const sDisplay =
			s > -1
				? `${m > 0 ? s : parseFloat(num.toFixed(1)).toLocaleString("en-US")} sec`
				: null;

		const parts = [hDisplay, mDisplay, sDisplay].filter(
			(value): value is string => Boolean(value),
		);

		return formatList(parts);
	}

	return `${parseFloat(num.toFixed(1)).toLocaleString("en-US")} ms`;
}

export function formatList(items: string[]): string {
	return items.join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
}

export function genId(): string {
	const s4 = () => {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	};

	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
