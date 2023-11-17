const { defineConfig } = require("@vue/cli-service");
const CopyWebpackPlugin = require("copy-webpack-plugin");
module.exports = defineConfig({
  runtimeCompiler: true,
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        {
          from: "node_modules/itk/WebWorkers",
          to: "itk/WebWorkers",
        },
      ]),
      new CopyWebpackPlugin([
        {
          from: "node_modules/itk/ImageIOs",
          to: "itk/ImageIOs",
        },
      ]),
    ],
  },
});
