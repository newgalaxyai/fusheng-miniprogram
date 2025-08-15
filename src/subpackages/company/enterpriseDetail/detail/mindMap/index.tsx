import { View, Canvas } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import { getEnterpriseGraphAPI } from '@/api/company'

// 修改 Node 接口以适配接口数据
interface Node {
  id: string // 对应接口的 Id
  x: number
  y: number
  width: number
  height: number
  text: string // 对应接口的 Name
  children: string[] // 子节点的 id 数组
  parent?: string
  expanded?: boolean // 展开状态
  hasChildren?: boolean // 是否有子节点，根据 Count > 0 判断
  nodeType?: string // 对应接口的 NodeType
  count?: number // 对应接口的 Count
  keyno?: string // 用于下级查询的参数
}

// 新增接口数据类型定义
interface ApiNodeData {
  Id: string
  Name: string
  NodeType: string
  Count: number
  Children?: ApiNodeData[]
  Image?: string | null
  OperType?: string
  Percent?: string | null
}

interface ApiResponse {
  Id: string
  Name: string
  NodeType: string
  Children: ApiNodeData[]
}

interface Connection {
  from: string
  to: string
}

interface Transform {
  x: number
  y: number
  scale: number
}

const MindMapPage = () => {
  // 在getEnterpriseGraph函数中添加坐标检查
  function getEnterpriseGraph(creditCode: any, keyno: string = '') {
    getEnterpriseGraphAPI({ creditCode, keyno }, res => {
      if (res.success) {
        const convertedNodes = convertApiDataToNodes(res.data)
        const layoutedNodes = calculateNodeLayout(updateNodeWidths(convertedNodes))

        // 检查节点坐标
        layoutedNodes.forEach(node => {})

        // 检查Canvas尺寸

        setNodes(layoutedNodes)

        const newConnections: Connection[] = []
        layoutedNodes.forEach(node => {
          if (node.parent) {
            newConnections.push({
              from: node.parent,
              to: node.id
            })
          }
        })
        setConnections(newConnections)
      } else {
        Taro.showToast({
          title: 'AI获取图谱失败，请稍后重试',
          icon: 'none'
        })
        console.error('接口调用失败:', res)
      }
    })
  }

  Taro.useLoad(options => {
    if (options.creditCode) {
      getEnterpriseGraph(options.creditCode)
    } else {
      Taro.showToast({
        title: '没有企业编码',
        icon: 'none'
      })
    }
  })

  const convertApiDataToNodes = (apiData: ApiResponse): Node[] => {
    const nodes: Node[] = []

    // 创建根节点（公司主体）
    const rootNode: Node = {
      id: apiData.Id,
      x: 400,
      y: 300,
      width: Math.max(160, getTextWidth(apiData.Name)),
      height: 45,
      text: apiData.Name,
      children: apiData.Children.map((child, index) => child.Id || `${child.NodeType}`),
      expanded: true,
      hasChildren: true,
      nodeType: apiData.NodeType,
      keyno: apiData.Id
    }
    nodes.push(rootNode)

    // 创建一级分支节点
    apiData.Children.forEach((childData, index) => {
      const childId = childData.Id || `${childData.NodeType}`
      const childNode: Node = {
        id: childId,
        x: 0, // 将由布局算法计算
        y: 0, // 将由布局算法计算
        width: Math.max(80, getTextWidth(childData.Name)),
        height: 40,
        text: childData.Name,
        // 修复：确保子节点的children数组ID也一致
        children: childData.Children ? childData.Children.map((subChild, subIndex) => subChild.Id || `${subChild.NodeType}_${subIndex}`) : [],
        parent: apiData.Id,
        expanded: false,
        hasChildren: true,
        nodeType: childData.NodeType,
        count: childData.Count,
        keyno: childId
      }
      nodes.push(childNode)

      // 如果有子节点数据，也创建子节点
      if (childData.Children && childData.Children.length > 0) {
        childData.Children.forEach((subChildData, subIndex) => {
          const subChildId = subChildData.Id || `${subChildData.NodeType}_${subIndex}`
          const subChildNode: Node = {
            id: subChildId,
            x: 0,
            y: 0,
            width: Math.max(60, getTextWidth(subChildData.Name)),
            height: 35,
            text: subChildData.Name,
            children: [],
            parent: childId,
            expanded: false,
            hasChildren: true,
            nodeType: subChildData.NodeType,
            count: subChildData.Count,
            keyno: subChildId
          }
          nodes.push(subChildNode)
        })
      }
    })

    return nodes
  }

  const canvasRef = useRef<any>(null)
  const [ctx, setCtx] = useState<any>(null)

  // 将这些函数定义移到useState之前
  const getTextWidth = (text: string, fontSize: number = 13) => {
    let width = 0
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (/[\u4e00-\u9fa5]/.test(char)) {
        // 中文字符
        width += fontSize
      } else {
        // 英文字符和数字
        width += fontSize * 0.6
      }
    }
    // 为圆圈和间距留出足够空间
    return width + 50
  }

  // 更新节点宽度的函数
  const updateNodeWidths = (nodeList: Node[]) => {
    return nodeList.map(node => ({
      ...node,
      width: Math.max(80, getTextWidth(node.text)) // 最小宽度80px
    }))
  }

  // 动态布局算法 - 修改为单侧布局
  const calculateNodeLayout = (nodes: Node[]) => {
    const layoutNodes = [...nodes]
    const centerNode = layoutNodes.find(n => !n.parent)
    if (!centerNode) return layoutNodes

    // 设置中心节点位置
    centerNode.x = 200
    centerNode.y = 300

    const primaryBranches = layoutNodes.filter(n => n.parent === centerNode.id)

    // 单侧布局：所有分支都显示在右侧
    const branchHeight = 100
    const totalHeight = primaryBranches.length * branchHeight
    const startY = centerNode.y - totalHeight / 2 + branchHeight / 2

    primaryBranches.forEach((branch, index) => {
      branch.x = centerNode.x + 300 // 所有分支都在右侧
      branch.y = startY + index * branchHeight

      // 处理分支的子节点
      const children = layoutNodes.filter(n => n.parent === branch.id)
      if (children.length > 0) {
        const childHeight = 60
        const childTotalHeight = children.length * childHeight
        const childStartY = branch.y - childTotalHeight / 2 + childHeight / 2

        children.forEach((child, childIndex) => {
          child.x = branch.x + 300 // 子节点也在右侧
          child.y = childStartY + childIndex * childHeight
        })
      }
    })

    return layoutNodes
  }

  // 修改nodes的初始状态为空数组，等待接口数据
  const [nodes, setNodes] = useState<Node[]>([])

  const [connections, setConnections] = useState<Connection[]>([])

  // 在初始化时调整画布中心位置
  // 调整初始transform
  const [transform, setTransform] = useState<Transform>({
    x: 0, // 不偏移
    y: 0, // 不偏移
    scale: 1 // 不缩放
  })

  const [isDragging, setIsDragging] = useState(false)
  const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 375, height: 600 })
  const [touchStartDistance, setTouchStartDistance] = useState(0)
  const [initialScale, setInitialScale] = useState(1)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // 获取系统信息设置canvas尺寸
    Taro.getSystemInfo({
      success: res => {
        setCanvasSize({
          width: res.windowWidth,
          height: res.windowHeight
        })
      }
    })
  }, [])

  useEffect(() => {
    if (canvasRef.current && canvasSize.width > 0 && canvasSize.height > 0) {
      const context = Taro.createCanvasContext('mindMapCanvas', canvasRef.current)
      setCtx(context)
    }
  }, [canvasSize])

  // 修改useEffect，减少重绘频率
  useEffect(() => {
    if (ctx && nodes.length > 0) {
      // 使用节流绘制
      const throttledDraw = throttle(() => {
        drawMindMap()
      }, 16)
      throttledDraw()
    }
  }, [ctx, nodes, transform])

  // 获取可见的节点（只显示展开的节点）
  const getVisibleNodes = () => {
    const visibleNodes: Node[] = []
    const visibleConnections: Connection[] = []

    const addNodeAndChildren = (nodeId: string) => {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) {
        return
      }

      visibleNodes.push(node)

      if (node.expanded && node.children.length > 0) {
        node.children.forEach(childId => {
          visibleConnections.push({ from: nodeId, to: childId })
          addNodeAndChildren(childId)
        })
      } else {
      }
    }

    // 查找根节点（没有parent的节点）
    const rootNode = nodes.find(n => !n.parent)

    if (rootNode) {
      addNodeAndChildren(rootNode.id)
    } else {
    }

    return { visibleNodes, visibleConnections }
  }

  // 添加绘制状态管理，避免重复绘制
  const [isDrawing, setIsDrawing] = useState(false)

  const drawMindMap = async () => {
    if (!ctx || nodes.length === 0 || isDrawing) return

    setIsDrawing(true)

    try {
      // 清空画布
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      ctx.setFillStyle('#f8f9fa')
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

      // 保存当前状态
      ctx.save()

      // 应用变换
      ctx.translate(transform.x, transform.y)
      ctx.scale(transform.scale, transform.scale)

      const { visibleNodes, visibleConnections } = getVisibleNodes()

      // 详细打印每个可见节点的信息
      visibleNodes.forEach((node, index) => {})

      if (visibleNodes.length === 0) {
        ctx.restore()
        ctx.draw(true)
        return
      }

      // 绘制连接线
      // 绘制连接线
      ctx.setStrokeStyle('#9ca3af')
      ctx.setLineWidth(2)

      visibleConnections.forEach((connection, index) => {
        const fromNode = visibleNodes.find(n => n.id === connection.from)
        const toNode = visibleNodes.find(n => n.id === connection.to)

        if (fromNode && toNode) {
          let fromX, fromY, toX, toY

          if (toNode.x < fromNode.x) {
            fromX = fromNode.x
            fromY = fromNode.y + fromNode.height / 2
            toX = toNode.x + toNode.width
            toY = toNode.y + toNode.height / 2
          } else {
            fromX = fromNode.x + fromNode.width
            fromY = fromNode.y + fromNode.height / 2
            toX = toNode.x
            toY = toNode.y + toNode.height / 2
          }

          // 计算控制点，创建平滑的曲线
          const controlPointX = (fromX + toX) / 2
          const controlPointY = fromY // 保持水平方向的曲线

          ctx.beginPath()
          ctx.moveTo(fromX, fromY)
          // 使用二次贝塞尔曲线
          ctx.quadraticCurveTo(controlPointX, controlPointY, toX, toY)
          ctx.stroke()
        }
      })

      // 绘制节点
      visibleNodes.forEach((node, index) => {
        drawNode(node)
      })

      // 恢复状态并强制绘制
      ctx.restore()
      // 使用异步绘制，避免阻塞UI
      await new Promise(resolve => {
        setTimeout(() => {
          ctx.draw(true)
          resolve(void 0)
        }, 0)
      })
    } finally {
      setIsDrawing(false)
    }
  }

  const drawNode = (node: Node) => {
    // 绘制节点背景 - 使用更圆润的样式
    ctx.setFillStyle('#ffffff')
    ctx.setStrokeStyle('#d1d5db')
    ctx.setLineWidth(1.5)

    // 绘制圆角矩形 - 增加圆角半径
    const radius = 12
    ctx.beginPath()
    ctx.moveTo(node.x + radius, node.y)
    ctx.lineTo(node.x + node.width - radius, node.y)
    ctx.quadraticCurveTo(node.x + node.width, node.y, node.x + node.width, node.y + radius)
    ctx.lineTo(node.x + node.width, node.y + node.height - radius)
    ctx.quadraticCurveTo(node.x + node.width, node.y + node.height, node.x + node.width - radius, node.y + node.height)
    ctx.lineTo(node.x + radius, node.y + node.height)
    ctx.quadraticCurveTo(node.x, node.y + node.height, node.x, node.y + node.height - radius)
    ctx.lineTo(node.x, node.y + radius)
    ctx.quadraticCurveTo(node.x, node.y, node.x + radius, node.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 绘制文字 - 调整字体样式
    ctx.setFillStyle('#374151')
    ctx.setFontSize(13)
    ctx.setTextAlign('center')
    ctx.fillText(node.text, node.x + node.width / 2, node.y + node.height / 2 + 4)

    // 绘制展开/折叠按钮
    if (node.hasChildren) {
      const buttonSize = 12
      const margin = 4

      // 找到中心主题节点
      const centerNode = nodes.find(n => !n.parent)
      let buttonX: number, buttonY: number

      if (centerNode) {
        // 判断当前节点相对于中心主题的位置
        const isLeftOfCenter = node.x < centerNode.x

        if (isLeftOfCenter) {
          // 节点在中心主题左边，圆圈显示在左边
          buttonX = node.x + margin
        } else {
          // 节点在中心主题右边，圆圈显示在右边
          buttonX = node.x + node.width - buttonSize - margin
        }
      } else {
        // 默认显示在右边
        buttonX = node.x + node.width - buttonSize - margin
      }

      // 让圆圈垂直居中
      buttonY = node.y + (node.height - buttonSize) / 2

      // 绘制按钮背景 - 使用更柔和的颜色
      ctx.setFillStyle(node.expanded ? '#3b82f6' : '#6b7280')
      ctx.beginPath()
      ctx.arc(buttonX + buttonSize / 2, buttonY + buttonSize / 2, buttonSize / 2, 0, 2 * Math.PI)
      ctx.fill()

      // 绘制按钮图标
      ctx.setStrokeStyle('#ffffff')
      ctx.setLineWidth(1.5)
      ctx.beginPath()
      if (node.expanded) {
        // 减号 - 根据按钮大小动态计算边距
        const iconPadding = buttonSize * 0.25 // 按钮大小的25%作为边距
        ctx.moveTo(buttonX + iconPadding, buttonY + buttonSize / 2)
        ctx.lineTo(buttonX + buttonSize - iconPadding, buttonY + buttonSize / 2)
      } else {
        // 加号 - 根据按钮大小动态计算边距
        const iconPadding = buttonSize * 0.25 // 按钮大小的25%作为边距
        ctx.moveTo(buttonX + iconPadding, buttonY + buttonSize / 2)
        ctx.lineTo(buttonX + buttonSize - iconPadding, buttonY + buttonSize / 2)
        ctx.moveTo(buttonX + buttonSize / 2, buttonY + iconPadding)
        ctx.lineTo(buttonX + buttonSize / 2, buttonY + buttonSize - iconPadding)
      }
      ctx.stroke()
    }
  }

  // 检查点击是否在节点上
  const getClickedNode = (x: number, y: number) => {
    const { visibleNodes } = getVisibleNodes()

    // 转换坐标（考虑变换）
    const transformedX = (x - transform.x) / transform.scale
    const transformedY = (y - transform.y) / transform.scale

    return visibleNodes.find(node => {
      return transformedX >= node.x && transformedX <= node.x + node.width && transformedY >= node.y && transformedY <= node.y + node.height
    })
  }

  const handleTouchStart = (e: any) => {
    const touches = e.touches

    if (touches.length === 1) {
      const touch = touches[0]
      // Remove getBoundingClientRect and use touch coordinates directly
      const x = touch.x || touch.clientX
      const y = touch.y || touch.clientY

      setTouchStartTime(Date.now())
      setTouchStartPos({ x, y })
      setIsDragging(true)
      setLastTouchPos({
        x: touch.clientX || touch.x,
        y: touch.clientY || touch.y
      })
    } else if (touches.length === 2) {
      // 双指缩放
      const distance = getDistance(touches[0], touches[1])
      setTouchStartDistance(distance)
      setInitialScale(transform.scale)
      setIsDragging(false)
    }
  }

  // 添加节流函数
  const throttle = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null
    let lastExecTime = 0
    return function (this: any, ...args: any[]) {
      const currentTime = Date.now()

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args)
        lastExecTime = currentTime
      } else {
        if (timeoutId) clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }

  // 节流的变换更新函数
  const throttledUpdateTransform = throttle((deltaX: number, deltaY: number) => {
    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
  }, 16) // 约60fps

  // 优化拖拽处理
  const handleTouchMove = (e: any) => {
    const touches = e.touches

    if (touches.length === 1 && isDragging) {
      // 单指拖拽背景
      const touch = touches[0]
      const currentX = touch.clientX || touch.x
      const currentY = touch.clientY || touch.y
      const deltaX = currentX - lastTouchPos.x
      const deltaY = currentY - lastTouchPos.y

      // 使用节流更新变换
      throttledUpdateTransform(deltaX, deltaY)

      setLastTouchPos({
        x: currentX,
        y: currentY
      })
    } else if (touches.length === 2) {
      // 双指缩放
      const distance = getDistance(touches[0], touches[1])
      const scaleChange = distance / touchStartDistance
      const newScale = Math.max(0.5, Math.min(3, initialScale * scaleChange))

      setTransform(prev => ({
        ...prev,
        scale: newScale
      }))
    }
  }

  // Also update the getDistance function to handle both coordinate systems
  const getDistance = (touch1: any, touch2: any) => {
    const x1 = touch1.clientX || touch1.x
    const y1 = touch1.clientY || touch1.y
    const x2 = touch2.clientX || touch2.x
    const y2 = touch2.clientY || touch2.y
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchEnd = (e: any) => {
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchStartTime

    // 如果是短时间的点击（不是拖拽）
    if (touchDuration < 200 && isDragging) {
      const clickedNode = getClickedNode(touchStartPos.x, touchStartPos.y)

      if (clickedNode) {
        // 直接点击节点就触发展开/收缩（如果有子节点的话）
        toggleNodeExpansion(clickedNode.id)
      }
    }

    setIsDragging(false)
    setTouchStartDistance(0)
  }

  // 切换节点展开状态 - 手风琴效果（同级只允许一个展开）
  const toggleNodeExpansion = (nodeId: string) => {
    setNodes(prevNodes => {
      const targetNode = prevNodes.find(n => n.id === nodeId)
      if (!targetNode) return prevNodes
      const newExpanded = !targetNode.expanded

      // 如果是展开操作且节点有子节点但当前没有加载
      if (newExpanded && targetNode.hasChildren) {
        // 调用接口获取子节点数据
        if ((targetNode.keyno, (targetNode.children?.length ?? 0) === 0)) {
          getEnterpriseGraphAPI({ keyno: targetNode.keyno }, res => {
            if (res.success && res.data.Children) {
              // 处理新获取的子节点数据
              const newChildNodes: Node[] = []
              const newConnections: Connection[] = [...connections]

              // 检查位置冲突的函数（包含新创建的节点）
              const isPositionOccupied = (x: number, y: number, excludeIds: string[] = [], newNodes: Node[] = []) => {
                // 检查现有节点
                const existingConflict = nodes.some(node => !excludeIds.includes(node.id) && Math.abs(node.x - x) < 120 && Math.abs(node.y - y) < 60)

                // 检查新创建的节点
                const newNodesConflict = newNodes.some(node => !excludeIds.includes(node.id) && Math.abs(node.x - x) < 120 && Math.abs(node.y - y) < 60)

                return existingConflict || newNodesConflict
              }

              // 寻找可用位置的函数（只向右侧扩展）
              const findAvailablePosition = (baseX: number, baseY: number, newNodes: Node[] = []) => {
                let x = baseX
                let y = baseY
                let attempts = 0

                while (isPositionOccupied(x, y, [], newNodes) && attempts < 20) {
                  x += 80 // 减少水平偏移，从140改为80
                  y += 15 // 减少垂直偏移，从20改为15
                  attempts++
                }

                return { x, y }
              }

              res.data.Children.forEach((childData: ApiNodeData, index: number) => {
                // 修复ID重复问题：使用父节点ID + 索引确保唯一性
                const childId = childData.Id || `${nodeId}_child_${index}_${childData.NodeType}`
                const childWidth = Math.max(80, getTextWidth(childData.Name))

                // 简化逻辑：所有子节点都显示在父节点右侧
                const childX = targetNode.x + (targetNode.width || 100) + 80

                // 直接计算Y位置，不需要避让
                const nodeSpacing = 50
                const childY = targetNode.y + index * nodeSpacing

                const childNode: Node = {
                  id: childId,
                  x: childX,
                  y: childY,
                  width: childWidth,
                  height: 35,
                  text: childData.Name,
                  children: [],
                  parent: nodeId,
                  expanded: false,
                  hasChildren: childData.Count > 0,
                  nodeType: childData.NodeType,
                  count: childData.Count,
                  keyno: childId
                }
                newChildNodes.push(childNode)
                newConnections.push({ from: nodeId, to: childId })
              })
              // 更新节点和连接
              setNodes(prev => {
                // 先处理同级节点的手风琴效果，再展开当前节点
                const updated = prev.map(node => {
                  if (node.id === nodeId) {
                    return { ...node, expanded: true, children: newChildNodes.map(n => n.id) }
                  } else if (node.parent === targetNode.parent && node.id !== nodeId) {
                    // 只收起同级的其他节点
                    return { ...node, expanded: false }
                  }
                  return node
                })
                return [...updated, ...newChildNodes]
              })
              setConnections(newConnections)
            }
          })
        }

        // 展开当前节点，收起同级其他节点
        return prevNodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, expanded: true }
          } else if (node.parent === targetNode.parent && node.id !== nodeId) {
            // 只收起同级的其他节点
            return { ...node, expanded: false }
          }
          return node
        })
      }

      // 如果是收起操作，直接收起当前节点
      return prevNodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: newExpanded }
        } else if (newExpanded && node.parent === targetNode.parent && node.id !== nodeId) {
          // 如果是展开操作，收起同级其他节点
          return { ...node, expanded: false }
        }
        return node
      })
    })
  }

  const resetView = () => {
    setTransform({
      x: 0,
      y: 0,
      scale: 1
    })
  }

  const zoomIn = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2)
    }))
  }

  const zoomOut = () => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, prev.scale / 1.2)
    }))
  }

  return (
    <View className="page-container">
      <View className="page-content">
        <Canvas
          ref={canvasRef}
          canvasId="mindMapCanvas"
          className="mind-map-canvas"
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </View>
    </View>
  )
}

export default MindMapPage
