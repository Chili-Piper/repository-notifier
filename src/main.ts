import * as core from '@actions/core'
import {wait} from './wait'
import {promises as fs} from 'fs'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.info('Loading config...')
    const configFileName = core.getInput('config-file')
    const content = await fs.readFile(configFileName, 'utf8')
    core.debug('config: ' + content)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
