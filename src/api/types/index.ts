export interface IResponse<T = any> {
  success: boolean
  data: T
  errMsg?: any
}

export type IAPIResponse<T = any> = {
  code: number
  data: T
  msg?: any
}

export * from './common'
export * from './company'
export * from './clue'
