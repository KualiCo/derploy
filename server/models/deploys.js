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
  // We need one timestamp with a Date so we can use $week from the aggregation
  // pipeline on it, but Dates are a pain to handle in elm so we have another
  // with just the time in milliseconds
  _timestamp: Date,
  timestamp: Number,
  _id: Number
}, {strict: false})

DeploySchema.statics.getForWeek = async function(date, project='STU-CM-Build-Master') {
  await this.updateDeploysIfNotUpToDate(project)
  const weekDay = moment(date)
  const startOfWeek = weekDay.startOf('week').valueOf()
  const endOfWeek = weekDay.endOf('week').valueOf()
  return this.find({
    $and: [
      {project},
      {result: 'SUCCESS'},
      {timestamp: {$gte: startOfWeek}},
      {timestamp: {$lte: endOfWeek}}
    ]
  }).sort({timestamp: -1})

  //const THREE_WEEKS = 1000 * 60 * 60 * 24 *7 * 3
  //return res.map(d => {
    //d.timestamp += THREE_WEEKS
    //return d
  //})
}

DeploySchema.statics.getLastId = async function(project) {
  var res = await this.find({project}).sort({_id: -1}).limit(1)
  let newestDeploy = res[0] || {_id: 0}
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
