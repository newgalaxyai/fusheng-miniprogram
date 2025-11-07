import React from 'react'
import { View, Image, Text, RichText } from '@tarojs/components'
import { ArrowRight, ArrowRightSmall } from '@nutui/icons-react-taro'
import { marked } from 'marked'
import Taro from '@tarojs/taro'
import { ROUTE, ROUTE_PARAMS_NAME } from '@/constants'
import MarkdownComponent from '../MarkDownComponent'

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
      .replace(
        /<div style="background-color:#f0f8ff; padding:10px; border-radius:5px;">[\s\S]*?<\/div>/g,
        '<div style="background-color:#ffffff; padding:none; border-radius:50px;">$1</div>'
      )
      // 使用“块级表格解析”：匹配“表头 | 分隔线 | 多行数据”
      .replace(
        /(?:^|\n)\s*\|(.+?)\|\s*\n\s*\|([-\s:|]+)\|\s*\n((?:\s*\|.*\|\s*\n?)*)/g,
        (match, headerLine, separatorLine, bodyLines) => {
          const normalize = (line: string) => line.replace(/^\s*\|\s*|\s*\|\s*$/g, '')
          const headers = normalize(headerLine)
            .split('|')
            .map(c => c.trim())
            .filter(Boolean)

          // 可根据分隔线的 :--- :---: ---: 判定对齐方式，这里简单左对齐
          const thStyle =
            'padding:12px 16px;border:1px solid #ddd;background:#f7f7f7;font-weight:600;text-align:left;vertical-align:top;font-size:12px;line-height:1.4;'
          const tdStyle =
            'padding:12px 16px;border:1px solid #ddd;text-align:left;vertical-align:top;font-size:12px;line-height:1.4;'

          const thead = `<thead><tr>${headers
            .map(h => `<th style="${thStyle}">${h}</th>`)
            .join('')}</tr></thead>`

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
        }
      )
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
      .replace(
        /^- (.+)$/gm,
        '<div style="display: flex; margin: 6px 0; align-items: flex-start;"><span style="margin-right: 8px; color: #666;">•</span><span>$1</span></div>'
      )
      // 处理嵌套的列表项（在HTML内容中的）
      .replace(
        /\n\s*- (.+)/g,
        '<div style="display: flex; margin: 6px 0; align-items: flex-start; margin-left: 20px;"><span style="margin-right: 8px; color: #666;">•</span><span>$1</span></div>'
      )
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(
        /(<\/table>)\s*## ([^\n]+)/g,
        '$1<div style="font-size: 14px; font-weight: bold; margin: 10px 0; color: #333;">$2</div>'
      )
      .replace(
        /(<\/table>)\s*### ([^\n]+)/g,
        '$1<div style="font-size: 16px; font-weight: bold; margin: 10px 0; color: #333;">$2</div>'
      )
      .replace(
        /(<\/div>)\s*#### ([^\n]+)/g,
        '$1<div style="font-size: 14px; font-weight: bold; margin: 8px 0; color: #333;">$2</div>'
      )
      .replace(
        /^\s*#### ([^\n]+)/gm,
        '<div style="font-size: 14px; font-weight: bold; margin: 8px 0; color: #333;">$1</div>'
      )
      .replace(
        /^\s*### ([^\n]+)/gm,
        '<div style="font-size: 16px; font-weight: bold; margin: 10px 0; color: #333;">$1</div>'
      )
      .replace(
        /^\s*## ([^\n]+)/gm,
        '<div style="font-size: 14px; font-weight: bold; margin: 10px 0; color: #333;">$1</div>'
      )
      .replace(
        /(<\/table>)\s*---\s*/g,
        '$1<div style="border-top: 2px solid #fff; margin: 10px 0; height: 0;"></div>'
      )
      .replace(
        /^---$/gm,
        '<div style="border-top: 2px solid #fff; margin: 10px 0; height: 0;"></div>'
      )

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
  msg: any
}

const toBranch = (val: any, e?: any) => {
  // 阻止事件冒泡
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }
  Taro.navigateTo({
    url: `/subpackages/company/enterpriseDetail/detail/branch/index?item=${JSON.stringify(val)}`
  })
}

const toDynamic = (val: any, e?: any) => {
  // 阻止事件冒泡
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }
  let res = { gid: val?.gid, name: val.name, logo: val.logo }
  Taro.navigateTo({
    url: `/subpackages/company/enterpriseDetail/detail/dynamicInfo/index?item=${JSON.stringify(
      res
    )}`
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
  // 跳转“企业搜索”页面，兼容 id 或旧的 messageId
  const mid = msg?.id || msg?.messageId
  Taro.navigateTo({
    url: `${ROUTE.ENTERPRISE_SEARCH_RESULT}?${ROUTE_PARAMS_NAME.MESSAGE_ID}=${mid}&${ROUTE_PARAMS_NAME.MESSAGE_KEYWORD}=${msg.keyword}`
  })
}

// 旧的“查看所有企业”入口依赖旧数据结构与跨页事件，已移除

const AiMessageComponent: React.FC<AiMessageComponentProps> = ({ msg }) => {
  const renderCorpList = () => {
    if (msg.tableType !== 'corp') return null
    const list = Array.isArray(msg.tableData) ? msg.tableData : []
    if (list.length === 0) return null

    return (
      <View>
        {list.slice(0, 10).map((val: any, idx: number) => {
          const logo = val.logo || ''
          const name = val.name || '- -'
          const creditCode = val.credit_code || val.creditCode || ''

          const clickCompany = () =>
            navigateToCompanyDetail({ creditCode, name, messageId: msg.id || msg.messageId })

          return (
            <View key={idx}>
              <View className="chat_ai_company" onClick={clickCompany}>
                <View className="company_left">
                  {logo && String(logo).includes('http') ? (
                    <Image src={logo} className="company_left_img" />
                  ) : logo ? (
                    <Text
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#1B5BFF',
                        color: '#fff',
                        borderRadius: '8rpx',
                        fontSize: '32rpx',
                        textAlign: 'center',
                        padding: '8rpx',
                        boxSizing: 'border-box'
                      }}
                      className="company_left_img"
                    >
                      {logo}
                    </Text>
                  ) : (
                    <Text
                      className="company_left_img"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#1B5BFF',
                        color: '#fff',
                        borderRadius: '8rpx',
                        fontSize: '32rpx'
                      }}
                    >
                      暂无
                    </Text>
                  )}
                </View>
                <View className="company_right">
                  <View className="company_right_top">
                    <Text className="company_right_top_text">{name}</Text>
                    <ArrowRightSmall color="#2B2B2B" size="24rpx" />
                  </View>
                  <View className="company_right_tabs">
                    <View
                      className="company_right_tab"
                      onClick={e => toBranch({ creditCode, name }, e)}
                    >
                      <View style={{ marginRight: 4 }}>总部及分支机构</View>
                      <ArrowRightSmall color="#ffffff" size="24rpx" />
                    </View>
                    <View
                      className="company_right_tab"
                      onClick={e => toDynamic({ gid: '', logo, name }, e)}
                    >
                      <View style={{ marginRight: 4 }}>近期动态</View>
                      <ArrowRightSmall color="#ffffff" size="24rpx" />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )
        })}

        {/* 查看全部企业按钮 */}
        <View
          className="company_view_all"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12rpx 16rpx',
            background: '#f7faff',
            borderRadius: '12rpx',
            marginTop: '8rpx'
          }}
          onClick={() => navigateToCompanyList(msg)}
        >
          <Text style={{ color: '#2B2B2B', fontSize: '32rpx', fontWeight: '600' }}>查看全部</Text>
          <ArrowRightSmall color="#2B2B2B" size="32rpx" />
        </View>
      </View>
    )
  }

  const renderPhoneList = () => {
    if (msg.tableType !== 'phone') return null
    const list = Array.isArray(msg.tableData) ? msg.tableData : []
    if (list.length === 0) return null

    return (
      <View className="contact_list">
        {list.map((item: any, idx: number) => (
          <View
            className="contact_item"
            key={`${item.phone || idx}-${idx}`}
            onClick={() => item.phone && Taro.makePhoneCall({ phoneNumber: String(item.phone) })}
          >
            <View className="contact_main">
              <View className="contact_phone">{item.phone || '未知号码'}</View>
              {item.recommend ? <View className="contact_recommend">推荐</View> : null}
            </View>
            <View className="contact_sub">
              <View className="contact_name">{item.name || '- -'}</View>
              <View className="contact_position">{item.position || ''}</View>
            </View>
          </View>
        ))}
      </View>
    )
  }

  return (
    <View>
      {msg.reasoningProcess ? (
        <MarkdownComponent content={msg.reasoningProcess} />
      ) : null}
      {msg.aiResponse ? (
        <MarkdownComponent content={msg.aiResponse} />
      ) : null}
      {renderCorpList()}
      {renderPhoneList()}
      {msg.aiConclusion ? (
        <View
          style={{ marginTop: '16rpx' }}
          className="chatMsg_ai_text"
        >
          <MarkdownComponent content={msg.aiConclusion} />
        </View>
      ) : null}
      {!Boolean(msg?.id) ? <ChatTechLoadingAnimation /> : null}
    </View>
  )
}

export default AiMessageComponent
