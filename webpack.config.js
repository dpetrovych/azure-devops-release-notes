const webpack = require('webpack');
const path = require("path");

module.exports = {
  entry: "./scripts/bootstrap.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss"],
  },
  devtool: "source-map",
  plugins: [],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader", { loader: "css-loader", options: { modules: true } }, "azure-devops-ui/buildScripts/css-variables-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.woff$/,
        use: [{
          loader: 'base64-inline-loader'
        }]
      },
      {
        test: /\.png$/,
        use: [{
          loader: 'base64-inline-loader'
        }]
      },
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
};