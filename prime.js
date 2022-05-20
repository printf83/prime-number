function isPrime(num, arrayOfPrime) {
	if (num > 10) {
		return factor(num, arrayOfPrime);
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

	// return factor(num, arrayOfPrime);
}

function factor(num, arrayOfPrime) {
	//return factor1(num);
	return factor4(num, arrayOfPrime);
}

//99999 number -> 1966ms (455,239,139 Loop)
function factor1(num) {
	if (num % 2 === 0) {
		return false;
	} else {
		let result = true;
		for (let x = 2; x < num; x++) {
			// totalLoop++;

			if (num % x === 0) {
				result = false;
				break;
			}
		}
		return result;
	}
}

//99999 number -> 1102ms (227,664,775 Loop)
function factor2(num) {
	if (num % 2 === 0) {
		return false;
	} else {
		let result = true;
		for (let x = 3; x < num; x++) {
			if (x % 2 !== 0) {
				// totalLoop++;
				if (num % x === 0) {
					result = false;
					// console.log(`${x} is factor for ${num}`);
					break;
				}
			}
		}
		return result;
	}
}

//99999 number -> 1029ms (227,648,110 Loop)
function factor3(num) {
	if (!((num + 1) % 6 === 0 || (num - 1) % 6 === 0)) {
		return false;
	} else {
		let result = true;
		for (let x = 3; x < num; x++) {
			if (x % 2 !== 0) {
				// totalLoop++;
				if (num % x === 0) {
					result = false;
					// console.log(`${x} is factor for ${num}`);
					break;
				}
			}
		}

		return result;
	}
}

//99999 number -> 272ms (46,414,463 Loop)
function factor4(num, arrayOfPrime) {
	let result = true;
	let arrayOfPrimeLength = arrayOfPrime.length;
	for (let x = 0; x < arrayOfPrimeLength; x++) {
		// totalLoop++;
		if (num % arrayOfPrime[x] === 0) {
			result = false;
			break;
		}
	}
	return result;
}

onmessage = function (e) {
	try {
		let max = e.data[0];
		let col = e.data[1];

		let min = 1;
		let item = "";
		let itsPrime = false;
		let arrayOfPrime = [];
		let result = [];

		for (let x = min; x <= max; x++) {
			// totalLoop++;
			itsPrime = isPrime(x, arrayOfPrime);
			if (itsPrime) {
				arrayOfPrime.push(x);
				item += `<span>${x}</span>`;
			} else {
				item += `<div>${x}</div>`;
			}

			if (x % col === 0) {
				result.push(item);
				item = "";
			}
		}

		if (item !== "") {
			result.push(item);
		}

		postMessage(result);
	} catch (err) {
		postMessage(null);
	}
};