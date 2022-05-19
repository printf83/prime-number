$(document).ready(() => {
	console.time("prime calc");
	let min = 1;
	let max = 1000;
	let iteminrow = 10;

	let result = "";
	let item = "";

	for (let x = min; x <= max; x++) {
		item += `<div ${isPrime(x) ? ' class="prime"' : ""}>${x}</div>`;

		if (x % iteminrow === 0) {
			result += `<div class="d-flex">${item}</div>`;
			item = "";
		}
	}

	$("#root").html(result);
	console.timeEnd("prime calc");
});

function isPrime(num) {
	if (num > 10) {
		return factor(num);
	} else {
		switch (num) {
			case 2:
			case 3:
			case 5:
			case 7:
				return true;
			default:
				return false;
		}
	}
}

function factor(num) {
	if (!((num + 1) % 6 === 0 || (num - 1) % 6 === 0)) {
		// if (num % 2 === 0) {
		return false;
	} else {
		let result = true;
		for (let x = 3; x < num; x++) {
			if (x % 2 !== 0) {
				if (num % x === 0) {
					result = false;
					console.log(`${x} is factor for ${num}`);
					break;
				}
			}
		}

		return result;
	}
}
