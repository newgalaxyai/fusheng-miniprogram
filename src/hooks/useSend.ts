import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore'
import {
  addMessageListAction,
  setMessageIdAction,
  setMessageListAction,
  setStreamMessageListAction,
  setStreamStatusAction
} from '@/redux/modules/session'
import {
  aiSessionCreateAPI,
  aiMessageCreateAPI,
  aiSessionUpdateAPI,
  streamAIAnswerAPI
} from '@/api/chatMsg'
import { IMessage } from '@/api/types/message'
import { finalUpdateMessageAsync } from '@/redux/asyncs/conversation'

// 参考 PC 端实现的小程序端消息发送 Hook
export const useSend = () => {
  const dispatch = useAppDispatch()
  const {
    login: { userInfo },
    session: { messageList }
  } = useAppSelector(state => state)

  // 流式回答（对齐 PC 端事件处理）
  const streamAIAnswer = async (
    data: {
      query: string
      response_mode: 'streaming'
      target_company_name: string
      target_company_serve: string
      conversation_id: string
    },
    nowMessageId: number,
    nowSessionId: number
  ) => {
    streamAIAnswerAPI(data, {
      onMessage: ({ name, data }) => {
        // console.log('streamAIAnswerName', name)
        // console.log('streamAIAnswer', data)

        const eventName = String(name || '')
        if (eventName === 'thinking' || eventName === 'text' || eventName === 'json') {
          dispatch(
            setStreamMessageListAction({
              name: eventName as 'thinking' | 'text' | 'json',
              data
            })
          )
        } else if (eventName === 'start_table') {
          dispatch(
            setMessageListAction({
              id: null,
              tableType: String(data || 'empty') as 'empty' | 'corp' | 'phone'
            })
          )
        } else if (eventName === 'conversation_id') {
          const convId = String(data || '')
          aiSessionUpdateAPI(
            {
              id: nowSessionId,
              userId: userInfo?.id,
              conversationId: convId
            },
            () => {
              // 可选：刷新会话列表
              //     dispatch(
              //   setMessageListAction({
              //     id: null,
              //   })
              // )
            }
          )
        } else if (eventName === 'keywords') {
          dispatch(
            setMessageListAction({
              id: null,
              keyword: String(data || '')
            })
          )
          // 备注：如有消息更新接口，可在此调用
        } else if (eventName === 'done') {
          dispatch(setStreamStatusAction('idle'))
          // 完成：将占位消息 id:null 更新为真实 id
          dispatch(
            finalUpdateMessageAsync({
              messageId: nowMessageId,
              isSuccess: true
            })
          )
        }
      },
      onError: error => {
        dispatch(setStreamStatusAction('idle'))
        // 完成：将占位消息 id:null 更新为真实 id
        dispatch(
          finalUpdateMessageAsync({
            messageId: nowMessageId,
            isSuccess: false
          })
        )
      },
      onComplete: () => {
        dispatch(setStreamStatusAction('idle'))
        // 完成：将占位消息 id:null 更新为真实 id
        dispatch(
          finalUpdateMessageAsync({
            messageId: nowMessageId,
            isSuccess: true
          })
        )
      }
    })
  }

  // 发送消息（参考 PC 端流程）
  const sendMessage = async (
    userMessage: string,
    isThinking: boolean,
    sessionId: number | null,
    conversationId: string,
    clearInputValue: () => void
  ) => {
    let newMessage: IMessage = {
      id: null,
      userId: userInfo?.id!,
      sessionId,
      keyword: null,
      userMessage,
      reasoningProcess: null,
      aiResponse: null,
      tableType: 'empty',
      tableData: [],
      isCollect: false,
      isLike: 0
    }
    let nowMessageId: number | null = null
    let nowSessionId: number | null = null
    try {
      // 添加占位消息
      dispatch(addMessageListAction([newMessage]))
      if (sessionId) {
        nowSessionId = sessionId
      } else {
        const newSessionRes = await new Promise<{ success: boolean; data?: number }>(resolve => {
          aiSessionCreateAPI({ userId: userInfo?.id }, res => resolve(res as any))
        })
        if (newSessionRes.success && newSessionRes.data) {
          nowSessionId = newSessionRes.data
        } else {
          return
        }
      }

      // 清空输入框
      clearInputValue()
      if (!sessionId) {
        // 更新占位消息的 sessionId
        dispatch(
          setMessageListAction({
            id: null,
            sessionId: nowSessionId!
          } as any)
        )
      }

      // 服务端创建消息
      const newMessageRes = await new Promise<{ success: boolean; data?: number }>(resolve => {
        aiMessageCreateAPI({ ...newMessage, sessionId: nowSessionId! }, res => resolve(res as any))
      })
      if (newMessageRes.success && typeof newMessageRes.data === 'number') {
        nowMessageId = newMessageRes.data
      } else {
        throw new Error('创建新消息失败')
      }

      // 开始流式回答
      const streamQueryData = {
        query: userMessage,
        response_mode: 'streaming' as const,
        target_company_name: userInfo?.companyName || '',
        target_company_serve: userInfo?.targetCompanyServe || '',
        conversation_id: conversationId || ''
      }
      dispatch(setStreamStatusAction('streaming'))
      await streamAIAnswer(streamQueryData, nowMessageId!, nowSessionId!)
    } catch (error) {
      console.log('sendMessage error', error)
      dispatch(setStreamStatusAction('idle'))
      const errorMessage = {
        id: null,
        aiResponse: '回复失败，请稍后重试'
      }
      dispatch(setMessageListAction(errorMessage))
      if (nowMessageId) {
        // 有真实消息 id，直接将占位消息替换为真实 id
        dispatch(
          setMessageIdAction({
            oldId: null,
            newId: nowMessageId
          })
        )
      } else {
        // 服务端无 id，则尝试创建错误消息
        const newMessageRes = await new Promise<{ success: boolean; data?: number }>(resolve => {
          aiMessageCreateAPI({ ...newMessage, ...errorMessage, sessionId: nowSessionId! }, res =>
            resolve(res as any)
          )
        })
        if (newMessageRes.success && typeof newMessageRes.data === 'number') {
          nowMessageId = newMessageRes.data
          dispatch(
            setMessageIdAction({
              oldId: null,
              newId: nowMessageId
            })
          )
        }
      }
    }
  }

  return { sendMessage }
}
