this.amekusa=this.amekusa||{};this.amekusa.util=(function(exports){'use strict';/*!
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
function arr(x) {
	return Array.isArray(x) ? x : [x];
}

/**
 * Checks the type of the given value matches with one of the given types.
 * If a constructor is given to `types`, it checks if `x` is `instanceof` the constructor.
 * @param {any} x
 * @param {...string|function} types - Type or Constructor
 * @return {boolean}
 */
function is(x, ...types) {
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
 * Returns whether the given value can be considered as "empty".
 * @param {any} x
 * @return {boolean}
 */
function isEmpty(x) {
	if (Array.isArray(x)) return x.length == 0;
	switch (typeof x) {
	case 'string':
		return !x;
	case 'object':
		for (let _ in x) return false;
		return true;
	case 'undefined':
		return true;
	}
	return false;
}

/**
 * Returns whether the given value can be considered as "empty" or "falsy".
 * Faster than {@link isEmpty}.
 * @param {any} x
 * @return {boolean}
 */
function isEmptyOrFalsy(x) {
	if (!x) return true;
	if (Array.isArray(x)) return x.length == 0;
	if (typeof x == 'object') {
		for (let _ in x) return false;
	}
	return false;
}

/**
 * @function isEmptyOrFalsey
 * Alias of {@link isEmptyOrFalsy}.
 */
const isEmptyOrFalsey = isEmptyOrFalsy;

/**
 * Removes "empty" values from the given object or array.
 * @param {object|any[]} x
 * @param {number} recurse - Recursion limit
 * @return {object|any[]} modified `x`
 */
function clean(x, recurse = 8) {
	if (recurse) {
		if (Array.isArray(x)) {
			let r = [];
			for (let i = 0; i < x.length; i++) {
				let v = clean(x[i], recurse - 1);
				if (!isEmpty(v)) r.push(v);
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
function merge(x, y, opts = {}) {
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

/**
 * Gets a property from the given object by the given string path.
 * @param {object} obj - Object to traverse
 * @param {string} path - Property names separated with '.'
 * @return {any} value of the found property, or undefined if it's not found
 */
function dig(obj, path) {
	path = path.split('.');
	for (let i = 0; i < path.length; i++) {
		let p = path[i];
		if (typeof obj == 'object' && p in obj) obj = obj[p];
		else return undefined;
	}
	return obj;
}

/**
 * Substitutes the properties of the given data for the references in the given string.
 * @param {string} str - String that contains references to the properties
 * @param {object} data - Object that contains properties to replace the references
 * @param {object} [opts] - Options
 * @return {string} a modified `str`
 */
function subst(str, data, opts = {}) {
	let {
		modifier = null,
		start = '{{',
		end   = '}}',
	} = opts;
	let ref = new RegExp(start + '\\s*([-.\\w]+)\\s*' + end, 'g');
	return str.replaceAll(ref, modifier
		? (_, m1) => (modifier(dig(data, m1), m1, data) || '')
		: (_, m1) => (dig(data, m1) || '')
	);
}var gen=/*#__PURE__*/Object.freeze({__proto__:null,arr:arr,clean:clean,dig:dig,is:is,isEmpty:isEmpty,isEmptyOrFalsey:isEmptyOrFalsey,isEmptyOrFalsy:isEmptyOrFalsy,merge:merge,subst:subst});/*!
 * === @amekusa/util.js/web === *
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
 * Converts non-safe chars in the given string into HTML entities.
 * @param {string} str
 * @return {string}
 */
function escHTML(str) {
	return `${str}`.replace(escHTML_find, escHTML_replace);
}

const escHtml = escHTML; // alias

const escHTML_map = {
	'&': 'amp',
	'"': 'quot',
	"'": 'apos',
	'<': 'lt',
	'>': 'gt'
};

const escHTML_find = new RegExp(`["'<>]|(&(?!${Object.values(escHTML_map).join('|')};))`, 'g');
	// NOTE:
	// - This avoids double-escaping '&' symbols
	// - Regex negative match: (?!word)

const escHTML_replace = found => `&${escHTML_map[found]};`;var web=/*#__PURE__*/Object.freeze({__proto__:null,escHTML:escHTML,escHtml:escHtml});/*!
 * === @amekusa/util.js/time === *
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
 * Coerces the given value into a `Date` object.
 * @param {...any} args - A `Date` object or args to pass to `Date()`
 * @return {Date}
 */
function date(...args) {
	if (!args.length || !args[0]) return new Date();
	if (args[0] instanceof Date) return args[0];
	return new Date(...args);
}

/**
 * Coerces the given value into a number of milliseconds.
 * @param {...args} args - A number or args to pass to `Date()`
 * @return {number} milliseconds
 */
function ms(...args) {
	if (!args.length || !args[0]) return Date.now();
	let x = args[0];
	if (typeof x == 'number') return x;
	if (x instanceof Date) return x.getTime();
	return (new Date(...args)).getTime();
}

/**
 * Adds the given amount of time to a `Date` object.
 * @param {Date} d - Date object to modify
 * @param {number} amount - Millieconds to add
 * @return {Date} modified Date
 */
function addTime(d, amount) {
	d.setTime(d.getTime() + amount);
	return d;
}

/**
 * Subtracts the timezone offset from a `Date` object.
 * @param {Date} d - Date object to modify
 * @return {Date} modified Date
 */
function localize(d) {
	d.setTime(d.getTime() - d.getTimezoneOffset() * 60000);
	return d;
}

/**
 * Quantizes a `Date` object with the given amount of time.
 * @param {Date} d - Date object to modify
 * @param {number} step - Quantization step size
 * @param {string} [method='round'] - `Math` method to apply
 * @return {Date} modified Date
 */
function quantize(d, step, method = 'round') {
	d.setTime(Math[method](d.getTime() / step) * step);
	return d;
}

/**
 * Alias of `quantize(d, step, 'round')`.
 */
function round(d, step) {
	return quantize(d, step, 'round');
}

/**
 * Alias of `quantize(d, step, 'floor')`.
 */
function floor(d, step) {
	return quantize(d, step, 'floor');
}

/**
 * Alias of `quantize(d, step, 'ceil')`.
 */
function ceil(d, step) {
	return quantize(d, step, 'ceil');
}

/**
 * Returns `YYYY`, `MM`, and `DD` representations of a `Date` object.
 * @param {Date} d - Date object
 * @param {string|object} [format]
 * - If omitted, the return value will be an array consists of the three parts.
 * - If a string is passed, the three parts will be joined with the string as a separator.
 * - If an object is passed, the three parts will be assigned as `Y`, `M`, and `D` properties.
 * @return {string|string[]|object}
 */
function ymd(d, format = null) {
	let r = [
		d.getFullYear().toString(),
		(d.getMonth() + 1).toString().padStart(2, '0'),
		d.getDate().toString().padStart(2, '0'),
	];
	switch (typeof format) {
	case 'string':
		return r.join(format);
	case 'object':
		if (!format) return r;
		format.Y = r[0];
		format.M = r[1];
		format.D = r[2];
		return format;
	default:
		if (!format) return r;
		throw `invalid type`;
	}
}

/**
 * Returns `hh`, `mm`, and `ss` representations of a `Date` object.
 * @param {Date} d - Date object
 * @param {string|object} [format]
 * - If omited, the return value will be an array consists of the three parts.
 * - If a string is passed, the three parts will be joined with the string as a separator.
 * - If an object is passed, the three parts will be assigned as `h`, `m`, and `s` properties.
 * @return {string|string[]|object}
 */
function hms(d, format = null) {
	let r = [
		d.getHours().toString().padStart(2, '0'),
		d.getMinutes().toString().padStart(2, '0'),
		d.getSeconds().toString().padStart(2, '0'),
	];
	switch (typeof format) {
	case 'string':
		return r.join(format);
	case 'object':
		if (!format) return r;
		format.h = r[0];
		format.m = r[1];
		format.s = r[2];
		return format;
	default:
		if (!format) return r;
		throw `invalid type`;
	}
}

/**
 * Returns a string representation of the given `Date` in ISO 9075 format, which is standard for MySQL.
 * @param {Date} d - Date object
 * @return {string} a string like `YYYY-MM-DD hh:mm:ss`
 */
function iso9075(d) {
	return ymd(d, '-') + ' ' + hms(d, ':');
}var time=/*#__PURE__*/Object.freeze({__proto__:null,addTime:addTime,ceil:ceil,date:date,floor:floor,hms:hms,iso9075:iso9075,localize:localize,ms:ms,quantize:quantize,round:round,ymd:ymd});exports.arr=arr;exports.clean=clean;exports.dig=dig;exports.gen=gen;exports.is=is;exports.isEmpty=isEmpty;exports.isEmptyOrFalsey=isEmptyOrFalsey;exports.isEmptyOrFalsy=isEmptyOrFalsy;exports.merge=merge;exports.subst=subst;exports.time=time;exports.web=web;return exports;})({});