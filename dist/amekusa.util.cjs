'use strict';var os=require('node:os'),fs=require('node:fs'),fsp=require('node:fs/promises'),path=require('node:path'),node_stream=require('node:stream'),node_process=require('node:process'),node_child_process=require('node:child_process'),assert=require('node:assert');function _interopNamespaceDefault(e){var n=Object.create(null);if(e){Object.keys(e).forEach(function(k){if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:function(){return e[k]}});}})}n.default=e;return Object.freeze(n)}var fsp__namespace=/*#__PURE__*/_interopNamespaceDefault(fsp);/*!
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
function clean$1(x, recurse = 8) {
	if (recurse) {
		if (Array.isArray(x)) {
			let r = [];
			for (let i = 0; i < x.length; i++) {
				let v = clean$1(x[i], recurse - 1);
				if (!isEmpty(v)) r.push(v);
			}
			return r;
		}
		if (typeof x == 'object') {
			let r = {};
			for (let k in x) {
				let v = clean$1(x[k], recurse - 1);
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
function merge$1(x, y, opts = {}) {
	if (!('recurse' in opts)) opts.recurse = 8;
	switch (Array.isArray(x) + Array.isArray(y)) {
	case 0: // no array
		if (opts.recurse && x && y && typeof x == 'object' && typeof y == 'object') {
			opts.recurse--;
			for (let k in y) x[k] = merge$1(x[k], y[k], opts);
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
}var gen=/*#__PURE__*/Object.freeze({__proto__:null,arr:arr,clean:clean$1,dig:dig,is:is,isEmpty:isEmpty,isEmptyOrFalsey:isEmptyOrFalsey,isEmptyOrFalsy:isEmptyOrFalsy,merge:merge$1,subst:subst});/*!
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
}var time=/*#__PURE__*/Object.freeze({__proto__:null,addTime:addTime,ceil:ceil,date:date,floor:floor,hms:hms,iso9075:iso9075,localize:localize,ms:ms,quantize:quantize,round:round,ymd:ymd});/*!
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
function exec(cmd, opts = {}) {
	opts = Object.assign({
		dryRun: false,
	}, opts);
	return new Promise((resolve, reject) => {
		if (opts.dryRun) {
			console.log(`[DRYRUN] ${cmd}`);
			return resolve();
		}
		node_child_process.exec(cmd, (err, stdout) => {
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
function args(args, opts = {}) {
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
function prod(set = undefined) {
	let value = 'production';
	if (set != undefined) node_process.env.NODE_ENV = set ? value : '';
	return node_process.env.NODE_ENV == value;
}

/**
 * Returns if NODE_ENV is 'development'
 * @param {any} [set]
 * @return {bool}
 */
function dev(set = undefined) {
	let value = 'development';
	if (set != undefined) node_process.env.NODE_ENV = set ? value : '';
	return node_process.env.NODE_ENV == value;
}var sh=/*#__PURE__*/Object.freeze({__proto__:null,args:args,dev:dev,exec:exec,prod:prod});/*!
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
class AssetImporter {
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
			case 'module':
				try {
					r = require.resolve(find[i]);
				} catch (e) {
					if (e.code == 'MODULE_NOT_FOUND') continue;
					throw e;
				}
				return r;
			case 'local':
				r = path.join(this.config.src, find[i]);
				if (fs.existsSync(r)) return r;
				break;
			case 'local:absolute':
			case 'local:abs':
				r = find[i];
				if (fs.existsSync(r)) return r;
				break;
			default:
				throw `invalid resolution method: ${method}`;
			}
		}
		throw `cannot resolve '${file}'`;
	}
	/**
	 * Imports all items in the queue at once.
	 */
	import() {
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
					if (!dstFile) dstFile = path.basename(src);
				}
				if (!type) type = typeMap[ext(dstFile)] || 'asset';
				if (!dstDir) dstDir = type + 's';

				// absolute destination
				url = path.join(dstDir, dstFile);
				let dst = path.join(this.config.dst, url);
				dstDir = path.dirname(dst);
				if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, {recursive:true});
				if (create) {
					fs.writeFileSync(dst, src);
					console.log('---- File Creation ----');
					console.log(' type:', type);
					console.log('  dst:', dst);
				} else {
					fs.copyFileSync(src, dst);
					console.log('---- File Import ----');
					console.log(' type:', type);
					console.log('  src:', src);
					console.log('  dst:', dst);
				}
			}

			if (!item.private) {
				if (!(type in this.results)) this.results[type] = [];
				this.results[type].push({type, url});
			}
		}
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
	'script':
		`<script src="%s"></script>`,

	'script:module':
		`<script type="module" src="%s"></script>`,

	'style':
		`<link rel="stylesheet" href="%s">`,
};/**
 * Alias of `os.homedir()`.
 * @type {string}
 */
const home = os.homedir();

/**
 * Returns or overwrites the extension of the given file path.
 * @param {string} file - File path
 * @param {string} [set] - New extension
 * @return {string} the extension, or a modified file path with the new extension
 */
function ext(file, set = null) {
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
function find(file, dirs = [], opts = {}) {
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
function untilde(file, replace = home) {
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
function clean(dir, pattern = null, opts = {}) {
	if (pattern && typeof pattern == 'string') pattern = new RegExp(pattern);
	let {
		recursive = false,
		types = {file: true},
	} = opts;
	return fsp__namespace.readdir(dir, {recursive, withFileTypes: true}).then(files => {
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
			tasks.push(fsp__namespace.rm(f, {force: true, recursive: true}).then(() => f));
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
function copy(src, dst) {
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
		return fsp__namespace.mkdir(path.dirname(_dst), {recursive: true}).then(fsp__namespace.copyFile(_src, _dst));
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
function modifyStream(fn) {
	return new node_stream.Transform({
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
}var io=/*#__PURE__*/Object.freeze({__proto__:null,AssetImporter:AssetImporter,clean:clean,copy:copy,ext:ext,find:find,home:home,modifyStream:modifyStream,untilde:untilde});const merge = Object.assign;

/*!
 * === @amekusa/util.js/test === *
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
 * @private
 */
function invalid(...args) {
	throw new InvalidTest(...args);
}

class InvalidTest extends Error {
}

function assertProps(obj, props, opts = {}) {
	if (typeof props != 'object') invalid(`'props' must be an object`);
	for (let k in props) {
		let v = props[k];
		if (!(k in obj)) assert.fail(`no such property as '${k}'`);
		assertEqual(obj[k], v, merge({msg: `property '${k}' failed`}, opts));
	}
}

function assertEqual(actual, expected, opts = {}) {
	let equal, deepEqual;
	if (opts.strict) {
		equal = assert.strictEqual;
		deepEqual = assert.deepStrictEqual;
	} else {
		equal = assert.equal;
		deepEqual = assert.deepEqual;
	}
	try {
		if (expected) {
			switch (typeof expected) {
			case 'object':
				let proto = Object.getPrototypeOf(expected);
				if (proto === Object.prototype || proto === Array.prototype)
					return deepEqual(actual, expected);
				return equal(actual, expected);
			}
		}
		return equal(actual, expected);
	} catch (e) {
		if (opts.msg) e.message = opts.msg + '\n' + e.message;
		throw e;
	}
}

function assertType(value, type, msg = '') {
	try {
		if (typeof type == 'string') assert.equal(typeof value, type);
		else assert.ok(value instanceof type);
	} catch (e) {
		if (msg) e.message = msg + '\n' + e.message;
		throw e;
	}
}

/**
 * @param {function} fn
 * @param {Array|object} cases
 * @param {string|function} [assertFn]
 */
function testFn(fn, cases, opts = {}) {
	let testCase = (c, title) => {
		it(title, () => {
			if (typeof c != 'object') invalid(`a test case must be an object`);

			// ---- call function ----
			let args = [];
			if ('args' in c) { // args to pass
				if (!Array.isArray(c.args)) invalid(`'args' must be an array`);
				args = c.args;
				delete c.args;
			}
			let r = fn(...args);

			// ---- check the result ----
			let check = {
				returnType() {
					assertType(r, c.returnType, `return type failed`);
				},
				return() {
					assertEqual(r, c.return, merge({msg: `return value failed`}, opts));
				},
				test() {
					if (typeof c.test != 'function') invalid(`'test' must be a function`);
					c.test(r, ...args);
				}
			};
			for (let k in c) {
				if (check[k]) check[k]();
				else invalid(`invalid property: '${k}' (available properties: ${Object.keys(check).join(', ')})`);
			}
		});
	};
	describe('function: ' + (fn.displayName || fn.name), () => {
		if (Array.isArray(cases)) {
			for (let i = 0; i < cases.length; i++) {
				let c = cases[i];
				let title = `#${i}`;
				if (Array.isArray(c.args)) title += ' ' + c.args.join(', ');
				testCase(c, title);
			}
		} else {
			let keys = Object.keys(cases);
			for (let i = 0; i < keys.length; i++) {
				testCase(cases[keys[i]], `#${i} ${keys[i]}`);
			}
		}
	});
}

/**
 * @param {function} construct - Constructor or function that returns an instance
 * @param {string} method - Method name
 * @param {object|object[]} cases - Cases
 * @param {object} [opts] - Options
 */
function testMethod(construct, method, cases, opts = {}) {
	let testCase = (c, title) => {
		it(title, () => {
			if (typeof c != 'object') invalid(`a test case must be an object`);

			// ---- instantiate ----
			let obj;
			if (opts.static) {
				if ('initArgs' in c) invalid(`'initArgs' is not available for a static method`);
				if ('prepare' in c) invalid(`'prepare' is not available for a static method`);
				obj = construct;
			} else {
				let initArgs = [];
				if ('initArgs' in c) {
					if (!Array.isArray(c.initArgs)) invalid(`'initArgs' must be an array`);
					initArgs = c.initArgs;
					delete c.initArgs;
				}
				try {
					obj = new construct(...initArgs);
				} catch (e) {
					obj = construct(...initArgs);
				}
				if ('prepare' in c) {
					if (typeof c.prepare != 'function') invalid(`'prepare' must be a function`);
					c.prepare(obj);
					delete c.prepare;
				}
			}

			// ---- call method ----
			if (!(method in obj)) invalid(`no such method as '${method}'`);
			let args = [];
			if ('args' in c) { // args to pass
				if (!Array.isArray(c.args)) invalid(`'args' must be an array`);
				args = c.args;
				delete c.args;
			}
			let r = obj[method](...args);

			// ---- check the result ----
			let check = {
				returnsSelf() { // check if returns itself
					assert.strictEqual(r, obj, `must return self`);
				},
				returnType() { // check return type
					assertType(r, c.returnType, `return type failed`);
				},
				return() { // check return value
					assertEqual(r, c.return, merge({msg: `return failed`}, opts));
				},
				props() { // check properties
					assertProps(obj, c.props, opts);
				},
				test() { // custom test
					if (typeof c.test != 'function') invalid(`'test' must be a function`);
					c.test(r, obj, ...args);
				}
			};
			for (let k in c) {
				if (check[k]) check[k]();
				else invalid(`invalid property: '${k}' (available properties: ${Object.keys(check).join(', ')})`);
			}
		});
	};
	describe('method: ' + method, () => {
		if (Array.isArray(cases)) {
			for (let i = 0; i < cases.length; i++) {
				let c = cases[i];
				let title = `#${i}`;
				if (Array.isArray(c.args)) title += ' ' + c.args.join(', ');
				testCase(c, title);
			}
		} else {
			let keys = Object.keys(cases);
			for (let i = 0; i < keys.length; i++) {
				testCase(cases[keys[i]], `#${i} ${keys[i]}`);
			}
		}
	});
}

/**
 * @param {function} construct - Constructor or function that returns an instance
 * @param {object|object[]} cases - Cases
 * @param {object} [opts] - Options
 */
function testInstance(construct, cases, opts = {}) {
	let testCase = (c, title) => {
		it(title, () => {
			if (typeof c != 'object') invalid(`a test case must be an object`);

			// ---- instantiate ----
			let args = [];
			if ('args' in c) {
				if (!Array.isArray(c.args)) invalid(`'args' must be an array`);
				args = c.args;
				delete c.args;
			}
			let obj;
			try {
				obj = new construct(...args);
			} catch (e) {
				obj = construct(...args);
			}

			// ---- check the result ----
			let check = {
				props() { // check properties
					assertProps(obj, c.props, opts);
				},
				test() { // custom check
					if (typeof c.test != 'function') invalid(`'test' must be a function`);
					c.test(obj, ...args);
				}
			};
			for (let k in c) {
				if (check[k]) check[k]();
				else invalid(`invalid property: '${k}' (available properties: ${Object.keys(check).join(', ')})`);
			}
		});
	};
	describe(construct.name, () => {
		if (Array.isArray(cases)) {
			for (let i = 0; i < cases.length; i++) {
				let c = cases[i];
				let title = `#${i}`;
				if (Array.isArray(c.args)) title += ' ' + c.args.join(', ');
				testCase(c, title);
			}
		} else {
			let keys = Object.keys(cases);
			for (let i = 0; i < keys.length; i++) {
				testCase(cases[keys[i]], `#${i} ${keys[i]}`);
			}
		}
	});
}var test=/*#__PURE__*/Object.freeze({__proto__:null,InvalidTest:InvalidTest,assertEqual:assertEqual,assertProps:assertProps,assertType:assertType,testFn:testFn,testInstance:testInstance,testMethod:testMethod});exports.arr=arr;exports.clean=clean$1;exports.dig=dig;exports.gen=gen;exports.io=io;exports.is=is;exports.isEmpty=isEmpty;exports.isEmptyOrFalsey=isEmptyOrFalsey;exports.isEmptyOrFalsy=isEmptyOrFalsy;exports.merge=merge$1;exports.sh=sh;exports.subst=subst;exports.test=test;exports.time=time;exports.web=web;