import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import './TreeNode.scss'

// 定义节点数据结构
export interface TreeNodeData {
  id: string
  text: string
  children?: TreeNodeData[]
  color?: string
}

// 定义组件属性
export interface TreeNodeProps {
  node: TreeNodeData
  level: number
  onAddNode: (parentId: string) => void
  onEditNode: (id: string, newText: string) => void
  onDeleteNode: (id: string) => void
}

const TreeNode = ({ node, level, onAddNode, onEditNode, onDeleteNode }: TreeNodeProps) => {
  // 控制当前节点的展开/折叠状态
  const [expanded, setExpanded] = useState(true)

  // 切换展开/折叠状态
  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  // 处理添加子节点
  const handleAddNode = e => {
    e.stopPropagation()
    onAddNode(node.id)
  }

  // 处理编辑节点
  const handleEditNode = e => {
    e.stopPropagation()
    const newText = prompt('请输入节点内容', node.text)
    if (newText && newText !== node.text) {
      onEditNode(node.id, newText)
    }
  }

  // 处理删除节点
  const handleDeleteNode = e => {
    e.stopPropagation()
    if (confirm('确定要删除这个节点吗？')) {
      onDeleteNode(node.id)
    }
  }

  // 根据层级获取节点样式
  const getNodeStyle = () => {
    const baseStyles = {
      backgroundColor: node.color || getLevelColor(level),
      paddingLeft: `${16 + (level - 1) * 24}px`
    }
    return baseStyles
  }

  // 根据层级获取默认颜色
  const getLevelColor = (level: number) => {
    const colors = [
      '#4285f4', // 一级节点 - 蓝色
      '#ea4335', // 二级节点 - 红色
      '#fbbc05', // 三级节点 - 黄色
      '#34a853', // 四级节点 - 绿色
      '#9c27b0' // 五级节点 - 紫色
    ]
    return colors[(level - 1) % colors.length]
  }

  return (
    <View className="tree-node-container">
      {/* 节点内容 */}
      <View className="tree-node touchable" style={getNodeStyle()} onClick={toggleExpand}>
        {/* 展开/折叠指示器（有子节点时显示） */}
        {node.children && node.children.length > 0 && <View className="expand-indicator">{expanded ? '▼' : '►'}</View>}

        {/* 节点文本 */}
        <Text className="node-text">{node.text}</Text>

        {/* 操作按钮组 */}
        <View className="node-actions">
          <View className="action-btn add-btn" onClick={handleAddNode}>
            <Text>+</Text>
          </View>
          <View className="action-btn edit-btn" onClick={handleEditNode}>
            <Text>✎</Text>
          </View>
          <View className="action-btn delete-btn" onClick={handleDeleteNode}>
            <Text>×</Text>
          </View>
        </View>
      </View>

      {/* 递归渲染子节点（仅当展开时） */}
      {expanded && node.children && node.children.length > 0 && (
        <View className="node-children">
          {node.children.map(childNode => (
            <TreeNode key={childNode.id} node={childNode} level={level + 1} onAddNode={onAddNode} onEditNode={onEditNode} onDeleteNode={onDeleteNode} />
          ))}
        </View>
      )}
    </View>
  )
}

export default TreeNode
