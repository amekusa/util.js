/**
 * Rollup Config
 *
 * Use with:
 *   rollup -c
 */

import {env} from 'node:process';
const prod = env.NODE_ENV == 'production';

const output = {
	sourcemap: !prod,
	indent: false,
	exports: 'named', // this is necessary if the entry point has named and default exports together
};

export default {
	input: 'src/main.js',
	output: [
		{
			file: 'dist/bundle.js',
			format: 'es',
			...output
		},
		{
			file: 'dist/bundle.cjs',
			format: 'cjs',
			...output
		},
	],
	treeshake: prod,
};
