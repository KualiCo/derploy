const Elm = require('./src/Main.elm')
const container = document.querySelector('.app')


import chart from './chart/chart'

const elmApp = Elm.embed(Elm.Main, container, {})
chart()
