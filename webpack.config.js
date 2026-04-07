const path = require('path');
const HTMLPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: {
		index: './src/index.tsx',
	},
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							compilerOptions: { noEmit: false },
						},
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader',
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [{ from: 'manifest.json', to: '../manifest.json' }],
		}),
		...getHtmlPlugins(['index']),
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		path: path.join(__dirname, 'dist/js'),
		filename: '[name].js',
	},
	performance: {
		hints: false,
		maxEntrypointSize: 512000,
		maxAssetSize: 512000,
	},
};

function getHtmlPlugins(chunks) {
	return chunks.map(
		(chunk) =>
			new HTMLPlugin({
				title: 'Days until',
				filename: `${chunk}.html`,
				chunks: [chunk],
				favicon: './public/favicon.ico',
			})
	);
}
