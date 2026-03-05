import Taro from '@tarojs/taro'
import { IMessage } from '@/redux/modules/conversation'
import store from '@/redux'
import { 
  setMessages, 
  setIsStreaming, 
  addMessage, 
  appendMessageContent, 
  updateMessageStatus, 
  updateMessageCompanyList, 
  updateMessageTotal, 
  updateMessageSplitNum, 
  updateMessageConclusion,
  updateMessageId 
} from '@/redux/modules/conversation'
import { textStageAPI, companyStageAPI, aiSessionUpdateAPI, aiMessageCreateAPI, preprocessingAPI } from '@/api/chatMsg'

class ChatService {
  private socket: Taro.SocketTask | null = null
  private reconnectInterval: any = null
  private isConnecting: boolean = false
  private url: string = 'wss://find-console.newgalaxyai.com/ws' // Placeholder URL
  private sessionId: string = ''

  // Set the WebSocket URL
  public setUrl(url: string) {
    this.url = url
  }

  // Connect to WebSocket
  public async connect(sessionId: string) {
    // If already connected to the same session, do nothing
    if (this.sessionId === sessionId && (this.socket || this.isConnecting)) return

    // If connected to a different session, disconnect first
    if (this.socket) {
      this.disconnect()
    }

    this.sessionId = sessionId
    this.isConnecting = true
    
    // Check if we have a valid URL (placeholder check)
    if (!this.url || this.url.includes('example.com')) {
      console.warn('WebSocket URL not configured. Using HTTP fallback.')
      this.isConnecting = false
      return
    }

    try {
      // @ts-ignore
      this.socket = await Taro.connectSocket({
        url: `${this.url}?sessionId=${sessionId}`,
        success: () => {
          console.log('WebSocket connecting...')
        }
      })

      if (this.socket) {
        this.socket.onOpen(() => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.stopReconnect()
        })

        this.socket.onClose(() => {
          console.log('WebSocket closed')
          this.socket = null
          this.isConnecting = false
          this.startReconnect()
        })

        this.socket.onError((err) => {
          console.error('WebSocket error', err)
          this.isConnecting = false
        })

        this.socket.onMessage((res) => {
          this.handleMessage(res.data)
        })
      }
    } catch (error) {
      console.error('WebSocket connection failed', error)
      this.isConnecting = false
    }
  }

  // Disconnect WebSocket
  public disconnect() {
    if (this.socket) {
      this.socket.close({})
      this.socket = null
    }
    this.stopReconnect()
  }

  // Reconnect logic
  private startReconnect() {
    if (this.reconnectInterval) return
    this.reconnectInterval = setInterval(() => {
      this.connect(this.sessionId)
    }, 5000)
  }

  private stopReconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
      this.reconnectInterval = null
    }
  }

  // Handle incoming WebSocket messages
  private handleMessage(data: string) {
    try {
      const parsedData = JSON.parse(data)
      
      if (parsedData.type === 'text_chunk') {
        store.dispatch(appendMessageContent({ 
          messageId: parsedData.messageId, 
          content: parsedData.content 
        }))
      } else if (parsedData.type === 'complete') {
        store.dispatch(updateMessageStatus({ 
          messageId: parsedData.messageId, 
          status: { textComplete: true } 
        }))
        store.dispatch(setIsStreaming(false))
        this.checkAndSave(parsedData.messageId, this.sessionId)
      }
    } catch (error) {
      console.error('Error parsing WS message', error)
    }
  }

  // Send message (wraps HTTP or WS depending on config)
  public sendMessage(text: string, sessionId: string, conversationId: string, companyInfo: any, userInfo: any) {
    // If WebSocket is connected, use it
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send({
        data: JSON.stringify({
          type: 'chat',
          content: text,
          sessionId,
          conversationId
        })
      })
      
      // Optimistically add user message to Redux
      const userMessageId = `msg_${Date.now()}_user`
      const userMsg: IMessage = {
        id: userMessageId,
        role: 'user',
        content: text,
        messageId: userMessageId,
        apiStatus: { textComplete: true, companyComplete: true },
        timestamp: Date.now(),
        isCollect: false,
        isLike: 0
      }
      store.dispatch(addMessage(userMsg))
      return
    }

    // Fallback to HTTP (Existing Logic moved here)
    this.handleHttpChat(text, sessionId, conversationId, companyInfo, userInfo)
  }

  // Check if message is complete and save to DB
  private checkAndSave(messageId: string, sessionId: string) {
    const state = store.getState().conversation
    const msg = state.currentMessages.find(m => m.messageId === messageId && m.role === 'ai')
    
    if (msg && msg.messageId && msg.apiStatus?.textComplete && msg.apiStatus?.companyComplete) {
       // Find user message
       const userMsg = state.currentMessages.find(m => m.messageId === msg.messageId!.replace('_ai', '_user') || (m.role === 'user' && Math.abs(m.timestamp - msg.timestamp) < 1000))
       
       if (!userMsg || !userMsg.messageId) return

       // Save to DB
       const answerTime = this.formatTime(new Date())
       const questionTimestamp = userMsg.timestamp
       const answerTimestamp = new Date(answerTime).getTime()
       const responseDuration = Number(((answerTimestamp - questionTimestamp) / 1000).toFixed(1))

       aiMessageCreateAPI(
          {
            sessionId: sessionId,
            userMessage: userMsg.content,
            aiResponse: msg.content,
            aiConclusion: msg.conclusion,
            questionTime: this.formatTime(new Date(questionTimestamp)),
            answerTime,
            responseDuration,
            enterpriseInfo: JSON.stringify({
              companyList: msg.companyList,
              splitNum: msg.splitNum,
              total: msg.total
            })
          },
          (res) => {
            if (res.success && res.data) {
               // Update message IDs in Redux
               store.dispatch(updateMessageId({ oldId: userMsg.messageId!, newId: res.data as string }))
               store.dispatch(updateMessageId({ oldId: msg.messageId!, newId: res.data as string }))
            }
          }
        )
    }
  }

  private formatTime(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // Stream simulation for HTTP response
  private async streamAIReply(text: string, targetMessageId: string, sessionId: string) {
    const STREAM_CONFIG = {
      chunkSize: 5,
      delay: 30
    }

    store.dispatch(setIsStreaming(true))
    
    for (let i = 0; i < text.length; i += STREAM_CONFIG.chunkSize) {
      const chunk = text.slice(i, i + STREAM_CONFIG.chunkSize)
      store.dispatch(appendMessageContent({
        messageId: targetMessageId,
        content: chunk
      }))
      await new Promise(res => setTimeout(res, STREAM_CONFIG.delay))
    }

    store.dispatch(updateMessageStatus({
      messageId: targetMessageId,
      status: { textComplete: true }
    }))
    store.dispatch(setIsStreaming(false))
    
    // Check and save after streaming is done
    this.checkAndSave(targetMessageId, sessionId)
  }

  // The existing HTTP logic refactored to use Redux
  private handleHttpChat(text: string, sessionId: string, conversationId: string, companyInfo: any, userInfo: any) {
    // 1. Generate IDs
    const userMessageId = `msg_${Date.now()}_user`
    const aiMessageId = `msg_${Date.now()}_ai`

    // 2. Add initial messages to Redux
    const userMsg: IMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      messageId: userMessageId,
      apiStatus: { textComplete: false, companyComplete: false },
      timestamp: Date.now(),
      companyList: [],
      isCollect: false,
      isLike: 0
    }
    
    const aiMsg: IMessage = {
      id: aiMessageId,
      role: 'ai',
      content: '',
      messageId: aiMessageId,
      apiStatus: { textComplete: false, companyComplete: false },
      timestamp: Date.now(),
      companyList: [],
      isCollect: false,
      isLike: 0
    }

    store.dispatch(addMessage(userMsg))
    store.dispatch(addMessage(aiMsg))
    
    // 3. Call APIs
    const messages = store.getState().conversation.currentMessages
    let lastCompanyList: any[] = []
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].companyList && messages[i].companyList!.length > 0) {
        lastCompanyList = messages[i].companyList!
        break
      }
    }

    // Preprocessing
    preprocessingAPI(
      {
        targetCompanyName: companyInfo.companyName,
        query: text,
        questionKeyword: companyInfo.expansionDomainKeywordsSelected ? companyInfo.expansionDomainKeywordsSelected.join(',') : '',
        responseMode: 'blocking',
        user: userInfo?.id,
        conversationId: conversationId || '',
        productSellingPointsRespDTO: {
          coreSellingPoints: companyInfo.coreSellingPoints || {},
          expansionDomainKeywords: companyInfo.expansionDomainKeywordsSelected || []
        },
        extendContextInfo: JSON.stringify(lastCompanyList.length > 5 ? lastCompanyList.slice(0, 5) : lastCompanyList)
      },
      (parameter) => {
        if (parameter.success && parameter.data) {
          // Text Stage
          textStageAPI({ ...parameter.data, conversationId: conversationId || '' }, (res) => {
            if (res.success && res.data) {
              if (res.data.isRecommend) {
                 store.dispatch(updateMessageStatus({
                   messageId: aiMessageId,
                   status: { companyComplete: false }
                 }))
                 
                 // Call Company Stage for recommend
                 companyStageAPI({ ...parameter.data, isRecommend: res.data.isRecommend }, (compRes) => {
                   if (compRes.success && compRes.data) {
                     const processedCompanyList = this.processCompanyList(compRes.data.companyInfoResponseList)
                     store.dispatch(updateMessageCompanyList({
                       messageId: aiMessageId,
                       companyList: processedCompanyList
                     }))
                     store.dispatch(updateMessageTotal({
                       messageId: aiMessageId,
                       total: compRes.data.total
                     }))
                     store.dispatch(updateMessageSplitNum({
                       messageId: aiMessageId,
                       splitNum: compRes.data.splitNum
                     }))
                     store.dispatch(updateMessageStatus({
                       messageId: aiMessageId,
                       status: { companyComplete: true }
                     }))
                     this.checkAndSave(aiMessageId, sessionId)
                   }
                 })
              }
              
              // Update Session Title
              aiSessionUpdateAPI({ userId: userInfo?.id, id: sessionId, title: text, conversationId: res.data.conversationId }, () => {})

              let responseText = ''
              if (res.data.introduction) {
                responseText = `${res.data.introduction || ''}<br>${res.data.analysisContent || ''}`
                this.streamAIReply(responseText, aiMessageId, sessionId)
                
                // If it has company body
                if (res.data.companyBody) {
                    const processedCompanyList = this.processCompanyList(res.data.companyBody.companyInfoResponseList)
                    store.dispatch(updateMessageConclusion({
                        messageId: aiMessageId,
                        conclusion: res.data.conclusion || ''
                    }))
                    store.dispatch(updateMessageCompanyList({
                        messageId: aiMessageId,
                        companyList: processedCompanyList || []
                    }))
                    store.dispatch(updateMessageTotal({
                        messageId: aiMessageId,
                        total: res.data.companyBody.total || 0
                    }))
                    store.dispatch(updateMessageSplitNum({
                        messageId: aiMessageId,
                        splitNum: res.data.companyBody.splitNum || 10
                    }))
                }
              } else {
                responseText = res.data.normalAnswer || ''
                this.streamAIReply(responseText, aiMessageId, sessionId)
              }
            } else {
              // Error
              store.dispatch(appendMessageContent({
                  messageId: aiMessageId,
                  content: '抱歉，我暂时无法回答您的问题，请稍后再试，谢谢！'
              }))
              store.dispatch(updateMessageStatus({
                  messageId: aiMessageId,
                  status: { textComplete: true, companyComplete: true }
              }))
              this.checkAndSave(aiMessageId, sessionId)
            }
          })
          
          companyStageAPI({ ...parameter.data, isRecommend: false }, (res) => {
            if (res.success && res.data) {
                const processedCompanyList = this.processCompanyList(res.data.companyInfoResponseList)
                store.dispatch(updateMessageCompanyList({
                    messageId: aiMessageId,
                    companyList: processedCompanyList
                }))
                store.dispatch(updateMessageTotal({
                    messageId: aiMessageId,
                    total: res.data.total
                }))
                store.dispatch(updateMessageSplitNum({
                    messageId: aiMessageId,
                    splitNum: res.data.splitNum
                }))
                store.dispatch(updateMessageStatus({
                    messageId: aiMessageId,
                    status: { companyComplete: true }
                }))
                this.checkAndSave(aiMessageId, sessionId)
            } else {
                store.dispatch(updateMessageStatus({
                    messageId: aiMessageId,
                    status: { companyComplete: true }
                }))
                this.checkAndSave(aiMessageId, sessionId)
            }
          })

        } else {
            // Preprocessing failed
             store.dispatch(appendMessageContent({
                  messageId: aiMessageId,
                  content: '抱歉，我暂时无法回答您的问题，请稍后再试。'
              }))
              store.dispatch(updateMessageStatus({
                  messageId: aiMessageId,
                  status: { textComplete: true, companyComplete: true }
              }))
              this.checkAndSave(aiMessageId, sessionId)
        }
      }
    )
  }

  // Helper to process company list
  private processCompanyList(list: any[]) {
      if (!list) return []
      return list.map((item: any) => {
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
  }
}

export const chatService = new ChatService()
