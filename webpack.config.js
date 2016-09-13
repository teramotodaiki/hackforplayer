const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');

const exportVarName = process.env.EXPORT_VAR_NAME || "h4p";
const cssPrefix = process.env.CSS_PREFIX || (exportVarName + "__");

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
    new WebpackNotifierPlugin(),
    new webpack.DefinePlugin({
      EXPORT_VAR_NAME: JSON.stringify(exportVarName),
      CSS_PREFIX: JSON.stringify(cssPrefix)
    })
  ],
  sassLoader: {
    data: `$prefix: ${cssPrefix};`
  }

};
