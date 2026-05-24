import { stopWorker } from "../workers";

export interface ShowStartEventHandlers {
	calcSinglePrime: () => void;
	calcRangePrime: () => void;
	ot_onchange: () => void;
	pr_onchange: () => void;
	maxRows_onchange: () => void;
	big_onchange: (val: string | number) => void;
	os_onchange: () => void;
}

export function attachShowStartEvents(handlers: ShowStartEventHandlers): void {
	const numElement = document.getElementById(
		"num",
	) as HTMLInputElement | null;
	const startButton = document.getElementById("btn-start-calc");
	const otCheckbox = document.getElementById("ot") as HTMLInputElement | null;
	const prCheckbox = document.getElementById("pr") as HTMLInputElement | null;
	const bigIntButtons =
		document.querySelectorAll<HTMLButtonElement>("#btn-bigint");
	const smallIntButtons =
		document.querySelectorAll<HTMLButtonElement>("#btn-smallint");
	const osInputs =
		document.querySelectorAll<HTMLInputElement>('input[name="os"]');

	if (numElement) {
		numElement.addEventListener("change", handlers.calcSinglePrime);
		numElement.addEventListener("keyup", function (event) {
			if (event.key === "Enter") {
				handlers.calcSinglePrime();
			}
		});
	}

	if (startButton) {
		startButton.addEventListener("click", handlers.calcRangePrime);
	}

	if (otCheckbox) {
		otCheckbox.addEventListener("change", handlers.ot_onchange);
	}

	if (prCheckbox) {
		prCheckbox.addEventListener("change", handlers.pr_onchange);
	}

	const maxRowsElement = document.getElementById(
		"max_rows",
	) as HTMLInputElement | null;

	if (maxRowsElement) {
		maxRowsElement.addEventListener("change", handlers.maxRows_onchange);
	}

	if (bigIntButtons.length > 0) {
		bigIntButtons.forEach((button) => {
			button.addEventListener("click", function (event) {
				event.preventDefault();
				handlers.big_onchange(0);
			});
		});
	}

	if (smallIntButtons.length > 0) {
		smallIntButtons.forEach((button) => {
			button.addEventListener("click", function (event) {
				event.preventDefault();
				handlers.big_onchange(1);
			});
		});
	}

	osInputs.forEach((input) => {
		input.addEventListener("change", handlers.os_onchange);
	});
}

export interface ShowRangePrimeEventHandlers {
	showStart: () => void;
	showRangePrimeOutput: () => void;
	showTooltip: (e: Event) => void;
	big_onchange: (val: string | number) => void;
}

export function attachShowRangePrimeEvents(
	handlers: ShowRangePrimeEventHandlers,
): void {
	const btnTryAgainList =
		document.querySelectorAll<HTMLButtonElement>("#btn-try-again");
	const btnShowResult = document.getElementById("btn-show-result");
	const btnBigIntList =
		document.querySelectorAll<HTMLButtonElement>("#btn-bigint");
	const btnSmallIntList =
		document.querySelectorAll<HTMLButtonElement>("#btn-smallint");
	const resultContainer = document.querySelector(
		".result_container",
	) as HTMLElement | null;

	if (btnTryAgainList.length > 0) {
		btnTryAgainList.forEach((button) => {
			button.addEventListener("click", () => {
				stopWorker();
				handlers.showStart();
			});
		});
	}

	const btnCancel = document.getElementById("btn-cancel");
	if (btnCancel) {
		btnCancel.addEventListener("click", () => {
			stopWorker();
			handlers.showStart();
		});
	}

	if (btnShowResult) {
		btnShowResult.addEventListener("click", handlers.showRangePrimeOutput);
	}

	if (btnBigIntList.length > 0) {
		btnBigIntList.forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				handlers.big_onchange(1);
			});
		});
	}

	if (btnSmallIntList.length > 0) {
		btnSmallIntList.forEach((button) => {
			button.addEventListener("click", (event) => {
				event.preventDefault();
				handlers.big_onchange(0);
			});
		});
	}

	if (resultContainer) {
		resultContainer.addEventListener("click", handlers.showTooltip);
	}
}
