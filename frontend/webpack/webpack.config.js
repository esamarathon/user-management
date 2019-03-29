const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');

module.exports = (env, argv) => {
  console.log(`Using webpack ${argv.mode} environment.`);
  return {
    entry: ['./src/main.js'],
    module: {
      rules: [
        loaders.VueLoader,
        loaders.CSSLoader,
        loaders.SCSSLoader(env, argv),
        loaders.JSLoader,
        loaders.RawLoader,
        loaders.ESLintLoader,
        loaders.FileLoader,
      ],
    },
    plugins: [
      plugins.MiniCssExtractPlugin,
      plugins.VueLoaderPlugin,
      plugins.HTMLWebpackPlugin,
      plugins.FaviconsPlugin,
    ],
    output: {
      path: path.resolve(__dirname, '../dist'),
      publicPath: '/',
      filename: '[hash].bundle.js',
    },
    resolve: {
      extensions: ['.js', '.vue', '.json', '.scss'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '@': './src',
        $: path.join(__dirname, '../node_modules'),
      },
    },
    devServer: {
      allowedHosts: [
        '127.0.0.1',
      ],
      historyApiFallback: true,
    },
    devtool: 'source-map',
  };
};
