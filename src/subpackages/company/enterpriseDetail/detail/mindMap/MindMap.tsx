import React, { useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import TreeNode, { TreeNodeData } from './TreeNode' // 确保路径正确
import './MindMap.scss'

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// 递归查找并更新节点
const updateNode = (nodes: TreeNodeData[], id: string, updateFn: (node: TreeNodeData) => void): TreeNodeData[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return Object.assign({}, node, updateFn(node))
    }

    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNode(node.children, id, updateFn)
      }
    }

    return node
  })
}

// 递归查找并添加子节点
const addChildNode = (nodes: TreeNodeData[], parentId: string, newNode: TreeNodeData): TreeNodeData[] => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newNode]
      }
    }

    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: addChildNode(node.children, parentId, newNode)
      }
    }

    return node
  })
}

// 递归查找并删除节点
const deleteNode = (nodes: TreeNodeData[], id: string): TreeNodeData[] => {
  return nodes.filter(node => {
    if (node.id === id) {
      return false
    }

    if (node.children && node.children.length > 0) {
      node.children = deleteNode(node.children, id)
    }

    return true
  })
}

const MindMap = () => {
  // 初始数据
  const [rootNodes, setRootNodes] = useState<TreeNodeData[]>([
    {
      id: generateId(),
      text: '中心主题',
      children: [
        {
          id: generateId(),
          text: '分支主题 1',
          children: [
            { id: generateId(), text: '子主题 1-1' },
            { id: generateId(), text: '子主题 1-2' }
          ]
        },
        {
          id: generateId(),
          text: '分支主题 2',
          children: [{ id: generateId(), text: '子主题 2-1' }]
        }
      ]
    }
  ])

  // 添加节点
  const handleAddNode = (parentId: string) => {
    const newNode: TreeNodeData = {
      id: generateId(),
      text: '新节点'
    }

    setRootNodes(prevNodes => addChildNode(prevNodes, parentId, newNode))
  }

  // 编辑节点
  const handleEditNode = (id: string, newText: string) => {
    setRootNodes(prevNodes => updateNode(prevNodes, id, node => ({ text: newText })))
  }

  // 删除节点
  const handleDeleteNode = (id: string) => {
    setRootNodes(prevNodes => deleteNode(prevNodes, id))
  }

  return (
    <View className="mind-map-container">
      <View className="mind-map-scroll">
        <View className="mind-map-content">
          {rootNodes.map(rootNode => (
            <TreeNode key={rootNode.id} node={rootNode} level={1} onAddNode={handleAddNode} onEditNode={handleEditNode} onDeleteNode={handleDeleteNode} />
          ))}
        </View>
      </View>
    </View>
  )
}

export default MindMap
