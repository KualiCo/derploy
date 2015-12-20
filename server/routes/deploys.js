// @flow

import moment from 'moment'

import {handleError} from './helpers'
import Deploys from '../models/deploys'

// TODO: do i return promises, or just return results?
function getDeploys(req) {
  console.log('req.params is', req.query)
  let date = req.query.date || Date.now()
  console.log('date is', moment(date).toString())
  return Deploys.getForWeek(date)
}

function getStats(req) {
  let start = req.query.start || moment().subtract(1, 'year').valueOf()
  let end = req.query.end || moment().valueOf()
  return Deploys.getStats(start, end)
}

export default function deployRoutes(app: any) {
  // can take a ?date=some-date query param
  app.get('/deploys', handleError(getDeploys))
  app.get('/stats', handleError(getStats))
}
