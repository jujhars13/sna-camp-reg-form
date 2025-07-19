require("dotenv").config();
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

const environment = process.env?.NODE_ENV || "development";
const supabaseKey = process.env?.SUPABASE_ANON_KEY;
const supabaseUrl = process.env?.SUPABASE_URL;
const version = process.env?.VERSION;

if (!supabaseKey || !supabaseUrl) {
  throw new Error("SUPABASE_ANON_KEY and/or SUPABASE_URL not found");
}

console.log({ environment, supabaseUrl });

module.exports = {
  devtool: "source-map",
  entry: "./src/index.js",
  mode: environment,
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  plugins: [
    new DefinePlugin({
      __supabase_url: JSON.stringify(supabaseUrl),
      __supabase_key: JSON.stringify(supabaseKey),
      __environment: JSON.stringify(environment),
      __version: JSON.stringify(version),
    }),
    new HtmlWebpackPlugin({
      title: "Caching",
      template: "src/index.html",
    }),
    new HtmlWebpackPlugin({
      filename: "done.html",
      template: "src/done.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/css", to: path.resolve(__dirname, "dist/css") },
        { from: "src/images", to: path.resolve(__dirname, "dist/images") },
        { from: "src/data", to: path.resolve(__dirname, "dist/data") },
        {
          from: "src/favicon.ico",
          to: path.resolve(__dirname, "dist/favicon.ico"),
        },
      ],
    }),
    // upload source maps to sentry
    sentryWebpackPlugin({
      org: "jujharcom",
      project: "javascript",
      authToken: process.env?.SENTRY_AUTH_TOKEN,
    }),
  ],
};
