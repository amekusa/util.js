import {existsSync, mkdirSync} from 'node:fs';
import {copyFile, writeFile} from 'node:fs/promises';
import {join, dirname, basename} from 'node:path';
import {ext} from '../io.js';

/*!
 * === @amekusa/util.js/io/AssetImporter === *
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
 * This is for copying styles or scripts to a certain HTML directory.
 * @author Satoshi Soma (github.com/amekusa)
 */
export class AssetImporter {
	/**
	 * @param {object} config
	 * @param {boolean} [config.minify=false] - Prefer `*.min.*` version
	 * @param {string} config.src - Source dir to search
	 * @param {string} config.dst - Destination dir
	 */
	constructor(config) {
		this.config = Object.assign({
			minify: false,
			src: '', // source dir to search
			dst: '', // destination dir
		}, config);
		this.queue = [];
		this.results = {
			script: [],
			style:  [],
			asset:  [],
		};
	}
	/**
	 * Adds a new item to import.
	 * @param {string|string[]|object|object[]} newImport
	 */
	add(newImport) {
		if (!Array.isArray(newImport)) newImport = [newImport];
		for (let i = 0; i < newImport.length; i++) {
			let item = newImport[i];
			switch (typeof item) {
			case 'string':
				item = {src: item};
				break;
			case 'object':
				if (Array.isArray(item)) throw `invalid type: array`;
				break;
			default:
				throw `invalid type: ${typeof item}`;
			}
			if (!('src' in item)) throw `'src' property is missing`;
			this.queue.push(Object.assign({
				order: 0,
				resolve: 'local',
				private: false,
			}, item));
		}
	}
	/**
	 * Resolves the location of the given file path
	 * @param {string} file - File path
	 * @param {string} method - Resolution method
	 * @return {string} Resolved file path
	 */
	resolve(file, method) {
		let find = [];
		if (this.config.minify) {
			let _ext = ext(file);
			find.push(ext(file, '.min' + _ext));
		}
		find.push(file);
		for (let i = 0; i < find.length; i++) {
			let r;
			switch (method) {
			case 'require':
				try {
					r = require.resolve(find[i]);
				} catch (e) {
					if (e.code == 'MODULE_NOT_FOUND') continue;
					throw e;
				}
				return r;
			case 'local':
				r = join(this.config.src, find[i]);
				if (existsSync(r)) return r;
				break;
			case 'local:absolute':
			case 'local:abs':
				r = find[i];
				if (existsSync(r)) return r;
				break;
			default:
				throw `invalid resolution method: ${method}`;
			}
		}
		throw `cannot resolve '${file}'`;
	}
	/**
	 * Imports all items in the queue at once.
	 * @return {Promise}
	 */
	import() {
		let tasks = [];
		let typeMap = {
			'.css': 'style',
			'.js': 'script',
		};
		this.queue.sort((a, b) => (Number(a.order) - Number(b.order))); // sort by order
		while (this.queue.length) {
			let item = this.queue.shift();
			let {type, src} = item;
			let url;

			if (!item.resolve) { // no resolution
				url = src;
				if (!type) type = typeMap[ext(src)] || 'asset';
				console.log('---- File Link ----');
				console.log(' type:', type);
				console.log('  src:', src);

			} else { // needs resolution
				let {dst:dstDir, as:dstFile} = item;
				let create = item.resolve == 'create'; // needs creation?
				if (create) {
					if (!dstFile) throw `'as' property is required with {resolve: 'create'}`;
				} else {
					src = this.resolve(src, item.resolve);
					if (!dstFile) dstFile = basename(src);
				}
				if (!type) type = typeMap[ext(dstFile)] || 'asset';
				if (!dstDir) dstDir = type + 's';

				// absolute destination
				url = join(dstDir, dstFile);
				let dst = join(this.config.dst, url);
				dstDir = dirname(dst);
				if (!existsSync(dstDir)) mkdirSync(dstDir, {recursive:true});

				// create/copy file
				if (create) {
					console.log('---- File Creation ----');
					console.log(' type:', type);
					console.log('  dst:', dst);
					tasks.push(writeFile(dst, src));
				} else {
					console.log('---- File Import ----');
					console.log(' type:', type);
					console.log('  src:', src);
					console.log('  dst:', dst);
					tasks.push(copyFile(src, dst));
				}
			}

			if (!item.private) {
				if (!(type in this.results)) this.results[type] = [];
				this.results[type].push({type, url});
			}
		}

		return tasks.length ? Promise.all(tasks) : Promise.resolve();
	}
	/**
	 * Outputs HTML tags for imported items.
	 * @param {string} [type] - Type
	 * @return {string} HTML
	 */
	toHTML(type = null) {
		let r;
		if (type) {
			let tmpl = templates[type];
			if (!tmpl) return '';
			if (Array.isArray(tmpl)) tmpl = tmpl.join('\n');
			let items = this.results[type];
			r = new Array(items.length);
			for (let i = 0; i < items.length; i++) {
				r[i] = tmpl.replaceAll('%s', items[i].url || '');
			}
		} else {
			let keys = Object.keys(this.results);
			r = new Array(keys.length);
			for (let i = 0; i < keys.length; i++) {
				r[i] = this.toHTML(keys[i]);
			}
		}
		return r.join('\n');
	}
}

const templates = {
	script: [
		`<script src="%s"></script>`,
	],
	module: [
		`<script type="module" src="%s"></script>`,
	],
	style: [
		`<link rel="stylesheet" href="%s">`,
	],
};

