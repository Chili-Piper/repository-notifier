import * as core from '@actions/core'
import * as github from '@actions/github'
import {wait} from './wait'
import {promises as fs} from 'fs'
import yaml from 'js-yaml'
import {Config} from './model/config'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.info('Loading config...')
    const configFileName = core.getInput('config-file')
    const content = await fs.readFile(`./${configFileName}`, 'utf8')
    const doc: Config = yaml.load(content) as Config

    core.info(`config:`)
    core.info(`${JSON.stringify(doc)}`)

    core.info(`before: ${github.context.payload.before}`)
    core.info(`ref: ${github.context.ref}`)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
