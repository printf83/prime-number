// function factor(num, arrayOfPrime) {
// 	//return factor1(num);
// 	return factor4(num, arrayOfPrime);
// }

// //99999 number -> 1966ms (455,239,139 Loop)
// function factor1(num) {
// 	if (num % 2 === 0) {
// 		return false;
// 	} else {
// 		let result = true;
// 		for (let x = 2; x < num; x++) {
// 			// totalLoop++;

// 			if (num % x === 0) {
// 				result = false;
// 				break;
// 			}
// 		}
// 		return result;
// 	}
// }

// //99999 number -> 1102ms (227,664,775 Loop)
// function factor2(num) {
// 	if (num % 2 === 0) {
// 		return false;
// 	} else {
// 		let result = true;
// 		for (let x = 3; x < num; x++) {
// 			if (x % 2 !== 0) {
// 				// totalLoop++;
// 				if (num % x === 0) {
// 					result = false;
// 					// console.log(`${x} is factor for ${num}`);
// 					break;
// 				}
// 			}
// 		}
// 		return result;
// 	}
// }

// //99999 number -> 1029ms (227,648,110 Loop)
// function factor3(num) {
// 	if (!((num + 1) % 6 === 0 || (num - 1) % 6 === 0)) {
// 		return false;
// 	} else {
// 		let result = true;
// 		for (let x = 3; x < num; x++) {
// 			if (x % 2 !== 0) {
// 				// totalLoop++;
// 				if (num % x === 0) {
// 					result = false;
// 					// console.log(`${x} is factor for ${num}`);
// 					break;
// 				}
// 			}
// 		}

// 		return result;
// 	}
// }

//99999 number -> 272ms (46,414,463 Loop)
// function factor(num, arrayOfPrime) {
// 	let result = true;
// 	let arrayOfPrimeLength = arrayOfPrime.length;
// 	for (let x = 0; x < arrayOfPrimeLength; x++) {
// 		if (num % arrayOfPrime[x] === 0) {
// 			result = false;
// 			break;
// 		}
// 	}
// 	return result;
// }

// function isPrimeRegex(num) {
// 	if (num % 2 === 0) return false;
// 	if (num % 3 === 0) return false;
// 	if (num % 5 === 0) return false;
// 	if (num % 7 === 0) return false;
// 	if (num % 11 === 0) return false;

// 	let t = new Array(num).fill(1).join("");
// 	let m = t.match(/^1?$|^(11+?)\1+$/);
// 	return !m;
// }

// function isPrime(num) {
// 	if (num > 11) {
// 		// if (isPrimeRegex(num)) {
// 		return factor(num);
// 		// }
// 		// else {
// 		// 	return false;
// 		// }
// 		// return isPrimeRegex(num);
// 	} else {
// 		switch (num) {
// 			case 2:
// 			case 3:
// 			case 5:
// 			case 7:
// 			case 11:
// 				return true;
// 			default:
// 				return false;
// 		}
// 	}
// }

// let hl_count = 0;
// let hl_num = 0;

// function factor(num) {
// 	let max = Math.sqrt(num);
// 	let result = true;
// 	for (let x = 2; x <= max; x++) {
// 		if (num % x === 0) {
// 			result = false;

// 			if (hl_count <= x) {
// 				hl_count = x;
// 				hl_num = num;
// 			}

// 			break;
// 		}
// 	}
// 	return result;
// }

function isPrime(num) {
	if (num == 2 || num == 3) return true;
	if (num <= 1 || num % 2 == 0 || num % 3 == 0) return false;
	for (let i = 5; i * i <= num; i += 6) if (num % i == 0 || num % (i + 2) == 0) return false;
	return true;
}

onmessage = function (e) {
	try {
		let min = e.data[0];
		let max = e.data[1];

		let result = [];

		// create empty array
		result = new Array(max - min + 1).fill(0);

		// loop inside array
		for (let x = min; x <= max; x++) {
			if (isPrime(x)) {
				result[x - min] = 1;
			}
		}

		// return result
		postMessage({
			result: result,
			count: result.filter((x) => x === 1).length,
		});
	} catch (err) {
		postMessage(null);
	}
};
