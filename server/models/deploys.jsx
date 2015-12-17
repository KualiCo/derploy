// @flow

import axios from 'axios'
import mongoose from 'mongoose'
import moment from 'moment'

import {getBuildsNewerThan} from '../lib/jenkins'

const Schema = mongoose.Schema

const DeploySchema = new Schema({
  project: String,
  timestamp: Date,
  _id: String
}, {strict: false})

// What do I need? I need a way to get all deploys for a week
DeploySchema.statics.getForWeek = async function(date, project='STU-CM-Master') {
  await this.updateDeploysIfNotUpToDate(project)
  // TODO: turn the date in to a range for the week.
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

DeploySchema.statics.getLastId = function(project='STU-CM-Master') {
  return this.findOne({
    project
  }).sort({_id: -1})
}

DeploySchema.statics.updateDeploysIfNotUpToDate = async function(project) {
  let newestBuildId = await this.getLastId(project)
  let newerBuilds = await getBuildsNewerThan(project, newestBuildId)

  if (newerBuilds.length == 0) {
    return
  }

  newerBuilds = newerBuilds.map(b => {
    b._id = b.id
    delete b.id
  })

  // TODO: do I transform the data here?
  return await this.insert(newerBuilds)
}

//DeploySchema.statics.getStats = function(startDate) {
  //return []
  // Use the aggregation framework with the $week operator?
  // grab all the deploys, add the year and week to them
  // group by year and week
//}

export default mongoose.model('Deploy', DeploySchema)
