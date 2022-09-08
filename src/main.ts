import * as core from '@actions/core'
import * as github from '@actions/github'
import {promises as fs} from 'fs'
import yaml from 'js-yaml'
import {Config} from './model/config'
import {PushEvent} from '@octokit/webhooks-definitions/schema'

async function run(): Promise<void> {
  try {
    core.info('Loading config...')
    const configFileName = core.getInput('config-file')
    const content = await fs.readFile(`./${configFileName}`, 'utf8')
    const doc: Config = yaml.load(content) as Config

    core.info(`config:`)
    core.info(`${JSON.stringify(doc)}`)

    const octokit = github.getOctokit(core.getInput('token'))

    if (github.context.eventName === 'push') {
      const pushPayload = github.context.payload as PushEvent

      core.info(`before: ${pushPayload.before}`)
      core.info(`after: ${pushPayload.after}`)
      core.info(`ref: ${github.context.ref}`)

      const compare = await octokit.request(
        'GET /repos/{owner}/{repo}/compare/{basehead}',
        {
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          basehead: `${pushPayload.before}...${pushPayload.after}`
        }
      )

      core.info(`compare:`)
      core.info(`${JSON.stringify(compare)}`)
    }

    //.rest.repos.createDispatchEvent({

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
