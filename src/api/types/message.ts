// 基础消息类型（不包含tableData）
export type IMessage = {
  id: number | null // 消息id
  userId: number // 用户id
  sessionId: number | null // 会话id
  keyword: string | null // 关键词
  userMessage: string // 用户问题
  reasoningProcess: string | null // 思考内容
  aiResponse: string | null // 正文内容
  tableType: 'empty' | 'corp' | 'phone' // 表格类型 empty无表格 corp企业 phone联系方式
  tableData?: any // 表格数据
  // tableTotal?: number // 表格数据总数
  // tableShowTotal?: number // 表格显示的数据总数
  isCollect: boolean // 是否收藏
  isLike: number // 是否点赞
  questionTime?: number // 问题时间
  answerTime?: number // 回答时间
  responseDuration?: number // 回答时长
  messageType?: number // 消息类型
  createTime?: number // 创建时间
  updateTime?: number // 更新时间
  creator?: string // 创建人
  updater?: string // 更新人
  deleted?: boolean // 是否删除
  // enterpriseInfo: string // 企业信息
  // enterpriseResultCount: number // 企业信息数量
}
