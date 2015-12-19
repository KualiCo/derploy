// @flow

// $FlowIssue d3 exists ya scallywag
import d3 from 'd3'
import c3 from 'c3'
import moment from 'moment'

window.d3 = d3

function yearWeekToWeekStartDate({year, week}) {
  return moment(year).week(week).day('Monday').valueOf()
}

// TODO: how do i render data on the graph
const data = [
  { "_id" : { "week" : 47, "year" : 2015 }, "count" : 1 },
  { "_id" : { "week" : 48, "year" : 2015 }, "count" : 26 },
  { "_id" : { "week" : 49, "year" : 2015 }, "count" : 22 },
  { "_id" : { "week" : 50, "year" : 2015 }, "count" : 1 }
]


export default function makeChart(argument) {
  const counts = data.reduce((memo, d) => {
    memo[0].push(yearWeekToWeekStartDate(d._id))
    memo[1].push(d.count)
    return memo
  }, [['x'], ['Sprints']])

  const countsArray = data.map(d => {
    return {
      date: yearWeekToWeekStartDate(d._id),
      count: d.count
    }
  })

  const chart = c3.generate({
    bindto: '.chart',
    data: {
      json: countsArray,
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

  //const chart = c3.generate({
    //bindto: '.chart',
    //data: {
      //x: 'x',
      //columns: [counts]
    //},
    //axis: {
      //x: {
        //type: 'timeseries',
        //tick: {
          //format: '%Y-%M-%d'
        //}
      //}
    //}
  //})
}
