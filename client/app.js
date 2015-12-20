import Elm from './src/Main.elm'
import chart from './chart/chart'

const container = document.querySelector('.app')
// You can provide initial arguments to elm, which come through in ports.
// I'm still pretty fuzzy on how exactly ports work, since this looks like
// a one-time value that you use signals to listen on.
//
// Howver, in the elm code we can call the port like it is a function that
// retuns a value, which hurts my brain.
const elmApp = Elm.embed(Elm.Main, container, {getStartTime: Date.now()})

elmApp.ports.loadChartData.subscribe(chart)
