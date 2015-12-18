// @flow

import axios from 'axios'
import mongoose from 'mongoose'
import moment from 'moment'

import {getBuildsNewerThan} from '../lib/jenkins'
import buildToDeploy from '../lib/jenkins-to-deploy'

const Schema = mongoose.Schema

const DeploySchema = new Schema({
  project: String,
  timestamp: Number,
  _id: Number
}, {strict: false})

DeploySchema.statics.getForWeek = async function(date, project='STU-CM-Build-Master') {
  await this.updateDeploysIfNotUpToDate(project)
  let weekDay = moment(date)
  let startOfWeek = weekDay.startOf('week').valueOf()
  let endOfWeek = weekDay.endOf('week').valueOf()
  return this.find({
    $and: [
      {project},
      {timestamp: {$gte: startOfWeek}},
      {timestamp: {$lte: endOfWeek}}
    ]
  }).sort({timestamp: -1})
}

DeploySchema.statics.getLastId = async function(project) {
  let newestDeploy = await this.findOne({project}) || {_id: 0}
  return newestDeploy._id
}

DeploySchema.statics.updateDeploysIfNotUpToDate = async function(project) {
  let newestBuildId = await this.getLastId(project)
  console.log('NEWEST BUILD ID IS', newestBuildId)
  let newerBuilds = await getBuildsNewerThan(project, newestBuildId)

  console.log('newer builds is', newerBuilds)

  if (newerBuilds.length == 0) {
    return
  }

  let builds = []
  for (let b of newerBuilds) {
    let deploy = await buildToDeploy(b)
    builds.push(deploy)
  }

  return await this.create(builds)
}

//DeploySchema.statics.getStats = function(startDate) {
  //return []
  // Use the aggregation framework with the $week operator?
  // grab all the deploys, add the year and week to them
  // group by year and week
//}

export default mongoose.model('Deploy', DeploySchema)
