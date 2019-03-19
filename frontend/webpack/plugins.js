const _MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const MiniCssExtractPlugin = new _MiniCssExtractPlugin({
  filename: '[name].bundle.css',
  chunkFilename: '[id].css',
});
module.exports = {
  MiniCssExtractPlugin,
  VueLoaderPlugin: new VueLoaderPlugin(),
};
