export type AddResultListener = (
	target: EventTarget,
	type: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions,
) => void;

export function attachLongPressAction(
	button: HTMLButtonElement | null,
	action: () => void,
	addResultListener: AddResultListener,
	cleanupHandlers: Array<() => void>,
): void {
	if (!button) {
		return;
	}

	let delayId: number | null = null;
	let intervalId: number | null = null;
	let repeatStarted = false;
	let suppressClick = false;

	const clearRepeat = (): void => {
		if (delayId !== null) {
			window.clearTimeout(delayId);
			delayId = null;
		}
		if (intervalId !== null) {
			window.clearInterval(intervalId);
			intervalId = null;
		}
		if (repeatStarted) {
			suppressClick = true;
			repeatStarted = false;
		}
	};

	const startRepeat = (): void => {
		if (button.disabled) {
			return;
		}
		delayId = window.setTimeout(() => {
			repeatStarted = true;
			action();
			intervalId = window.setInterval(() => {
				if (button.disabled) {
					clearRepeat();
					return;
				}
				action();
			}, 80);
		}, 250);
	};

	const mouseDownHandler = () => startRepeat();
	const touchStartHandler: EventListener = (event) => {
		const touchEvent = event as TouchEvent;
		touchEvent.preventDefault();
		startRepeat();
	};
	const mouseUpHandler = clearRepeat;
	const mouseLeaveHandler = clearRepeat;
	const touchEndHandler: EventListener = (event) => {
		if (delayId !== null && !repeatStarted) {
			action();
			suppressClick = true;
		}
		clearRepeat();
	};
	const touchCancelHandler = clearRepeat;
	const blurHandler = clearRepeat;
	const clickHandler: EventListener = (event) => {
		const mouseEvent = event as MouseEvent;
		if (suppressClick) {
			mouseEvent.preventDefault();
			mouseEvent.stopImmediatePropagation();
			suppressClick = false;
		}
	};

	addResultListener(button, "mousedown", mouseDownHandler);
	addResultListener(button, "touchstart", touchStartHandler, {
		passive: false,
	});
	addResultListener(button, "mouseup", mouseUpHandler);
	addResultListener(button, "mouseleave", mouseLeaveHandler);
	addResultListener(button, "touchend", touchEndHandler);
	addResultListener(button, "touchcancel", touchCancelHandler);
	addResultListener(button, "blur", blurHandler);
	addResultListener(button, "click", clickHandler);
	cleanupHandlers.push(clearRepeat);
}

export function attachPagingThumbDrag(
	pagingThumb: HTMLElement | null,
	pagingTrack: HTMLElement | null,
	getPageCount: () => number,
	goToPage: (page: number) => void,
	addResultListener: AddResultListener,
	cleanupHandlers: Array<() => void>,
): void {
	if (!pagingThumb || !pagingTrack) {
		return;
	}

	let dragging = false;
	let pointerId: number | null = null;

	const updatePosition = (clientY: number): void => {
		const rect = pagingTrack.getBoundingClientRect();
		const position = Math.min(Math.max(0, clientY - rect.top), rect.height);
		const ratio = rect.height > 0 ? position / rect.height : 0;
		const page = Math.round(ratio * (getPageCount() - 1));
		goToPage(page);
	};

	const onPointerMove = (event: PointerEvent): void => {
		if (!dragging || event.pointerId !== pointerId) {
			return;
		}
		updatePosition(event.clientY);
	};

	const endDrag = (event: PointerEvent): void => {
		if (!dragging || event.pointerId !== pointerId) {
			return;
		}
		dragging = false;
		pointerId = null;
		if (pagingThumb.hasPointerCapture(event.pointerId)) {
			pagingThumb.releasePointerCapture(event.pointerId);
		}
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", endDrag);
		window.removeEventListener("pointercancel", endDrag);
	};

	const pointerDownHandler: EventListener = (event) => {
		const pointerEvent = event as PointerEvent;
		if (pointerEvent.button !== 0) {
			return;
		}
		pointerEvent.preventDefault();
		pointerEvent.stopPropagation();
		dragging = true;
		pointerId = pointerEvent.pointerId;
		pagingThumb.setPointerCapture(pointerId);
		updatePosition(pointerEvent.clientY);
		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", endDrag);
		window.addEventListener("pointercancel", endDrag);
	};

	addResultListener(pagingThumb, "pointerdown", pointerDownHandler);
	cleanupHandlers.push(() => {
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerup", endDrag);
		window.removeEventListener("pointercancel", endDrag);
		if (
			dragging &&
			pointerId !== null &&
			pagingThumb.hasPointerCapture(pointerId)
		) {
			pagingThumb.releasePointerCapture(pointerId);
		}
	});
}

export function attachWheelPageChange(
	element: HTMLElement | null,
	getCurrentPage: () => number,
	goToPage: (page: number) => void,
	addResultListener: AddResultListener,
): void {
	if (!element) {
		return;
	}

	addResultListener(
		element,
		"wheel",
		(event) => {
			const wheelEvent = event as WheelEvent;
			wheelEvent.preventDefault();
			const delta = Math.sign(wheelEvent.deltaY);
			if (delta > 0) {
				goToPage(getCurrentPage() + 1);
			} else if (delta < 0) {
				goToPage(getCurrentPage() - 1);
			}
		},
		{ passive: false },
	);
}
