import { state } from "../state";
import { formatNumber } from "../utils";
import { genUI } from "../dom";
import { attachShowRangePrimeEvents } from "./events";
import {
	btnTryAgain,
	btnScrollFirst,
	btnScrollPrev10,
	btnScrollPrev,
	btnScrollNext,
	btnScrollNext10,
	btnScrollLast,
	header,
} from "./builders";

interface ResultCallbacks {
	showStart: () => void;
	showRangePrimeOutput: () => void;
	showTooltip: (e: Event) => void;
	big_onchange: (val: string | number) => void;
}

const ROW_HEIGHT = 25;

export function showRangePrimeOutputImpl(callbacks: ResultCallbacks): void {
	const { showStart, showRangePrimeOutput, showTooltip, big_onchange } =
		callbacks;
	const resultArray = state.result as number[] | Uint8Array;
	const visibleCount = state.os === 0 ? resultArray.length : state.primeFound;
	const col = Math.max(
		1,
		state.big ? Number(state.col as bigint) : Number(state.col as number),
	);

	const primeValues: Array<number | bigint> = [];
	if (state.os === 1) {
		for (let index = 0; index < resultArray.length; index++) {
			if (resultArray[index] === 1) {
				primeValues.push(
					state.big
						? (state.min as bigint) + BigInt(index)
						: (state.min as number) + index,
				);
			}
		}
	}

	const totalRows =
		state.os === 0
			? Math.ceil(resultArray.length / col)
			: Math.ceil(primeValues.length / col);

	genUI(
		`
		${header()} 
		Showing <b>${formatNumber(visibleCount)} numbers</b> in a paged view.<br/>
		Use the paging buttons below to move through results.
		<div class="result_container">
			<div class="result-viewport">
				<div class="result-inner"></div>
			</div>
		</div>
		<div class="result-page-info">
			<div class="paging-label" id="paging_label">Page 1 of 1</div>
		</div>
		<div class="result-scroll-controls">
			${btnScrollFirst}${btnScrollPrev10}${btnScrollPrev}${btnTryAgain}${btnScrollNext}${btnScrollNext10}${btnScrollLast}
		</div>
		`,
		function () {
			attachShowRangePrimeEvents({
				showStart,
				showRangePrimeOutput: showRangePrimeOutput,
				showTooltip,
				big_onchange,
			});

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
				return state.big
					? (state.min as bigint) + BigInt(index)
					: (state.min as number) + index;
			}

			function renderRow(row: number): string {
				const start = row * col;
				const items: string[] = [];

				if (state.os === 1) {
					for (
						let index = start;
						index < Math.min(primeValues.length, start + col);
						index++
					) {
						const value = primeValues[index];
						items.push(
							`<span class="result-item prime">${formatNumber(value)}</span>`,
						);
					}
				} else {
					for (
						let index = start;
						index < Math.min(resultArray.length, start + col);
						index++
					) {
						const value = getValue(index);
						items.push(
							`<span class="result-item ${
								resultArray[index] === 1 ? "prime" : "composite"
							}">${formatNumber(value)}</span>`,
						);
					}
				}

				return `<div class="result-row">${items.join("")}</div>`;
			}

			viewport.style.overflow = "hidden";
			inner.style.position = "relative";
			inner.style.height = "100%";
			viewport.style.overflow = "hidden";
			inner.style.position = "relative";
			inner.style.height = "100%";

			const content = document.createElement("div");
			content.className = "result-content";
			content.style.position = "absolute";
			content.style.left = "0";
			content.style.top = "0";
			content.style.width = "100%";
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

				let html = "";
				for (let row = firstRow; row < lastRow; row++) {
					html += renderRow(row);
				}

				content.style.transform = "translateY(0)";
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
			window.addEventListener("resize", onResize);
			const btnScrollFirstElement = document.getElementById(
				"btn-scroll-first",
			) as HTMLButtonElement | null;
			const btnScrollPrev10Element = document.getElementById(
				"btn-scroll-prev10",
			) as HTMLButtonElement | null;
			const btnScrollPrevElement = document.getElementById(
				"btn-scroll-prev",
			) as HTMLButtonElement | null;
			const btnScrollNextElement = document.getElementById(
				"btn-scroll-next",
			) as HTMLButtonElement | null;
			const btnScrollNext10Element = document.getElementById(
				"btn-scroll-next10",
			) as HTMLButtonElement | null;
			const btnScrollLastElement = document.getElementById(
				"btn-scroll-last",
			) as HTMLButtonElement | null;

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
				if (btnScrollPrevElement) {
					btnScrollPrevElement.disabled = atFirst;
				}
				if (btnScrollNextElement) {
					btnScrollNextElement.disabled = atLast;
				}
				if (btnScrollNext10Element) {
					btnScrollNext10Element.disabled = atLast;
				}
				if (btnScrollLastElement) {
					btnScrollLastElement.disabled = atLast;
				}
			}

			if (btnScrollFirstElement) {
				btnScrollFirstElement.addEventListener("click", () =>
					goToPage(0),
				);
			}

			if (btnScrollLastElement) {
				btnScrollLastElement.addEventListener("click", () =>
					goToPage(pageCount - 1),
				);
			}

			if (btnScrollPrev10Element) {
				btnScrollPrev10Element.addEventListener("click", () =>
					goToPage(currentPage - 10),
				);
			}

			if (btnScrollNext10Element) {
				btnScrollNext10Element.addEventListener("click", () =>
					goToPage(currentPage + 10),
				);
			}

			if (btnScrollPrevElement) {
				btnScrollPrevElement.addEventListener("click", () =>
					goToPage(currentPage - 1),
				);
			}

			if (btnScrollNextElement) {
				btnScrollNextElement.addEventListener("click", () =>
					goToPage(currentPage + 1),
				);
			}

			render();
			updateScrollButtons();
		},
	);
}
