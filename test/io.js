import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test, io} from '../dist/amekusa.util.js';
import {testInstance, testMethod} from '../src/test.js';
const {testFn} = test;

testFn(io.ext, {
	'get extension': {
		args: ['foo.txt'],
		return: '.txt'
	},
	'get extension (no extension)': {
		args: ['foo'],
		return: ''
	},
	'set extension': {
		args: ['foo.txt', '.md'],
		return: 'foo.md'
	},
	'set extension (no extension)': {
		args: ['foo', '.txt'],
		return: 'foo.txt'
	},
	'remove extension': {
		args: ['foo.txt', ''],
		return: 'foo'
	}
});

testFn(io.untilde, {
	'~': {
		args: ['~', 'Home'],
		return: 'Home'
	},
	'~/foo': {
		args: ['~/foo', 'Home'],
		return: 'Home/foo'
	},
	'foo': {
		args: ['foo', 'Home'],
		return: 'foo'
	}
});

testInstance(io.AssetImporter, {
	'default config': {
		test(inst) {
			let {
				minify,
				src,
				dst,
			} = inst.config;
			eq(minify, false);
			eq(src, '');
			eq(dst, '');
		}
	},
	'config': {
		args: [{
			minify: true,
			src: 'foo',
			dst: 'bar',
		}],
		test(inst) {
			let {
				minify,
				src,
				dst,
			} = inst.config;
			eq(minify, true);
			eq(src, 'foo');
			eq(dst, 'bar');
		}
	}
});

testMethod(io.AssetImporter, 'add', {
	'string': {
		args: ['foo'],
		test(ret, inst) {
			let {queue} = inst;
			eq(queue.length, 1);
			let {src, resolve} = queue[0];
			eq(src, 'foo');
			eq(resolve, 'local');
		}
	},
	'string array': {
		args: [['foo', 'bar']],
		test(ret, inst) {
			let {queue} = inst;
			eq(queue.length, 2);
			eq(queue[0].src, 'foo');
			eq(queue[1].src, 'bar');
		}
	}
});
