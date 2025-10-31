import { IPaginationRequest } from './common'

// 线索
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
// 获取线索列表请求参数
export type IGetClueListRequest = IPaginationRequest & {
  userId: number // 用户id
  isImportantClue: boolean // 是否重要线索
  status?: number // 线索状态 1-跟进中 2-未跟进
  name?: string // 客户公司名称
}

// 更新线索请求参数
export type IUpdateClueRequest = {
  id: number // 线索id
  isImportantClue?: boolean // 是否重要线索
  isTop?: boolean // 是否置顶
}

// 简单获取所有线索（id和name）
export type IGetAllClueListRequest = {
  isImportantClue: boolean // 是否为重要线索
}
export type IGetAllClueListResponse = {
  id: number
  name: string
  unifiedSocialCreditCode: string // 统一社会信用代码
}[]

export type IFile = {
  name: string // 文件名
  size: number // 文件大小
  url: string // 文件url
  // type: string // 文件类型
  status?: string // 文件状态
}
// 新增跟进
export type IAddFollowUpRequest = {
  leadId: number // 线索id
  contactInfo: string // 联系信息
  type?: string // 跟进类型
  method?: string // 跟进方式
  followUpTime?: string // 跟进时间
  content: string // 跟进内容
  followUpFileList?: IFile[] | null // 跟进文件列表
}

// 跟进列表
export type IFollowUp = {
  id: number
  leadId: number // 线索id
  contactInfo: string // 联系信息
  type?: string // 跟进类型
  method?: string // 跟进方式
  followUpTime?: number // 跟进时间
  content: string // 跟进内容
  followUpFileList?: IFile[] | null // 跟进文件列表
  createTime: number // 创建时间
}
// 获取跟进列表请求参数
export type IGetFollowUpListRequest = IPaginationRequest & {
  leadId: number // 线索id
  content?: string // 跟进内容
}
