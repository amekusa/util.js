/*!
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
export function date(...args) {
	if (!args.length || !args[0]) return new Date();
	if (args[0] instanceof Date) return args[0];
	return new Date(...args);
}

/**
 * Coerces the given value into a number of milliseconds.
 * @param {...args} args - A number or args to pass to `Date()`
 * @return {number} milliseconds
 */
export function ms(...args) {
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
export function addTime(d, amount) {
	d.setTime(d.getTime() + amount);
	return d;
}

/**
 * Subtracts the timezone offset from a `Date` object.
 * @param {Date} d - Date object to modify
 * @return {Date} modified Date
 */
export function localize(d) {
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
export function quantize(d, step, method = 'round') {
	d.setTime(Math[method](d.getTime() / step) * step);
	return d;
}

/**
 * Alias of `quantize(d, step, 'round')`.
 */
export function round(d, step) {
	return quantize(d, step, 'round');
}

/**
 * Alias of `quantize(d, step, 'floor')`.
 */
export function floor(d, step) {
	return quantize(d, step, 'floor');
}

/**
 * Alias of `quantize(d, step, 'ceil')`.
 */
export function ceil(d, step) {
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
export function ymd(d, format = null) {
	let r = [
		d.getFullYear().toString(),
		(d.getMonth() + 1).toString().padStart(2, '0'),
		d.getDate().toString().padStart(2, '0'),
	];
	if (!format) return r;
	switch (typeof format) {
	case 'string':
		return r.join(format);
	case 'object':
		format.Y = r[0];
		format.M = r[1];
		format.D = r[2];
		return format;
	default:
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
export function hms(d, format = null) {
	let r = [
		d.getHours().toString().padStart(2, '0'),
		d.getMinutes().toString().padStart(2, '0'),
		d.getSeconds().toString().padStart(2, '0'),
	];
	if (!format) return r;
	switch (typeof format) {
	case 'string':
		return r.join(format);
	case 'object':
		format.h = r[0];
		format.m = r[1];
		format.s = r[2];
		return format;
	default:
		throw `invalid type`;
	}
}

/**
 * Returns a string representation of the given `Date` in ISO 9075 format, which is standard for MySQL.
 * @param {Date} d - Date object
 * @return {string} a string like `YYYY-MM-DD hh:mm:ss`
 */
export function iso9075(d) {
	return ymd(d, '-') + ' ' + hms(d, ':');
}

