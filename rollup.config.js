/**
 * Rollup Config
 *
 * Use with:
 *   rollup -c
 */

import {env} from 'node:process';
import terser from '@rollup/plugin-terser';

const name = 'amekusa.util';

const prod = env.NODE_ENV == 'production';
const treeshake = prod; // treeshake options
const output = {
	name,
	exports: 'named',
	sourcemap: !prod,
	compact: prod,
	indent: !prod,
};

const tasks = [
	{
		// for node
		input: 'src/main.js',
		treeshake,
		output: [
			{
				file: `dist/${name}.js`,
				format: 'es',
				...output
			},
			{
				file: `dist/${name}.cjs`,
				format: 'cjs',
				...output
			},
		],
	},
	{
		// for browser
		input: 'src/main.br.js',
		treeshake,
		output: [
			{
				// for <script>
				file: `dist/${name}.br.js`,
				format: 'iife',
				...output
			},
			{
				// for <script type="module">
				file: `dist/${name}.br.es.js`,
				format: 'es',
				...output
			},
		],
	},
];

if (prod) {
	tasks.push({
		// minifiled versions
		input: 'src/main.br.js',
		treeshake,
		output: [
			{
				file: `dist/${name}.br.min.js`,
				format: 'iife',
				...output
			},
			{
				file: `dist/${name}.br.es.min.js`,
				format: 'es',
				...output
			},
		],
		plugins: [
			terser()
		],
	});
}

export default tasks;
