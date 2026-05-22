import { state } from "./state";

export type WorkerScript = "prime" | "singleprime" | "factor" | "joinresult";

export interface WorkerParamsMap {
	prime: [number | bigint, number | bigint, number];
	singleprime: [number | bigint, number];
	factor: [(number | bigint)[], number | bigint, number, number];
	joinresult: [
		(number | bigint)[],
		number | bigint,
		number | bigint,
		number | bigint,
		number,
		number,
	];
}

export interface WorkerResultMap {
	prime: { result: (number | bigint)[]; count: number };
	singleprime: (number | bigint)[];
	factor: (number | bigint)[];
	joinresult: string;
}

export type WorkerMessage<T> =
	| { type: "progress"; data: number }
	| { type: "data"; data: T };

const workerUrls = {
	prime: new URL("./prime.ts", import.meta.url),
	prime_big: new URL("./prime_big.ts", import.meta.url),
	singleprime: new URL("./singleprime.ts", import.meta.url),
	singleprime_big: new URL("./singleprime_big.ts", import.meta.url),
	factor: new URL("./factor.ts", import.meta.url),
	factor_big: new URL("./factor_big.ts", import.meta.url),
	joinresult: new URL("./joinresult.ts", import.meta.url),
	joinresult_big: new URL("./joinresult_big.ts", import.meta.url),
} as const;

type WorkerUrlKey = keyof typeof workerUrls;

let wk: Worker | null = null;

export function runWorker<T extends WorkerScript>(
	script: T,
	params: WorkerParamsMap[T],
	callback: (data: WorkerResultMap[T]) => void,
	onerror?: (e: string) => void,
	onprogress?: (e: number) => void,
): void {
	stopWorker();

	const workerKey = `${script}${state.big ? `_big` : ""}` as WorkerUrlKey;
	const workerUrl = workerUrls[workerKey];

	wk = new Worker(workerUrl, { type: "module" });
	wk.postMessage(params);
	wk.onmessage = function (
		e: MessageEvent<WorkerMessage<WorkerResultMap[T]>>,
	): void {
		if (e.data.type === "progress") {
			if (typeof onprogress === "function") {
				onprogress(e.data.data);
			}
		} else {
			if (typeof callback === "function") {
				callback(e.data.data);
			}
		}
	};
	wk.onerror = function (e) {
		if (typeof onerror === "function") {
			onerror(e.message);
		}
	};
}

export function stopWorker() {
	if (wk !== null) {
		wk.terminate();
		wk = null;
	}
}
