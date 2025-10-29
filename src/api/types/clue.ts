import { IPaginationRequest } from './common'

export type IClue = {
  id: number // 线索id
  userId: number // 用户id
  logo?: string // 客户logo
  customerCompanyName: string // 客户公司名称
  followUpDays: number | null // 跟进天数
  isImportantClue: boolean // 是否重要线索
  isTop: boolean // 是否置顶
  lastFollowUpTime: number | null // 最后跟进时间
  source: string // 线索来源
  status: number // 线索状态 1-跟进中 2-未跟进
  unifiedSocialCreditCode: string // 统一社会信用代码
  createTime: number // 创建时间
}

export type IGetClueListRequest = IPaginationRequest & {
  userId: number // 用户id
  isImportantClue: boolean // 是否重要线索
  status?: number // 线索状态 1-跟进中 2-未跟进
  name?: string // 客户公司名称
}
