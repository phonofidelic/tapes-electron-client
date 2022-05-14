const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
require('dotenv').config()

module.exports = {
  entry: path.resolve(__dirname, 'src', 'index.web-client.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    fallback: {
      path: require.resolve('path-browserify'),
      buffer: require.resolve("buffer"),
      process: false
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    // new webpack.EnvironmentPlugin([
    //   'USER_API_KEY_SECURE',
    //   'USER_API_KEY',
    //   'USER_API_SECRET',
    //   'ACOUSTID_API_KEY',
    //   'GITHUB_TOKEN',
    //   'WEB3STORAGE_TOKEN'
    // ]),
    new webpack.DefinePlugin({
      'process.env.USER_API_KEY': JSON.stringify(process.env.USER_API_KEY || '')
    })
  ],
  devtool: 'eval-cheap-source-map'
};