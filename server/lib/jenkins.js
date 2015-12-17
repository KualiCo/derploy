// @flow

import axios from 'axios'
import {find, head, last} from 'lodash'

import {getCommit, getPR, getUser} from './github'

type Build = {
  number: number,
  url: string
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

export async function getBuildsNewerThan(
  project: string,
  buildId: string
): Promise<Array<Object>> {

  let fetchedProject = await fetchProject(project)
  let builds = fetchedProject.builds || []
  // no builds, do nahthing
  if (builds.length == 0) {
    return Promise.resolve([])
  }

  let newestBuildId = getIdFromBuild(builds[0])
  let newestBuildIdFromDb = await this.getLastId(project)
  if (newestBuildIdFromDb === newestBuildId) {
    return Promise.resolve([])
  }

  let newerBuildNumbers = builds.map(getIdFromBuild)
    .filter(buildNumber => buildNumber > newestBuildIdFromDb)

  let newBuilds = []
  for (let buildNumber of newerBuildNumbers) {
    newBuilds.push(await fetchDeploy(project, buildNumber))
  }

  return newBuilds
}

async function fetchDeploy(project: string, id: string): Object {
  console.log('fetching deploy', id)
  const {data: deploy} = await axios({
    url: `***REMOVED***/job/${project}/${id}/api/json`,
    auth: credentials()
  })
  return await augmentWithPrInfo(deploy)
}

