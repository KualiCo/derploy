// @flow

import axios from 'axios'
import c3 from 'c3'
// $FlowIssue d3 exists ya scallywag
import d3 from 'd3'
import moment from 'moment'

window.d3 = d3

function yearWeekToWeekStartDate({year, week}) {
  return moment().year(year).week(week).day(1).toDate()
}

const data = [
  //{ "_id" : { "week" : 47, "year" : 2015 }, "count" : 1 },
  //{ "_id" : { "week" : 48, "year" : 2015 }, "count" : 26 },
  //{ "_id" : { "week" : 49, "year" : 2015 }, "count" : 22 },
  //{ "_id" : { "week" : 50, "year" : 2015 }, "count" : 1 }
]

function getStats() {
  return axios.get('/stats').then(r => r.data)
}

function makeChart(_data) {
  if (!_data) {
    _data = data
  }

  const formattedData = _data.map(d => {
    return {
      date: yearWeekToWeekStartDate(d._id),
      Deploys: d.count
    }
  })
  console.log(formattedData[0].date)

  const chart = c3.generate({
    bindto: '.chart',
    data: {
      json: formattedData,
      keys: {
        x: 'date',
        value: ['Deploys']
      },
      colors: {
        Deploys: ['#82CF45']
      }
    },
    point: {
      r: 7,
      stroke: '#82CF45',
      fill: 'none'
    },
    axis: {
      y: {
        label: {
          text: 'Number of Deploys',
          position: 'outer-center'
        }
      },
      x: {
        type: 'timeseries',
        label: {
          text: 'Sprint Week',
          position: 'outer-center'
        },
        tick: {
          format: function(x) {
            return moment(x).format('MMM Do YY')
          }
        }
      }
    }
  })

  chart.legend.hide('Deploys')
}

export default function fetchDataAndMakeChart() {
  getStats()
    .then(
      makeChart,
      console.error)
}
