import { IMessage } from '@/api/types/message'

// 会话相关 Redux 类型（对齐 PC 端结构）
export interface ISessionState {
  sessionList: any[]
  messageList: IMessage[]
  streamStatus: 'idle' | 'streaming'
}

// 流式事件（简化版，按小程序端事件对齐）
export interface IStreamEvent {
  name: 'thinking' | 'text' | 'json'
  data: any
}

// 局部消息更新（根据 id 精准更新）
export interface IUpdateMessageRequest {
  id: number | null
  keyword?: string | null
  userMessage?: string
  reasoningProcess?: string | null
  aiResponse?: string | null
  tableType?: 'empty' | 'corp' | 'phone'
  tableData?: any
  isCollect?: boolean
  isLike?: number
}