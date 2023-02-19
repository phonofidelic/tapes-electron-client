const path = require('path');
const rules = require('./webpack.rules.cjs');

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/electron/index.ts',
  // Put your normal webpack config below here
  output: { filename: 'index.cjs' },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: { '@': path.resolve('src') },
  },
  externals: [
    'datastore-level',
    'level',
    // '@koush/wrtc',
    // 'wrtc',
    // 'dlv',
    // 'ipfs-repo',
  ],
  // target: 'electron-main',
  // node: {
  //   global: true,
  //   __dirname: true,
  //   __filename: true
  // }
  devtool: 'eval-cheap-source-map',
};
