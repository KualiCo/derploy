// @flow

import fs from 'fs'
Bluebird.promisifyAll(fs)

import axios from 'axios'
import Bluebird from 'bluebird'
import {find, get, head, last} from 'lodash'

import {getUser, getCommit, getPR} from './github'


type Build = {
  number: number,
  url: string
}

let db = {
  mostRecentBuild: null,
  builds: {},
  githubUsers: {}
}

const DB_FILENAME = 'db.json'

function write(db) {
  // $FlowIssue promisify
  return fs.writeFileAsync(DB_FILENAME, JSON.stringify(db))
}

async function load() {
  try {
    // $FlowIssue promisify
    let diskDb = await fs.readFileAsync(DB_FILENAME)
    db = JSON.parse(diskDb)
    return db
  } catch (e) {
    // $FlowIssue promisify
    await fs.writeFileAsync(DB_FILENAME, JSON.stringify(db))
    return db
  }
}

function getIdFromBuild(build: Build): string {
  const chunks = build.url.split('/')
  return chunks[chunks.length - 2]
}

function credentials() {
  return {
    username: '***REMOVED***',
    password: '***REMOVED***'
  }
}

function fetchProject(project: string): Promise<Object> {
  console.log('fetching project')
  return axios({
    url: `***REMOVED***/job/${project}/api/json`,
    auth: credentials()
  }).then(res => res.data)
}

async function augmentWithPrInfo(deploy: Object): Object {
  const commitInfo = getDeployCommit(deploy)
  if (!commitInfo) {
    return Promise.resolve(deploy)
  }

  const pr = await getPrForCommitInfo(commitInfo)
  if (pr) {
    deploy.title = pr.title
    deploy.description = pr.body
  }

  return deploy
}

type CommitInfo = {
  hash: string,
  owner: string,
  repo: string
}

async function getPrForCommitInfo(commitInfo: CommitInfo): ?Object {
  const commit = await getCommit(commitInfo.owner, commitInfo.repo, commitInfo.hash)

  console.log('fetching', commitInfo)
  console.log('commit is', commit)

  if (isPrMergeCommit(commit)) {
    return await getPrForCommit(commit, commitInfo)
  }
}

function isPrMergeCommit(commit) {
  return !!getPrNumber(commit)
}

function getPrForCommit(commit, commitInfo) {
  const prNumber = getPrNumber(commit)
  return getPR(commitInfo.owner, commitInfo.repo, prNumber)
}

function getPrNumber(commit) {
  const message = commit.commit.message
  const regexp = /Merge pull request #(\d+) from/
  const results = regexp.exec(message) || []
  return results[1]
}

function getDeployCommit(deploy): ?CommitInfo {
  const builds = getBuildsByBranchName(deploy)
  if (!builds) {
    return null
  }

  const hash = builds.buildsByBranchName['origin/master'].revision.SHA1
  const {owner, repo} = getRepoName(builds)
  return {
    hash,
    owner,
    repo
  }
}

function getRemoteParts(builds) {
  const remote = builds.remoteUrls[0]
  return remote.split('/')
}

function getRepoName(builds) {
  const remoteParts = getRemoteParts(builds)
  const owner = remoteParts[remoteParts.length - 2]
  const repo = head(last(remoteParts).split('.'))
  return {owner, repo}
}

function getBuildsByBranchName(deploy): Object {
  return find(deploy.actions, a => a.buildsByBranchName)
}

async function fetchDeploy(project, id): Object {
  console.log('fetching deploy', id)
  const {data: deploy} = await axios({
    url: `***REMOVED***/job/${project}/${id}/api/json`,
    auth: credentials()
  })
  return await augmentWithPrInfo(deploy)
}


// todo: when parsing a deploy
// get the commit it was for
// if it was a merge commit, get the pr it as for
// get the pr description and title

export async function getGitHubUser(userName: string): Object {
  console.log('getting github user', userName, Object.keys(db.githubUsers))
  let user = db.githubUsers[userName]
  if (user) {
    return user
  }

  const gitHubUser = await getUser(userName)
  db.githubUsers[userName] = gitHubUser

  await write(db)
  return gitHubUser
}

export async function getHydratedBuilds(): Object {
  // grab the builds from jenkins
  // check if the newest one is newer than the one we have
  // if so, grab all the newer ones
  // store in db and save db
  //
  // return the builds
  let project = await fetchProject('STU-CM-Build-Master')
  let builds = project.builds || []
  // no builds, do nahthing
  if (builds.length == 0) {
    return db.builds
  }

  let newestBuildId = getIdFromBuild(builds[0])
  if (db.mostRecentBuild === newestBuildId) {
    return db.builds
  }

  let newerBuildNumbers = builds.map(getIdFromBuild).filter(buildNumber => buildNumber > db.mostRecentBuild)
  console.log('newerBuildNumbers are', newerBuildNumbers.length)

  for (let buildNumber of newerBuildNumbers) {
    db.builds[buildNumber] = await fetchDeploy('STU-CM-BUILD-Master', buildNumber)
    console.log('done fetching', buildNumber)
  }
  console.log('######################done setting build numbers, db is now set woo######################')

  db.mostRecentBuild = newerBuildNumbers[0]
  await write(db)
  console.log('done writing wooooo')
  return db.builds
}

load()
