var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'resocket.io.js'
  },
  module: {
    loaders: [{ test: /\.js$/, loader: "jsx-loader" }],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  externals: {
    'socket.io': 'io'
  }
};
