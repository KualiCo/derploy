// @flow

import c3 from 'c3'
// $FlowIssue d3 exists ya scallywag
import d3 from 'd3'
import moment from 'moment'

window.d3 = d3

function yearWeekToWeekStartDate(year, week) {
  return moment().year(year).week(week).day(1).toDate()
}


type Stat = {
  week: number,
  year: number,
  count: number
}

export default function makeChart(_data: Array<Stat>) {
  console.log('CALLING MAKE CHART AND I GOT', _data)

  const formattedData = _data.map(d => {
    return {
      date: yearWeekToWeekStartDate(d.year, d.week),
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
