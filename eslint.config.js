export default [
	{
		ignores: [
			'node_modules/',
			'dist/',
			'docs/',
		]
	},
	{
		files: [
			'src/**/*.js',
			'test/**/*.js',
		],
		rules: {
			semi: ['error', 'always'],
			indent: ['error', 'tab', {
				ignoredNodes: ['SwitchCase']
			}]
		}
	}
];
