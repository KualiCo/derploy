// @flow

// We transform objects from jenkins in to living, breathing, real deploys

import {find, head, last} from 'lodash'

import {getCommit, getPR} from './github'

type CommitInfo = {
  hash: string,
  owner: string,
  repo: string
}

export default async function augmentWithPrInfo(deploy: Object): Object {
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

function getBuildsByBranchName(deploy): Object {
  return find(deploy.actions, a => a.buildsByBranchName)
}

function getRepoName(builds) {
  const remoteParts = getRemoteParts(builds)
  const owner = remoteParts[remoteParts.length - 2]
  const repo = head(last(remoteParts).split('.'))
  return {owner, repo}
}

function getRemoteParts(builds) {
  const remote = builds.remoteUrls[0]
  return remote.split('/')
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
