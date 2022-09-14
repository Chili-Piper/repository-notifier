import {ImNotifier} from './im-notifier'

export interface Config {
  dispatchEventName?: string
  defaultContentMatchPattern?: string
  defaultRegexGroupNames?: string[]
  rules: Rule[]
  mappers?: Mapper[]
  imNotifiers: ImNotifier[]
}

export interface Rule {
  path: string
  contentMatchRegex?: string
  regexGroupNames?: string[]
  repository: string
  imNotifier?: string
}

export interface Mapper {
  name: string
  from: string
  to: string
}
