import { stopWorker } from "../workers";

export interface ShowStartEventHandlers {
	calcSinglePrime: () => void;
	calcRangePrime: () => void;
	onShowCalculationChange: () => void;
	onShowProgressChange: () => void;
	onBigIntModeChange: (val: string | number) => void;
	onShowPrimeOnlyChange: () => void;
}

export function attachShowStartEvents(
	handlers: ShowStartEventHandlers,
): () => void {
	const cleanupHandlers: Array<() => void> = [];
	const addListener = (
		target: EventTarget,
		type: string,
		listener: EventListener,
		options?: boolean | AddEventListenerOptions,
	): void => {
		target.addEventListener(type, listener, options);
		cleanupHandlers.push(() => {
			target.removeEventListener(type, listener, options);
		});
	};

	const numElement = document.getElementById(
		"singleNumber",
	) as HTMLInputElement | null;
	const startButton = document.getElementById("btn-start-calc");
	const otCheckbox = document.getElementById(
		"showCalculation",
	) as HTMLInputElement | null;
	const prCheckbox = document.getElementById(
		"showProgress",
	) as HTMLInputElement | null;
	const bigIntButtons =
		document.querySelectorAll<HTMLButtonElement>(".btn-bigint");
	const smallIntButtons =
		document.querySelectorAll<HTMLButtonElement>(".btn-smallint");
	const osInputs = document.querySelectorAll<HTMLInputElement>(
		'input[name="showPrimeOnly"]',
	);

	if (numElement) {
		addListener(
			numElement,
			"change",
			handlers.calcSinglePrime as EventListener,
		);
		const keyupHandler: EventListener = (event) => {
			const keyboardEvent = event as KeyboardEvent;
			if (keyboardEvent.key === "Enter") {
				handlers.calcSinglePrime();
			}
		};
		addListener(numElement, "keyup", keyupHandler);
	}

	if (startButton) {
		addListener(
			startButton,
			"click",
			handlers.calcRangePrime as EventListener,
		);
	}

	if (otCheckbox) {
		addListener(
			otCheckbox,
			"change",
			handlers.onShowCalculationChange as EventListener,
		);
	}

	if (prCheckbox) {
		addListener(
			prCheckbox,
			"change",
			handlers.onShowProgressChange as EventListener,
		);
	}

	if (bigIntButtons.length > 0) {
		bigIntButtons.forEach((button) => {
			const handler: EventListener = (event) => {
				const mouseEvent = event as MouseEvent;
				mouseEvent.preventDefault();
				handlers.onBigIntModeChange(0);
			};
			addListener(button, "click", handler);
		});
	}

	if (smallIntButtons.length > 0) {
		smallIntButtons.forEach((button) => {
			const handler: EventListener = (event) => {
				const mouseEvent = event as MouseEvent;
				mouseEvent.preventDefault();
				handlers.onBigIntModeChange(1);
			};
			addListener(button, "click", handler);
		});
	}

	osInputs.forEach((input) => {
		addListener(
			input,
			"change",
			handlers.onShowPrimeOnlyChange as EventListener,
		);
	});

	return () => {
		cleanupHandlers.forEach((cleanup) => cleanup());
		cleanupHandlers.length = 0;
	};
}

export interface ShowRangePrimeEventHandlers {
	showStart: () => void;
	showRangePrimeOutput: () => void;
	showTooltip: (e: Event) => void;
	onBigIntModeChange: (val: string | number) => void;
}

export function attachShowRangePrimeEvents(
	handlers: ShowRangePrimeEventHandlers,
): () => void {
	const cleanupHandlers: Array<() => void> = [];
	const addListener = (
		target: EventTarget,
		type: string,
		listener: EventListener,
		options?: boolean | AddEventListenerOptions,
	): void => {
		target.addEventListener(type, listener, options);
		cleanupHandlers.push(() => {
			target.removeEventListener(type, listener, options);
		});
	};
	const btnTryAgainList =
		document.querySelectorAll<HTMLButtonElement>("#btn-try-again");
	const btnShowResult = document.getElementById("btn-show-result");
	const btnBigIntList =
		document.querySelectorAll<HTMLButtonElement>(".btn-bigint");
	const btnSmallIntList =
		document.querySelectorAll<HTMLButtonElement>(".btn-smallint");
	const resultContainer = document.querySelector(
		".result_container",
	) as HTMLElement | null;

	if (btnTryAgainList.length > 0) {
		btnTryAgainList.forEach((button) => {
			const handler: EventListener = () => {
				stopWorker();
				handlers.showStart();
			};
			addListener(button, "click", handler);
		});
	}

	const btnCancel = document.getElementById("btn-cancel");
	if (btnCancel) {
		addListener(btnCancel, "click", () => {
			stopWorker();
			handlers.showStart();
		});
	}

	if (btnShowResult) {
		addListener(
			btnShowResult,
			"click",
			handlers.showRangePrimeOutput as EventListener,
		);
	}

	if (btnBigIntList.length > 0) {
		btnBigIntList.forEach((button) => {
			const handler: EventListener = (event) => {
				const mouseEvent = event as MouseEvent;
				mouseEvent.preventDefault();
				handlers.onBigIntModeChange(0);
			};
			addListener(button, "click", handler);
		});
	}

	if (btnSmallIntList.length > 0) {
		btnSmallIntList.forEach((button) => {
			const handler: EventListener = (event) => {
				const mouseEvent = event as MouseEvent;
				mouseEvent.preventDefault();
				handlers.onBigIntModeChange(1);
			};
			addListener(button, "click", handler);
		});
	}

	if (resultContainer) {
		addListener(
			resultContainer,
			"click",
			handlers.showTooltip as EventListener,
		);
	}

	return () => {
		cleanupHandlers.forEach((cleanup) => cleanup());
		cleanupHandlers.length = 0;
	};
}
