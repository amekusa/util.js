/**
 * Rollup Config
 *
 * Use with:
 *   rollup -c rollup.js
 */

import {env} from 'node:process';

const output = {
	sourcemap: env.NODE_ENV != 'production',
	indent: false,
	exports: 'named',
};

export default {
	input: 'src/main.js',
	output: [
		{
			file: 'dist/import/bundle.js',
			format: 'es',
			...output
		},
		{
			file: 'dist/require/bundle.cjs',
			format: 'cjs',
			...output
		},
	],
	treeshake: true,
};
