import Taro from '@tarojs/taro'
import store from '@/redux/index'
import { addSessionMessage, updateSessionMessage, appendSessionMessageContent, setConversationGenerating } from '@/redux/modules/conversation'
import { preprocessingAPI, textStageAPI, companyStageAPI, aiMessageCreateAPI } from '@/api/chatMsg'
import { IMessage } from '@/redux/modules/conversation'

// Helper for formatting time
const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  const second = date.getSeconds().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

class ChatService {
  private static instance: ChatService

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  // Generate a unique ID for messages
  private generateUniqueId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Send a message
   * @param content User input content
   * @param sessionId Current session ID
   * @param userId Current user ID
   */
  public async sendMessage(content: string, sessionId: string, userId: string, conversationId: string = '') {
    const questionTime = formatTime(new Date())
    const startTime = Date.now()

    // 1. Add user message
    const userMsgId = this.generateUniqueId()
    const userMsg: IMessage = {
      id: userMsgId,
      messageId: userMsgId,
      role: 'user',
      content,
      timestamp: startTime,
      apiStatus: { textComplete: true, companyComplete: true },
      companyList: [],
      splitNum: 0,
      total: 0,
      conclusion: ''
    }

    store.dispatch(addSessionMessage({ sessionId, message: userMsg }))

    // 2. Add AI placeholder message
    const aiMsgId = this.generateUniqueId()
    const aiMsg: IMessage = {
      id: aiMsgId,
      messageId: aiMsgId,
      role: 'ai',
      content: '',
      timestamp: Date.now(),
      apiStatus: { textComplete: false, companyComplete: false },
      splitNum: 0,
      total: 0,
      companyList: [],
      conclusion: ''
    }

    store.dispatch(addSessionMessage({ sessionId, message: aiMsg }))
    store.dispatch(setConversationGenerating({ sessionId, isGenerating: true }))

    try {
      // Get context info
      const state = store.getState()
      const sessionMsgs = state.conversation.sessionMessages[sessionId] || []
      let lastCompanyList: any[] = []
      // Find last company list from previous messages
      for (let i = sessionMsgs.length - 2; i >= 0; i--) {
        const msg = sessionMsgs[i]
        if (msg.companyList && msg.companyList.length > 0) {
          lastCompanyList = msg.companyList
          break
        }
      }

      const companyInfo = Taro.getStorageSync('companyInfo') || {}

      // Handle customInput logic similar to AiChat
      if (companyInfo?.customInput) {
        companyInfo.expansionDomainKeywordsSelected = [...(companyInfo.expansionDomainKeywordsSelected || []), companyInfo.customInput]
        // Note: we don't save back to storage here to avoid side effects, but we use it for API call
      }

      // 3. Preprocessing
      const prepParams = {
        targetCompanyName: companyInfo.companyName,
        query: content,
        questionKeyword: companyInfo.expansionDomainKeywordsSelected ? companyInfo.expansionDomainKeywordsSelected.join(',') : '',
        responseMode: 'blocking',
        user: userId,
        conversationId: conversationId,
        productSellingPointsRespDTO: {
          coreSellingPoints: {
            coreBusiness: companyInfo.coreSellingPoints?.coreBusiness,
            productDescription: companyInfo.coreSellingPoints?.productDescription,
            productFeatures: companyInfo.coreSellingPoints?.productFeatures
          },
          expansionDomainKeywords: companyInfo.expansionDomainKeywordsSelected
        },
        extendContextInfo: JSON.stringify(lastCompanyList.length > 5 ? lastCompanyList.slice(0, 5) : lastCompanyList)
      }

      const prepRes: any = await this.callApi(preprocessingAPI, prepParams)

      if (!prepRes.success) {
        throw new Error(prepRes.msg || 'Preprocessing failed')
      }

      // 4. Text Stage
      const textRes: any = await this.callApi(textStageAPI, {
        ...prepRes.data,
        conversationId: conversationId
      })

      if (textRes.success) {
        store.dispatch(
          updateSessionMessage({
            sessionId,
            messageId: aiMsgId,
            apiStatus: { textComplete: true, companyComplete: false }
          })
        )

        if (textRes.data.isRecommend) {
          // Start streaming text content
          await this.streamContent(sessionId, aiMsgId, textRes.data.answer || textRes.data.normalAnswer)
        } else {
          // If not recommend, maybe just show answer directly?
          // Assuming answer is always there.
          await this.streamContent(sessionId, aiMsgId, textRes.data.answer || textRes.data.normalAnswer)
        }
      } else {
        throw new Error(textRes.msg || 'Text stage failed')
      }

      // 5. Company Stage
      let companyData = {
        companyList: [],
        splitNum: 0,
        total: 0
      }

      if (textRes.data.isRecommend) {
        const companyRes: any = await this.callApi(companyStageAPI, {
          ...prepRes.data,
          isRecommend: textRes.data.isRecommend
        })

        if (companyRes.success) {
          companyData = companyRes.data

          // Process company list
          const processedCompanyList = (companyData.companyList || []).map((item: any) => {
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
          })

          store.dispatch(
            updateSessionMessage({
              sessionId,
              messageId: aiMsgId,
              companyList: processedCompanyList,
              splitNum: companyData.splitNum,
              total: companyData.total,
              apiStatus: { textComplete: true, companyComplete: true }
            })
          )
        } else {
          store.dispatch(
            updateSessionMessage({
              sessionId,
              messageId: aiMsgId,
              apiStatus: { textComplete: true, companyComplete: true }
            })
          )
        }
      } else {
        // No company stage needed
        store.dispatch(
          updateSessionMessage({
            sessionId,
            messageId: aiMsgId,
            apiStatus: { textComplete: true, companyComplete: true }
          })
        )
      }

      // 6. Save to backend
      const answerTime = formatTime(new Date())
      const endTime = Date.now()
      const responseDuration = Number(((endTime - startTime) / 1000).toFixed(1))

      // Get final AI content from store
      const currentState = store.getState()
      const currentMsgs = currentState.conversation.sessionMessages[sessionId] || []
      // 确保获取最新的AI消息内容，因为 streamContent 已经更新了 state
      const finalAiMsg = currentMsgs.find(m => m.messageId === aiMsgId)

      if (finalAiMsg) {
        // 保存消息
        this.saveMessageToBackend({
          sessionId,
          userContent: content,
          aiContent: finalAiMsg.content, // 使用完整内容
          aiConclusion: '',
          questionTime,
          answerTime,
          responseDuration,
          enterpriseInfo: {
            companyList: companyData.companyList || [],
            splitNum: companyData.splitNum || 0,
            total: companyData.total || 0
          }
        }).catch(err => console.error('Failed to save message:', err))
      }
    } catch (error) {
      console.error('Chat error:', error)
      store.dispatch(
        updateSessionMessage({
          sessionId,
          messageId: aiMsgId,
          content: '\n\n(请求出错，请重试)',
          apiStatus: { textComplete: true, companyComplete: true }
        })
      )
    } finally {
      // 确保无论成功失败都移除生成状态
      store.dispatch(setConversationGenerating({ sessionId, isGenerating: false }))
    }
  }

  // Helper to promisify API calls
  private callApi(apiFunc: Function, params: any): Promise<any> {
    return new Promise(resolve => {
      apiFunc(params, (res: any) => resolve(res))
    })
  }

  // Simulate streaming content
  private streamContent(sessionId: string, messageId: string, fullContent: string) {
    return new Promise<void>(resolve => {
      if (!fullContent) {
        resolve()
        return
      }

      let currentIndex = 0
      const chunkSize = 2 // chars per tick

      const timer = setInterval(() => {
        // 检查会话是否还在生成状态中（防止被意外取消）
        // 但这里我们希望即使切换页面也继续，所以不做额外检查，除非明确要有停止机制

        if (currentIndex >= fullContent.length) {
          clearInterval(timer)
          resolve()
          return
        }

        const chunk = fullContent.slice(currentIndex, currentIndex + chunkSize)
        store.dispatch(
          appendSessionMessageContent({
            sessionId,
            messageId,
            content: chunk
          })
        )
        currentIndex += chunkSize
      }, 30) // Faster interval for smoother feel
    })
  }

  private async saveMessageToBackend(params: { sessionId: string; userContent: string; aiContent: string; aiConclusion: string; questionTime: string; answerTime: string; responseDuration: number; enterpriseInfo: any }) {
    const apiParams = {
      sessionId: params.sessionId,
      userMessage: params.userContent,
      aiResponse: params.aiContent,
      aiConclusion: params.aiConclusion,
      questionTime: params.questionTime,
      answerTime: params.answerTime,
      responseDuration: params.responseDuration,
      enterpriseInfo: JSON.stringify(params.enterpriseInfo)
    }

    const res = await this.callApi(aiMessageCreateAPI, apiParams)
    if (res.success) {
      return res.data
    }
    return null
  }
}

export default ChatService.getInstance()
