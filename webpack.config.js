module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'hackforplayer.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  }
};
