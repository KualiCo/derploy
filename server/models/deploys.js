// @flow

import axios from 'axios'
import mongoose from 'mongoose'
import moment from 'moment'

import {getBuildsNewerThan} from '../lib/jenkins'
import buildToDeploy from '../lib/jenkins-to-deploy'

const Schema = mongoose.Schema

const DeploySchema = new Schema({
  project: String,
  timestamp: Date,
  _id: Number
}, {strict: false})

DeploySchema.statics.getForWeek = async function(date, project='STU-CM-Build-Master') {
  await this.updateDeploysIfNotUpToDate(project)
  let weekDay = moment(date)
  let startOfWeek = weekDay.startOf('week').valueOf
  let endOfWeek = weekDay.endOf('week').valueOf
  return this.find({
    project,
    timestamp: {
      $and: [
        {$gte: startOfWeek},
        {$lte: endOfWeek}
      ]
    }
  }).sort({timestamp: -1})
}

DeploySchema.statics.getLastId = function(project) {
  return this.findOne({
    project
  })
}

DeploySchema.statics.updateDeploysIfNotUpToDate = async function(project) {
  console.log('CALLING UPDATE DEPLOYS IF NOT UP TO DATE')
  console.log('THIS IS', this)
  let newestBuildId = await this.getLastId(project)
  let newerBuilds = await getBuildsNewerThan(project, newestBuildId)

  if (newerBuilds.length == 0) {
    return
  }

  let builds = []
  for (let b of newerBuilds) {
    let deploy = await buildToDeploy(b)
    builds.push(deploy)
  }

  return await this.insert(builds)
}

//DeploySchema.statics.getStats = function(startDate) {
  //return []
  // Use the aggregation framework with the $week operator?
  // grab all the deploys, add the year and week to them
  // group by year and week
//}

export default mongoose.model('Deploy', DeploySchema)
