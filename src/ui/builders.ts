import { state } from "../state";

export function ctlCheckbox(
	id: string,
	checked: boolean,
	label: string,
): string {
	return `
	<div class="form-group">
		<label class="checkbox" for="${id}">${label}
			<input type="checkbox" id="${id}" ${checked ? ` checked="checked"` : ""}/>
			<span class="checkmark"></span>
		</label>
	</div>`;
}

export function ctlRadio(
	id: string,
	name: string,
	value: number,
	checked: boolean,
	label: string,
): string {
	return `
	<div class="form-group">
		<label class="radio" for="${id}">${label}
			<input type="radio" id="${id}" name="${name}" value="${value}" ${checked ? ` checked="checked"` : ""}/>
			<span class="checkmark"></span>
		</label>
	</div>`;
}

export function ctlNumber(
	id: string,
	value: number | bigint,
	label: string,
	container_id?: string,
): string {
	return `
	<div class="form-group"${container_id ? ` id="${container_id}"` : ""}>
		<label for="${id}">${label}</label>
		<input type="number" id="${id}" value="${value}" />
	</div>`;
}

export function ctlButton(id: string, label: string): string {
	return `<button type="button" id="${id}" aria-label="${label}">${label}</button>`;
}

export function ctlTextResult(id: string): string {
	return `<div class="form-group" role="status" aria-live="polite"><div id="${id}"></div></div>`;
}

export const bigTitle = ` <sup class="pointer" title="BigInt"><small><button type="button" id="btn-bigint" aria-label="Switch to BigInt mode">&beta;igInt</button></small></sup>`;
export const smallTitle = ` <sup class="pointer" title="Number"><small><button type="button" id="btn-smallint" aria-label="Switch to Integer mode">&#938;nteger</button></small></sup>`;

export const header = function () {
	return `<h2>Prime Number Checker${state.big ? bigTitle : smallTitle}</h2>`;
};
export const header2 = function () {
	return `<h2>Prime Number List${state.big ? bigTitle : smallTitle}</h2>`;
};
export const errorHeader = function () {
	return `<h2 class="font-danger">Error!${state.big ? bigTitle : smallTitle}</h2>`;
};

export function timerIndicator(id: string) {
	return `<span id="${id}"></span>`;
}

export function progressIndicator(id: string | null) {
	return id
		? `<div class="progress" role="progressbar" aria-label="Calculation progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar" id="${id}">&nbsp;</div></div>`
		: "";
}

export const btnTryAgain = ctlButton("btn-try-again", "Try Again");
export const btnShowResult = ctlButton("btn-show-result", "Show Result");
export const btnScrollBottom = ctlButton("btn-scroll-bottom", "Bottom");
export const btnScrollTop = ctlButton("btn-scroll-top", "Top");
export const loading2 = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
export const loading3 = `<div class="lds-ring-big"><div></div><div></div><div></div><div></div></div>`;

export const loading4 = function () {
	return !state.pr ? `${loading2}` : "";
};
