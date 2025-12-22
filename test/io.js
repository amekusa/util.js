import assert from 'node:assert';
const
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test, io} from '../dist/amekusa.util.js';
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

