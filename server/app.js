// @flow

import body from 'body-parser'
import express from 'express'

import deployRoutes from './routes/deploys'
import {PORT} from './config'

const app = express()

app.use(body.json())
app.use(express.static('client'))

// set the routes woo
deployRoutes(app)

export default function startApp() {
  console.log(`listening on port ${PORT}`)
  app.listen(PORT)
}
