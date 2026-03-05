import React, { useEffect, useRef, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { View, Image, Input, Text, ScrollView, Textarea } from '@tarojs/components'
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import './index.scss'
import { aiSessionCreateAPI, aiMessageEvaluationCreateAPI, userFavoriteCreateAPI } from '@/api/chatMsg'
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore'
import { Dialog, TextArea, BackTop } from '@nutui/nutui-react-taro'
import { ArrowDownSize6, ArrowUpSize6 } from '@nutui/icons-react-taro'
import { getSessionListAsync, getFavoriteListAsync } from '@/redux/asyncs/conversation'
import { setMessages, setIsStreaming, updateMessageLikeStatus, updateMessageCollectStatus, IMessage } from '@/redux/modules/conversation'
import { chatService } from '@/service/chat'
import AiMessageComponent from '@/components/AiMessageComponent'

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

  // Redux State
  const messages = useAppSelector(state => state.conversation.currentMessages)
  const isStreaming = useAppSelector(state => state.conversation.isStreaming)
  const userInfo = useAppSelector(state => state.login.userInfo)

  // Local State
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [scrollTop, setScrollTop] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [bottomHeight, setBottomHeight] = useState('314rpx')
  const [aiSessionId, setAiSessionId] = useState('')
  const aiSessionIdRef = useRef('')
  const [yiJianVisible, setYiJianVisible] = useState(false)
  const [yiJianInput, setYiJianInput] = useState('')
  const [copyMessageId, setCopyMessageId] = useState('')
  const [buttonStates, setButtonStates] = useState<{ [key: string]: { [buttonIndex: number]: boolean } }>({})

  const companyInfo = Taro.getStorageSync('companyInfo') || {}

  // Refs
  const isProcessingRef = useRef(false)
  const isEventRegistered = useRef(false)

  // Generate Unique ID
  const generateUniqueId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Update ref when aiSessionId changes
  useEffect(() => {
    aiSessionIdRef.current = aiSessionId
    if (aiSessionId) {
      chatService.connect(aiSessionId)
    }
    // Do not disconnect on unmount to keep background connection alive
    // Connection management is handled by ChatService
  }, [aiSessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    getChatMsgHeight()
  }, [messages])

  // Adjust bottom height on keyboard change
  useEffect(() => {
    if (keyboardHeight > 0) {
      setBottomHeight('235rpx')
    } else {
      setBottomHeight('314rpx')
    }
  }, [keyboardHeight])

  useEffect(() => {
    // 1. Keyboard height listener
    if (process.env.TARO_ENV === 'weapp') {
      Taro.onKeyboardHeightChange(res => {
        setKeyboardHeight(res.height)
      })
    }

    // 2. Init session
    if (Taro.getStorageSync('aiSessionId')) {
      setAiSessionId(Taro.getStorageSync('aiSessionId'))
    } else {
      getAiSession()
    }

    // 3. Handle history loading
    const handleGetChatItem = res => {
      setAiSessionId(res.id)
      setConversationId(res.conversationId)
      dispatch(setMessages([]))

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
              timestamp: Date.now(),
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || generateUniqueId(),
              isCollect: item.isCollect,
              isLike: item.isLike
            })
          }
          if (item.aiResponse) {
            let companyList: any[] = []
            let splitNum = 10
            let total = 0

            try {
              const enterpriseInfo = JSON.parse(item.enterpriseInfo)
              companyList = enterpriseInfo.companyList || []
              splitNum = enterpriseInfo.splitNum
              total = enterpriseInfo.total
            } catch (e) {}

            newMessages.push({
              id: item.id || generateUniqueId(),
              role: 'ai',
              content: item.aiResponse,
              conclusion: item.aiConclusion,
              companyList: companyList.map((item: any) => {
                // Ensure structure
                if (!item.contactInfo) item.contactInfo = { phones: [] }
                if (!Array.isArray(item.contactInfo.phones)) item.contactInfo.phones = []
                if (!Array.isArray(item.tags)) item.tags = []

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
              }),
              splitNum,
              total,
              timestamp: Date.now(),
              apiStatus: { textComplete: true, companyComplete: true },
              messageId: item.id || generateUniqueId(),
              isCollect: item.isCollect,
              isLike: item.isLike
            })
          }
        })
        dispatch(setMessages(newMessages))
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

  const handleSend = useCallback((res: string) => {
    if (res && !isProcessingRef.current) {
      isProcessingRef.current = true

      setTimeout(() => {
        // Use global service
        if (aiSessionIdRef.current) {
          sendMessage(res, aiSessionIdRef.current)
        } else {
          // Create session if missing (should be rare)
          getAiSession().then(newSessionId => {
            if (newSessionId) sendMessage(res, newSessionId)
          })
        }

        // Reset flag
        setTimeout(() => {
          isProcessingRef.current = false
        }, 1000)
      }, 300)
    }
  }, [])

  const sendMessage = (text: string, sessionId: string) => {
    if (!text.trim() || isStreaming) return

    if (!Taro.getStorageSync('companyInfo')) {
      Taro.eventCenter.trigger('companyShow', true)
    }

    if (companyInfo?.customInput) {
      companyInfo.expansionDomainKeywordsSelected = [...companyInfo.expansionDomainKeywordsSelected, companyInfo.customInput]
    }

    chatService.sendMessage(text, sessionId, conversationId, companyInfo, userInfo)
  }

  useEffect(() => {
    if (isEventRegistered.current) return

    console.log('注册send事件监听')
    Taro.eventCenter.on('send', handleSend)
    isEventRegistered.current = true

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

  useImperativeHandle(ref, () => ({
    getAiSessionCopy
  }))

  const handleButtonClick = (messageId: string, buttonIndex: number) => {
    let msg = messages.find(item => item.messageId === messageId && item.role === 'ai')
    if (!msg) return

    setCopyMessageId(messageId)

    // Find user message for context
    const userMsg = messages.find(item => item.role === 'user' && Math.abs(item.timestamp - msg!.timestamp) < 5000) // approximate match
    const userInput = userMsg ? userMsg.content : ''

    const currentAnswerContent = {
      content: msg.content,
      companyList: msg.companyList,
      userInput: userInput
    }

    setButtonStates(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [buttonIndex]: !prev[messageId]?.[buttonIndex]
      }
    }))

    if (buttonIndex === 0) {
      // Copy
      let copyContent = currentAnswerContent.content
      if (currentAnswerContent.companyList && currentAnswerContent.companyList.length > 0) {
        copyContent += '\n\n企业信息：\n'
        currentAnswerContent.companyList.forEach((company: any, index: number) => {
          copyContent += `\n${index + 1}. ${company.name || '未知企业名称'}\n`
          if (company.legalPerson) copyContent += `   法人: ${company.legalPerson}\n`
          if (company.tags && Array.isArray(company.tags) && company.tags.length > 0) {
            copyContent += `   标签: ${company.tags.join(', ')}\n`
          }
          if (company.contactInfo?.phones && company.contactInfo.phones.length > 0) {
            copyContent += `   联系方式: ${company.contactInfo.phones.join(', ')}\n`
          }
        })
      }
      Taro.setClipboardData({ data: copyContent })
    } else if (buttonIndex === 1) {
      // Like
      const newLikeStatus = msg.isLike === 1 ? 0 : 1

      // Update Redux state immediately for UI feedback
      dispatch(updateMessageLikeStatus({ messageId, isLike: newLikeStatus }))

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
          if (res.success) {
            Taro.showToast({ title: newLikeStatus === 1 ? '点赞成功' : '取消点赞', icon: 'none' })
          } else {
            // Revert if failed (optional, but good UX)
            dispatch(updateMessageLikeStatus({ messageId, isLike: msg!.isLike })) // revert to old status
          }
        }
      )
    } else if (buttonIndex === 2) {
      // Dislike
      if (msg.isLike === 0) {
        setYiJianVisible(true)
      } else {
        // Cancel dislike (if that's a thing? Usually dislike is just dislike. Assuming toggle or just set to 0)
        // If current status is disliked (2?), and we click dislike again, maybe we want to cancel?
        // But here logic says: if msg.isLike === 0 (neutral), show feedback dialog.
        // If msg.isLike !== 0 (meaning liked or disliked?), it calls API to set to 0?
        // Let's assume the intention is: if already disliked/liked, clicking dislike resets to neutral?

        // Actually, let's look at the original logic:
        // if (msg.isLike === 0) { setYiJianVisible(true) } else { aiMessageEvaluationCreateAPI(..., isLiked: 0) }

        dispatch(updateMessageLikeStatus({ messageId, isLike: 0 }))

        aiMessageEvaluationCreateAPI(
          {
            userId: userInfo?.id,
            messageId: messageId,
            entryPoint: 'ai_chat',
            isLiked: 0,
            questionContent: currentAnswerContent.userInput,
            answerContent: JSON.stringify(currentAnswerContent)
          },
          res => {}
        )
      }
    } else if (buttonIndex === 3) {
      // Collect
      let contentSummary = JSON.stringify({
        content: msg.content,
        companyList: msg.companyList,
        splitNum: msg.splitNum,
        total: msg.total
      })
      let queryParams = {
        title: userInput,
        userId: userInfo?.id,
        messageId,
        contentSummary: contentSummary
      }
      userFavoriteCreateAPI(queryParams, res => {
        if (res.success) {
          dispatch(getFavoriteListAsync())
          const newCollectStatus = !msg!.isCollect
          dispatch(updateMessageCollectStatus({ messageId, isCollect: newCollectStatus }))
          Taro.showToast({ title: newCollectStatus ? '收藏成功' : '已取消收藏', icon: 'none' })
        }
      })
    }
  }

  const yiJianConfirm = () => {
    let msg = messages.find(item => item.messageId === copyMessageId && item.role === 'ai')
    if (!msg) return

    // Find user message
    const userMsg = messages.find(item => item.role === 'user' && Math.abs(item.timestamp - msg!.timestamp) < 5000)
    const userInput = userMsg ? userMsg.content : ''

    const currentAnswerContent = {
      content: msg.content,
      companyList: msg.companyList,
      userInput: userInput
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
          dispatch(updateMessageLikeStatus({ messageId: copyMessageId, isLike: 2 }))
        }
      }
    )
    setYiJianVisible(false)
  }

  useDidShow(() => {
    setKeyboardHeight(0)
  })
  useDidHide(() => {
    setKeyboardHeight(0)
  })

  const getAiSession = async () => {
    return new Promise<string>(resolve => {
      aiSessionCreateAPI({ userId: userInfo?.id }, res => {
        if (res.success && res.data) {
          Taro.setStorageSync('aiSessionId', res.data)
          setAiSessionId(res.data)
          dispatch(getSessionListAsync())
          Taro.eventCenter.trigger('addSession', true)
          dispatch(setMessages([]))
          setConversationId('')
          resolve(res.data)
        } else {
          resolve('')
        }
      })
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
        dispatch(setMessages([]))
        dispatch(setIsStreaming(false))
        Taro.showToast({ title: '会话创建成功', icon: 'none' })
        setConversationId('')
      }
    })
  }

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

  return (
    <View className="index" style={{ height: '100%' }}>
      <ScrollView scrollY scrollTop={scrollTop} className="chat-list" style={{ height: `calc(100% - ${bottomHeight})`, paddingBottom: '20rpx' }}>
        {messages.map((item, index) => (
          <View key={item.messageId || index}>
            {item.role === 'user' ? (
              <View className="chatMsg_user">
                <View className="chatMsg_user_content">
                  <Text>{item.content}</Text>
                </View>
                <Image className="chatMsg_user_avatar" src={userInfo?.avatar || ''} mode="aspectFill" />
              </View>
            ) : (
              <View className="chatMsg_ai">
                <Image className="chatMsg_ai_avatar" src="https://galaxy-ai.oss-cn-hangzhou.aliyuncs.com/glks/miniprogram/logo.png" mode="aspectFill" />
                <View className="chatMsg_ai_content">{item.content ? <AiMessageComponent msg={item} onButtonClick={handleButtonClick} isCollect={item.isCollect} isLike={item.isLike} /> : <TechLoadingAnimation />}</View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 意见反馈弹窗 */}
      <Dialog visible={yiJianVisible} title="意见反馈" onCancel={() => setYiJianVisible(false)} onConfirm={yiJianConfirm}>
        <TextArea placeholder="请输入您的意见反馈" value={yiJianInput} onChange={val => setYiJianInput(val)} />
      </Dialog>
    </View>
  )
})

export default Index
