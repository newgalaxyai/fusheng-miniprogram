import Taro from '@tarojs/taro'
import { View, RichText } from '@tarojs/components'
import './index.scss'
import { memo } from 'react'
import { marked } from 'marked'

// 适配小程序 RichText 的 Markdown 转 HTML
marked.setOptions({
  breaks: true,
  gfm: false
})

interface IProps {
  content: string
}

const toSafeHtml = (text: string): string => {
  if (!text) return ''
  try {
    let decodedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')

    // 将孤立的换行增强为段落换行
    let processedText = decodedText.replace(/([^\n])\n([^\n])/g, '$1\n\n$2')

    // 使用 marked 生成基础 HTML（仅限小程序 RichText 支持的轻量标签）
    let html = marked.parse(processedText) as string

    // 二次解码，避免 &quot; 等残留导致截断
    html = html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')

    // 将段落中的换行转换为 <br>，避免在块之间插入额外 <br>
    const finalHtml = html.replace(/([^>])\n([^<])/g, '$1<br>$2')
    return finalHtml
  } catch (e) {
    // 解析失败时退化为简单的文本 + <br>
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\n/g, '<br>')
  }
}

function MarkdownComponent(props: IProps) {
  const html = toSafeHtml(props.content)
  return (
    <View className="markdown-container">
      <RichText nodes={html} />
    </View>
  )
}

export default memo(MarkdownComponent, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content
})
