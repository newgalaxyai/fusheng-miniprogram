import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISessionState, IStreamEvent, IUpdateMessageRequest } from '@/redux/types/session'

// 初始状态（参考 PC 端）
const initialState: ISessionState = {
  sessionList: [],
  messageList: [],
  streamStatus: 'idle'
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // 会话列表（目前小程序端暂不改动使用场景）
    setSessionListAction(state, { payload }: PayloadAction<ISessionState['sessionList']>) {
      state.sessionList = payload
    },
    // 添加新消息（id 为 null 的占位消息）
    addMessageListAction(state, { payload }: PayloadAction<ISessionState['messageList']>) {
      state.messageList = state.messageList.concat(payload)
    },
    // 全量替换消息列表（加载历史时）
    setAllMessageListAction(state, { payload }: PayloadAction<ISessionState['messageList']>) {
      if (state.streamStatus === 'idle') {
        state.messageList = [...payload]
      }
    },
    // 局部更新某条消息（按 id 精确匹配）
    setMessageListAction(state, { payload }: PayloadAction<IUpdateMessageRequest>) {
      state.messageList = state.messageList.map(message => {
        if (message.id === payload.id) {
          return { ...message, ...payload }
        }
        return message
      })
    },
    // 更新某条消息的 id（将占位消息 id: null 置为真实 id）
    setMessageIdAction(
      state,
      { payload }: PayloadAction<{ oldId: number | null; newId: number }>
    ) {
      state.messageList = state.messageList.map(message => {
        if (message.id === payload.oldId) {
          return { ...message, id: payload.newId }
        }
        return message
      })
      if (payload.oldId == null) {
        state.streamStatus = 'idle'
      }
    },
    // 流式更新（定位到当前占位消息 id: null）
    setStreamMessageListAction(state, { payload }: PayloadAction<IStreamEvent>) {
      const idx = state.messageList.findIndex(message => message.id == null)
      if (idx < 0) return
      const message = state.messageList[idx]
      switch (payload.name) {
        case 'thinking':
          state.messageList[idx] = {
            ...message,
            reasoningProcess: (message.reasoningProcess || '') + (payload.data || '')
          }
          break
        case 'text':
          state.messageList[idx] = {
            ...message,
            aiResponse: (message.aiResponse || '') + (payload.data || '')
          }
          break
        case 'json':
          state.messageList[idx] = {
            ...message,
            tableData: payload.data
          }
          break
        default:
          break
      }
    },
    setStreamStatusAction(state, { payload }: PayloadAction<ISessionState['streamStatus']>) {
      state.streamStatus = payload
    }
  }
})

export const {
  setSessionListAction,
  addMessageListAction,
  setAllMessageListAction,
  setMessageListAction,
  setMessageIdAction,
  setStreamMessageListAction,
  setStreamStatusAction
} = sessionSlice.actions

export default sessionSlice.reducer