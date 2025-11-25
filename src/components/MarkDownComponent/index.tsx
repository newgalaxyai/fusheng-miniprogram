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
    // 使用默认 marked 生成 HTML
    let html = marked.parse(processedText) as string

    // 二次解码，避免 &quot; 等残留导致截断
    html = html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')

    // 为常见标签注入内联样式，控制字号与间距
    html = html
      // 标题 h1-h6
      .replace(/<h1([^>]*)>/g, '<h1$1 style="font-size:1.5em;font-weight:700;margin:20px 0;">')
      .replace(/<h2([^>]*)>/g, '<h2$1 style="font-size:1.25em;font-weight:700;margin:18px 0;">')
      .replace(/<h3([^>]*)>/g, '<h3$1 style="font-size:1.125em;font-weight:600;margin:16px 0;">')
      .replace(/<h4([^>]*)>/g, '<h4$1 style="font-size:1em;font-weight:600;margin:14px 0;">')
      .replace(/<h5([^>]*)>/g, '<h5$1 style="font-size:0.875em;font-weight:600;margin:12px 0;">')
      .replace(/<h6([^>]*)>/g, '<h6$1 style="font-size:0.75em;font-weight:600;margin:10px 0;">')
      // 段落
      .replace(/<p([^>]*)>/g, '<p$1 style="font-size:1em;line-height:1.7;margin:12px 0;">')
      // 列表容器
      .replace(/<ul([^>]*)>/g, '<ul$1 style="margin:12px 0 12px 24px;padding:0;">')
      .replace(/<ol([^>]*)>/g, '<ol$1 style="margin:12px 0 12px 24px;padding:0;">')
      // 列表项
      .replace(/<li([^>]*)>/g, '<li$1 style="font-size:1em;margin:8px 0;">')
      // 引用
      .replace(/<blockquote([^>]*)>/g, '<blockquote$1 style="font-size:1em;color:#666;border-left:6px solid #ddd;padding-left:16px;margin:12px 0;">')
      // 行内代码与代码块
      .replace(/<code([^>]*)>/g, '<code$1 style="font-size:24px;background:#f6f8fa;padding:4px 8px;border-radius:6px;">')
      .replace(/<pre([^>]*)>/g, '<pre$1 style="font-size:24px;line-height:1.6;background:#f6f8fa;padding:16px;border-radius:8px;overflow:auto;">')
      // 链接与强调
      .replace(/<a([^>]*)>/g, '<a$1 style="font-size:1em;color:#1677ff;">')
      .replace(/<strong([^>]*)>/g, '<strong$1 style="font-size:1em;font-weight:700;">')
      .replace(/<em([^>]*)>/g, '<em$1 style="font-size:1em;font-style:italic;">')

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
