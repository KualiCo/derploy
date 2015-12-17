// @flow

import axios from 'axios'

  // TODO: get this token from some config files
const TOKEN = '***REMOVED***'

export function getUser(userName: string): Promise<Object> {
  return axios.get(`https://api.github.com/users/${userName}`).then(r => r.data)
}

export function getCommit(org: string, repo: string, id: string): Promise<Object> {
  return axios({
    url: `https://api.github.com/repos/${org}/${repo}/commits/${id}`,
    params: {
      access_token: TOKEN
    }
  }).then(r => r.data)
}

export function getPR(org: string, repo: string, id: string): Promise<Object> {
  return axios({
    url: `https://api.github.com/repos/${org}/${repo}/pulls/${id}`,
    params: {
      access_token: TOKEN
    }
  }).then(r => r.data)
}
