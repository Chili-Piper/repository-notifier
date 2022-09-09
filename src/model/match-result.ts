import {Rule} from './config'

export interface ContentMatchResult {
  [key: string]: string
}

export interface MatchResult {
  rule: Rule
  result?: ContentMatchResult
}
