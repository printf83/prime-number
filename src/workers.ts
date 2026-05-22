import { state } from "./state";

export type WorkerMessage =
	| { type: "progress"; data: number }
	| { type: "data"; data: unknown };

let wk: Worker | null = null;

export function runWorker(
	script: string,
	params: unknown[],
	callback: (e: unknown) => void,
	onerror?: (e: string) => void,
	onprogress?: (e: number) => void,
): void {
	stopWorker();

	wk = new Worker(`dist/${script}${state.big ? `_big` : ""}.js`);
	wk.postMessage(params);
	wk.onmessage = function (e: MessageEvent<WorkerMessage>) {
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
