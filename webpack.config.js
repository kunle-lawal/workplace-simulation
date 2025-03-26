const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
	entry: "./app/index.ts",
	mode: "development",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "index.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: "./index.html",
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "style.css", to: "style.css" },
				{ from: "404.html", to: "404.html" },
			],
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, "dist"),
		},
		hot: true,
		port: 3000,
		open: true,
		historyApiFallback: true,
	},
};
