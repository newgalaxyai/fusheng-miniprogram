import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
  useImperativeHandle
} from 'react'
import { View, Image, Input, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'
import {
  textStageAPI,
  companyStageAPI,
  guessYouWantAPI,
  aiSessionCreateAPI,
  aiMessageCreateAPI,
  aiSessionUpdateAPI,
  aiMessageEvaluationCreateAPI,
  userFavoriteCreateAPI,
  preprocessingAPI,
  streamAIAnswerAPI
} from '@/api/chatMsg'
import { useAppSelector } from '@/hooks/useAppStore'
import { Dialog, TextArea, BackTop } from '@nutui/nutui-react-taro'
import { ArrowDownSize6, ArrowUpSize6 } from '@nutui/icons-react-taro'
import { useAppDispatch } from '@/hooks/useAppStore'
import { getSessionListAsync, getFavoriteListAsync } from '@/redux/asyncs/conversation'
import AiMessageComponent from '@/components/AiMessageComponent'
import { IMessage } from '@/api/types/message'

// UI 扩展类型，不改变服务端 IMessage 的结构
type MessageUI = IMessage & {
  clientId?: string
  aiConclusion?: string | null
}

const TechLoadingAnimation = () => {
  return (
    <View className="tech-loading-container">
      <View className="tech-loading-dots">
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
      </View>
      <View className="tech-loading-text">正在加载...</View>
    </View>
  )
}

const Index = forwardRef<{ getAiSessionCopy: () => void }, { height: number }>(
  ({ height }, ref) => {
    const dispatch = useAppDispatch()
    // 会话消息按“轮次”保存，使用服务端结构：每项包含 userMessage / aiResponse / tableType / tableData 等
    const [messages, setMessages] = useState<MessageUI[]>([])
    const [input, setInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const contentRef = useRef<any>(null)
    const scrollViewRef = useRef<any>(null)
    const [recommendAnim, setRecommendAnim] = useState('')
    const [conversationId, setConversationId] = useState('')
    const recommendRef = useRef<HTMLDivElement>(null)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
    const [loadFailed, setLoadFailed] = useState(false)
    const [currentScrollTop, setCurrentScrollTop] = useState(0)
    const [isAtTop, setIsAtTop] = useState(true)
    const [isAtBottom, setIsAtBottom] = useState(false)
    const [scrollTop, setScrollTop] = useState(0)
    const [scrollCounter, setScrollCounter] = useState(0)
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const [bottomHeight, setBottomHeight] = useState('314rpx')
    const companyInfo = Taro.getStorageSync('companyInfo') || {}
    const userInfo = useAppSelector(state => state.login.userInfo)
    const [recommendBatches, setRecommendBatches] = useState<any[]>([])
    const [recommendQueue, setRecommendQueue] = useState<any[][]>([]) // 存储三次API调用的结果
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0) // 当前显示的批次索引
    const [aiSessionId, setAiSessionId] = useState('')
    const aiSessionIdRef = useRef('')
    const [questionTime, setQuestionTime] = useState('')
    const [yiJianVisible, setYiJianVisible] = useState(false)
    const [yiJianInput, setYiJianInput] = useState('')
    const [copyMessageId, setCopyMessageId] = useState<number | null>(null)
    // 去除 apiStatus：以消息 id 是否存在判断是否完成并保存
    const [saveQueue, setSaveQueue] = useState<Set<string>>(new Set())

    // 添加功能按钮状态管理
    const [buttonStates, setButtonStates] = useState<{
      [key: string]: { [buttonIndex: number]: boolean }
    }>({})

    // 生成唯一ID的函数
    const generateUniqueId = () => {
      return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // 更新 ref 当 aiSessionId 状态改变时
    useEffect(() => {
      aiSessionIdRef.current = aiSessionId
    }, [aiSessionId])

    // 更新 ref 当 message 状态改变时
    useEffect(() => {
      getChatMsgHeight()
      console.log(messages)
    }, [messages])

    // 键盘弹起时调整底部高度
    useEffect(() => {
      if (keyboardHeight > 0) {
        setBottomHeight('235rpx')
      } else {
        setBottomHeight('314rpx')
      }
    }, [keyboardHeight])

    useEffect(() => {
      // 1. 键盘高度变化监听（仅微信小程序）
      if (process.env.TARO_ENV === 'weapp') {
        Taro.onKeyboardHeightChange(res => {
          setKeyboardHeight(res.height)
        })
      }

      // 2. 初始化推荐批次和AI会话
      getRecommendBatches()
      if (Taro.getStorageSync('aiSessionId')) {
        setAiSessionId(Taro.getStorageSync('aiSessionId'))
      } else {
        getAiSession()
      }

      const handleGetChatItem = res => {
        setAiSessionId(res.id)
        setConversationId(res.conversationId)
        // 直接使用服务端返回结构，不遍历改写
        setMessages(Array.isArray(res.aiMessageDOS) ? res.aiMessageDOS : [])
        // 历史消息默认已保存（id 非空），不再维护 apiStatus
        setTimeout(() => {
          getChatMsgHeight()
        }, 100)
        Taro.hideLoading()
      }

      Taro.eventCenter.on('getChatItem', handleGetChatItem)

      return () => {
        Taro.eventCenter.off('addMsg')
        Taro.eventCenter.off('getChatItem', handleGetChatItem)
      }
    }, [])

    const isProcessingRef = useRef(false)
    const isSessionProcessingRef = useRef(false) // 新增：防止 continueWithSessionId 重复执行
    const isEventRegistered = useRef(false)

    const handleSend = useCallback(
      (res: string) => {
        if (res && !isProcessingRef.current) {
          isProcessingRef.current = true

          setTimeout(() => {
            if (aiSessionIdRef.current) {
              continueWithSessionId(aiSessionIdRef.current, res)
            } else {
            }

            // 延迟重置标志
            setTimeout(() => {
              isProcessingRef.current = false
            }, 1000)
          }, 300)
        }
      },
      [] // 移除不必要的依赖
    )

    useEffect(() => {
      // 如果已经注册过，直接返回
      if (isEventRegistered.current) {
        return
      }

      console.log('注册send事件监听')
      Taro.eventCenter.on('send', handleSend)
      isEventRegistered.current = true

      // 监听注销事件
      const handleUnregister = () => {
        console.log('收到注销指令，清理send事件监听')
        Taro.eventCenter.off('send', handleSend)
        isEventRegistered.current = false
      }

      Taro.eventCenter.on('unregisterSendEvent', handleUnregister)

      return () => {
        console.log('清理send事件监听')
        Taro.eventCenter.off('send', handleSend)
        Taro.eventCenter.off('unregisterSendEvent', handleUnregister)
        isEventRegistered.current = false
      }
    }, [handleSend])

    // 额外添加一个监听来追踪组件更新
    useEffect(() => {
      console.log('组件重新渲染，时间:', new Date().toISOString())
    }, [])

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getAiSessionCopy
    }))

    // 处理功能按钮点击
    const handleButtonClick = (messageId: number | null, buttonIndex: number) => {
      if (messageId == null) return
      const turn = messages.find(item => item.id === messageId)
      if (!turn) return
      setCopyMessageId(messageId)
      const currentAnswerContent = {
        content: turn.aiResponse,
        tableType: turn.tableType,
        tableData: turn.tableData,
        userInput: turn.userMessage
      }

      const idKey = String(messageId)
      setButtonStates(prev => ({
        ...prev,
        [idKey]: {
          ...prev[idKey],
          [buttonIndex]: !prev[idKey]?.[buttonIndex]
        }
      }))

      if (buttonIndex === 0) {
        // 构建复制内容：AI回答 + 表格数据（新结构）
        let copyContent = currentAnswerContent.content || ''
        if (turn.tableType === 'corp') {
          const list = Array.isArray(turn.tableData) ? turn.tableData : []
          if (list.length > 0) {
            copyContent += '\n\n企业信息：\n'
            list.forEach((company: any, index: number) => {
              copyContent += `\n${index + 1}. ${company?.name || '未知企业名称'}\n`
            })
          }
        } else if (turn.tableType === 'phone') {
          const contacts = Array.isArray(turn.tableData) ? turn.tableData : []
          if (contacts.length > 0) {
            copyContent += '\n\n联系人：\n'
            contacts.forEach((c: any, index: number) => {
              copyContent += `\n${index + 1}. ${c?.name || ''} ${c?.position || ''} ${
                c?.phone || ''
              }`
            })
          }
        }

        Taro.setClipboardData({
          data: copyContent
        })
      } else if (buttonIndex === 1) {
        setMessages(prev =>
          prev.map(m => (m.id === messageId ? { ...m, isLike: m.isLike === 1 ? 0 : 1 } : m))
        )
        aiMessageEvaluationCreateAPI(
          {
            userId: userInfo?.id,
            messageId: messageId,
            entryPoint: 'ai_chat',
            isLiked: turn.isLike === 1 ? 0 : 1,
            questionContent: currentAnswerContent.userInput,
            answerContent: JSON.stringify(currentAnswerContent)
          },
          res => {
            if (!res.success) {
              setMessages(prev =>
                prev.map(m => (m.id === messageId ? { ...m, isLike: turn.isLike } : m))
              )
              Taro.showToast({ title: '点赞失败', icon: 'none' })
            } else {
              Taro.showToast({ title: '点赞成功', icon: 'none' })
            }
          }
        )
      } else if (buttonIndex === 2) {
        setMessages(prevMessages =>
          prevMessages.map(message => {
            if (message.id === messageId) {
              if (message.isLike === 0) {
                setYiJianVisible(true)
              } else {
                const updatedMessage = { ...message, isLike: 0 }
                aiMessageEvaluationCreateAPI(
                  {
                    userId: userInfo?.id,
                    messageId: messageId,
                    entryPoint: 'ai_chat',
                    isLiked: 0,
                    questionContent: currentAnswerContent.userInput,
                    answerContent: JSON.stringify(currentAnswerContent)
                  },
                  res => {
                    if (!res.success) {
                      setMessages(prevMsgs =>
                        prevMsgs.map(msg =>
                          msg.id === messageId ? { ...msg, isLike: message.isLike } : msg
                        )
                      )
                    }
                  }
                )

                return updatedMessage
              }
            }
            return message
          })
        )
      } else if (buttonIndex === 3) {
        // 更新messages状态，只修改特定messageId的消息
        setMessages(prevMessages =>
          prevMessages.map(message =>
            message.id === messageId ? { ...message, isCollect: !message.isCollect } : message
          )
        )
        let contentSummary = JSON.stringify({
          content: turn.aiResponse,
          tableType: turn.tableType,
          tableData: turn.tableData
        })
        let queryParams = {
          title: turn.userMessage,
          userId: userInfo?.id,
          messageId,
          contentSummary: contentSummary
        }
        if (!turn.isCollect) {
          userFavoriteCreateAPI(queryParams, res => {
            if (res.success) {
              // dispatch(getFavoriteListAsync())
              setMessages(prev => {
                return prev.map(item => {
                  if (item.id === messageId) {
                    return {
                      ...item,
                      isCollect: true
                    }
                  }
                  return item
                })
              })
              Taro.showToast({ title: '收藏成功', icon: 'none' })
            }
          })
        } else {
          userFavoriteCreateAPI(queryParams, res => {
            if (res.success) {
              // dispatch(getFavoriteListAsync())
              setMessages(prev => {
                return prev.map(item => {
                  if (item.id === messageId) {
                    return {
                      ...item,
                      isCollect: false
                    }
                  }
                  return item
                })
              })
              Taro.showToast({ title: '已取消收藏', icon: 'none' })
            }
          })
        }
      }
    }

    const yiJianConfirm = () => {
      if (copyMessageId == null) return
      const turn = messages.find(item => item.id === copyMessageId)
      if (!turn) return
      const currentAnswerContent = {
        content: turn.aiResponse,
        tableType: turn.tableType,
        tableData: turn.tableData,
        userInput: turn.userMessage
      }

      aiMessageEvaluationCreateAPI(
        {
          userId: userInfo?.id,
          messageId: copyMessageId,
          entryPoint: 'ai_chat',
          isLiked: 2,
          questionContent: currentAnswerContent.userInput,
          answerContent: JSON.stringify(currentAnswerContent),
          commentContent: yiJianInput
        },
        res => {
          if (res.success) {
            Taro.showToast({ title: '反馈成功', icon: 'none' })
            setYiJianInput('')
            setMessages(prevMessages =>
              prevMessages.map(message => {
                if (message.id === copyMessageId) {
                  const newDislikeStatus = message.isLike === 2 ? 0 : 2
                  return { ...message, isLike: newDislikeStatus }
                }
                return message
              })
            )
          }
        }
      )
      setYiJianVisible(false)
    }

    // 移除 listenerInterface：保存逻辑改为仅在 complete / error 触发

    const saveMessageToDatabase = async (turn: any, messageId: string) => {
      try {
        const answerTime = formatTime(new Date())
        const questionTimestamp = new Date(questionTime).getTime()
        const answerTimestamp = new Date(answerTime).getTime()
        const responseDurationMs = answerTimestamp - questionTimestamp
        const responseDuration = Number((responseDurationMs / 1000).toFixed(1))
        const result = await new Promise((resolve, reject) => {
          aiMessageCreateAPI(
            {
              // 新结构：与 PC 端 IMessage 对齐
              sessionId: aiSessionIdRef.current ? Number(aiSessionIdRef.current) : null,
              keyword: turn?.keyword || null,
              userMessage: turn?.userMessage,
              reasoningProcess: turn?.reasoningProcess || null,
              aiResponse: turn?.aiResponse || turn?.content || '',
              tableType: turn?.tableType || 'empty',
              tableData: turn?.tableData || [],
              // 保留原有时间与统计字段
              questionTime,
              answerTime,
              responseDuration,
              // 保留收藏与点赞状态
              isCollect: turn.isCollect,
              isLike: turn.isLike
            },
            res => {
              if (res.success) {
                resolve(res.data)
              } else {
                reject(res)
              }
            }
          )
        })

        // 保存成功后更新消息ID
        if (result) {
          getChatMsgHeight()
          setMessages(msgs =>
            msgs.map(msg => (msg.clientId === messageId ? { ...msg, id: Number(result) } : msg))
          )
        }
      } catch (error) {
        console.error('保存消息失败:', error)
      } finally {
        // 从保存队列中移除
        setSaveQueue(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }
    }

    // 页面显示时重置键盘高度
    useDidShow(() => {
      setKeyboardHeight(0)
    })

    // 页面隐藏时重置键盘高度
    useDidHide(() => {
      setKeyboardHeight(0)
    })

    const getAiSession = () => {
      aiSessionCreateAPI({ userId: userInfo?.id }, res => {
        if (res.success && res.data) {
          Taro.setStorageSync('aiSessionId', res.data)
          setAiSessionId(res.data)
          dispatch(getSessionListAsync())
          Taro.eventCenter.trigger('addSession', true)
          setMessages([])
          setConversationId('')
        }
      })
    }

    const getAiSessionCopy = () => {
      aiSessionCreateAPI({ userId: userInfo?.id }, res => {
        if (res.success && res.data) {
          Taro.setStorageSync('aiSessionId', res.data)
          setAiSessionId(res.data)
          dispatch(getSessionListAsync())
          Taro.eventCenter.trigger('addSession', true)
          setScrollTop(0)
          setMessages([])
          setIsStreaming(false)
          Taro.showToast({ title: '会话创建成功', icon: 'none' })
          setConversationId('')
        }
      })
    }

    // 获取聊天消息高度
    const getChatMsgHeight = () => {
      const query = Taro.createSelectorQuery()
      query.selectAll('.chatMsg_ai, .chatMsg_user').boundingClientRect((rects: any[]) => {
        if (rects && rects.length) {
          const lastRect = rects[rects.length - 1]
          const lastMsgHeight = Math.abs(lastRect?.top || 0) + Math.abs(lastRect?.height || 0) + 100
          setScrollTop(prevScrollTop => {
            return prevScrollTop + lastMsgHeight
          })
        }
      })
      query.exec()
    }

    // 流式输出AI回复
    const streamAIReply = async (text: string, targetMessageId: string) => {
      const STREAM_CONFIG = {
        chunkSize: 10, // 每次输出的字符数量，控制打字机效果的速度
        delay: 10, // 每次输出间隔时间（毫秒），数值越小输出越快
        scrollCheckInterval: 2 // 滚动检查间隔次数，每输出多少次检查一次滚动位置
      }

      setIsStreaming(true)
      let reply = ''
      for (let i = 0; i < text.length; i += STREAM_CONFIG.chunkSize) {
        const chunk = text.slice(i, i + STREAM_CONFIG.chunkSize)
        reply += chunk

        setMessages(msgs =>
          msgs.map(msg => (msg.clientId === targetMessageId ? { ...msg, aiResponse: reply } : msg))
        )

        if (i % STREAM_CONFIG.scrollCheckInterval === 0) {
          setTimeout(() => {
            getChatMsgHeight()
          }, 50)
        }

        await new Promise(res => setTimeout(res, STREAM_CONFIG.delay))
      }

      // 流式输出完成
      setIsStreaming(false)
      getChatMsgHeight()
    }

    // 格式化时间为 YYYY-M-D HH:mm:ss
    const formatTime = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    // 发送消息
    const send = () => {
      if (!Taro.getStorageSync('aiSessionId')) {
        aiSessionCreateAPI({ userId: userInfo?.id }, res => {
          if (res.success && res.data) {
            Taro.setStorageSync('aiSessionId', res.data)
            setAiSessionId(res.data)
            dispatch(getSessionListAsync())

            // 在这里使用新创建的 sessionId 继续执行后续逻辑
            continueWithSessionId(res.data, input)
          }
        })
      } else {
        // 如果已有 sessionId，直接继续执行
        continueWithSessionId(aiSessionId, input)
      }
    }

    // 重新生成：使用当前消息的用户问题重新发送给 AI
    const regenerate = (turn: MessageUI) => {
      const text = String(turn?.userMessage || '').trim()
      if (!text || isStreaming) return

      const sessionIdInStorage = Taro.getStorageSync('aiSessionId')
      if (!sessionIdInStorage) {
        aiSessionCreateAPI({ userId: userInfo?.id }, res => {
          if (res.success && res.data) {
            Taro.setStorageSync('aiSessionId', res.data)
            setAiSessionId(res.data)
            dispatch(getSessionListAsync())
            continueWithSessionId(res.data, text)
          }
        })
      } else {
        continueWithSessionId(aiSessionId, text)
      }
    }

    // 提取公共逻辑到单独函数
    const continueWithSessionId = (sessionId: string, text: string) => {
      // 防止重复执行
      if (isSessionProcessingRef.current) {
        console.log('continueWithSessionId 正在处理中，跳过重复调用')
        return
      }

      if (!Taro.getStorageSync('companyInfo')) {
        Taro.eventCenter.trigger('companyShow', true)
      }
      if (!text.trim() || isStreaming) return

      // 设置处理标志
      isSessionProcessingRef.current = true

      setQuestionTime(formatTime(new Date())) // 用户发送消息的时间

      // 为该轮生成唯一ID（对应AI消息ID）
      const aiMessageId = generateUniqueId()
      const newMsg: MessageUI = {
        id: null,
        userId: userInfo?.id!,
        // IMessage.sessionId 为 number | null，这里显式数值化
        sessionId: sessionId ? Number(sessionId) : null,
        clientId: aiMessageId,
        userMessage: text,
        // IMessage.aiResponse 为 string | null，初始空串即可
        aiResponse: '',
        aiConclusion: null,
        keyword: null,
        reasoningProcess: '',
        tableType: 'empty',
        // 避免被推断为 never[]，与 IMessage.tableData?: any 对齐
        tableData: [] as any,
        isCollect: false,
        isLike: 0
      }
      setMessages(msgs => [...msgs, newMsg])
      // 不再维护 apiStatus，等待 complete / error 保存生成 id

      if (companyInfo?.customInput) {
        companyInfo.expansionDomainKeywordsSelected = [
          ...companyInfo.expansionDomainKeywordsSelected,
          companyInfo.customInput
        ]
      }

      // 重置处理标志的函数
      const resetProcessingFlag = () => {
        setTimeout(() => {
          isSessionProcessingRef.current = false
        }, 2000) // 2秒后允许下次执行
      }

      const doAll = () => {
        try {
          setIsStreaming(true)
          const requestData = {
            query: text,
            response_mode: 'streaming' as const,
            conversation_id: conversationId || '',
            target_company_name: companyInfo?.companyName || '',
            target_company_serve: companyInfo?.coreSellingPoints?.coreBusiness || ''
          }

          streamAIAnswerAPI(requestData, {
            onMessage: ({ name, data }) => {
              // 为兼容后端事件字面量类型差异，统一按字符串处理
              const eventName = String((name as any) || '')
              switch (eventName) {
                case 'conversation_id': {
                  const convId = String(data || '')
                  setConversationId(convId)
                  aiSessionUpdateAPI(
                    { userId: userInfo?.id, id: sessionId, title: text, conversationId: convId },
                    res => {
                      if (res.success) {
                        dispatch(getSessionListAsync())
                      }
                    }
                  )
                  break
                }
                case 'keywords': {
                  const kws = String(data || '')
                  setMessages(prev =>
                    prev.map(msg => (msg.clientId === aiMessageId ? { ...msg, keyword: kws } : msg))
                  )
                  break
                }
                case 'start_text': {
                  setIsStreaming(true)
                  break
                }
                case 'text': {
                  const chunk = String(data || '')
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.clientId === aiMessageId
                        ? { ...msg, aiResponse: (msg.aiResponse || '') + chunk }
                        : msg
                    )
                  )
                  // 滚动到底部以跟随输出
                  setTimeout(() => getChatMsgHeight(), 50)
                  break
                }
                case 'end_text': {
                  setIsStreaming(false)
                  resetProcessingFlag()
                  break
                }
                case 'start_thinking': {
                  setIsStreaming(true)
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.clientId === aiMessageId ? { ...msg, reasoningProcess: '' } : msg
                    )
                  )
                  break
                }
                case 'thinking': {
                  const chunk = String(data || '')
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.clientId === aiMessageId
                        ? { ...msg, reasoningProcess: (msg.reasoningProcess || '') + chunk }
                        : msg
                    )
                  )
                  break
                }
                case 'end_thinking': {
                  setIsStreaming(false)
                  break
                }
                case 'start_table': {
                  const nextType =
                    (String(data || 'empty') as 'empty' | 'corp' | 'phone') || 'empty'
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.clientId === aiMessageId
                        ? { ...msg, tableType: nextType, tableData: [] }
                        : msg
                    )
                  )
                  break
                }
                case 'json': {
                  const nextTableData: any[] = Array.isArray(data) ? (data as any[]) : []
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.clientId === aiMessageId ? { ...msg, tableData: nextTableData } : msg
                    )
                  )
                  break
                }
                case 'end_table': {
                  break
                }
                case 'done': {
                  setIsStreaming(false)
                  const turn = messages.find(item => item.clientId === aiMessageId)
                  if (turn && !turn.id && !saveQueue.has(aiMessageId)) {
                    setSaveQueue(prev => new Set([...prev, aiMessageId]))
                    getChatMsgHeight()
                    saveMessageToDatabase(turn, aiMessageId)
                  }
                  resetProcessingFlag()
                  break
                }
                default:
                  break
              }
            },
            onError: error => {
              setIsStreaming(false)
              setMessages(prev =>
                prev.map(msg =>
                  msg.clientId === aiMessageId
                    ? { ...msg, aiResponse: '抱歉，服务暂时不可用，请稍后再试。' }
                    : msg
                )
              )
              // 接口报错也视为本轮完成，直接保存并生成消息 id
              // const turn = messages.find(item => item.clientId === aiMessageId)
              // if (turn && !turn.id && !saveQueue.has(aiMessageId)) {
              //   setSaveQueue(prev => new Set([...prev, aiMessageId]))
              //   getChatMsgHeight()
              //   saveMessageToDatabase(turn, aiMessageId)
              // }
              // resetProcessingFlag()
            },
            onComplete: () => {
              console.log('结束')

              // 若未触发 end_text，则确保结束标记并尝试保存
              setIsStreaming(false)
              // const turn = messages.find(item => item.clientId === aiMessageId)
              // if (turn && !turn.id && !saveQueue.has(aiMessageId)) {
              //   setSaveQueue(prev => new Set([...prev, aiMessageId]))
              //   getChatMsgHeight()
              //   saveMessageToDatabase(turn, aiMessageId)
              // }
            }
          })
        } catch (error) {
          setIsStreaming(false)
          resetProcessingFlag()
        }
      }
      doAll()
      setInput('')

      // 发送消息后滚动到底部
      setTimeout(() => {
        getChatMsgHeight()
      }, 100)
    }

    const assignment = (val: any) => {
      setInput(val)
      // 自动发送推荐问题
      setTimeout(() => {
        continueWithSessionId(aiSessionId, val)
      }, 100)
    }

    // 预加载五次推荐数据
    const loadFiveBatches = async () => {
      const promises: Promise<any[]>[] = []
      for (let i = 0; i < 1; i++) {
        promises.push(
          new Promise<any[]>(resolve => {
            if (companyInfo?.customInput) {
              companyInfo.expansionDomainKeywordsSelected = [
                ...companyInfo.expansionDomainKeywordsSelected,
                companyInfo.customInput
              ]
            }
            guessYouWantAPI(companyInfo.expansionDomainKeywordsSelected || [], res => {
              if (res && res.success && res.data) {
                let batches: any[] = []
                if (Array.isArray(res.data)) {
                  batches = res.data
                } else if (typeof res.data === 'object' && res.data.batches) {
                  batches = res.data.batches
                }
                resolve(batches)
              } else {
                resolve([])
              }
            })
          })
        )
      }

      try {
        const results = await Promise.all(promises)
        const validResults = results.filter(
          (batch: any[]) => Array.isArray(batch) && batch.length > 0
        )
        if (validResults.length > 0) {
          setRecommendQueue(validResults)
          setRecommendBatches(validResults[0])
          setCurrentBatchIndex(0)
          setLoadFailed(true)
        } else {
          setLoadFailed(false)
        }
      } catch (error) {
        setLoadFailed(false)
      }
    }

    const getRecommendBatches = () => {
      loadFiveBatches()
    }

    const handleChangeBatch = () => {
      if (recommendQueue.length > 1) {
        // 删除当前显示的第一条，显示队列中的下一条
        const newQueue = [...recommendQueue.slice(1)]

        setRecommendQueue(newQueue)
        setRecommendBatches(newQueue[0] || [])
        setCurrentBatchIndex(0)
        if (companyInfo?.customInput) {
          companyInfo.expansionDomainKeywordsSelected = [
            ...companyInfo.expansionDomainKeywordsSelected,
            companyInfo.customInput
          ]
        }
        // 异步调用新的API，补充队列到三条
        guessYouWantAPI(companyInfo.expansionDomainKeywordsSelected || [], res => {
          if (res && res.success && res.data) {
            let batches: any[] = []
            if (Array.isArray(res.data)) {
              batches = res.data
            } else if (typeof res.data === 'object' && res.data.batches) {
              batches = res.data.batches
            }

            if (batches.length > 0) {
              setRecommendQueue(prevQueue => [...prevQueue, batches])
            }
          }
        })
      } else {
        loadFiveBatches()
      }
    }

    const handleScroll = (e: any) => {
      const {
        scrollTop: currentScrollTop,
        scrollHeight: currentScrollHeight,
        scrollLeft,
        scrollWidth
      } = e.detail

      // 使用固定的视口高度计算
      const viewportHeight = height ? (window.innerHeight || 667) - height - 319 : 400

      const isNearBottom = currentScrollHeight - currentScrollTop - viewportHeight < 10
      setShouldAutoScroll(isNearBottom)
      setCurrentScrollTop(currentScrollTop)

      setTimeout(() => {
        // 控制置顶置底按钮显示
        const isAtTopPosition = currentScrollTop <= 50
        const isAtBottomPosition = currentScrollHeight - currentScrollTop - viewportHeight <= 400
        setIsAtTop(isAtTopPosition)
        setIsAtBottom(isAtBottomPosition)
      }, 100)
    }

    // 滚动到顶部函数
    const scrollToTop = () => {
      setScrollCounter(prev => prev + 1)
      // 使用接近0但不为0的值，避免状态混乱
      setScrollTop(scrollCounter + 1)
    }

    // 滚动到底部函数
    const scrollToBottom = () => {
      setScrollCounter(prev => prev + 1)
      // 使用一个足够大的值确保滚动到底部，即使聊天记录很长
      setScrollTop(999999999 + scrollCounter)
    }

    const handleInput = (e: any) => {
      setInput(e.detail.value)
    }

    const yiJianCancel = () => {
      setYiJianVisible(false)
    }

    return (
      <View
        className="chatPage"
        style={{ height: `calc(100vh - ${height}px)` }}
        onTouchMove={e => {
          e.stopPropagation()
        }}
        onTouchStart={e => {
          e.stopPropagation()
        }}
        onTouchEnd={e => {
          e.stopPropagation()
        }}
      >
        {messages.length === 0 ? (
          <View
            className="chatPage_default"
            ref={contentRef}
            style={{ height: `calc(100% - 314rpx)` }}
          >
            {keyboardHeight !== 336 && (
              <Image
                src="https://find-console.newgalaxyai.com/glks/assets/home/home4.png"
                className="chatPage_img"
              />
            )}
            {loadFailed ? (
              <View className="chatPage_recommend">
                <View className="chatPage_recommend_title">
                  <View className="recommend_left">
                    <Image
                      src="https://find-console.newgalaxyai.com/glks/assets/home/home5.png"
                      className="recommend_left_img"
                    />
                    <Text className="recommend_left_text">您可以试着问我：</Text>
                  </View>
                  <View
                    className="recommend_right"
                    onClick={handleChangeBatch}
                    style={{ cursor: 'pointer' }}
                  >
                    <Text className="recommend_right_text">换一批</Text>
                    <Image
                      src="https://find-console.newgalaxyai.com/glks/assets/home/home6.png"
                      className="recommend_right_img"
                    />
                  </View>
                </View>
                <View
                  className={`chatPage_recommend_content${
                    recommendAnim ? ' ' + recommendAnim : ''
                  }`}
                  ref={recommendRef}
                >
                  {recommendBatches && recommendBatches.length > 0 ? (
                    recommendBatches.map((item, idx) => (
                      <View
                        onClick={() => {
                          assignment(item)
                        }}
                        className="chatPage_recommend_content_item"
                        key={idx}
                      >
                        {item}
                      </View>
                    ))
                  ) : (
                    <TechLoadingAnimation />
                  )}
                </View>
              </View>
            ) : (
              <View></View>
            )}
          </View>
        ) : (
          // 在ScrollView后面添加置顶置底按钮
          <ScrollView
            className="chatPage_content"
            ref={scrollViewRef}
            style={{ height: `calc(100vh - ${height}px - 319rpx)` }}
            scrollY
            scrollTop={scrollTop}
            onScroll={handleScroll}
            enhanced={true}
            scrollWithAnimation={true}
            showScrollbar={false}
          >
            {messages.map((turn, idx) => (
              <View key={idx} style={{ padding: '8px 0' }}>
                <View className="chatMsg user">
                  <Text user-select className="chatMsg_user">
                    {turn.userMessage}
                  </Text>
                </View>
                <View className="chatMsg ai">
                  <View className="chatMsg_ai">
                    <AiMessageComponent msg={turn} />
                    {Boolean(turn.aiResponse) && Boolean(turn.id) ? (
                      <View className="chatMsg_ai_fun">
                        <Image
                          src="https://find-console.newgalaxyai.com/glks/assets/home/home10.png"
                          className={`chatMsg_ai_fun_img ${
                            buttonStates[String(turn.id ?? turn.clientId)]?.[0]
                              ? 'button-active'
                              : ''
                          }`}
                          onClick={() => handleButtonClick(turn.id, 0)}
                          data-message-id={turn.id}
                          data-button-index={0}
                        />
                        {(turn.isLike == 0 || turn.isLike == 1) && (
                          <Image
                            src={
                              turn.isLike == 1
                                ? 'https://find-console.newgalaxyai.com/glks/assets/home/home14.png'
                                : 'https://find-console.newgalaxyai.com/glks/assets/home/home11.png'
                            }
                            className={`chatMsg_ai_fun_img ${
                              buttonStates[String(turn.id ?? turn.clientId)]?.[1]
                                ? 'button-active'
                                : ''
                            }`}
                            onClick={() => handleButtonClick(turn.id, 1)}
                            data-message-id={turn.id}
                            data-button-index={1}
                          />
                        )}
                        {(turn.isLike == 0 || turn.isLike == 2) && (
                          <Image
                            src={
                              turn.isLike == 2
                                ? 'https://find-console.newgalaxyai.com/glks/assets/home/home15.png'
                                : 'https://find-console.newgalaxyai.com/glks/assets/home/home12.png'
                            }
                            className={`chatMsg_ai_fun_img ${
                              buttonStates[String(turn.id ?? turn.clientId)]?.[2]
                                ? 'button-active'
                                : ''
                            }`}
                            onClick={() => handleButtonClick(turn.id, 2)}
                            data-message-id={turn.id}
                            data-button-index={2}
                          />
                        )}
                        <Image
                          src={
                            !turn.isCollect
                              ? 'https://find-console.newgalaxyai.com/glks/assets/home/home13.png'
                              : 'https://find-console.newgalaxyai.com/glks/assets/home/home16.png'
                          }
                          className={`chatMsg_ai_fun_img ${
                            buttonStates[String(turn.id ?? turn.clientId)]?.[3]
                              ? 'button-active'
                              : ''
                          }`}
                          onClick={() => handleButtonClick(turn.id, 3)}
                          data-message-id={turn.id}
                          data-button-index={3}
                        />
                        {/* 重新生成：使用 redo 图标，点击重新发送当前用户问题 */}
                        <Image
                          src="https://find-console.newgalaxyai.com/glks/assets/home/home6.png"
                          className="chatMsg_ai_fun_img"
                          onClick={() => regenerate(turn)}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {messages.length != 0 && (
          <View className="floatingButton">
            {!isAtTop && (
              <View className="floatingButtonTop" onClick={() => scrollToTop()}>
                <ArrowUpSize6 color="#333" size="30rpx" />
              </View>
            )}
            {!isAtBottom && (
              <View className="floatingButtonBottom" onClick={() => scrollToBottom()}>
                <ArrowDownSize6 color="#333" size="30rpx" />
              </View>
            )}
          </View>
        )}

        <View
          className="chatPage_bottom"
          style={{
            height: bottomHeight,
            bottom: keyboardHeight ? `${keyboardHeight}px` : 0,
            transition: 'height 0.26s, bottom 0.26s'
          }}
        >
          <View className="chatPage_bottom_input">
            <Textarea
              show-confirm-bar={false}
              adjust-position={false}
              value={input}
              onInput={handleInput}
              className="chatPage_input"
              onConfirm={send}
              placeholder="请输入您的客户需求～"
              placeholderStyle="color: #A9A9A9;"
              disabled={isStreaming}
            />
            <View className="chatPage_fun">
              <View className="chatPage_fun_left">
                {/* <Image
                onClick={() => {
                  speechToText()
                }}
                src="https://find-console.newgalaxyai.com/glks/assets/home/home7.png"
                className="chatPage_fun_left1"
              />
              <View className="chatPage_fun_left2">
                <Image src="https://find-console.newgalaxyai.com/glks/assets/home/home8.png" className="chatPage_fun_left2Img" />
                <Text>深度思考</Text>
              </View> */}
              </View>
              <Image
                src="https://find-console.newgalaxyai.com/glks/assets/home/home9.png"
                onClick={() => {
                  send()
                }}
                className="chatPage_fun_right"
              />
            </View>
          </View>
          <View
            style={{
              color: '#A9A9A9',
              fontSize: '22rpx',
              width: '100%',
              textAlign: 'center',
              marginTop: '20rpx'
            }}
          >
            内容由AI生成，仅供参考
          </View>
        </View>

        <View className="customizeDialog">
          <Dialog
            title="您对本回答满意吗？"
            visible={yiJianVisible}
            onConfirm={() => yiJianConfirm()}
            onCancel={() => yiJianCancel()}
          >
            <TextArea
              className="chatPage_inputs"
              placeholder="请输入您的评价"
              value={yiJianInput}
              onInput={e => setYiJianInput(e.detail.value)}
            />
          </Dialog>
        </View>
      </View>
    )
  }
)

export default Index
