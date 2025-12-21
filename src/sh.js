import {env} from 'node:process';
import {exec as _exec} from 'node:child_process';

/*!
 * === @amekusa/util.js/sh === *
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
 * Executes the given shell command, and returns a Promise that resolves the stdout
 * @param {string} cmd
 * @param {object} [opts]
 * @return {Promise}
 */
export function exec(cmd, opts = {}) {
	opts = Object.assign({
		dryRun: false,
	}, opts);
	return new Promise((resolve, reject) => {
		if (opts.dryRun) {
			console.log(`[DRYRUN] ${cmd}`);
			return resolve();
		}
		_exec(cmd, (err, stdout) => {
			return err ? reject(err) : resolve(stdout);
		});
	});
}

/**
 * Converts the given objects to shell arguments in a string form
 * @param {object} args
 * @param {object} [opts]
 * @return {string}
 */
export function args(args, opts = {}) {
	opts = Object.assign({
		sep: ' ', // key-value separator
	}, opts);
	let r = [];
	for (let key in args) {
		let value = args[key];
		if (isNaN(key)) { // non-numeric key
			switch (typeof value) {
			case 'boolean':
				if (value) r.push(key);
				break;
			case 'number':
				r.push(key + opts.sep + value);
				break;
			case 'string':
				r.push(key + opts.sep + `"${value}"`);
				break;
			}
		} else { // numeric key
			r.push(value);
		}
	}
	return r.join(' ');
}

/**
 * Returns if NODE_ENV is 'production'
 * @param {any} [set]
 * @return {bool}
 */
export function prod(set = undefined) {
	let value = 'production';
	if (set != undefined) env.NODE_ENV = set ? value : '';
	return env.NODE_ENV == value;
}

/**
 * Returns if NODE_ENV is 'development'
 * @param {any} [set]
 * @return {bool}
 */
export function dev(set = undefined) {
	let value = 'development';
	if (set != undefined) env.NODE_ENV = set ? value : '';
	return env.NODE_ENV == value;
}

