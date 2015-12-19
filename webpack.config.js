module.exports = {
  entry: './client/app.js',

  output: {
    path: './client/build/',
    filename: 'app.js'
  },

  resolve: {
    extensions: ['', '.js']
  },

  module: {
    loaders: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        loader: 'elm-webpack'
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel'
      }
    ],
    // i mean i do want webpack to parse elm stuff b/c i want it compiled, but
    // for some horrible reason i also want to tell it not to parse elm code?
    // DEV TOOLS UX IS FINE EVERYTHING IS FINE WEBPACK IS CLEARLY THE BEST
    noParse: [/\.elm$/]
  }
}
