// @flow

import {handleError} from './helpers'
import Deploys from '../models/deploys'

// TODO: do i return promises, or just return results?
function getDeploys(req) {
  let date = req.params.date || Date.now()
  return Deploys.getForWeek(date)
}

export default function deployRoutes(app: any) {
  // can take a ?date=some-date query param
  app.get('/deploys', handleError(getDeploys))
}
