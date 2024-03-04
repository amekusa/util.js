/*!
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
export function escape(str) {
	// if (!str) return '';
	return `${str}`.replace(escape_find, escape_replace);
}

const escape_map = {
	'&': 'amp',
	'"': 'quot',
	"'": 'apos',
	'<': 'lt',
	'>': 'gt'
};

const escape_find = new RegExp(`["'<>]|(&(?!${Object.values(escape_map).join('|')};))`, 'g');
	// NOTE:
	// - This avoids double-escaping '&' symbols
	// - Regex negative match: (?!word)

const escape_replace = found => `&${escape_map[found]};`;

export default {
	escape,
};