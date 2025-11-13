import { createAsyncThunk } from '@reduxjs/toolkit'
import { IThunkState } from '../types/index'
import { setLoading, setConversations, setFavorites } from '../modules/conversation'
import { aiSessionListAPI, updateMessageAPI, userFavoriteListAPI } from '@/api/chatMsg'
import { setMessageIdAction, setMessageListAction } from '../modules/session'

// 将API转换为Promise
const aiSessionListPromise = (params: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    aiSessionListAPI(params, (res) => {
      if (res.success) {
        resolve(res.data)
      } else {
        reject(res)
      }
    })
  })
}

const userFavoriteListPromise = (params: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    userFavoriteListAPI(params, (res) => {
      if (res.success) {
        resolve(res.data)
      } else {
        reject(res)
      }
    })
  })
}

// 获取会话列表
export const getSessionListAsync = createAsyncThunk<void, void, IThunkState>(
  'conversation/getSessionListAsync',
  async (_, { dispatch, getState }) => {
    const state = getState()
    const userId = state.login.userInfo?.id
    
    if (!userId) {
      console.error('用户未登录')
      return
    }
    
    dispatch(setLoading(true))
    
    try {
      const data = await aiSessionListPromise({ userId })
      const convertedData = Object.entries(data).map(([name, list]) => ({
        name,
        list: list as any[]
      }))
      dispatch(setConversations(convertedData))
    } catch (error) {
      console.error('获取会话列表失败:', error)
    } finally {
      dispatch(setLoading(false))
    }
  },
  {
    condition: undefined
  }
)

// 获取收藏列表
export const getFavoriteListAsync = createAsyncThunk<void, void, IThunkState>(
  'conversation/getFavoriteListAsync',
  async (_, { dispatch, getState }) => {
    const state = getState()
    const userId = state.login.userInfo?.id
    
    if (!userId) {
      console.error('用户未登录')
      return
    }
    
    dispatch(setLoading(true))
    
    try {
      const data = await userFavoriteListPromise({ userId })
      const favoriteList = data.map((item: any) => ({
        ...item,
        role: 'ai',
        apiStatus: {
          textComplete: true,
          companyComplete: true
        },
        content: item.contentSummary,
        companyList: JSON.parse(item.enterpriseInfo).companyList,
        splitNum: JSON.parse(item.enterpriseInfo).splitNum,
        total: JSON.parse(item.enterpriseInfo).total
      }))
      dispatch(setFavorites(favoriteList))
    } catch (error) {
      console.error('获取收藏列表失败:', error)
    } finally {
      dispatch(setLoading(false))
    }
  },
  {
    condition: undefined
  }
)

export const finalUpdateMessageAsync = createAsyncThunk<
  void, // 返回的数据类型，你可以根据实际API返回类型调整
  { messageId: number;sessionId: number; isSuccess: boolean },
  IThunkState
>('session/updateFinalMessageAsync', async ({ messageId, sessionId, isSuccess }, { dispatch, getState }) => {
  console.log('finalUpdateMessageAsync', messageId)
  // 在此请求接口获取数据
  const {
    session: { messageList }
  } = getState()
  const messageIndex = messageList.findIndex((message) => message.id == null)
  const message = messageList[messageIndex]
  console.log('finalUpdateMessageAsync', message)
  await updateMessageAPI({
    ...message,
    aiResponse: isSuccess ? message.aiResponse : '回复失败，请稍后重试',
    id: messageId
  })
  dispatch(
    setMessageListAction({
      id: null,
      aiResponse: isSuccess ? message.aiResponse : '回复失败，请稍后重试'
    })
  )
  dispatch(
    setMessageIdAction({
      oldId: null,
      newId: messageId
    })
  )
})
