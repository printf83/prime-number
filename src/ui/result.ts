import { state } from "../state";
import { formatNumber } from "../utils";
import { genUI } from "../dom";
import { attachShowRangePrimeEvents } from "./events";
import {
	attachLongPressAction,
	attachPagingThumbDrag,
	attachWheelPageChange,
} from "./resultPaging";
import {
	rangePrimeResultHtml,
	resultItemHtml,
	resultRowHtml,
} from "./builders";

interface ResultCallbacks {
	showStart: () => void;
	showRangePrimeOutput: () => void;
	showTooltip: (e: Event) => void;
	onBigIntModeChange: (val: string | number) => void;
}

const ROW_HEIGHT = 25;
let currentResultResizeHandler: EventListenerOrEventListenerObject | null =
	null;
let currentResultCleanupHandlers: Array<() => void> = [];
const primeIndexCache: number[] = [];
let primeSearchIndex = 0;

export function cleanupResultResizeListener(): void {
	if (currentResultResizeHandler !== null) {
		window.removeEventListener("resize", currentResultResizeHandler);
		currentResultResizeHandler = null;
	}
	primeIndexCache.length = 0;
	primeSearchIndex = 0;
}

export function cleanupResultUI(): void {
	currentResultCleanupHandlers.forEach((cleanup) => cleanup());
	currentResultCleanupHandlers.length = 0;
	cleanupResultResizeListener();
}

export function showRangePrimeOutputImpl(callbacks: ResultCallbacks): void {
	const { showStart, showRangePrimeOutput, showTooltip, onBigIntModeChange } =
		callbacks;
	cleanupResultUI();
	const container = document.getElementById("container");
	if (container) {
		container.classList.add("result");
	}
	const resultArray = state.result as number[] | Uint8Array;
	primeIndexCache.length = 0;
	primeSearchIndex = 0;
	const showPrimeOnly = state.showPrimeOnly;
	const visibleCount = showPrimeOnly ? state.primeFound : resultArray.length;
	const col = Math.max(
		1,
		state.big
			? Number(state.columns as bigint)
			: Number(state.columns as number),
	);
	const bigMode = state.big !== 0;
	const minValue = state.min;
	const minValueNumber = bigMode ? 0 : (minValue as number);
	const minValueBigInt = bigMode ? (minValue as bigint) : 0n;
	const resultLength = resultArray.length;
	const primeCount = state.primeFound;

	function ensurePrimeCount(count: number): void {
		const requestedCount = Math.min(count, primeCount);
		if (primeIndexCache.length >= requestedCount) {
			return;
		}

		while (
			primeIndexCache.length < requestedCount &&
			primeSearchIndex < resultLength
		) {
			if (resultArray[primeSearchIndex] === 1) {
				primeIndexCache.push(primeSearchIndex);
			}
			primeSearchIndex += 1;
		}
	}

	const totalRows = showPrimeOnly
		? Math.ceil(primeCount / col)
		: Math.ceil(resultLength / col);

	genUI(rangePrimeResultHtml(visibleCount), function () {
		const cleanupRangePrimeEvents = attachShowRangePrimeEvents({
			showStart,
			showRangePrimeOutput: showRangePrimeOutput,
			showTooltip,
			onBigIntModeChange,
		});
		currentResultCleanupHandlers.push(cleanupRangePrimeEvents);
		const viewport = document.querySelector(
			".result-viewport",
		) as HTMLElement | null;
		const inner = document.querySelector(
			".result-inner",
		) as HTMLElement | null;
		const pageLabel = document.getElementById(
			"paging_label",
		) as HTMLElement | null;

		if (!viewport || !inner) {
			return;
		}

		function getValue(index: number): number | bigint {
			return bigMode
				? minValueBigInt + BigInt(index)
				: minValueNumber + index;
		}

		function renderRow(row: number): string {
			const start = row * col;
			const rowEnd = start + col;
			const items: string[] = [];

			if (showPrimeOnly) {
				const end = Math.min(primeCount, rowEnd);

				for (let index = start; index < end; index++) {
					items.push(
						resultItemHtml(getValue(primeIndexCache[index]), true),
					);
				}
			} else {
				for (
					let index = start;
					index < Math.min(resultLength, start + col);
					index++
				) {
					items.push(
						resultItemHtml(
							getValue(index),
							resultArray[index] === 1,
						),
					);
				}
			}

			return resultRowHtml(items);
		}

		const content = document.createElement("div");
		content.className = "result-content";
		inner.appendChild(content);

		function getViewportContentHeight(): number {
			const viewportStyle = getComputedStyle(viewport!);
			return (
				viewport!.clientHeight -
				parseFloat(viewportStyle.paddingTop) -
				parseFloat(viewportStyle.paddingBottom)
			);
		}

		let rowsPerPage = 1;
		let pageCount = 1;
		let currentPage = 0;

		function updatePageMetrics(): void {
			const viewportContentHeight = getViewportContentHeight();
			rowsPerPage = Math.max(
				1,
				Math.floor(viewportContentHeight / ROW_HEIGHT),
			);
			pageCount = Math.max(1, Math.ceil(totalRows / rowsPerPage));
			if (currentPage >= pageCount) {
				currentPage = pageCount - 1;
			}
		}

		function updatePageLabel(): void {
			if (pageLabel) {
				pageLabel.textContent = `Page ${formatNumber(currentPage + 1)} of ${formatNumber(pageCount)}`;
			}
		}

		function render(): void {
			const firstRow = currentPage * rowsPerPage;
			const lastRow = Math.min(totalRows, firstRow + rowsPerPage);

			if (showPrimeOnly) {
				const requiredPrimes = Math.min(primeCount, lastRow * col);
				ensurePrimeCount(requiredPrimes);
			}

			let html = "";
			for (let row = firstRow; row < lastRow; row++) {
				html += renderRow(row);
			}

			content.innerHTML = html;
			updatePageLabel();
		}

		let resizePending = false;
		function onResize(): void {
			if (resizePending) {
				return;
			}
			resizePending = true;
			window.requestAnimationFrame(() => {
				resizePending = false;
				updatePageMetrics();
				render();
				updateScrollButtons();
			});
		}

		updatePageMetrics();
		cleanupResultResizeListener();
		window.addEventListener("resize", onResize);
		currentResultResizeHandler = onResize;
		const btnScrollFirstElement = document.getElementById(
			"btn-scroll-first",
		) as HTMLButtonElement | null;
		const btnScrollPrev10Element = document.getElementById(
			"btn-scroll-prev10",
		) as HTMLButtonElement | null;
		const btnScrollPrevElement = document.getElementById(
			"btn-scroll-prev",
		) as HTMLButtonElement | null;
		const btnScrollPrevPageElement = document.getElementById(
			"btn-scroll-prev-page",
		) as HTMLButtonElement | null;
		const btnScrollNextElement = document.getElementById(
			"btn-scroll-next",
		) as HTMLButtonElement | null;
		const btnScrollNextPageElement = document.getElementById(
			"btn-scroll-next-page",
		) as HTMLButtonElement | null;
		const btnScrollNext10Element = document.getElementById(
			"btn-scroll-next10",
		) as HTMLButtonElement | null;
		const btnScrollLastElement = document.getElementById(
			"btn-scroll-last",
		) as HTMLButtonElement | null;
		const pagingThumb = document.getElementById(
			"paging_thumb",
		) as HTMLElement | null;
		const pagingTrack = document.querySelector(
			".paging-track",
		) as HTMLElement | null;
		const resultContainer = document.querySelector(
			".result_container",
		) as HTMLElement | null;

		currentResultCleanupHandlers = [];

		function addResultListener(
			target: EventTarget,
			type: string,
			listener: EventListener,
			options?: boolean | AddEventListenerOptions,
		): void {
			target.addEventListener(type, listener, options);
			currentResultCleanupHandlers.push(() => {
				target.removeEventListener(type, listener, options);
			});
		}

		function updatePagingThumb(): void {
			if (!pagingThumb) {
				return;
			}

			const sizePercent = Math.max(100 / pageCount, 5);
			const topPercent =
				pageCount > 1
					? (currentPage / (pageCount - 1)) * (100 - sizePercent)
					: 0;

			pagingThumb.style.height = `${sizePercent}%`;
			pagingThumb.style.top = `${topPercent}%`;
		}

		function goToPageByTrack(offsetY: number): void {
			if (!pagingTrack) {
				return;
			}
			const rect = pagingTrack.getBoundingClientRect();
			const position = Math.min(
				Math.max(0, offsetY - rect.top),
				rect.height,
			);
			const ratio = rect.height > 0 ? position / rect.height : 0;
			const page = Math.round(ratio * (pageCount - 1));
			goToPage(page);
		}

		function goToPage(page: number): void {
			currentPage = Math.max(0, Math.min(pageCount - 1, page));
			render();
			updateScrollButtons();
		}

		function updateScrollButtons(): void {
			const atFirst = currentPage <= 0;
			const atLast = currentPage >= pageCount - 1;

			if (btnScrollFirstElement) {
				btnScrollFirstElement.disabled = atFirst;
			}
			if (btnScrollPrev10Element) {
				btnScrollPrev10Element.disabled = atFirst;
			}
			if (btnScrollPrevPageElement) {
				btnScrollPrevPageElement.disabled = atFirst;
			}
			if (btnScrollPrevElement) {
				btnScrollPrevElement.disabled = atFirst;
			}
			if (btnScrollNextElement) {
				btnScrollNextElement.disabled = atLast;
			}
			if (btnScrollNextPageElement) {
				btnScrollNextPageElement.disabled = atLast;
			}
			if (btnScrollNext10Element) {
				btnScrollNext10Element.disabled = atLast;
			}
			if (btnScrollLastElement) {
				btnScrollLastElement.disabled = atLast;
			}
			updatePagingThumb();
		}

		if (btnScrollFirstElement) {
			addResultListener(btnScrollFirstElement, "click", () =>
				goToPage(0),
			);
		}

		if (btnScrollLastElement) {
			addResultListener(btnScrollLastElement, "click", () =>
				goToPage(pageCount - 1),
			);
		}

		if (btnScrollPrev10Element) {
			addResultListener(btnScrollPrev10Element, "click", () =>
				goToPage(currentPage - 10),
			);
		}

		if (btnScrollNext10Element) {
			addResultListener(btnScrollNext10Element, "click", () =>
				goToPage(currentPage + 10),
			);
		}

		if (btnScrollPrevPageElement) {
			addResultListener(btnScrollPrevPageElement, "click", () =>
				goToPage(currentPage - 1),
			);
		}

		if (btnScrollPrevElement) {
			addResultListener(btnScrollPrevElement, "click", () =>
				goToPage(currentPage - 1),
			);
		}

		if (btnScrollNextPageElement) {
			addResultListener(btnScrollNextPageElement, "click", () =>
				goToPage(currentPage + 1),
			);
		}

		if (btnScrollNextElement) {
			addResultListener(btnScrollNextElement, "click", () =>
				goToPage(currentPage + 1),
			);
		}

		if (pagingTrack) {
			const onTrackClick: EventListener = (event) => {
				const trackEvent = event as MouseEvent | TouchEvent;
				const clientY =
					trackEvent instanceof MouseEvent
						? trackEvent.clientY
						: trackEvent.touches && trackEvent.touches[0]
							? trackEvent.touches[0].clientY
							: 0;
				goToPageByTrack(clientY);
			};

			addResultListener(pagingTrack, "click", onTrackClick);
			addResultListener(
				pagingTrack,
				"touchstart",
				(event) => {
					const touchEvent = event as TouchEvent;
					touchEvent.preventDefault();
					onTrackClick(touchEvent);
				},
				{ passive: false },
			);
		}

		attachPagingThumbDrag(
			pagingThumb,
			pagingTrack,
			() => pageCount,
			goToPage,
			addResultListener,
			currentResultCleanupHandlers,
		);
		attachWheelPageChange(
			resultContainer,
			() => currentPage,
			goToPage,
			addResultListener,
		);

		const longPressButtons: Array<{
			button: HTMLButtonElement | null;
			action: () => void;
		}> = [
			{
				button: btnScrollPrev10Element,
				action: () => goToPage(currentPage - 10),
			},
			{
				button: btnScrollNext10Element,
				action: () => goToPage(currentPage + 10),
			},
			{
				button: btnScrollPrevPageElement,
				action: () => goToPage(currentPage - 1),
			},
			{
				button: btnScrollPrevElement,
				action: () => goToPage(currentPage - 1),
			},
			{
				button: btnScrollNextPageElement,
				action: () => goToPage(currentPage + 1),
			},
			{
				button: btnScrollNextElement,
				action: () => goToPage(currentPage + 1),
			},
		];

		longPressButtons.forEach(({ button, action }) =>
			attachLongPressAction(
				button,
				action,
				addResultListener,
				currentResultCleanupHandlers,
			),
		);

		render();
		updateScrollButtons();
	});
}
