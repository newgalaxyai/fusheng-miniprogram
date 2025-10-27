import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Input, Empty, Button } from '@nutui/nutui-react-taro'
import './index.scss'
import { Search } from '@nutui/icons-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import { clueFollowUpPageAPI } from '@/api/clue'
import { useSelector } from 'react-redux'

const FollowListPage = () => {
  const userInfo = useSelector((state: any) => state.login.userInfo)
  const [followUpList, setFollowUpList] = useState<any[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // 解析安全HTML
  const parseSafeHTML = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
  }

  // 解析日期
  const parseDate = (dateString: string) => {
    if (!dateString) return '跟进时间'
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // 获取跟进列表
  const getFollowUpList = (pageNum = 1, append = false) => {
    if (loading || (!hasMore && pageNum > 1)) return

    setLoading(true)
    const params = {
      pageNum: pageNum,
      pageSize: 10,
      userId: userInfo?.id,
      leadId: selectedItem?.id || '',
      keywords: searchValue
    }

    clueFollowUpPageAPI(params, res => {
      if (res.success && res.data) {
        const newData = res.data.list || []
        if (append) {
          setFollowUpList(prev => [...prev, ...newData])
        } else {
          setFollowUpList(newData)
        }
        setHasMore(newData.length === 10)
        setPage(pageNum)
      } else {
        Taro.showToast({
          title: '获取失败',
          icon: 'none'
        })
      }
      setLoading(false)
    })
  }

  // 加载更多
  const loadMore = () => {
    if (hasMore && !loading) {
      getFollowUpList(page + 1, true)
    }
  }

  // 搜索处理
  const handleSearch = () => {
    setPage(1)
    setHasMore(true)
    getFollowUpList(1, false)
  }

  // 跳转到跟进详情页面
  const toFollowPage = (item: any) => {
    Taro.navigateTo({
      url: `/subpackages/cluePage/follow/index?id=${item.id}`
    })
  }

  // 跳转到添加跟进页面
  const addFollow = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    Taro.navigateTo({
      url: `/subpackages/cluePage/addFollow/index?leadId=${selectedItem?.id}&associateLead=${encodeURIComponent(selectedItem?.name || '')}&name=1`
    })
  }

  useLoad(() => {
    // 获取页面参数
    const instance = Taro.getCurrentInstance()
    const params = instance.router?.params

    if (params) {
      const { leadId, leadName } = params
      if (leadId) {
        setSelectedItem({
          id: leadId,
          name: leadName ? decodeURIComponent(leadName) : ''
        })
      }
    }
  })

  useEffect(() => {
    if (selectedItem?.id) {
      getFollowUpList(1, false)
    }
  }, [selectedItem])

  return (
    <View className="followList_page">
      {/* 搜索框和写跟进按钮 */}
      <View className="followList_input_box">
        <View className="followList_input_icon">
          <Search color="#AAAAAA" size="36rpx" />
        </View>
        <Input className="followList_input" placeholder="搜索跟进内容" style={{ width: '100%' }} value={searchValue} onChange={e => setSearchValue(e)} onBlur={handleSearch} clearable={true} />
        <Button className="followList_search_btn" onClick={addFollow}>
          写跟进
        </Button>
      </View>

      {/* 跟进记录列表 */}
      <ScrollView scrollY className="followList_content" onScrollToLower={loadMore} lowerThreshold={50} style={{ height: 'calc(100vh - 160rpx)' }}>
        {followUpList.map((item: any, index: number) => (
          <View className="clueRecord_item" onClick={() => toFollowPage(item)} key={index}>
            <View className="clueRecord_item_left">{item?.avatar ? <Image src={item.avatar} className="avatar" /> : <Image src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise11.png" className="avatar" />}</View>
            <View className="clueRecord_item_right">
              <View className="clueRecord_item_right_top">
                <View className="item_time">
                  <Image src="https://find-console.newgalaxyai.com/glks/assets/chat/chat1.png" className="item_time_img"></Image>
                  {parseDate(item.createTime || '跟进时间')}
                </View>
                <View className="status text-ellipsis">{item.nickname || '跟进人'}</View>
              </View>
              <View className="item_link">
                跟进方式：{item.method || '跟进方式'}｜{item.followUpName || '客户名称'}({item.followUpPosition || '客户职位'})｜{item.followUpPhone || '客户手机号'}
              </View>
              <View className="item_content">{item.content || '跟进内容'}</View>
            </View>
          </View>
        ))}

        {(!followUpList || followUpList.length === 0) && !loading && (
          <View className="empty_container">
            <Image className="empty_image" src="https://find-console.newgalaxyai.com/glks/assets/emptyImg.png" />
            <Text className="empty_text">暂无跟进记录</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default FollowListPage
