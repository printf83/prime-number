import { state } from "../state";
import { formatNumber } from "../utils";

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
	inputType: "text" | "number" = "text",
	attrs = "",
): string {
	return `
	<div class="form-group"${container_id ? ` id="${container_id}"` : ""}>
		<label for="${id}">${label}</label>
		<input type="${inputType}" ${
			inputType === "text" ? `inputmode="numeric" pattern="[0-9]*"` : ""
		} id="${id}" value="${value}" ${attrs} autocomplete="off" spellcheck="false" />
	</div>`;
}

export function ctlButton(id: string, label: string, smicon?: string): string {
	if (smicon) {
		return `<button type="button" id="${id}" aria-label="${label}"><span class="sm-label">${smicon}</span><span class="md-label">${label}</span></button>`;
	} else {
		return `<button type="button" id="${id}" aria-label="${label}">${label}</button>`;
	}
}

export function ctlTextResult(id: string): string {
	return `<div class="form-group" role="status" aria-live="polite"><div id="${id}" class="d-flex-column"></div></div>`;
}

export const bigTitle = ` <sup class="pointer" title="Maximum supported by BigInt"><button type="button" class="mode-toggle small btn-bigint" aria-label="Switch to BigInt mode">&beta;igInt</button></sup>`;
export const smallTitle = ` <sup class="pointer" title="Maximum 9007199254740991"><button type="button" class="mode-toggle small btn-smallint" aria-label="Switch to Integer mode">&#938;nteger</button></sup>`;

export const header = function () {
	return `<h2>Prime Number Checker${state.big ? bigTitle : smallTitle}</h2>`;
};
export const header2 = function () {
	return `<h2>Prime Number List${state.big ? bigTitle : smallTitle}</h2>`;
};
export const errorHeader = function () {
	return `<h2 class="font-danger">Error!${state.big ? bigTitle : smallTitle}</h2>`;
};

export function errorResult(message: string): string {
	return `${errorHeader()}<div>${message}</div>${btnTryAgain}`;
}

export function errorTextHtml(message: string): string {
	return `<div class="font-danger">${message}</div>`;
}

export function rangePrimeResultHtml(visibleCount: number): string {
	return `
		${header()}
		<span>Showing <b>${formatNumber(visibleCount)} numbers</b> in a paged view.</span>
		<span>Use the paging buttons below to move through results.</span>
		<div class="result_container">
			<div class="result-viewport">
				<div class="result-inner"></div>
			</div>
			<div class="result-paging" aria-label="Page scrollbar">
				<button type="button" id="btn-scroll-prev-page" class="paging-arrow" aria-label="Previous page">&#9650;</button>
				<div class="paging-track">
					<div class="paging-thumb" id="paging_thumb"></div>
				</div>
				<button type="button" id="btn-scroll-next-page" class="paging-arrow" aria-label="Next page">&#9660;</button>
			</div>
		</div>
		<div class="result-page-info">
			<div class="paging-label" id="paging_label">Page 1 of 1</div>
		</div>
		<div class="result-scroll-controls">
			${btnScrollFirst}${btnScrollPrev10}${btnScrollPrev}${btnTryAgain2}${btnScrollNext}${btnScrollNext10}${btnScrollLast}
		</div>
	`;
}

export function rangePrimeSummaryHtml(
	primeFound: string,
	min: string,
	max: string,
	processTime: string,
	method: string,
): string {
	return `
		${header()}
		<span>We found <b>${primeFound} prime number</b> between <b>${min}</b> and <b>${max}</b> in <b>${processTime}</b> using <b>${method}</b>.</span>
	`;
}

export function rangePrimeTooHugeHtml(
	primeFound: string,
	min: string,
	max: string,
	processTime: string,
	method: string,
): string {
	return `
		${rangePrimeSummaryHtml(primeFound, min, max, processTime, method)}
		<span>The range is too large to render in this browser. Narrow the range to see the primes.</span>
	`;
}

export function resultItemHtml(
	value: number | bigint,
	isPrime: boolean,
): string {
	return `<button type="button" class="result-item ${isPrime ? "prime" : "composite"}" popovertarget="tooltip" popovertargetaction="show">${formatNumber(value)}</button>`;
}

export function resultRowHtml(items: string[]): string {
	return `<div class="result-row">${items.join("")}</div>`;
}

export function timerIndicator(id: string) {
	return `<span id="${id}"></span>`;
}

export function progressIndicator(id: string | null) {
	return id
		? `<div class="progress" role="progressbar" aria-label="Calculation progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="bar" id="${id}">&nbsp;</div></div>`
		: "";
}

export function currentCountIndicator(id: string | null) {
	return id
		? `<div id="${id}">Currently found <b>0</b> prime numbers</div>`
		: "";
}

export function copyStatusHtml(message: string): string {
	return `<span class="small">${message}</span>`;
}

export function singlePrimeInitialOutputHtml(
	timerId: string,
	progressId: string | null,
): string {
	return `
		<div id="singleprime_status">Checking ${timerIndicator(timerId)}</div>
		<div id="singleprime_factors"></div>
		${loading4()}
		${progressIndicator(progressId)}
	`;
}

export function singlePrimeDivisorMessageHtml(
	divisorInfo: string,
	only: boolean,
): string {
	return `<span class="small">It can${only ? ` only` : ``} be divided with ${divisorInfo}</span>`;
}

export function singlePrimeTimeHtml(id: string, loadingMarkup: string): string {
	return `<div><span class="small" id="${id}">${loadingMarkup}</span></div>`;
}

export function tooltipDivisorMessageHtml(
	divisorInfo: string,
	only: boolean,
): string {
	return `<div class="small"><span>It can${only ? ` only` : ``} be divided with</span> ${divisorInfo}</div>`;
}

export function tooltipTimeHtml(id: string, loadingMarkup: string): string {
	return `<div><span id="${id}">${loadingMarkup}</span></div>`;
}

export function createPrimeResultHtml(
	tag: string,
	id: string,
	number: string,
	isPrime: boolean,
	resultHtml: string,
	method: string,
	timeHTtml: string,
): string {
	return `<${tag} id="${id}" class="pointer" title="Click to copy number">${number}</${tag}><div><b class="${
		isPrime ? "font-success" : "font-danger"
	}">${isPrime ? "Is a prime number" : "Is NOT a prime number"}</b></div>${resultHtml}<div class="small">Using ${method}</div><div>${timeHTtml}</div>`;
}

export function createPrimeStatusHtml(
	tag: string,
	id: string,
	number: string,
	isPrime: boolean,
): string {
	return `<${tag} id="${id}" class="pointer" title="Click to copy number">${number}</${tag}><span><b class="${
		isPrime ? "font-success" : "font-danger"
	}">${isPrime ? "Is a prime number" : "Is NOT a prime number"}</b></span>`;
}

export function primeFactorTableHtml(bodyId: string): string {
	return `<div class="small"><span>It can be divided with</span><div class="scrollable"><table class="prime-divisors"><tbody id="${bodyId}"></tbody></table></div></div>`;
}

export function factorTableHtml(rows: string): string {
	return `<div class="scrollable"><table>${rows}</table></div>`;
}

export function primeFactorRowHtml(
	divisor: number | bigint,
	quotient: number | bigint,
): string {
	return `<tr><td>÷</td><td>${formatNumber(divisor)}</td><td>=</td><td>${formatNumber(quotient)}</td></tr>`;
}

export const btnTryAgain = ctlButton("btn-try-again", "Try Again");
export const btnTryAgain2 = ctlButton("btn-try-again", "Try Again", "&#8635;");
export const btnCancel = ctlButton("btn-cancel", "Cancel");
export const btnScrollFirst = ctlButton("btn-scroll-first", "&#8676;");
export const btnScrollPrev10 = ctlButton("btn-scroll-prev10", "&#8606;");
export const btnScrollPrev = ctlButton("btn-scroll-prev", "&#8592;");
export const btnScrollNext = ctlButton("btn-scroll-next", "&#8594;");
export const btnScrollNext10 = ctlButton("btn-scroll-next10", "&#8608;");
export const btnScrollLast = ctlButton("btn-scroll-last", "&#8677;");
export const btnShowResult = ctlButton("btn-show-result", "Show Result");
export const loading2 = `<div><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>`;
export const loading3 = `<div><div class="lds-ring-big"><div></div><div></div><div></div><div></div></div></div>`;

export const loading4 = function () {
	return !state.showProgress ? `${loading2}` : "";
};
