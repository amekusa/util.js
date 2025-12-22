import os from 'node:os';
import fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import {Transform} from 'node:stream';
import {exec} from './sh.js';

/*!
 * === @amekusa/util.js/io === *
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
 * Alias of `os.homedir()`.
 * @type {string}
 */
export const home = os.homedir();

/**
 * Returns or overwrites the extension of the given file path.
 * @param {string} file - File path
 * @param {string} [set] - New extension
 * @return {string} the extension, or a modified file path with the new extension
 */
export function ext(file, set = null) {
	let dot = file.lastIndexOf('.');
	return typeof set == 'string'
		? (dot < 0 ? (file + set) : (file.substring(0, dot) + set))
		: (dot < 0 ? '' : file.substring(dot));
}

/**
 * Searches the given file path in the given directories.
 * @param {string} file - File to find
 * @param {string[]} dirs - Array of directories to search
 * @param {object} [opts] - Options
 * @param {boolean} [opts.allowAbsolute=true] - If true, `file` can be an absolute path
 * @return {string|boolean} found file path, or false if not found
 */
export function find(file, dirs = [], opts = {}) {
	let {allowAbsolute = true} = opts;
	if (allowAbsolute && path.isAbsolute(file)) return fs.existsSync(file) ? file : false;
	for (let i = 0; i < dirs.length; i++) {
		let find = path.join(dirs[i], file);
		if (fs.existsSync(find)) return find;
	}
	return false;
}

/**
 * Replaces the beginning `~` character with `os.homedir()`.
 * @param {string} file - File path
 * @param {string} [replace=os.homedir()] - Replacement
 * @return {string} modified `file`
 */
export function untilde(file, replace = home) {
	if (!file.startsWith('~')) return file;
	if (file.length == 1) return replace;
	if (file.startsWith(path.sep, 1)) return replace + file.substring(1);
	return file;
}

/**
 * Deletes the files in the given directory.
 * @param {string} dir - Directory to clean
 * @param {string|RegExp} [pattern] - File pattern
 * @param {object} [opts] - Options
 * @param {boolean} [opts.recursive=false] - Searches recursively
 * @param {object} [opts.types] - File types to delete
 * @param {boolean} [opts.types.any=false] - Any type
 * @param {boolean} [opts.types.file=true] - Regular file
 * @param {boolean} [opts.types.dir=false] - Directory
 * @param {boolean} [opts.types.symlink=false] - Symbolic link
 * @return {Promise} a promise resolved with the deleted file paths
 */
export function clean(dir, pattern = null, opts = {}) {
	if (pattern && typeof pattern == 'string') pattern = new RegExp(pattern);
	let {
		recursive = false,
		types = {file: true},
	} = opts;
	return fsp.readdir(dir, {recursive, withFileTypes: true}).then(files => {
		let tasks = [];
		for (let i = 0; i < files.length; i++) {
			let f = files[i];
			if (!types.any) {
				if (f.isFile()) {
					if (!types.file) continue;
				} else if (f.isDirectory()) {
					if (!types.dir) continue;
				} else if (f.isSymbolicLink()) {
					if (!types.symlink) continue;
				}
			}
			f = path.join(dir, f.name);
			if (pattern && !f.match(pattern)) continue;
			tasks.push(fsp.rm(f, {force: true, recursive: true}).then(() => f));
		}
		return tasks.length ? Promise.all(tasks) : false;
	});
}

/**
 * Copies the given file(s) to another directory
 * @param {string|object|string[]|object[]} src
 * @param {string} dst Base destination directory
 * @return {Promise}
 */
export function copy(src, dst) {
	return Promise.all((Array.isArray(src) ? src : [src]).map(item => {
		let _src, _dst;
		switch (typeof item) {
		case 'object':
			_src = item.src;
			_dst = item.dst;
			break;
		case 'string':
			_src = item;
			break;
		default:
			throw 'invalid type';
		}
		_dst = path.join(dst, _dst || path.basename(_src));
		return fsp.mkdir(path.dirname(_dst), {recursive: true}).then(fsp.copyFile(_src, _dst));
	}));
}

/**
 * Returns a Transform stream object with the given function as its transform() method.
 * `fn` must return a string which is to be the new content, or a Promise which resolves a string.
 *
 * @example
 * return gulp.src(src)
 *   .pipe(modifyStream((data, enc) => {
 *     // do stuff
 *     return newData;
 *   }));
 *
 * @param {function} fn
 * @return {Transform}
 */
export function modifyStream(fn) {
	return new Transform({
		objectMode: true,
		transform(file, enc, done) {
			let r = fn(file.contents.toString(enc), enc);
			if (r instanceof Promise) {
				r.then(modified => {
					file.contents = Buffer.from(modified, enc);
					this.push(file);
					done();
				});
			} else {
				file.contents = Buffer.from(r, enc);
				this.push(file);
				done();
			}
		}
	});
}

