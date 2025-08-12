import { View, Text } from '@tarojs/components'
import MindMap from './MindMap'
import './index.scss'

const MindMapPage = () => {
  return (
    <View className="page-container">
      <View className="page-header">
        <Text className="page-title">思维导图工具</Text>
      </View>
      <View className="page-content">
        <MindMap />
      </View>
    </View>
  )
}

export default MindMapPage
