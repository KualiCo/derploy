// @flow

import body from 'body-parser'
import express from 'express'

import deployRoutes from './routes/deploys'

const app = express()

app.use(body.json())
app.use(express.static('client'))

// set the routes woo
deployRoutes(app)

export default function startApp() {
  console.log('listening woooo')
  app.listen(2999)
}
