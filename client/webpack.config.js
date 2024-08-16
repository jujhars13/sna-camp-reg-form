const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: "./src/index.js",
  //mode: 'production',
  mode: process.env?.NODE_ENV ? process.env.NODE_ENV : "development",
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new Dotenv(),
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
