const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const JSLoader = {
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
  },
};

const VueLoader = {
  test: /\.vue$/,
  exclude: /node_modules/,
  use: {
    loader: 'vue-loader',
  },
};

const RawLoader = {
  test: /\.pem$/,
  exclude: /node_modules/,
  use: {
    loader: 'raw-loader',
  },
};

const ESLintLoader = {
  test: /\.js$/,
  enforce: 'pre',
  exclude: /node_modules/,
  use: {
    loader: 'eslint-loader',
    options: {
      configFile: '.eslintrc.js',
    },
  },
};

const CSSLoader = {
  test: /\.css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: 'css-loader',
      options: { importLoaders: 1 },
    },
    {
      loader: 'postcss-loader',
    },
    // 'css-loader',
  ],
};

const SCSSLoader = {
  test: /\.scss$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    // "style-loader",
    'css-loader',
    'sass-loader',
  ],
};

const FileLoader = {
  test: /\.(png|svg|jpg|gif)$/,
  use: [
    'file-loader',
  ],
};

module.exports = {
  JSLoader, ESLintLoader, CSSLoader, VueLoader, RawLoader, FileLoader, SCSSLoader,
};
