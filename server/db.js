// @flow

import fs from 'fs'

import Bluebird from 'bluebird'
import github from 'octokat'
import axios from 'axios'

Bluebird.promisifyAll(fs)

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
  console.log('build is', build)
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

function fetchDeploy(project, id): Promise<Object> {
  console.log('fetching deploy', id)
  return axios({
    url: `***REMOVED***/job/${project}/${id}/api/json`,
    auth: credentials()
  }).then(res => res.data)
}

export async function getGitHubUser(userName: string): Object {
  console.log('getting github user', userName, Object.keys(db.githubUsers))
  let user = db.githubUsers[userName]
  if (user) {
    return user
  }

  const gitHubUser = await github({disableHypermedia: true}).users(userName).fetch()
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
