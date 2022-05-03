module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
  externals: [
    'datastore-level',
    'level',
    // '@koush/wrtc',
    'wrtc',
    'dlv',
    'ipfs-repo',
  ],
  // target: 'electron-main',
  // node: {
  //   global: true,
  //   __dirname: true,
  //   __filename: true
  // }
  devtool: 'eval-cheap-source-map'
};
