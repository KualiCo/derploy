// @flow

import express from 'express'
import body from 'body-parser'

import {getDeploys} from './jenkins'

const app = express()
app.use(body.json())

function handleError(handler) {
  return async function(req, res, next) {
    try {
      let result = await handler(req, res, next)
      res.json(result)
    } catch (e) {
      console.error('error doing stuff', e.stack)
      res.status(500).json({error: e.stack})
    }
  }
}

async function getYonDeploys(req, res) {
  console.log('wat')
  const deploys = getDeploys()
  // get all jenkins deploys for today
  // for each deploy: get the user who deployed from github
  console.log('sending  response', deploys)
  return deploys
}

app.get('/deploys', handleError(getYonDeploys))

export default function startApp() {
  console.log('listening woooo')
  app.listen(2999)
}
