// Just an entry for babel-register
require('babel-register')
require('babel-polyfill')
var app = require('./app')
app.default()
