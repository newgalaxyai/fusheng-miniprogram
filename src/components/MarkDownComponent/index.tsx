import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import Markdown from 'taro-markdown'
import './index.scss'
import { memo } from 'react'

interface IProps {
  content: string
}

function MarkdownComponent(props: IProps) {
  return (
    <View className="markdown-container">
      <Markdown content={props.content} />
    </View>
  )
}

export default memo(MarkdownComponent, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content
})
