# THE MAGICAL DEPLOY DASHBOARD WOOOOOOOOOO

This is a humble dashboard to show how often we deploy, and what the contents
of those deploys are.

## Installation And Running

Install Elm 0.16 and MongoDB.


Create a JSON file called `server/lib/jenkins-to-deploy.json` that maps jenkins usernames to their corresponding github username.


Run this:

```bash
npm i
npm run build
npm start
```

This will build the front-end code (both Elm and JS), and start the server on
port 2999 by default. Visit [http://localhost:2999](http://localhost:2999) to
see the deploys.


The first time this runs, it will need to grab a bunch of builds from Jenkins.
This can take a minute or two.


Also, Jenkins only exposes the last 50 builds through the api, so by default it
won't start with that much data.


## Configuration

Config happens in `server/config.js`. The config pulls from environment
variables. You'll need to supply a github oauth token, a jenkins url, a jenkins
username, and a jenkins auth token. See [here](https://wiki.jenkins-ci.org/display/JENKINS/Authenticating+scripted+clients) for how to generate an auth token for a jenkins user.

## TODO

- [x] format relative dates on deploys
- [x] remove extra quotes on relative time formatting
- [x] get initial current time faster so we don't have to update every second
- [x] get current date
- [x] get only deploys for a single day
- [x] get all deploys for the current week
- [x] get current week
- [ ] split up deploys by week to display a single sprint
- [x] handle errors somewhere in the ui
- [x] on click, expand row to fill the whole panel
- [x] Pull title and description from commit if the deploy commit isn't a pr merge
- [x] sort the deploys by time
- [x] add an endpoint to get stats for past weeks
- [x] use an actual db ya mook (but still use a seed file of some kind i guess)
- [x] use real config instead of hard-coded tokens that i have to expire now
- [x] rotate keys
- [x] only show successful deploys
- [x] make jenkins url configurable


### deploys/commits:

- [x] why do the commits not show up?
- [x] make deploy expand and collapse
- [x] format expanded deploy correctly
- [ ] make commits expand and collapse
- [ ] add commit user


### graph:
- [x] implement stats endpoint
- [x] grab graph data from server instead of hardcoding
- [x] hook grabbing graph data up to elm
- [x] style graph
- [x] make graph a child of the div the elm app is in so it is the same width
- [ ] make tool-tip styled and labeled correctly
- [x] add tool-tips to graph

Longer term improvements:

* Animations to things expanding and collapsing
* Pull more than the past 50 builds from jenkins
* clean up the horrible mess that is the css
