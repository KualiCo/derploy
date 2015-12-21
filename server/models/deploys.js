// @flow

import axios from 'axios'
import mongoose from 'mongoose'
import moment from 'moment'

import {getBuildsNewerThan} from '../lib/jenkins'
import buildToDeploy from '../lib/jenkins-to-deploy'

const Schema = mongoose.Schema

const DeploySchema = new Schema({
  project: String,
  result: String,
  _timestamp: Date,
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
      {result: 'SUCCESS'},
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
  let newerBuilds = await getBuildsNewerThan(project, newestBuildId)

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

DeploySchema.statics.getStats = function(startDate, endDate, project='STU-CM-Build-Master') {
  const match = {
    $match : {
      $and : [
        {
          timestamp : {
            $gte : startDate
          }
        },
        {result: 'SUCCESS'},
        {
          timestamp : {
            $lte : endDate
          }
        },
        {
          project
        }
      ]
    }
  }

  const group = {
    $group : {
      _id : {
        week : {
          $week : "$_timestamp"
        },
        year : {
          $year : "$_timestamp"
        }
      },
      count : {
        $sum : 1
      }
    }
  }

  // It looks like the week from MongoDB is one week behind, so we tweak
  // it after it comes back from the db
  return this.aggregate([match, group]).exec().
    then(stats => {
      return stats.map(stat => {
        stat._id.week += 1
        return stat
      })
    })
}

export default mongoose.model('Deploy', DeploySchema)
