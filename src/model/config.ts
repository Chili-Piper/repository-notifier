export interface Config {
  rules: Rule[]
}

export interface Rule {
  path: string
  eventName?: string
  repository: string
}
