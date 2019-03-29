const _MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HTMLPlugin = require('html-webpack-plugin');
const FaviconsPlugin = require('favicons-webpack-plugin');

const MiniCssExtractPlugin = new _MiniCssExtractPlugin({
  filename: '[hash].bundle.css',
  chunkFilename: '[id].css',
});
module.exports = {
  MiniCssExtractPlugin,
  VueLoaderPlugin: new VueLoaderPlugin(),
  HTMLWebpackPlugin: new HTMLPlugin({
    template: 'index.html',
    inject: true,
  }),
  FaviconsPlugin: new FaviconsPlugin({
    logo: './src/assets/esa-logo.png',
    emitStats: true,
    icons: {
      android: true,
      appleIcon: false,
      appleStartup: false,
      coast: false,
      favicons: true,
      firefox: false,
      opengraph: true,
      twitter: false,
      yandex: false,
      windows: false,
    },
  }),
};
