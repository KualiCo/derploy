import Elm from './src/Main.elm'
import chart from './chart/chart'

const container = document.querySelector('.app')
const elmApp = Elm.embed(Elm.Main, container, {})

elmApp.ports.loadChartData.subscribe(chart)
