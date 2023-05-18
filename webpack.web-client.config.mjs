import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import dotenv from 'dotenv';
dotenv.config();

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default {
  entry: {
    index: path.resolve('src', 'renderer.tsx'),
    // db: path.resolve(__dirname, 'src', 'db', 'index.ts'),
    // effects: path.resolve(__dirname, 'src', 'effects', 'index.ts'),
    // recorder: path.resolve(__dirname, 'src', 'views', 'Recorder.tsx'),
    // library: path.resolve(__dirname, 'src', 'views', 'Library.tsx'),
    // recordingDetail: path.resolve(__dirname, 'src', 'views', 'RecordingDetail.tsx'),
    // settings: path.resolve(__dirname, 'src', 'views', 'Settings.tsx')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve('dist'),
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
      stream: path.resolve('node_modules/stream-browserfy'),
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
      template: path.join('src', 'index.html'),
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
    new webpack.DefinePlugin({
      SENTRY_DNS: JSON.stringify(process.env.SENTRY_DNS),
    }),
  ],
  devtool: 'eval-cheap-source-map',
  experiments: {
    topLevelAwait: true,
  },
  externals: {
    fs: '{ existsSync: () => true }',
    'fs-extra': '{ copy: () => {} }',
    rimraf: '() => {}',
  },
};
