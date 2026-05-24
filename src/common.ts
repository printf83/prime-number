export function modPow(
	base: bigint,
	exponent: bigint,
	modulus: bigint,
): bigint {
	let result = 1n;
	let power = base % modulus;
	let exp = exponent;

	while (exp > 0n) {
		if (exp & 1n) {
			result = (result * power) % modulus;
		}
		power = (power * power) % modulus;
		exp >>= 1n;
	}

	return result;
}

export function millerRabin(num: bigint, bases: bigint[]): boolean {
	if (num < 2n) return false;
	if (num % 2n === 0n) return num === 2n;

	let d = num - 1n;
	let s = 0n;
	while (d % 2n === 0n) {
		d /= 2n;
		s += 1n;
	}

	for (const a of bases) {
		const witness = a % num;
		if (witness === 0n) return true;
		let x = modPow(witness, d, num);
		if (x === 1n || x === num - 1n) continue;

		let isComposite = true;
		for (let r = 1n; r < s; r += 1n) {
			x = modPow(x, 2n, num);
			if (x === num - 1n) {
				isComposite = false;
				break;
			}
		}

		if (isComposite) return false;
	}

	return true;
}

export function isProbablyPrime(num: bigint): boolean {
	if (num === 2n || num === 3n) return true;
	if (num <= 1n || num % 2n === 0n || num % 3n === 0n) return false;

	const bases = [2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n];
	return millerRabin(num, bases);
}

export function progressDivNumber(max: number, div = 100): number {
	return max > div ? Math.floor(max / div) : div;
}

export function progressDivBigInt(max: bigint, div = 100n): bigint {
	return max > div ? max / div : div;
}

export function simpleSieve(limit: number): number[] {
	const sieve = new Uint8Array(limit + 1);
	sieve.fill(1);

	if (limit >= 0) sieve[0] = 0;
	if (limit >= 1) sieve[1] = 0;

	const primes: number[] = [];
	if (limit >= 2) {
		primes.push(2);
	}

	const maxP = Math.floor(Math.sqrt(limit));
	for (let p = 3; p <= limit; p += 2) {
		if (sieve[p]) {
			primes.push(p);
			if (p <= maxP) {
				const step = p * p;
				for (let j = step; j <= limit; j += 2 * p) {
					sieve[j] = 0;
				}
			}
		}
	}

	return primes;
}

export function createNumberProgressEmitter(
	onProgress: (progress: number) => void,
) {
	let lastProgress = -1;
	return function progress(x: number, max: number, div: number): void {
		if (div === 0) return;
		if (x % div === 0) {
			const curProgress = Math.floor((x / max) * 100);
			if (lastProgress !== curProgress) {
				lastProgress = curProgress;
				onProgress(curProgress);
			}
		}
	};
}

export function createBigIntProgressEmitter(
	onProgress: (progress: number) => void,
) {
	let lastProgress = -1n;
	return function progress(x: bigint, max: bigint, div: bigint): void {
		if (div === 0n) return;
		if (x % div === 0n) {
			const curProgress = (x * 100n) / max;
			if (lastProgress !== curProgress) {
				lastProgress = curProgress;
				onProgress(Number(curProgress));
			}
		}
	};
}
