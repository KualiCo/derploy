// @flow

import chalk from 'chalk'
import inquirer from 'inquirer'
import mongoose from 'mongoose'

import '../config'
import Deploys from '../models/deploys'

const question = {
  type: 'confirm',
  name: 'yup',
  message: chalk.red('You are about to drop all data. Are you sure?'),
  default: false
}

function drop() {
  inquirer.prompt([question], function(answers) {
    if (answers.yup) {
      Deploys.collection.drop((err, res) => {
        if (err) {
          console.error(chalk.red('error dropping:'))
          console.error(err)
        } else {
          console.log(chalk.green('drop successful'))
        }

        mongoose.disconnect()
      })
    } else {
      mongoose.disconnect()
    }
  })
}

drop()
