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
		(number | bigint)[] | Uint8Array,
		number | bigint,
		number | bigint,
		number | bigint,
		number,
		number,
	];
}

export interface WorkerResultMap {
	prime: {
		result: (number | bigint)[] | Uint8Array;
		count: number;
		resultTooHuge?: boolean;
	};
	singleprime: (number | bigint)[];
	factor: (number | bigint)[];
	joinresult: string;
}

export type WorkerProgressData =
	| number
	| {
			progress: number;
			count?: number;
			prime?: boolean;
			factors?: (number | bigint)[];
	  };

export type WorkerMessage<T> =
	| {
			type: "progress";
			data:
				| number
				| {
						progress: number;
						count?: number;
						prime?: boolean;
						factors?: (number | bigint)[];
				  };
	  }
	| { type: "data"; data: T }
	| { type: "error"; error: string };

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

export type WorkerJob = {
	[K in WorkerScript]: {
		script: K;
		params: WorkerParamsMap[K];
	};
}[WorkerScript];

let wk: Worker | null = null;
let currentWorkerJob: WorkerJob | null = null;

function areParamsEqual(
	a: readonly unknown[] | Uint8Array,
	b: readonly unknown[] | Uint8Array,
): boolean {
	if (a === b) {
		return true;
	}

	if (a.length !== b.length) {
		return false;
	}

	for (let index = 0; index < a.length; index += 1) {
		const aValue = a[index];
		const bValue = b[index];

		if (aValue === bValue) {
			continue;
		}

		if (
			Array.isArray(aValue) &&
			Array.isArray(bValue) &&
			areParamsEqual(aValue, bValue)
		) {
			continue;
		}

		if (
			aValue instanceof Uint8Array &&
			bValue instanceof Uint8Array &&
			areParamsEqual(aValue, bValue)
		) {
			continue;
		}

		if (!Object.is(aValue, bValue)) {
			return false;
		}
	}

	return true;
}

export function getCurrentWorkerJob(): WorkerJob | null {
	return currentWorkerJob;
}

export function isCurrentWorkerJob<T extends WorkerScript>(
	script: T,
	params: WorkerParamsMap[T],
): boolean {
	return (
		currentWorkerJob !== null &&
		currentWorkerJob.script === script &&
		areParamsEqual(
			currentWorkerJob.params as readonly unknown[],
			params as readonly unknown[],
		)
	);
}

export function stopWorkerIfCurrentJob<T extends WorkerScript>(
	script: T,
	params: WorkerParamsMap[T],
): boolean {
	if (isCurrentWorkerJob(script, params)) {
		stopWorker();
		return true;
	}
	return false;
}

export function runWorker<T extends WorkerScript>(
	script: T,
	params: WorkerParamsMap[T],
	callback: (data: WorkerResultMap[T]) => void,
	onerror?: (e: string) => void,
	onprogress?: (e: WorkerProgressData) => void,
): void {
	stopWorker();

	const workerKey =
		`${script}${state.big ? `_big` : ""}` as WorkerConstructorKey;
	const WorkerConstructor = workerConstructors[workerKey];

	const worker = new WorkerConstructor();
	wk = worker;
	currentWorkerJob = { script, params } as WorkerJob;
	worker.postMessage(params);
	worker.onmessage = function (
		e: MessageEvent<WorkerMessage<WorkerResultMap[T]>>,
	): void {
		switch (e.data.type) {
			case "progress":
				if (typeof onprogress === "function") {
					onprogress(e.data.data);
				}
				break;
			case "data":
				if (typeof callback === "function") {
					callback(e.data.data);
				}
				break;
			case "error":
				if (typeof onerror === "function") {
					onerror(e.data.error);
				}
				break;
		}
	};

	worker.onmessageerror = function (): void {
		if (typeof onerror === "function") {
			onerror("Worker message could not be deserialized.");
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
	currentWorkerJob = null;
}
