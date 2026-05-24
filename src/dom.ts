import { PerformanceWithMemory } from "./state";
import { formatList, formatTime } from "./utils";

export function runCallback(callback?: () => void): void {
	if (typeof callback === "function") {
		callback();
	}
}

export function setInnerHtml(
	id: string,
	html: string,
	callback?: () => void,
): void {
	const dom = document.getElementById(id);
	if (!dom) {
		return;
	}

	dom.innerHTML = html;
	runCallback(callback);
}

export function genUI(html: string, callback?: () => void): void {
	setInnerHtml("root", html, callback);
}

export function showSinglePrimeOutput(
	html: string,
	callback?: () => void,
): void {
	setInnerHtml("num_result", html, callback);
}

export function genTooltip(target: HTMLElement, html: string): void {
	setInnerHtml("tooltip", html, function () {
		const rect = target.getBoundingClientRect();
		const tooltip_container = document.getElementById("tooltip_container");
		if (tooltip_container) {
			tooltip_container.style.top = `${rect.top + window.scrollY - 5}px`;
			tooltip_container.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
			tooltip_container.style.display = "block";
			tooltip_container.setAttribute("aria-hidden", "false");
		}
	});
}

export function addResizeListener(
	elem: HTMLElement,
	fun: () => void,
): () => void {
	type RequestAnimationFrameWindow = Window & {
		mozRequestAnimationFrame?: typeof window.requestAnimationFrame;
		webkitRequestAnimationFrame?: typeof window.requestAnimationFrame;
		msRequestAnimationFrame?: typeof window.requestAnimationFrame;
		mozCancelAnimationFrame?: typeof window.cancelAnimationFrame;
		webkitCancelAnimationFrame?: typeof window.cancelAnimationFrame;
		msCancelAnimationFrame?: typeof window.cancelAnimationFrame;
	};

	const win = window as RequestAnimationFrameWindow;
	const requestAnimationFrame =
		win.requestAnimationFrame ||
		win.mozRequestAnimationFrame ||
		win.webkitRequestAnimationFrame ||
		win.msRequestAnimationFrame;
	const cancelAnimationFrameFn =
		win.cancelAnimationFrame ||
		win.mozCancelAnimationFrame ||
		win.webkitCancelAnimationFrame ||
		win.msCancelAnimationFrame;
	let cancelled = false;
	let rafId: number | null = null;
	let wid = "";
	let hei = "";

	function cleanup(): void {
		cancelled = true;
		if (rafId !== null && typeof cancelAnimationFrameFn === "function") {
			cancelAnimationFrameFn(rafId);
		}
	}

	function test(): void {
		if (cancelled) {
			return;
		}

		const newStyle = getComputedStyle(elem);
		if (wid !== newStyle.width || hei !== newStyle.height) {
			wid = newStyle.width;
			hei = newStyle.height;
			fun();
			cleanup();
			return;
		}

		rafId = requestAnimationFrame(test);
	}

	if (typeof ResizeObserver !== "undefined") {
		const observer = new ResizeObserver(() => {
			if (cancelled) {
				return;
			}
			fun();
			observer.disconnect();
			cleanup();
		});
		observer.observe(elem);

		return function () {
			cancelled = true;
			observer.disconnect();
			if (
				rafId !== null &&
				typeof cancelAnimationFrameFn === "function"
			) {
				cancelAnimationFrameFn(rafId);
			}
		};
	}

	rafId = requestAnimationFrame(test);

	return cleanup;
}

export function monitorRenderTime(
	target: string,
	outputid1: string,
	outputid2: string,
): void {
	const elem = document.getElementById(target);

	if (elem) {
		const start = window.performance.now();
		const cancel = addResizeListener(elem, function () {
			const duration = window.performance.now() - start;
			const sduration = formatTime(duration);

			setTimeout(function () {
				setInnerHtml(outputid1, `Complete in ${sduration}`);
				setInnerHtml(outputid2, `Complete in ${sduration}`);
			}, 100);
			cancel();
		});
	}
}

export function updateProgress(id: string | null, value: number): void {
	if (!id) {
		return;
	}

	const elem = document.getElementById(id);
	if (elem) {
		elem.style.width = `${value.toFixed(0)}%`;
		const progressContainer = elem.parentElement;
		if (progressContainer) {
			progressContainer.setAttribute("aria-valuenow", value.toFixed(0));
		}
	}
}

export function getRadioValue(name: string): string | null {
	const ele = document.getElementsByName(
		name,
	) as NodeListOf<HTMLInputElement>;

	for (let i = 0; i < ele.length; i++) {
		if (ele[i].checked) {
			return ele[i].value;
		}
	}

	return null;
}

export function getParam(): URLSearchParams {
	return new URLSearchParams(window.location.search);
}

export function secTimer(id: string, d: number): void {
	setTimeout(function () {
		const elem = document.getElementById(id);
		if (elem) {
			d = d ? d : 1;

			const h = Math.floor(d / 3600);
			const m = Math.floor((d % 3600) / 60);
			const s = Math.floor((d % 3600) % 60);

			const hDisplay = h > 0 ? `${h} hrs` : null;
			const mDisplay = m > 0 ? `${m} min` : null;
			const sDisplay = s > 0 ? `${s} sec` : null;

			const text = formatList(
				[hDisplay, mDisplay, sDisplay].filter(
					(value): value is string => Boolean(value),
				),
			);

			elem.innerHTML = `since ${text} ago `;
			secTimer(id, ++d);
		}
	}, 1000);
}

export function getMemory() {
	setTimeout(function () {
		const perf = window.performance as PerformanceWithMemory;
		const t = perf.memory;
		const d = document.getElementById("mem");

		if (d) {
			if (t) {
				d.innerHTML = `
				Memory usage <b>
				${Math.floor((t.usedJSHeapSize / t.totalJSHeapSize) * 100)}% | 
				${Math.floor(t.usedJSHeapSize / 1024 / 1024)}Mb</b>
				`;
			} else {
				d.innerHTML = `Memory usage unavailable`;
			}
		}

		getMemory();
	}, 100);
}
