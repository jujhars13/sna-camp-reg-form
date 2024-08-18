require("dotenv").config();
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const { webpack, DefinePlugin } = require("webpack");
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");

const environment = process.env?.NODE_ENV
  ? process.env.NODE_ENV
  : "development";
const supabaseKey = process.env?.SUPABASE_ANON_KEY
  ? process.env.SUPABASE_ANON_KEY
  : undefined;
const supabaseUrl = process.env?.SUPABASE_URL
  ? process.env.SUPABASE_URL
  : undefined;

if (!supabaseKey || !supabaseUrl) {
  console.error("supabase key or URL not found");
  process.exit(11);
}

console.log({ environment, supabaseUrl });

module.exports = {
  devtool: "source-map",
  entry: "./src/index.js",
  mode: environment,
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new DefinePlugin({
      __supabase_url: JSON.stringify(supabaseUrl),
      __supabase_key: JSON.stringify(supabaseKey),
      __environment: JSON.stringify(environment)
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
    new HtmlWebpackPlugin({
      filename:'done.html',
      template: "src/done.html"
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/css", to: path.resolve(__dirname, "dist/css") },
        { from: "src/images", to: path.resolve(__dirname, "dist/images") },
        {
          from: "src/favicon.ico",
          to: path.resolve(__dirname, "dist/favicon.ico")
        }
      ]
    }),
    // upload source maps to sentry
    sentryWebpackPlugin({
      org: "jujharcom",
      project: "javascript",
      authToken: process.env?.SENTRY_AUTH_TOKEN,
    }),
  ]
};
