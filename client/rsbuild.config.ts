import { fa } from "@faker-js/faker";
import { defineConfig } from "@rsbuild/core";

export default {
  server: {
    port: 3001
  },
  html: {
    title: "SNA Camp Registration",
    template: "./src/index.html",
    favicon: "./src/favicon.ico"
  },
  output: {
    copy: [
      { from: "./src/css", to: "static/css" },
      { from: "./src/images", to: "static/images" }
    ]
  }
};
