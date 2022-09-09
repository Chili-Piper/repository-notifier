export interface Config {
  dispatchEventName?: string
  defaultContentMatchPattern?: string
  defaultGroupNames?: string[]
  rules: Rule[]
  mappers?: Mapper[]
}

export interface Rule {
  path: string
  contentMatchRegex?: string
  groupNames?: string[]
  eventName?: string
  repository: string
}

export interface Mapper {
  name: string
  from: string
  to: string
}
