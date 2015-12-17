// @flow

import fs from 'fs'

import axios from 'axios'
import {map, get, last, filter} from 'lodash-fp'
import moment from 'moment'

import * as db from './db'

type Timestamp = number

export type Commit = {
  affectedPaths: Array<string>,
  commitId: string,
  message: string,
  author: string,
  timestamp: Timestamp,
}

export type GitHubUser = {
  fullName: string,
  userName: string,
  avatarUrl: string
}

export type Deploy = {
  title: string,
  description: string,
  user: GitHubUser,
  displayName: string,
  number: number,
  duration: number,
  result: string,
  timestamp: Timestamp,
  url: string,
  commits: Array<Commit>
}

const JENKINS_TO_GITHUB = {
  ***REMOVED***: 'splodingsocks',
  ***REMOVED***: 'jergason',
  ***REMOVED***: 'numso',
  ***REMOVED***: '***REMOVED***bward',
  ***REMOVED***: 'omginbd'
}

const PARTY_PARROT = 'https://emoji.slack-edge.com/T02M85ECP/partyparrot/27cfbe1c58952b0f.gif'
async function getGithubUser(jenkinsUserName: string, fullName: string): Promise<GitHubUser> {
  const githubName = JENKINS_TO_GITHUB[jenkinsUserName]
  if (!githubName) {
    return {
      fullName,
      userName: jenkinsUserName,
      avatarUrl: PARTY_PARROT
    }
  }

  const gitHubUser = await db.getGitHubUser(githubName)
  const user = {
    fullName,
    userName: githubName,
    avatarUrl: gitHubUser.avatar_url || PARTY_PARROT
  }
  return Promise.resolve(user)
}

function parseChangeSet(changeSet): Array<Commit> {
  const changes = get('items', changeSet, [])
  return map((change) => {
    return {
      affectedPaths: change.affectedPaths,
      commitId: change.commitId,
      message: change.msg,
      author: change.author.fullName,
      timestamp: new Date(change.date).getTime()
    }
  }, changes)
}

async function getDeploy(build): Promise<Deploy> {
  let jenkinsUserName = last((get('culprits[0].absoluteUrl', build) || '').split('/'))
  let fullName = get('culprits[0].fullName', build) || ''
  let deploy = {
    title: build.title,
    description: build.description,
    user: await getGithubUser(jenkinsUserName, fullName),
    displayName: build.displayName,
    number: build.number,
    duration: build.duration,
    result: build.result,
    timestamp: build.timestamp,
    url: build.url,
    commits: parseChangeSet(build.changeSet),
  }

  return deploy
}

export async function getDeploys(day: number): Promise<Array<Deploy>> {
  let builds = await db.getHydratedBuilds()
  console.log('WOOOOOOOOOOOO GOT HYDRATED BUILDS')
  let thisMorning = moment().hour(0).minute(0).subtract(10, 'days').valueOf()
  let buildsWeCareAbout = filter((b) => {
    console.log('b is', b.timestamp, 'now is', thisMorning)
    return b.timestamp > thisMorning
  }, builds)
  console.log('builds we care about are', buildsWeCareAbout)
  let deploys = []
  for (let build of buildsWeCareAbout) {
    deploys.push(await getDeploy(build))
    console.log('DONE PUSHING THAT DEPLOY YO')
  }
  return deploys
  //return [await getDeploy(json)]
}
