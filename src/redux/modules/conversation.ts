import { createSlice } from '@reduxjs/toolkit'

// 会话消息接口
export interface IMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
  companyList?: any[]
  apiStatus?: { textComplete: boolean; companyComplete: boolean }
  messageId?: string
  splitNum?: number
  total?: number
  conclusion?: string
  isCollect?: boolean
  isLike?: number
}

// 历史会话接口
export interface IConversation {
  name: string
  list: IMessage[]
  createdAt: number
  updatedAt: number
}

// 收藏项接口
export interface IFavoriteItem {
  id: string
  type: 'company' | 'message' | 'conversation'
  title: string
  content: any
  createdAt: number
  tags?: string[]
}

// 会话状态接口
export interface IConversationState {
  conversations: IConversation[]
  currentConversationId: string | null
  favorites: IFavoriteItem[]
  loading: boolean
  // New state for current chat
  currentMessages: IMessage[]
  isStreaming: boolean
}

const initialState: IConversationState = {
  conversations: [],
  currentConversationId: null,
  favorites: [],
  loading: false,
  currentMessages: [],
  isStreaming: false
}

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    // 设置加载状态
    setLoading: (state, { payload }) => {
      state.loading = payload
      return state
    },

    // 设置会话列表
    setConversations: (state, { payload }) => {
      state.conversations = payload
      return state
    },

    // 设置当前会话ID
    setCurrentConversationId: (state, { payload }) => {
      state.currentConversationId = payload
      return state
    },

    // 设置收藏列表
    setFavorites: (state, { payload }) => {
      state.favorites = payload
      return state
    },

    // New Reducers for Chat
    setMessages: (state, { payload }) => {
      state.currentMessages = payload
    },

    setIsStreaming: (state, { payload }) => {
      state.isStreaming = payload
    },

    addMessage: (state, { payload }) => {
      state.currentMessages.push(payload)
    },

    appendMessageContent: (state, { payload }) => {
      const { messageId, content } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.content += content
      }
    },

    updateMessageStatus: (state, { payload }) => {
      const { messageId, status } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.apiStatus = { ...msg.apiStatus, ...status }
      }
    },

    updateMessageCompanyList: (state, { payload }) => {
      const { messageId, companyList } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.companyList = companyList
      }
    },

    updateMessageTotal: (state, { payload }) => {
      const { messageId, total } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.total = total
      }
    },

    updateMessageSplitNum: (state, { payload }) => {
      const { messageId, splitNum } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.splitNum = splitNum
      }
    },

    updateMessageConclusion: (state, { payload }) => {
      const { messageId, conclusion } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.conclusion = conclusion
      }
    },

    updateMessageLikeStatus: (state, { payload }) => {
      const { messageId, isLike } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.isLike = isLike
      }
    },

    updateMessageCollectStatus: (state, { payload }) => {
      const { messageId, isCollect } = payload
      const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
      if (msg) {
        msg.isCollect = isCollect
      }
    },

    // Update message ID (e.g. after saving to DB)
    updateMessageId: (state, { payload }) => {
      const { oldId, newId } = payload
      const msg = state.currentMessages.find(m => m.messageId === oldId)
      if (msg) {
        msg.messageId = newId
        msg.id = newId // Also update id if it matches
      }
    }
  }
})

export const { setLoading, setConversations, setCurrentConversationId, setFavorites, setMessages, setIsStreaming, addMessage, appendMessageContent, updateMessageStatus, updateMessageCompanyList, updateMessageTotal, updateMessageSplitNum, updateMessageConclusion, updateMessageLikeStatus, updateMessageCollectStatus, updateMessageId } = conversationSlice.actions

export default conversationSlice.reducer
