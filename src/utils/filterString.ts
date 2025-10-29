export const filterHTMLString = (html: string) => {
  if (!html) return ''
//   const cleanHTML = html
//     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除script标签
//     .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // 移除iframe标签
//     .replace(/<em\b[^<]*(?:(?!<\/em>)<[^<]*)*<\/em>/gi, '') // 移除iframe标签
//     .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // 移除事件处理器
//     .replace(/<[^>]*>/g, '') // 移除所有HTML标签
//     .replace(/&nbsp;/g, ' ') // 替换HTML实体
//     .replace(/&lt;/g, '<')
//     .replace(/&gt;/g, '>')
//     .replace(/&amp;/g, '&')
//     .replace(/&quot;/g, '"')
//     .replace(/&#039;/g, "'")
//     .trim() // 去除首尾空白

  return html.replace(/<\/?em>/g, '')
}
