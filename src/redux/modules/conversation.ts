import { createSlice } from '@reduxjs/toolkit'

// 会话消息接口
export interface IMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: number
  companyList: any[]
  apiStatus: { textComplete: boolean; companyComplete: boolean }
  messageId: string
  splitNum: number
  total: number
  conclusion: string
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
  // 会话消息集合：sessionId -> messages
  sessionMessages: Record<string, IMessage[]>
  // 正在生成的会话ID集合
  generatingConversationIds: string[]
}

const initialState: IConversationState = {
  conversations: [],
  currentConversationId: null,
  favorites: [],
  loading: false,
  sessionMessages: {},
  generatingConversationIds: []
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

    // 设置特定会话的消息列表
    setSessionMessages: (state, { payload }: { payload: { sessionId: string; messages: IMessage[] } }) => {
      state.sessionMessages[payload.sessionId] = payload.messages
      return state
    },

    // 添加单条消息到特定会话
    addSessionMessage: (state, { payload }: { payload: { sessionId: string; message: IMessage } }) => {
      if (!state.sessionMessages[payload.sessionId]) {
        state.sessionMessages[payload.sessionId] = []
      }
      state.sessionMessages[payload.sessionId].push(payload.message)
      return state
    },

    // 更新特定会话的单条消息
    updateSessionMessage: (state, { payload }: { payload: { sessionId: string; messageId: string } & Partial<IMessage> }) => {
      const messages = state.sessionMessages[payload.sessionId]
      if (messages) {
        const index = messages.findIndex(m => m.messageId === payload.messageId)
        if (index !== -1) {
          messages[index] = { ...messages[index], ...payload }
        }
      }
      return state
    },

    // 追加特定会话的消息内容
    appendSessionMessageContent: (state, { payload }: { payload: { sessionId: string; messageId: string; content: string } }) => {
      const messages = state.sessionMessages[payload.sessionId]
      if (messages) {
        const index = messages.findIndex(m => m.messageId === payload.messageId)
        if (index !== -1) {
          messages[index].content += payload.content
        }
      }
      return state
    },

    // 设置会话生成状态
    setConversationGenerating: (state, { payload }: { payload: { sessionId: string; isGenerating: boolean } }) => {
      if (payload.isGenerating) {
        if (!state.generatingConversationIds.includes(payload.sessionId)) {
          state.generatingConversationIds.push(payload.sessionId)
        }
      } else {
        state.generatingConversationIds = state.generatingConversationIds.filter(id => id !== payload.sessionId)
      }
      return state
    }
  }
})

export const { setLoading, setConversations, setCurrentConversationId, setFavorites, setSessionMessages, addSessionMessage, updateSessionMessage, appendSessionMessageContent, setConversationGenerating } = conversationSlice.actions

export default conversationSlice.reducer
