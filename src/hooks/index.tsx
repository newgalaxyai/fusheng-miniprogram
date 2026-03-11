import React, { useEffect, useRef, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { View, Image, Input, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import '../pages/index/aiChat/index.scss'
import { textStageAPI, companyStageAPI, guessYouWantAPI, aiSessionCreateAPI, aiMessageCreateAPI, aiSessionUpdateAPI, aiMessageEvaluationCreateAPI, userFavoriteCreateAPI, preprocessingAPI } from '@/api/chatMsg'
import { useAppSelector } from '@/hooks/useAppStore'
import store from '@/redux/index'
import { Dialog, TextArea, BackTop } from '@nutui/nutui-react-taro'
import { ArrowDownSize6, ArrowUpSize6 } from '@nutui/icons-react-taro'
import { useAppDispatch } from '@/hooks/useAppStore'
import { getSessionListAsync, getFavoriteListAsync } from '@/redux/asyncs/conversation'
import AiMessageComponent from '@/components/AiMessageComponent'
import chatService from '@/service/chat'
import { setSessionMessages, setCurrentConversationId, IMessage } from '@/redux/modules/conversation'

const TechLoadingAnimation = () => {
  return (
    <View className="techloading">
      <View className="techLogo">
        <Image className="techLogoImg" src="https://galaxy-ai.oss-cn-hangzhou.aliyuncs.com/glks/wdlogo.png" mode="aspectFill" />
      </View>
      <View className="techLogoText">
        <Text className="techLogoTextOne">深度检测报告生成中...</Text>
        <Text className="techLogoTextTwo">
          我们正在为您检索相关信息，预计需要 <Text style={{ color: '#FF9633' }}>5分钟！</Text>
        </Text>
      </View>
      <View className="techLogoTips">
        <Image className="techLogoTipsImg" src="https://galaxy-ai.oss-cn-hangzhou.aliyuncs.com/glks/ldlogo.png" mode="aspectFill" />
        <Text className="techLogoTipsText">您可以安全退出小程序，检索完成后，系统会通过微信“服务通知”发送文件查看链接。</Text>
      </View>
    </View>
  )
}

const Index = forwardRef<{ getAiSessionCopy: () => void }, { height: number }>(({ height }, ref) => {
  const dispatch = useAppDispatch()
  const [aiSessionId, setAiSessionId] = useState('')
  const aiSessionIdRef = useRef('')
  const sessionMessages = useAppSelector(state => state.conversation.sessionMessages)
  const generatingConversationIds = useAppSelector(state => state.conversation.generatingConversationIds)

  // Use messages from Redux
  const messages = (aiSessionId ? sessionMessages[aiSessionId] : []) || []

  // Derive isStreaming from Redux state
  const isStreaming = generatingConversationIds.includes(aiSessionId)

  // Wrapper for setMessages to update Redux
  const setMessages = useCallback(
    (newMsgs: any) => {
      if (!aiSessionId) return
      let finalMsgs
      if (typeof newMsgs === 'function') {
        finalMsgs = newMsgs(sessionMessages[aiSessionId] || [])
      } else {
        finalMsgs = newMsgs
      }
      dispatch(setSessionMessages({ sessionId: aiSessionId, messages: finalMsgs }))
    },
    [aiSessionId, sessionMessages, dispatch]
  )

  const [input, setInput] = useState('')
  // const [isStreaming, setIsStreaming] = useState(false) // Removed local state
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
  const [questionTime, setQuestionTime] = useState('')
  const [yiJianVisible, setYiJianVisible] = useState(false)
  const [yiJianInput, setYiJianInput] = useState('')
  const [copyMessageId, setCopyMessageId] = useState('')
  const [saveQueue, setSaveQueue] = useState<Set<string>>(new Set())

  // 添加功能按钮状态管理
  const [buttonStates, setButtonStates] = useState<{ [key: string]: { [buttonIndex: number]: boolean } }>({})

  // 生成唯一ID的函数
  const generateUniqueId = () => {
    2
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

      const isGenerating = store.getState().conversation.generatingConversationIds.includes(res.id)
      if (isGenerating) {
        // 只有当Redux中确实有该会话的消息时才跳过加载
        const hasReduxMessages = store.getState().conversation.sessionMessages[res.id]?.length > 0
        if (hasReduxMessages) {
          Taro.hideLoading()
          setTimeout(() => {
            getChatMsgHeight()
          }, 100)
          return
        }
      }

      setMessages([])
      setTimeout(() => {
        const newMessages: IMessage[] = []
        res.aiMessageDOS.forEach((item: any) => {
          if (item.userMessage) {
            newMessages.push({
              id: item.id || generateUniqueId(),
              role: 'user',
              splitNum: 0,
              total: 0,
              content: item.userMessage,
              conclusion: '',
              companyList: [],
              timestamp: Date.now(), // Added timestamp as it is required in IMessage
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || generateUniqueId(),
              isCollect: item.isCollect,
              isLike: item.isLike
            })
          }
          if (item.aiResponse) {
            let parsedEnterpriseInfo: any = { companyList: [], splitNum: 0, total: 0 }
            try {
              if (item.enterpriseInfo) {
                parsedEnterpriseInfo = JSON.parse(item.enterpriseInfo)
              }
            } catch (e) {
              console.error('Failed to parse enterpriseInfo', e)
            }

            const companyList = (parsedEnterpriseInfo.companyList || []).map((item: any) => {
              // 确保 contactInfo 存在且有正确的结构
              if (!item.contactInfo) {
                item.contactInfo = { phones: [] }
              }
              if (!Array.isArray(item.contactInfo.phones)) {
                item.contactInfo.phones = []
              }
              // 确保 tags 是数组
              if (!Array.isArray(item.tags)) {
                item.tags = []
              }
              let locationStr = item.province || item.address || item.location || '未知省份'
              if (locationStr.includes('省')) {
                item.handleLocation = locationStr.split('省')[0] + '省'
              } else if (locationStr.includes('自治区')) {
                item.handleLocation = locationStr.split('自治区')[0] + '自治区'
              } else if (locationStr.includes('市')) {
                const directMunicipalities = ['北京', '上海', '天津', '重庆']
                const found = directMunicipalities.find(city => locationStr.includes(city))
                item.handleLocation = found ? found + '市' : locationStr.split('市')[0] + '市'
              } else {
                item.handleLocation = '未知省份'
              }

              if (item.legalPerson) {
                item.legalPerson = item.legalPerson.replace(/\s*\([^)]*\)\s*/g, '').trim() || '- -'
              } else {
                item.legalPerson = '- -'
              }
              return item
            })

            newMessages.push({
              id: item.id || generateUniqueId(),
              role: 'ai',
              content: item.aiResponse,
              conclusion: item.aiConclusion || '',
              companyList: companyList,
              splitNum: parsedEnterpriseInfo.splitNum || 0,
              total: parsedEnterpriseInfo.total || 0,
              timestamp: Date.now(), // Added timestamp
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || generateUniqueId(),
              isCollect: item.isCollect,
              isLike: item.isLike
            })
          }
        })
        store.dispatch(setSessionMessages({ sessionId: res.id, messages: newMessages }))
        setTimeout(() => {
          getChatMsgHeight()
        }, 100)
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
  const handleButtonClick = (messageId: string, buttonIndex: number) => {
    let msg = messages.filter(item => item.messageId === messageId)
    setCopyMessageId(messageId)
    // 直接计算answerContent，不依赖状态
    const currentAnswerContent = {
      content: msg.filter(item => item.role === 'ai')[0].content,
      companyList: msg.filter(item => item.role === 'ai')[0].companyList,
      userInput: msg.filter(item => item.role === 'user')[0].content
    }

    setButtonStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [buttonIndex]: !prev[messageId]?.[buttonIndex]
      }
    }))

    if (buttonIndex === 0) {
      // 构建复制内容：AI回答 + 企业信息
      let copyContent = currentAnswerContent.content

      // 如果有企业列表，添加企业信息
      if (currentAnswerContent.companyList && currentAnswerContent.companyList.length > 0) {
        copyContent += '\n\n企业信息：\n'

        currentAnswerContent.companyList.forEach((company, index) => {
          copyContent += `\n${index + 1}. ${company.name || '未知企业名称'}\n`
          if (company.legalPerson) copyContent += `   法人: ${company.legalPerson}\n`
          if (company.tags && Array.isArray(company.tags) && company.tags.length > 0) {
            copyContent += `   标签: ${company.tags.join(', ')}\n`
          }
          if (company.contactInfo?.phones && company.contactInfo.phones.length > 0) {
            copyContent += `   联系方式: ${company.contactInfo.phones.join(', ')}\n`
          }
          if (company.score) copyContent += `   匹配度: ${company.score}%\n`
          if (company.industry) copyContent += `   经营范围: ${company.industry}\n`
          if (company.orgType) copyContent += `   公司类型: ${company.orgType}\n`
          if (company.location) copyContent += `   所在省份: ${company.location}\n`
          if (company.businessScope) copyContent += `   公司简介: ${company.businessScope}\n`
        })
      }

      Taro.setClipboardData({
        data: copyContent
      })
    } else if (buttonIndex === 1) {
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            const newLikeStatus = message.isLike === 1 ? 0 : 1
            aiMessageEvaluationCreateAPI(
              {
                userId: userInfo?.id,
                messageId: messageId,
                entryPoint: 'ai_chat',
                isLiked: newLikeStatus,
                questionContent: currentAnswerContent.userInput,
                answerContent: JSON.stringify(currentAnswerContent)
              },
              res => {
                if (!res.success) {
                  setMessages(prevMsgs => prevMsgs.map(msg => (msg.messageId === messageId && msg.role === 'ai' ? { ...msg, isLike: message.isLike } : msg)))
                  Taro.showToast({
                    title: '点赞失败',
                    icon: 'none'
                  })
                } else {
                  Taro.showToast({
                    title: '点赞成功',
                    icon: 'none'
                  })
                }
              }
            )

            return { ...message, isLike: newLikeStatus }
          }
          return message
        })
      )
    } else if (buttonIndex === 2) {
      setMessages(prevMessages =>
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
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
                    setMessages(prevMsgs => prevMsgs.map(msg => (msg.messageId === messageId && msg.role === 'ai' ? { ...msg, isLike: message.isLike } : msg)))
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
        prevMessages.map(message => {
          if (message.messageId === messageId && message.role === 'ai') {
            return { ...message, isCollect: !message.isCollect }
          }
          return message
        })
      )
      let contentSummary = JSON.stringify({
        content: msg.filter(item => item.role === 'ai')[0].content,
        companyList: msg.filter(item => item.role === 'ai')[0].companyList,
        splitNum: msg.filter(item => item.role === 'ai')[0].splitNum,
        total: msg.filter(item => item.role === 'ai')[0].total
      })
      let queryParams = {
        title: msg.filter(item => item.role === 'user')[0].content,
        userId: userInfo?.id,
        messageId,
        contentSummary: contentSummary
      }
      if (!msg.filter(item => item.role === 'ai')[0].isCollect) {
        userFavoriteCreateAPI(queryParams, res => {
          if (res.success) {
            dispatch(getFavoriteListAsync())
            Taro.showToast({ title: '收藏成功', icon: 'none' })
          }
        })
      } else {
        userFavoriteCreateAPI(queryParams, res => {
          if (res.success) {
            dispatch(getFavoriteListAsync())
            Taro.showToast({ title: '已取消收藏', icon: 'none' })
          }
        })
      }
    }
  }

  const yiJianConfirm = () => {
    let msg = messages.filter(item => item.messageId === copyMessageId)

    // 直接计算answerContent，不依赖状态
    const currentAnswerContent = {
      content: msg.filter(item => item.role === 'ai')[0].content,
      companyList: msg.filter(item => item.role === 'ai')[0].companyList,
      userInput: msg.filter(item => item.role === 'user')[0].content
    }

    aiMessageEvaluationCreateAPI(
      {
        userId: userInfo?.id,
        messageId: copyMessageId,
        entryPoint: 'ai_chat',
        isLiked: 2,
        questionContent: currentAnswerContent.userInput,
        answerContent: JSON.stringify(currentAnswerContent),
        feedback: yiJianInput
      },
      res => {
        if (res.success) {
          Taro.showToast({
            title: '评价成功',
            icon: 'none'
          })
          setMessages(prevMessages =>
            prevMessages.map(message => {
              if (message.messageId === copyMessageId && message.role === 'ai') {
                return { ...message, isLike: 2 }
              }
              return message
            })
          )
        } else {
          Taro.showToast({
            title: '评价失败',
            icon: 'none'
          })
        }
      }
    )
    setYiJianVisible(false)
  }

  const getAiSession = () => {
    if (aiSessionId) return
    // 即使在生成中也允许初始化新对话
    aiSessionCreateAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        Taro.setStorageSync('aiSessionId', res.data)
        setAiSessionId(res.data)
        dispatch(getSessionListAsync())
        Taro.eventCenter.trigger('addSession', true)
        setScrollTop(0)
        setMessages([])
        // setIsStreaming(false) // Removed
        Taro.showToast({ title: '会话创建成功', icon: 'none' })
        setConversationId('')
      }
    })
  }

  const getAiSessionCopy = () => {
    // 即使在生成中也允许新建对话，但需要切换到新对话
    // 移除 isStreaming 检查
    aiSessionCreateAPI({ userId: userInfo?.id }, res => {
      if (res.success && res.data) {
        Taro.setStorageSync('aiSessionId', res.data)
        setAiSessionId(res.data)
        dispatch(getSessionListAsync())
        Taro.eventCenter.trigger('addSession', true)
        setScrollTop(0)
        setMessages([])
        // setIsStreaming(false) // Removed
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

  // Removed streamAIReply

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
    if (!input.trim()) return
    // 检查当前会话是否在生成中
    if (aiSessionId && generatingConversationIds.includes(aiSessionId)) return

    if (!Taro.getStorageSync('aiSessionId')) {
      aiSessionCreateAPI({ userId: userInfo?.id }, res => {
        if (res.success && res.data) {
          const newSessionId = res.data
          Taro.setStorageSync('aiSessionId', newSessionId)
          setAiSessionId(newSessionId)
          dispatch(getSessionListAsync())

          // 使用 ChatService 发送消息
          chatService.sendMessage(input, newSessionId, String(userInfo?.id || ''), '')
          setInput('')
        }
      })
    } else {
      // 使用 ChatService 发送消息
      chatService.sendMessage(input, aiSessionId, String(userInfo?.id || ''), conversationId)
      setInput('')
    }
  }

  // 提取公共逻辑到单独函数 (保留此函数名以防其他地方引用，但内部逻辑已迁移到 ChatService)
  const continueWithSessionId = (sessionId: string, text: string) => {
    if (!text.trim()) return

    // 检查该 sessionId 是否已经在生成中
    const state = store.getState()
    const generatingIds = state.conversation.generatingConversationIds
    if (generatingIds.includes(sessionId)) {
      Taro.showToast({ title: '该对话正在生成中', icon: 'none' })
      return
    }

    chatService.sendMessage(text, sessionId, String(userInfo?.id || ''), conversationId)
    setInput('')
  }

  const assignment = (val: any) => {
    // 检查是否已经在生成中
    if (aiSessionId && generatingConversationIds.includes(aiSessionId)) return

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
            companyInfo.expansionDomainKeywordsSelected = [...companyInfo.expansionDomainKeywordsSelected, companyInfo.customInput]
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
      const validResults = results.filter((batch: any[]) => Array.isArray(batch) && batch.length > 0)
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
        companyInfo.expansionDomainKeywordsSelected = [...companyInfo.expansionDomainKeywordsSelected, companyInfo.customInput]
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
    const { scrollTop: currentScrollTop, scrollHeight: currentScrollHeight, scrollLeft, scrollWidth } = e.detail

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
        <View className="chatPage_default" ref={contentRef} style={{ height: `calc(100% - 314rpx)` }}>
          {keyboardHeight !== 336 && <Image src="https://find-console.newgalaxyai.com/glks/assets/home/home4.png" className="chatPage_img" />}
          {loadFailed ? (
            <View className="chatPage_recommend">
              <View className="chatPage_recommend_title">
                <View className="recommend_left">
                  <Image src="https://find-console.newgalaxyai.com/glks/assets/home/home5.png" className="recommend_left_img" />
                  <Text className="recommend_left_text">您可以试着问我：</Text>
                </View>
                <View className="recommend_right" onClick={handleChangeBatch} style={{ cursor: 'pointer' }}>
                  <Text className="recommend_right_text">换一批</Text>
                  <Image src="https://find-console.newgalaxyai.com/glks/assets/home/home6.png" className="recommend_right_img" />
                </View>
              </View>
              <View className={`chatPage_recommend_content${recommendAnim ? ' ' + recommendAnim : ''}`} ref={recommendRef}>
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
        <ScrollView className="chatPage_content" ref={scrollViewRef} style={{ height: `calc(100vh - ${height}px - 319rpx)` }} scrollY scrollTop={scrollTop} onScroll={handleScroll} enhanced={true} scrollWithAnimation={true} showScrollbar={false}>
          {messages.map((msg, idx) => (
            <View key={idx} className={`chatMsg ${msg.role === 'user' ? 'user' : 'ai'}`} style={{ padding: '8px 0' }}>
              {msg.role === 'user' ? (
                <Text user-select className="chatMsg_user">
                  {msg.content}
                </Text>
              ) : (
                <View className="chatMsg_ai">
                  <AiMessageComponent msg={msg} />
                  {msg.content && msg.apiStatus.textComplete && msg.apiStatus.companyComplete ? (
                    <View className="chatMsg_ai_fun">
                      <Image src="https://find-console.newgalaxyai.com/glks/assets/home/home10.png" className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[0] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 0)} data-message-id={msg.messageId} data-button-index={0} />
                      {(msg.isLike == 0 || msg.isLike == 1) && <Image src={msg.isLike == 1 ? 'https://find-console.newgalaxyai.com/glks/assets/home/home14.png' : 'https://find-console.newgalaxyai.com/glks/assets/home/home11.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[1] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 1)} data-message-id={msg.messageId} data-button-index={1} />}
                      {(msg.isLike == 0 || msg.isLike == 2) && <Image src={msg.isLike == 2 ? 'https://find-console.newgalaxyai.com/glks/assets/home/home15.png' : 'https://find-console.newgalaxyai.com/glks/assets/home/home12.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[2] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 2)} data-message-id={msg.messageId} data-button-index={2} />}
                      <Image src={!msg.isCollect ? 'https://find-console.newgalaxyai.com/glks/assets/home/home13.png' : 'https://find-console.newgalaxyai.com/glks/assets/home/home16.png'} className={`chatMsg_ai_fun_img ${buttonStates[msg.messageId]?.[3] ? 'button-active' : ''}`} onClick={() => handleButtonClick(msg.messageId, 3)} data-message-id={msg.messageId} data-button-index={3} />
                    </View>
                  ) : null}
                </View>
              )}
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

      <View className="chatPage_bottom" style={{ height: bottomHeight, bottom: keyboardHeight ? `${keyboardHeight}px` : 0, transition: 'height 0.26s, bottom 0.26s' }}>
        <View className="chatPage_bottom_input">
          <Textarea show-confirm-bar={false} adjust-position={false} value={input} onInput={handleInput} className="chatPage_input" onConfirm={send} placeholder="请输入您的客户需求～" placeholderStyle="color: #A9A9A9;" disabled={isStreaming} />
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
        <View style={{ color: '#A9A9A9', fontSize: '22rpx', width: '100%', textAlign: 'center', marginTop: '20rpx' }}>内容由AI生成，仅供参考</View>
      </View>

      <View className="customizeDialog">
        <Dialog title="您对本回答满意吗？" visible={yiJianVisible} onConfirm={() => yiJianConfirm()} onCancel={() => yiJianCancel()}>
          <TextArea className="chatPage_inputs" placeholder="请输入您的评价" value={yiJianInput} onInput={e => setYiJianInput(e.detail.value)} />
        </Dialog>
      </View>
    </View>
  )
})

export default Index
