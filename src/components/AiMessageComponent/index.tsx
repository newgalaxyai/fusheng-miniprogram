import React, { useEffect } from 'react'
import { View, Image, Text } from '@tarojs/components'
import { ArrowRight, ArrowRightSmall } from '@nutui/icons-react-taro'
import { marked } from 'marked'
import Taro from '@tarojs/taro'

// 配置marked选项，适合小程序环境
marked.setOptions({
  breaks: true, // 支持换行
  gfm: false // 启用GitHub风格的Markdown
})

// 使用marked.parse解析Markdown
const parseMarkdown = (text: string): string => {
  if (!text) return ''

  try {
    // 首先解码HTML实体
    let decodedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')

    // 预处理：确保换行符被正确处理
    let processedText = decodedText
      // 将单独的\n转换为两个\n（markdown段落分隔）
      .replace(/([^\n])\n([^\n])/g, '$1\n\n$2')

    // 使用marked解析Markdown
    const result = marked.parse(processedText)

    let htmlResult: string
    if (typeof result === 'string') {
      htmlResult = result
    } else {
      htmlResult = String(result)
    }

    // 关键修改：在marked.parse之后再次解码HTML实体，解决&quot;问题
    let decodedHtmlResult = htmlResult
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')

    // 最后确保所有\n都被转换
    const finalResult = decodedHtmlResult.replace(/\n/g, '<br>')

    return finalResult
  } catch (error) {
    console.error('❌ parseMarkdown - 解析错误:', error)
    // 错误处理时也要解码HTML实体
    const fallbackResult = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\n/g, '<br>')

    return fallbackResult
  }
}

const ChatTechLoadingAnimation = () => {
  return (
    <View className="tech-loading-container">
      <View className="tech-loading-dots">
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
        <View className="tech-dot"></View>
      </View>
      <View className="tech-loading-text">AI正在思考中...</View>
    </View>
  )
}

interface AiMessageComponentProps {
  msg: {
    splitNum: number
    total: number
    content: string
    conclusion: string
    companyList: any[]
    apiStatus: { textComplete: boolean; companyComplete: boolean }
    messageId: string
    role: string
  }
}

const navigateToCompanyDetail = (company: any) => {
  Taro.navigateTo({
    url: `/subpackages/company/enterpriseDetail/index?company=${JSON.stringify(company)}`
  })
}

const navigateToCompanyList = (msg: any) => {
  // 先跳转页面
  Taro.navigateTo({ url: `/subpackages/company/enterpriseSearch/index?messageId=${msg.messageId}` }).then(() => {
    // 页面跳转成功后，延迟触发事件
    setTimeout(() => {
      Taro.eventCenter.trigger('enterpriseSearchData', {
        companyList: msg.companyList,
        total: msg.total,
        messageId: msg.messageId
      })
    }, 100) // 延迟100ms确保目标页面已经加载
  })
}

const AiMessageComponent: React.FC<AiMessageComponentProps> = ({ msg }) => {
  useEffect(() => {
    const handleEnterpriseDetailUnload = (res: any) => {
      if (res.messageId === msg.messageId) {
        msg.companyList.forEach((item: any) => {
          if (item.creditCode === res.creditCode) {
            item.hasFeedback = res.hasFeedback
            item.isJoinClue = res.isJoinClue
            item.commentContent = res.commentContent
          }
        })
      }
    }
    Taro.eventCenter.on('enterpriseDetailUnload', handleEnterpriseDetailUnload)

    return () => {
      Taro.eventCenter.off('enterpriseDetailUnload', handleEnterpriseDetailUnload)
    }
  }, [])

  useEffect(() => {
    const handleEnterpriseSearchDataEdit = (data: any) => {
      if (data.messageId === msg.messageId) {
        msg.companyList = data.companyList
      }
    }
    Taro.eventCenter.on('enterpriseSearchDataEdit', handleEnterpriseSearchDataEdit)

    return () => {
      Taro.eventCenter.off('enterpriseSearchDataEdit', handleEnterpriseSearchDataEdit)
    }
  }, [])

  return (
    <View>
      {msg.content ? <View className="chatMsg_ai_text" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}></View> : null}
      {msg.role === 'ai' && msg.apiStatus.textComplete && msg.companyList && msg.companyList.length > 0
        ? msg.companyList.slice(0, msg.splitNum == 0 || msg.splitNum == null ? 10 : msg.splitNum).map((val, valIdx) => (
            <View key={valIdx}>
              <View className="chat_ai_company" onClick={() => navigateToCompanyDetail({ ...val, messageId: msg.messageId })}>
                <View className="company_left">
                  {val.logo ? (
                    // 判断是否为图片链接（包含http或https）
                    val.logo.includes('http') ? (
                      <Image src={val.logo} className="company_left_img" />
                    ) : (
                      // 如果是文字，显示文字
                      <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="company_left_img">
                        {val.logo}
                      </Text>
                    )
                  ) : (
                    // 如果为空，显示"暂无"
                    <Text className="company_left_img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx' }}>
                      暂无
                    </Text>
                  )}
                </View>
                <View className="company_right">
                  <View className="company_right_top">
                    <Text className="company_right_top_text">{val.name}</Text>
                    <ArrowRightSmall color="#2B2B2B" size="24rpx" />
                  </View>
                  <View className="company_right_tags">
                    {val.regStatus != 'null' && <Text className="company_right_tag">{val.regStatus || '- -'}</Text>}
                    <Text className="company_right_tag">{val?.contactInfo?.phones?.length || 0}联系方式</Text>
                    <Text className="company_right_tag">{val?.staffNum}人</Text>
                  </View>
                  <View className="company_right_info">
                    <Text className="legal-person">法人:{val.legalPerson}</Text>
                    <Text className="address">{val.handleLocation}</Text>
                    <View className="website">
                      <Image src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise3.png" className="website_img" />
                      官网
                    </View>
                  </View>
                  <View className="company_right_date">
                    <Text className="company_right_date_text">{val.establishTime}</Text>
                  </View>
                  <View className="company_right_tabs">
                    <Text className="company_right_tab">最匹配</Text>
                    <Text className="company_right_tab">最新</Text>
                  </View>
                </View>
              </View>
              {valIdx === msg.splitNum - 1 && (
                <View className="chatMsg_ai_fun_line" onClick={() => navigateToCompanyList(msg)}>
                  <View style={{ marginRight: '16rpx' }}>查看{msg.total}企业信息</View>
                  <ArrowRight color="#1B5BFF" size="30rpx" />
                </View>
              )}
            </View>
          ))
        : null}
      {msg.conclusion ? <View style={{ marginTop: '16rpx' }} className="chatMsg_ai_text" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.conclusion) }}></View> : null}
      {/* 加载动画单独显示在文字和公司列表下方 */}
      {(!msg.apiStatus.textComplete || !msg.apiStatus.companyComplete) && <ChatTechLoadingAnimation />}
    </View>
  )
}

export default AiMessageComponent
