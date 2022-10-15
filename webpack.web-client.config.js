const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
require('dotenv').config();

module.exports = {
  entry: {
    index: path.resolve(__dirname, 'src', 'index.web-client.tsx'),
    // db: path.resolve(__dirname, 'src', 'db', 'index.ts'),
    // effects: path.resolve(__dirname, 'src', 'effects', 'index.ts'),
    // recorder: path.resolve(__dirname, 'src', 'views', 'Recorder.tsx'),
    // library: path.resolve(__dirname, 'src', 'views', 'Library.tsx'),
    // recordingDetail: path.resolve(__dirname, 'src', 'views', 'RecordingDetail.tsx'),
    // settings: path.resolve(__dirname, 'src', 'views', 'Settings.tsx')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    hot: true,
    port: 3001,
    // contentBase: path.resolve(__dirname, 'src'),
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
      process: false,
      crypto: false,
      zlib: false,
    },
    alias: {
      stream: path.resolve(__dirname, 'node_modules/stream-browserfy'),
      '@': path.resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|\.webpack)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // inject: true,
      template: path.join(__dirname, 'src', 'index.html'),
      // inlineSource: '.(ts|tsx|js|css)$',
      // scriptLoading: 'blocking'
    }),
    // new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.USER_API_KEY': JSON.stringify(
        process.env.USER_API_KEY || ''
      ),
    }),
    new webpack.DefinePlugin({
      WEB_CLIENT_URL: JSON.stringify(process.env.WEB_CLIENT_URL),
    }),
    new webpack.DefinePlugin({
      LIBP2P_SIG_SERVER: JSON.stringify(process.env.LIBP2P_SIG_SERVER),
    }),
  ],
  devtool: 'eval-cheap-source-map',
};
