var path = require("path");
var webpack = require("webpack");
var BowerWebpackPlugin = require("bower-webpack-plugin");
var production = process.env.NODE_ENV === 'production';
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

const configObj = {
  entry:  {
    videoDetection: 'videoDetectionService',
    popup: 'views/popupView',
    oauth: 'chrome_oauth_receiver',
    event: 'events'
  },
  output: {
    path:     'builds/builds',
    filename: '[name].bundle.js',
  },
  resolve: {
    root: [
      path.join(__dirname, "js"),
      path.join(__dirname, "bower_components"),
      path.join(__dirname, "styles")
    ]
  },
  module: {
    preLoaders: [{
      test: /\.js/,
      exclude: /node_modules|bower_components|vendor/,
      loader: 'jscs-loader'
    }, {
      test: /\.js/,
      exclude: /node_modules|bower_components|vendor/,
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
      },
    },
    {
      test: /\.less/,
      loaders: ['style', 'css', 'less']
    },
    { test: /\.(woff(2)?|ttf|eot|svg)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000000mimetype=application/font-woff" },
    ],
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin(".bower.json", ["main"])
    ),
    new BowerWebpackPlugin(),
    new CommonsChunkPlugin('commons.chunk.js')
  ],
  jscs: {
    preset: 'airbnb',
    emitErrors: true,
    requireTrailingComma: false,
    safeContextKeyword: ["_this", "self", "that"],
  },
  jshint: {
    globals: {
      chrome: false,
      window: false,
      document: false,
      btoa: false,
      setInterval: false,
      MutationObserver: false,
      console: false
    },
    esnext: true,
    strict: false,
    undef: true,
    eqeqeq: true,
    unused : true,
  }
};

if (!production) {
  configObj.devtool = '#eval-source-map';
} else {
  configObj.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = configObj;
