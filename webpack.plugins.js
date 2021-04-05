const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
require('dotenv').config();

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    USER_API_KEY: JSON.stringify(process.env.USER_API_KEY),
  }),
];
