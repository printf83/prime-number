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

let hl_count = 0;
let hl_num = 0;

function factor(num) {
	let max = Math.sqrt(num);
	let result = true;
	for (let x = 2; x <= max; x++) {
		if (num % x === 0) {
			result = false;

			if (hl_count <= x) {
				hl_count = x;
				hl_num = num;
			}

			break;
		}
	}
	return result;
}

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

onmessage = function (e) {
	try {
		let min = e.data[0];
		let max = e.data[1];

		let itsPrime = false;
		let result = [];

		// create empty array
		result = new Array(max - min + 1);
		result.fill(0);

		// loop inside array
		for (let x = min; x <= max; x++) {
			itsPrime = isPrime(x);
			if (itsPrime) {
				result[x - min] = 1;
			}
		}

		// return result
		postMessage({
			result: result,
			count: result.filter((x) => x === 1).length,
			hl_count: hl_count,
			hl_num: hl_num,
		});
	} catch (err) {
		postMessage(null);
	}
};
