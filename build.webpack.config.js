const path = require('path');

module.exports = {
  entry: './src/context-promise.ts',
  output: {
    filename: 'context-promise.js',
    library: 'ContextPromise',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: ['.ts', '.js']
  },
};
