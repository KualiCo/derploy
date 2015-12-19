const Elm = require('./src/Main.elm')
 const container = document.querySelector('.app')

const elmApp = Elm.embed(Elm.Main, container, {})

import chart from './chart/chart'

chart()
