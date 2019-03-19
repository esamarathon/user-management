const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');

module.exports = {
  entry: ['./src/main.js'],
  module: {
    rules: [
      loaders.VueLoader,
      loaders.CSSLoader,
      loaders.SCSSLoader,
      loaders.JSLoader,
      loaders.RawLoader,
      loaders.ESLintLoader,
      loaders.FileLoader,
    ],
  },
  plugins: [
    plugins.MiniCssExtractPlugin,
    plugins.VueLoaderPlugin,
  ],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].bundle.js',
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.scss'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': './src',
      $: path.join(__dirname, '../node_modules'),
    },
  },
};
