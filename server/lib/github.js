// @flow

import axios from 'axios'
import {GH_TOKEN} from '../config'

let userCache = {}
export function getUser(userName: string): Promise<Object> {
  if (userCache[userName]) {
    return Promise.resolve(userCache[userName])
  }

  return axios.get(`https://api.github.com/users/${userName}`)
  .then(r => r.data)
  .then(user => {
    userCache[userName] = user
    return user
  })
}

export function getCommit(org: string, repo: string, id: string): Promise<Object> {
  return axios({
    url: `https://api.github.com/repos/${org}/${repo}/commits/${id}`,
    params: {
      access_token: GH_TOKEN
    }
  }).then(r => r.data)
}

export function getPR(org: string, repo: string, id: string): Promise<Object> {
  return axios({
    url: `https://api.github.com/repos/${org}/${repo}/pulls/${id}`,
    params: {
      access_token: GH_TOKEN
    }
  }).then(r => r.data)
}
