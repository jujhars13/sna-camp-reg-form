require("dotenv").config();
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const { webpack, DefinePlugin } = require("webpack");

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
  entry: "./src/index.js",
  mode: environment,
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new DefinePlugin({
      SUPABASEURL: JSON.stringify(supabaseUrl),
      SUPABASEKEY: JSON.stringify(supabaseKey),
      ENVIRONMENT: JSON.stringify(environment)
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/css", to: path.resolve(__dirname, "dist/css") },
        {
          from: "src/favicon.ico",
          to: path.resolve(__dirname, "dist/favicon.ico")
        }
      ]
    })
  ]
};
