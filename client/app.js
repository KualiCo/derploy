var Elm = require('./src/Main.elm')
var container = document.querySelector('.app')

var elmApp = Elm.embed(Elm.Main, container, {})
