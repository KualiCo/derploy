// @flow

import {handleError} from './helpers'
import {getDeploys as getDeploysFromDb} from '../jenkins'

// TODO: do i return promises, or just return results?
function getDeploys(req) {
  return getDeploysFromDb(1)
}

export default function deployRoutes(app: any) {
  app.get('/deploys', handleError(getDeploys))
}
