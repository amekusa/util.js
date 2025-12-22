/*!
 * === @amekusa/util.js/gen === *
 * MIT License
 *
 * Copyright (c) 2024 Satoshi Soma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Coerces the given value into an array.
 * @param {any} x
 * @return {any[]}
 */
export function arr(x) {
	return Array.isArray(x) ? x : [x];
}

/**
 * Checks the type of the given value matches with one of the given types.
 * If a constructor is given to `types`, it checks if `x` is `instanceof` the constructor.
 * @param {any} x
 * @param {...string|function} types - Type or Constructor
 * @return {boolean}
 */
export function is(x, ...types) {
	let t = typeof x;
	for (let i = 0; i < types.length; i++) {
		let v = types[i];
		if (typeof v == 'string') {
			if (v == 'array') {
				if (Array.isArray(x)) return true;
			} else if (t == v) return true;
		} else if (x instanceof v) return true;
	}
	return false;
}

/**
 * Returns whether the given value can be considered as "empty" or "falsey".
 * @param {any} x
 * @return {boolean}
 */
export function isEmpty(x) {
	if (!x) return true;
	if (Array.isArray(x)) return x.length == 0;
	if (typeof x == 'object') {
		for (let _ in x) return false;
	}
	return false;
}

/**
 * Removes "empty" values from the given object or array.
 * @param {object|any[]} x
 * @param {number} recurse - Recursion limit
 * @return {object|any[]} modified `x`
 */
export function clean(x, recurse = 8) {
	if (recurse) {
		if (Array.isArray(x)) {
			let r = [];
			for (let i = 0; i < x.length; i++) {
				let I = clean(x[i], recurse - 1);
				if (!isEmpty(I)) r.push(I);
			}
			return r;
		}
		if (typeof x == 'object') {
			let r = {};
			for (let k in x) {
				let v = clean(x[k], recurse - 1);
				if (!isEmpty(v)) r[k] = v;
			}
			return r;
		}
	}
	return x;
}

/**
 * Merges the 2nd object into the 1st object recursively (deep-merge). The 1st object will be modified.
 * @param {object} x - The 1st object
 * @param {object} y - The 2nd object
 * @param {object} [opts] - Options
 * @param {number} opts.recurse=8 - Recurstion limit. Negative number means unlimited
 * @param {boolean|string} opts.mergeArrays - How to merge arrays
 * - `true`: merge x with y
 * - 'push': push y elements to x
 * - 'concat': concat x and y
 * - other: replace x with y
 * @return {object} The 1st object
 */
export function merge(x, y, opts = {}) {
	if (!('recurse' in opts)) opts.recurse = 8;
	switch (Array.isArray(x) + Array.isArray(y)) {
	case 0: // no array
		if (opts.recurse && x && y && typeof x == 'object' && typeof y == 'object') {
			opts.recurse--;
			for (let k in y) x[k] = merge(x[k], y[k], opts);
			opts.recurse++;
			return x;
		}
	case 1: // 1 array
		return y;
	}
	// 2 arrays
	switch (opts.mergeArrays) {
	case true:
		for (let i = 0; i < y.length; i++) {
			if (!x.includes(y[i])) x.push(y[i]);
		}
		return x;
	case 'push':
		x.push(...y);
		return x;
	case 'concat':
		return x.concat(y);
	}
	return y;
}

