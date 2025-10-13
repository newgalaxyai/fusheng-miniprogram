import React, { useEffect, useState } from 'react'
import { View, Image, Text, RichText } from '@tarojs/components'
import { ArrowRight, ArrowRightSmall } from '@nutui/icons-react-taro'
import { marked } from 'marked'
import Taro from '@tarojs/taro'

// 配置marked选项，适合小程序环境
marked.setOptions({
  breaks: true, // 支持换行
  gfm: false // 启用GitHub风格的Markdown
})

// 简单而可靠的 Markdown 解析函数
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

    // 应用自定义样式处理
    let htmlResult = processedText
      // 处理嵌套的背景色div，移除外层div的padding
      .replace(/<div style="background-color:#f0f8ff; padding:10px; border-radius:5px;">[\s\S]*?<\/div>/g, '<div style="background-color:#ffffff; padding:none; border-radius:50px;">$1</div>')
      // 使用“块级表格解析”：匹配“表头 | 分隔线 | 多行数据”
      .replace(/(?:^|\n)\s*\|(.+?)\|\s*\n\s*\|([-\s:|]+)\|\s*\n((?:\s*\|.*\|\s*\n?)*)/g, (match, headerLine, separatorLine, bodyLines) => {
        const normalize = (line: string) => line.replace(/^\s*\|\s*|\s*\|\s*$/g, '')
        const headers = normalize(headerLine)
          .split('|')
          .map(c => c.trim())
          .filter(Boolean)

        // 可根据分隔线的 :--- :---: ---: 判定对齐方式，这里简单左对齐
        const thStyle = 'padding:12px 16px;border:1px solid #ddd;background:#f7f7f7;font-weight:600;text-align:left;vertical-align:top;font-size:12px;line-height:1.4;'
        const tdStyle = 'padding:12px 16px;border:1px solid #ddd;text-align:left;vertical-align:top;font-size:12px;line-height:1.4;'

        const thead = `<thead><tr>${headers.map(h => `<th style="${thStyle}">${h}</th>`).join('')}</tr></thead>`

        const rows = bodyLines
          .trim()
          .split('\n')
          .filter(line => /\|/.test(line.trim()))
          .map(line => {
            const cells = normalize(line)
              .split('|')
              .map(c => c.trim())
            return `<tr>${cells.map(c => `<td style="${tdStyle}">${c}</td>`).join('')}</tr>`
          })
          .join('')

        return `<table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #ddd;background:#fff;">${thead}<tbody>${rows}</tbody></table>`
      })
      // 处理特殊的列表块（包含字数、内容、样例的部分）
      .replace(/(- \*\*字数\*\*[\s\S]*?(?=\n\n|$))/g, match => {
        const listItems = match
          .split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => {
            const content = line.replace(/^- /, '')
            return `<div style="display: flex; margin: 6px 0; align-items: flex-start;"><span style="margin-right: 8px; color: #666;">•</span><span>${content}</span></div>`
          })
          .join('')

        // 处理样例部分的引用内容
        const exampleMatch = match.match(/>\s*([\s\S]*?)(?=\n\n|$)/)
        let exampleContent = ''
        if (exampleMatch) {
          exampleContent = `<div style="">${exampleMatch[1].trim()}</div>`
        }

        return `<div style="background-color:#fff; padding:none; border-radius:5px;">${listItems}${exampleContent}</div>`
      })
      // 处理普通列表项
      .replace(/^- (.+)$/gm, '<div style="display: flex; margin: 6px 0; align-items: flex-start;"><span style="margin-right: 8px; color: #666;">•</span><span>$1</span></div>')
      // 处理嵌套的列表项（在HTML内容中的）
      .replace(/\n\s*- (.+)/g, '<div style="display: flex; margin: 6px 0; align-items: flex-start; margin-left: 20px;"><span style="margin-right: 8px; color: #666;">•</span><span>$1</span></div>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/(<\/table>)\s*## ([^\n]+)/g, '$1<div style="font-size: 14px; font-weight: bold; margin: 10px 0; color: #333;">$2</div>')
      .replace(/(<\/table>)\s*### ([^\n]+)/g, '$1<div style="font-size: 16px; font-weight: bold; margin: 10px 0; color: #333;">$2</div>')
      .replace(/(<\/div>)\s*#### ([^\n]+)/g, '$1<div style="font-size: 14px; font-weight: bold; margin: 8px 0; color: #333;">$2</div>')
      .replace(/^\s*#### ([^\n]+)/gm, '<div style="font-size: 14px; font-weight: bold; margin: 8px 0; color: #333;">$1</div>')
      .replace(/^\s*### ([^\n]+)/gm, '<div style="font-size: 16px; font-weight: bold; margin: 10px 0; color: #333;">$1</div>')
      .replace(/^\s*## ([^\n]+)/gm, '<div style="font-size: 14px; font-weight: bold; margin: 10px 0; color: #333;">$1</div>')
      .replace(/(<\/table>)\s*---\s*/g, '$1<div style="border-top: 2px solid #fff; margin: 10px 0; height: 0;"></div>')
      .replace(/^---$/gm, '<div style="border-top: 2px solid #fff; margin: 10px 0; height: 0;"></div>')

    // 关键修改：再次解码HTML实体，解决&quot;问题
    let decodedHtmlResult = htmlResult
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')

    // 只在段落内部的换行才转换为<br>，避免在div之间添加额外的<br>
    const finalResult = decodedHtmlResult.replace(/([^>])\n([^<])/g, '$1<br>$2')
    console.log(finalResult)

    return finalResult
  } catch (error) {
    console.error('Markdown parsing error:', error)
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

const toBranch = (val: any, e?: any) => {
  // 阻止事件冒泡
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }
  // let res = { gid: e?.gid, name: e.name, logo: e.logo }
  // Taro.navigateTo({
  //   url: `/subpackages/company/enterpriseDetail/detail/dynamicInfo/index?item=${JSON.stringify(res)}`
  // })
}

const toDynamic = (val: any, e?: any) => {
  console.log(val)

  // 阻止事件冒泡
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }
  let res = { gid: val?.gid, name: val.name, logo: val.logo }
  Taro.navigateTo({
    url: `/subpackages/company/enterpriseDetail/detail/dynamicInfo/index?item=${JSON.stringify(res)}`
  })
}

const navigateToCompanyDetail = (company: any, e?: any) => {
  // 阻止事件冒泡
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }

  Taro.navigateTo({
    url: `/subpackages/company/enterpriseDetail/index?company=${JSON.stringify(company)}`
  })
}

const navigateToCompanyList = (msg: any) => {
  // 先跳转页面
  Taro.navigateTo({ url: `/subpackages/company/enterpriseSearch/index?messageId=${msg.messageId}` }).then(() => {
    // 页面跳转成功后，延迟触发事件
    setTimeout(() => {
      console.log('企业搜索数据', msg.companyList)
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
    Taro.eventCenter.on('enterpriseDetailUnloadAi', handleEnterpriseDetailUnload)

    return () => {
      Taro.eventCenter.off('enterpriseDetailUnloadAi', handleEnterpriseDetailUnload)
    }
  }, [msg])

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
      {msg.content ? <RichText className="chatMsg_ai_text" nodes={parseMarkdown(msg.content)} /> : null}
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
                  {/* <View className="company_right_tags">
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
                  </View> */}
                  <View className="company_right_tabs">
                    <View className="company_right_tab" onClick={e => toBranch(val, e)}>
                      <View style={{ marginRight: 4 }}>总部及分支机构</View>
                      <ArrowRightSmall color="#ffffff" size="24rpx" />
                    </View>
                    <View className="company_right_tab" onClick={e => toDynamic(val, e)}>
                      <View style={{ marginRight: 4 }}>近期动态</View>
                      <ArrowRightSmall color="#ffffff" size="24rpx" />
                    </View>
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
