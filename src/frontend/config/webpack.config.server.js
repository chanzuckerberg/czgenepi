const paths = require("./paths");
const nodeExternals = require("webpack-node-externals");

const entry = { server: "./src/server/index.ts" };

module.exports = {
  devtool: "inline-source-map",
  entry: entry,
  // don't compile node_modules
  externals: [nodeExternals()],
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              // use the tsconfig in the server directory
              configFile: "src/server/tsconfig.json",
            },
          },
        ],
      },
    ],
  },
  output: {
    filename: "[name].js",
    path: paths.appBuild,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  target: "node",
};
