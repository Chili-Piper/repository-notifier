import * as core from '@actions/core'
import * as github from '@actions/github'
import {promises as fs} from 'fs'
import yaml from 'js-yaml'
import {Config, Rule} from './model/config'
import {PushEvent} from '@octokit/webhooks-definitions/schema'
import {PaginateInterface} from '@octokit/plugin-paginate-rest'
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import {Octokit} from '@octokit/core'
import {ContentMatchResult, MatchResult} from './model/match-result'
import {handleMatchResultNotifications} from './notify'

function getMatchPattern(rule: Rule, config: Config): string | undefined {
  return rule.contentMatchRegex
    ? rule.contentMatchRegex
    : config.defaultContentMatchPattern
}

function getGroupNames(rule: Rule, config: Config) {
  return rule.groupNames ? rule.groupNames : config.defaultGroupNames
}

async function checkMatches(
  octokit: Octokit & Api & {paginate: PaginateInterface},
  config: Config
) {
  const pushPayload = github.context.payload as PushEvent
  const matchResults: MatchResult[] = []

  const compare = await octokit.request(
    'GET /repos/{owner}/{repo}/compare/{basehead}',
    {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      basehead: `${pushPayload.before}...${pushPayload.after}`
    }
  )

  core.info(`compare status: ${compare.data.status}`)

  if (compare && compare.data && compare.data.files) {
    compare.data.files.map(file => {
      core.info(`file changed: ${file.filename}`)
      config.rules.map(rule => {
        core.debug(`rule: ${JSON.stringify(rule)}`)
        if (file.filename.match(rule.path)) {
          const matchPattern = getMatchPattern(rule, config)
          if (matchPattern) {
            const regexMatch = file.patch?.match(matchPattern)

            if (regexMatch) {
              core.info(
                `file's content matched: ${file.filename}. (match pattern: ${matchPattern})`
              )

              const groupNames = getGroupNames(rule, config)
              const contentMatchResult: ContentMatchResult = {}
              core.debug(`group names: ${JSON.stringify(groupNames)}`)
              core.debug(`regex match: ${JSON.stringify(regexMatch)}`)
              regexMatch.forEach((match, idx) => {
                if (idx > 0) {
                  if (groupNames && groupNames[idx - 1]) {
                    contentMatchResult[groupNames[idx - 1]] = match
                  }
                }
              })

              matchResults.push({rule, result: contentMatchResult})
            }
          } else {
            matchResults.push({rule})
          }
        }
      })
    })
  } else {
    core.info('No files changed. Skipping...')
  }

  return matchResults
}

async function applyMappers(config: Config, matchResults: MatchResult[]) {
  if (config.mappers) {
    config.mappers.forEach(mapper => {
      matchResults.forEach(matchResult => {
        if (
          matchResult.result &&
          matchResult.result[mapper.name] &&
          matchResult.result[mapper.name] === mapper.from
        ) {
          core.debug(
            `mapper applied: ${JSON.stringify(
              mapper
            )}; MatchResult: ${JSON.stringify(matchResult)}`
          )
          matchResult.result[mapper.name] = mapper.to
        }
      })
    })
  }

  return matchResults
}

async function run(): Promise<void> {
  try {
    core.info('Loading config...')
    const configFileName = core.getInput('config-file')
    const content = await fs.readFile(`./${configFileName}`, 'utf8')
    const config: Config = yaml.load(content) as Config

    core.info(`config:`)
    core.info(`${JSON.stringify(config)}`)

    const octokit = github.getOctokit(core.getInput('token'))

    if (github.context.eventName !== 'push') {
      core.info(`Event name is ${github.context.eventName}. Skipping...`)
      return
    }

    const matchResults = await applyMappers(
      config,
      await checkMatches(octokit, config)
    )

    core.info(`matched rules: ${JSON.stringify(matchResults)}`)

    await handleMatchResultNotifications(config, matchResults)

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
