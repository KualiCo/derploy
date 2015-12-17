// @flow

import mongoose from 'mongoose'

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_NAME = process.env.DB_NAME || 'derploy'

mongoose.connect(`mongodb://${DB_HOST}/${DB_NAME}`)
let db = mongoose.connection
db.on('error', (err) => {
  console.error('ERROR WITH MONGO CONNECTION', err)
})

db.once('open', () => {
  console.log('WOOO DB CONNECTED')
})

export let GH_TOKEN = process.env.GH_TOKEN || '***REMOVED***'
export let JENKINS_USER = process.env.JENKINS_USER || '***REMOVED***'
export let JENKINS_KEY = process.env.JENKINS_KEY || '***REMOVED***'
export let PORT = process.env.PORT || 2999
