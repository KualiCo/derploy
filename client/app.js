var Elm = require('./src/Main.elm')
var container = document.querySelector('.app')

var d3 = require('d3')
window.d3 = d3
var nv = require('nvd3')

var elmApp = Elm.embed(Elm.Main, container, {})

nv.addGraph(function() {
  var chart = nv.models.line()

  chart.interpolate = 'basis'

  // who knows what this does really
  chart.scatter.pointSize(2)

  //chart.

  var data = testData()
  console.log('data is', data)

  var datum = [{
    values: data,
    key: 'Years'
  }]
  d3.select('.chart svg')
      .datum(datum)
      .transition().duration(500)
      .call(chart)

  nv.utils.windowResize(chart.update)

  return chart
})

function stream_layers(n, m, o) {
  if (arguments.length < 3) o = 0;
  function bump(a) {
    var x = 1 / (.1 + Math.random()),
        y = 2 * Math.random() - .5,
        z = 10 / (.1 + Math.random());
    for (var i = 0; i < m; i++) {
      var w = (i / m - y) * z;
      a[i] += x * Math.exp(-w * w);
    }
  }
  //return d3.range(n).map(function() {
      var a = [], i;
      for (i = 0; i < m; i++) a[i] = o + o * Math.random();
      for (i = 0; i < 5; i++) bump(a);
      return a.map(stream_index);
    //});
}

function stream_index(d, i) {
  return {x: i, y: Math.max(0, d)};
}

function testData() {
  return stream_layers(3,128,.1)//.map(function(data, i) {
    //return {
      //key: 'Stream' + i,
      //values: data
    //}
  //})
}
