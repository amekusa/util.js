import {test, web} from '../dist/amekusa.util.js';

const {testFn} = test;

testFn(web.escHTML, {
	'anchor tag': {
		args:  ['<a href="https://example.com/index.html?uid=1000&q=hello+world">Click Me!</a>'],
		return: '&lt;a href=&quot;https://example.com/index.html?uid=1000&amp;q=hello+world&quot;&gt;Click Me!&lt;/a&gt;'
	},
	'avoid double escape': {
		args:  ['&lt;a href=&quot;https://example.com/index.html?uid=1000&amp;q=hello+world&quot;&gt;Click Me!&lt;/a&gt;'],
		return: '&lt;a href=&quot;https://example.com/index.html?uid=1000&amp;q=hello+world&quot;&gt;Click Me!&lt;/a&gt;'
	},
}, 'strictEqual');
