module.exports = {
  entry: './client/app.js',
  output: {
    path: './client/build/',
    filename: 'app.js'
  },
  module: {
    loaders: [{
      test: /\.elm$/,
      exclude: [/elm-stuff/, /node_modules/],
      loader: 'elm-webpack'
    }]
  }
}
