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

export function gcdBigInt(a: bigint, b: bigint): bigint {
	return b === 0n ? (a < 0n ? -a : a) : gcdBigInt(b, a % b);
}

export function randomBigInt(max: bigint): bigint {
	if (max <= 0n) {
		return 0n;
	}

	let bits = max.toString(2).length;
	let value = 0n;
	while (value <= 0n || value >= max) {
		value = 0n;
		let generated = 0;
		while (generated < bits) {
			const random53 = BigInt(
				Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
			);
			value = (value << 53n) ^ random53;
			generated += 53;
		}
		value = value % max;
	}

	return value;
}

export function pollardsRho(n: bigint): bigint {
	if (n % 2n === 0n) return 2n;
	if (n % 3n === 0n) return 3n;

	let c = randomBigInt(n - 1n) + 1n;
	let x = randomBigInt(n - 2n) + 2n;
	let y = x;
	let d = 1n;

	while (d === 1n) {
		x = (modPow(x, 2n, n) + c) % n;
		y = (modPow(y, 2n, n) + c) % n;
		y = (modPow(y, 2n, n) + c) % n;
		d = gcdBigInt(x > y ? x - y : y - x, n);
		if (d === n) {
			return pollardsRho(n);
		}
	}

	return d;
}

export function factorBigInt(num: bigint): bigint[] {
	if (num === 1n) return [];
	if (isProbablyPrime(num)) return [num];

	const divisor = pollardsRho(num);
	const left = factorBigInt(divisor);
	const right = factorBigInt(num / divisor);
	return [...left, ...right];
}

export function getDivisorsFromPrimeFactors(factors: bigint[]): bigint[] {
	const counts = new Map<bigint, number>();
	for (const factor of factors) {
		counts.set(factor, (counts.get(factor) ?? 0) + 1);
	}

	const entries = Array.from(counts.entries());
	const divisors: bigint[] = [];

	function generate(index: number, current: bigint): void {
		if (index === entries.length) {
			divisors.push(current);
			return;
		}

		const [prime, count] = entries[index];
		let value = 1n;
		for (let i = 0; i <= count; i += 1) {
			generate(index + 1, current * value);
			value *= prime;
		}
	}

	generate(0, 1n);
	return divisors.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function getDivisorPairsFromPrimeFactors(
	n: bigint,
	primeFactors: bigint[],
): Array<[bigint, bigint]> {
	const divisors = getDivisorsFromPrimeFactors(primeFactors);
	const pairs: Array<[bigint, bigint]> = [];
	for (const divisor of divisors) {
		const quotient = n / divisor;
		if (divisor <= quotient) {
			pairs.push([divisor, quotient]);
		}
	}
	return pairs;
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
