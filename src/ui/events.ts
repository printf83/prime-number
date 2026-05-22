import { state } from "../state";

export interface ShowStartEventHandlers {
	calcSinglePrime: () => void;
	calcRangePrime: () => void;
	ot_onchange: () => void;
	pr_onchange: () => void;
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
	const bigIntButton = document.getElementById("btn-bigint");
	const smallIntButton = document.getElementById("btn-smallint");
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

	if (bigIntButton) {
		bigIntButton.addEventListener("click", function (event) {
			event.preventDefault();
			handlers.big_onchange(0);
		});
	}

	if (smallIntButton) {
		smallIntButton.addEventListener("click", function (event) {
			event.preventDefault();
			handlers.big_onchange(1);
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
	doScrollTo: (location: number) => void;
}

export function attachShowRangePrimeEvents(
	handlers: ShowRangePrimeEventHandlers,
): void {
	const btnTryAgain = document.getElementById("btn-try-again");
	const btnShowResult = document.getElementById("btn-show-result");
	const btnScrollBottom = document.getElementById("btn-scroll-bottom");
	const btnScrollTop = document.getElementById("btn-scroll-top");
	const resultContainer = document.querySelector(
		".result_container",
	) as HTMLElement | null;

	if (btnTryAgain) {
		btnTryAgain.addEventListener("click", handlers.showStart);
	}

	if (btnShowResult) {
		btnShowResult.addEventListener("click", handlers.showRangePrimeOutput);
	}

	if (btnScrollBottom) {
		btnScrollBottom.addEventListener("click", () => handlers.doScrollTo(1));
	}

	if (btnScrollTop) {
		btnScrollTop.addEventListener("click", () => handlers.doScrollTo(0));
	}

	if (resultContainer && state.os === 0) {
		resultContainer.addEventListener("click", handlers.showTooltip);
	}
}
