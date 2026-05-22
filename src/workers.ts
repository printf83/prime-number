import { state } from "./state";
import PrimeWorker from "./prime.ts?worker";
import PrimeWorkerBig from "./prime_big.ts?worker";
import SinglePrimeWorker from "./singleprime.ts?worker";
import SinglePrimeWorkerBig from "./singleprime_big.ts?worker";
import FactorWorker from "./factor.ts?worker";
import FactorWorkerBig from "./factor_big.ts?worker";
import JoinResultWorker from "./joinresult.ts?worker";
import JoinResultWorkerBig from "./joinresult_big.ts?worker";

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

const workerConstructors = {
	prime: PrimeWorker,
	prime_big: PrimeWorkerBig,
	singleprime: SinglePrimeWorker,
	singleprime_big: SinglePrimeWorkerBig,
	factor: FactorWorker,
	factor_big: FactorWorkerBig,
	joinresult: JoinResultWorker,
	joinresult_big: JoinResultWorkerBig,
} as const;

type WorkerConstructorKey = keyof typeof workerConstructors;

let wk: Worker | null = null;

export function runWorker<T extends WorkerScript>(
	script: T,
	params: WorkerParamsMap[T],
	callback: (data: WorkerResultMap[T]) => void,
	onerror?: (e: string) => void,
	onprogress?: (e: number) => void,
): void {
	stopWorker();

	const workerKey =
		`${script}${state.big ? `_big` : ""}` as WorkerConstructorKey;
	const WorkerConstructor = workerConstructors[workerKey];

	const worker = new WorkerConstructor();
	wk = worker;
	worker.postMessage(params);
	worker.onmessage = function (
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
