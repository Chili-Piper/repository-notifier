import {MatchResult} from './model/match-result'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {Config} from './model/config'

export async function handleMatchResultNotifications(
  config: Config,
  matchResults: MatchResult[]
) {
  core.debug(`handleMatchResultNotifications: ${JSON.stringify(matchResults)}`)
  const octokit = github.getOctokit(core.getInput('token'))

  for (const matchResult of matchResults) {
    const rule = matchResult.rule
    const result = matchResult.result
    core.info(`notifying for rule: ${JSON.stringify(rule)}`)
    try {
      await octokit.request('POST /repos/{owner}/{repo}/dispatches', {
        owner: github.context.repo.owner,
        repo: rule.repository,
        event_type: config.dispatchEventName
          ? config.dispatchEventName
          : 'notifier_event',
        client_payload: {
          ...result
        }
      })
    } catch (error) {
      core.setFailed(`Failed to send notification: ${error}`)
    }
  }
}
