import {Config} from './model/config'
import {MatchResult} from './model/match-result'
import * as core from '@actions/core'
import axios from 'axios'

export async function handleImNotifications(
  config: Config,
  matchResults: MatchResult[]
) {
  const slackUrl = core.getInput('slack-url')
  if (!slackUrl) {
    core.debug('Slack not enabled. Ignoring notifications...')
    return
  }

  const slackNotifier = config.imNotifiers.find(value => value.type === 'SLACK')

  if (!slackNotifier) {
    core.debug('No slack notifier found. Ignoring notifications...')
    return
  }

  const promises = matchResults.map(async value => {
    if (value.rule.imNotifier && value.rule.imNotifier === slackNotifier.name) {
      await axios.post(slackUrl, {
        text: `Version update: ${value.rule.path}. ${JSON.stringify(
          value.result
        )}`
      })
    }
  })

  await Promise.all(promises)
}
