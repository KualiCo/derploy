// @flow

import {get, last, map} from 'lodash'

import {getUser} from './github'

type Timestamp = number

export type Commit = {
  affectedPaths: Array<string>,
  commitId: string,
  message: string,
  author: GitHubUser,
  hash: string,
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
  _id: string,
  duration: number,
  result: string,
  timestamp: Timestamp,
  _timestamp: Timestamp,
  url: string,
  commits: Array<Commit>,
  project: string
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

  const gitHubUser = await getUser(githubName)
  const user = {
    fullName: gitHubUser.name,
    userName: githubName,
    avatarUrl: gitHubUser.avatar_url || PARTY_PARROT
  }
  return Promise.resolve(user)
}

async function parseChangeSet(changeSet): Promise<Array<Commit>> {
  const changes = get(changeSet, 'items', [])
  let parsedChanges =  []
  for (let change of changes) {
    let jenkinsUserName = last(get(change, 'author.absoluteUrl', '').split('/'))
    parsedChanges.push({
      affectedPaths: change.affectedPaths,
      commitId: change.commitId,
      message: change.msg,
      author: await getGithubUser(jenkinsUserName, change.author.fullName),
      timestamp: new Date(change.date).getTime(),
      hash: change.id
    })
  }
  return parsedChanges
}

function getProject(build: Object): string {
  const urlParts = build.url.split('/')
  return urlParts[urlParts.length - 3]
}

export default async function buildToDeploy(build: Object): Promise<Deploy> {
  let jenkinsUserName = last(get(build, 'culprits[0].absoluteUrl', '').split('/'))
  let fullName = get(build, 'culprits[0].fullName', '')
  let deploy = {
    title: build.title,
    description: build.description,
    user: await getGithubUser(jenkinsUserName, fullName),
    displayName: build.displayName,
    // the number is the integer version of the id, the "id" field is a string
    // which could make sorting harder
    _id: build.number,
    duration: build.duration,
    result: build.result,
    timestamp: build.timestamp,
    _timestamp: build.timestamp,
    url: build.url,
    commits: await parseChangeSet(build.changeSet),
    project: getProject(build)
  }

  return deploy
}
