const rules = require('./webpack.rules.cjs');
const plugins = require('./webpack.plugins.cjs');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // target: 'electron-renderer',
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    fallback: {
      crypto: false,
      // path: false,
      path: require.resolve('path-browserify'),
      // assert: false,
      assert: require.resolve('assert/'),
      // stream: false,
      stream: require.resolve('stream-browserify'),
      url: false,
      buffer: require.resolve('buffer'),
    },
    alias: {
      stream: path.resolve(__dirname, 'node_modules/stream-browserfy'),
      '@': path.resolve('src'),
    },
  },
};
