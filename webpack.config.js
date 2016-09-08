const WebpackNotifierPlugin = require('webpack-notifier');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'hackforplayer.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ["style", "css"]
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      }
    ]
  },
  plugins: [
    new WebpackNotifierPlugin()
  ]
};
