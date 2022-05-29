const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
require('dotenv').config();

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  // new webpack.DefinePlugin({
  //   USER_API_KEY: JSON.stringify(process.env.USER_API_KEY),
  // }),
  new webpack.DefinePlugin({
    WEB_CLIENT_URL: JSON.stringify(process.env.WEB_CLIENT_URL),
  }),
  new webpack.DefinePlugin({
    LIBP2P_SIG_SERVER: JSON.stringify(process.env.LIBP2P_SIG_SERVER)
  }),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }),
];
