var path = require("path");
var webpack = require("webpack");
var BowerWebpackPlugin = require("bower-webpack-plugin");

module.exports = {
  entry:  {
    videoDetection: 'videoDetectionService',
    popup: 'backbone/views/popup-view',
    event: 'events'
  },
  output: {
    sourceMapFilename: 'bundle.js.map',
    path:     'builds',
    filename: '[name].bundle.js',
  },
  resolve: {
    root: [
      path.join(__dirname, "js"),
      path.join(__dirname, "bower_components")
    ]
  },
  "devtool": '#inline-source-map',
  module: {
    preLoaders: [{
      test: /\.js/,
      exclude: /node_modules|bower_components|lib/,
      loader: 'jscs-loader'
    }, {
      test: /\.js/,
      exclude: /node_modules|bower_components|lib/,
      loader: 'jshint-loader'
    }],
    loaders: [
      {
      test:   /\.js/,
      loader: 'babel',
      include: __dirname + '/js',
      exclude: /node_modules|bower_components/,
      query: {
        presets: ['es2015']
      }
    }
    ],
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
    ),
    new BowerWebpackPlugin()
  ],
  jscs: {
    preset: 'airbnb',
    emitErrors: true,
    safeContextKeyword: ["_this", "self", "that"]
  },
  jshint: {
    esnext: true
  }
};