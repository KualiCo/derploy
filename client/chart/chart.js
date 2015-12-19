// @flow

import axios from 'axios'
import c3 from 'c3'
// $FlowIssue d3 exists ya scallywag
import d3 from 'd3'
import moment from 'moment'

window.d3 = d3

function yearWeekToWeekStartDate({year, week}) {
  return moment(year).week(week).day('Monday').valueOf()
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
      count: d.count
    }
  })

  const chart = c3.generate({
    bindto: '.chart',
    data: {
      json: formattedData,
      keys: {
        x: 'date',
        value: ['count']
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%M-%d'
        }
      }
    }
  })
}

export default function fetchDataAndMakeChart() {
  getStats()
    .then(
      makeChart,
      console.error)
}
