// @flow

import axios from 'axios'
import {find, head, last} from 'lodash'

import augmentWithPrInfo from './augment-deploy-with-pr'
import {JENKINS_USER, JENKINS_KEY, JENKINS_URL} from '../config'

type Build = {
  number: number,
  url: string
}

function getIdFromBuild(build: Build): number {
  return build.number
}

function credentials() {
  return {
    username: JENKINS_USER,
    password: JENKINS_KEY
  }
}

function fetchProject(project: string): Promise<Object> {
  return axios({
    url: `${JENKINS_URL}/job/${project}/api/json`,
    auth: credentials()
  }).then(res => res.data)
}

export async function getBuildsNewerThan(
  project: string,
  newestBuildIdFromDb: ?string
): Promise<Array<Object>> {

  let fetchedProject = await fetchProject(project)
  let builds = fetchedProject.builds || []
  // no builds, do nahthing
  if (builds.length == 0) {
    return Promise.resolve([])
  }

  let newestBuildId = getIdFromBuild(builds[0])
  if (newestBuildIdFromDb === newestBuildId) {
    return Promise.resolve([])
  }

  let newerBuildNumbers = builds.map(getIdFromBuild)
    .filter(buildNumber => buildNumber > newestBuildIdFromDb)

  let newBuilds = []
  //newBuilds.push(await fetchDeploy(project, newerBuildNumbers[0]))
  for (let buildNumber of newerBuildNumbers) {
    newBuilds.push(await fetchDeploy(project, buildNumber))
  }

  return newBuilds
}

function fetchDeploy(project: string, id: string): Promise<Object> {
  return axios({
    url: `${JENKINS_URL}/job/${project}/${id}/api/json`,
    auth: credentials()
  })
  .then(r => r.data)
  .then(augmentWithPrInfo)
}
