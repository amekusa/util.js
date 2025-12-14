import assert from 'node:assert';
const
	ok = assert.ok,
	eq = assert.equal,
	seq = assert.strictEqual,
	deq = assert.deepEqual,
	dseq = assert.deepStrictEqual;

import {test} from '@amekusa/nodeutil';
import {time} from '../dist/bundle.js';

const {testFn} = test;

const min  = 60 * 1000;
const hour = 60 * min;
const day  = 24 * hour;

testFn(time.date, {
	'no args': {
		args: [],
		returnType: Date,
		test(r) {
			let diff = r.getTime() - Date.now();
			ok(diff <= 1);
		}
	},
	'null': {
		args: [null],
		returnType: Date,
		test(r) {
			let diff = r.getTime() - Date.now();
			ok(diff <= 1);
		}
	},
	'string': {
		args: ['2000-01-23'],
		returnType: Date,
		test(r) {
			let y = r.getFullYear();
			let m = r.getMonth();
			let d = r.getDate();
			eq(y, 2000);
			eq(m, 0);
			eq(d, 23);
		}
	}
});

testFn(time.ms, {
	'no args': {
		args: [],
		returnType: 'number',
		test(r) {
			let diff = r - Date.now();
			ok(diff <= 1);
		}
	},
	'null': {
		args: [null],
		returnType: 'number',
		test(r) {
			let diff = r - Date.now();
			ok(diff <= 1);
		}
	},
	'string': {
		args: ['2000-01-23'],
		returnType: 'number',
		test(r) {
			let date = new Date('2000-01-23');
			eq(r, date.getTime());
		}
	}
});

testFn(time.addTime, {
	'add 1 day': {
		args: [new Date('2000-01-23'), day],
		returnType: Date,
		test(r, date) {
			seq(r, date);
			eq(date.getTime(), (new Date('2000-01-24')).getTime());
		}
	}
});

testFn(time.localize, {
	'': {
		args: [new Date('January 23, 2000 00:00:00 GMT+09:00')],
		returnType: Date,
		test(r, date) {
			seq(r, date);
			let utc = new Date('January 23, 2000 00:00:00 GMT+00:00');
			eq(date.getTime(), utc.getTime());
		}
	}
});

testFn(time.quantize, {
	'step = 1 min': {
		args: [new Date('2000-01-23 00:12:34'), min],
		returnType: Date,
		test(r, date) {
			seq(r, date);
			eq(date.getTime(), (new Date('2000-01-23 00:13:00')).getTime());
		}
	},
	'step = 1 min (floor)': {
		args: [new Date('2000-01-23 00:12:34'), min, 'floor'],
		returnType: Date,
		test(r, date) {
			seq(r, date);
			eq(date.getTime(), (new Date('2000-01-23 00:12:00')).getTime());
		}
	},
	'step = 1 min (ceil)': {
		args: [new Date('2000-01-23 00:12:34'), min, 'ceil'],
		returnType: Date,
		test(r, date) {
			seq(r, date);
			eq(date.getTime(), (new Date('2000-01-23 00:13:00')).getTime());
		}
	}
});

testFn(time.ymd, {
	'format = default': {
		args: [new Date('2000-01-23')],
		returnType: Array,
		return: ['2000', '01', '23']
	},
	'format = /': {
		args: [new Date('2000-01-23'), '/'],
		returnType: 'string',
		return: '2000/01/23'
	},
	'format = <empty-string>': {
		args: [new Date('2000-01-23'), ''],
		returnType: 'string',
		return: '20000123'
	},
	'format = object': {
		args: [new Date('2000-01-23'), {}],
		returnType: 'object',
		return: {
			Y: '2000',
			M: '01',
			D: '23'
		}
	}
});

testFn(time.hms, {
	'format = default': {
		args: [new Date('2000-01-23 12:34:56')],
		returnType: Array,
		return: ['12', '34', '56']
	},
	'format = /': {
		args: [new Date('2000-01-23 12:34:56'), '/'],
		returnType: 'string',
		return: '12/34/56'
	},
	'format = <empty-string>': {
		args: [new Date('2000-01-23 12:34:56'), ''],
		returnType: 'string',
		return: '123456'
	},
	'format = object': {
		args: [new Date('2000-01-23 12:34:56'), {}],
		returnType: 'object',
		return: {
			h: '12',
			m: '34',
			s: '56'
		}
	}
});

testFn(time.iso9075, {
	'': {
		args: [new Date('2000-01-23 12:34:56')],
		returnType: 'string',
		return: '2000-01-23 12:34:56'
	}
});

