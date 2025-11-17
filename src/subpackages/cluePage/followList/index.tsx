import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import {
  Input,
  Empty,
  Button,
  Steps,
  Step,
  InfiniteLoading,
  SearchBar,
  Divider
} from '@nutui/nutui-react-taro'
import './index.scss'
import { Search } from '@nutui/icons-react-taro'
import Taro, { useLoad, eventCenter } from '@tarojs/taro'
import { clueFollowUpPageAPI, getFollowUpListAsyncAPI } from '@/api/clue'
import { useSelector } from 'react-redux'
import { ICorpContactInfo, IFollowUp, IGetFollowUpListRequest } from '@/api/types'
import { useAppSelector } from '@/hooks/useAppStore'
import { ROUTE, ROUTE_PARAMS_NAME } from '@/constants'
import dayjs from 'dayjs'
import { CLUE_EVENT } from '@/constants/event'

const FollowListPage = () => {
  const {
    login: { userInfo }
  } = useAppSelector(state => state)
  useLoad(loadOptions => {
    const leadId = loadOptions[ROUTE_PARAMS_NAME.CLUE_ID]
    setFilterFollowUpListForm({
      ...filterFollowUpListForm,
      leadId: Number(leadId)
    })
  })
  // ==================== 搜索框 ====================
  const [searchInputValue, setSearchInputValue] = useState('')
  // ==================== 写跟进按钮 ====================
  // 跳转到添加跟进页面
  const addFollow = () => {
    Taro.navigateTo({
      url: `${ROUTE.ADD_FOLLOW}?${ROUTE_PARAMS_NAME.CLUE_ID}=${filterFollowUpListForm.leadId}`
    })
  }
  // ==================== 筛选表单 ====================
  // 初始化表单数据
  const initialFilterFollowUpListForm: IGetFollowUpListRequest = {
    pageNo: 1,
    pageSize: 10,
    leadId: 0
  }
  const [filterFollowUpListForm, setFilterFollowUpListForm] = useState<IGetFollowUpListRequest>(
    initialFilterFollowUpListForm
  )
  // ==================== 跟进列表 ====================
  const [followUpList, setFollowUpList] = useState<IFollowUp[]>([])
  // 获取跟进列表
  const getFollowUpList = useCallback(async () => {
    if (filterFollowUpListForm.leadId === 0) {
      return
    }
    Taro.showLoading({
      title: '加载中...'
    })
    setFollowUpCursor(1)
    const followUpRes = await getFollowUpListAsyncAPI(filterFollowUpListForm)
    if (followUpRes.code == 0) {
      const newData = followUpRes.data.list || []
      setFollowUpList(newData)
      setHasMore(newData.length === 10)
    } else {
      Taro.showToast({
        title: '获取失败',
        icon: 'none'
      })
    }
    Taro.hideLoading()
  }, [filterFollowUpListForm])
  useEffect(() => {
    getFollowUpList()
  }, [getFollowUpList])
  // ==================== 滚动加载 ====================
  const [followUpCursor, setFollowUpCursor] = useState<number>(1)
  const [hasMore, setHasMore] = useState(true)
  // 加载更多
  const loadMore = async () => {
    const followUpRes = await getFollowUpListAsyncAPI({
      ...filterFollowUpListForm,
      pageNo: followUpCursor + 1
    })
    if (followUpRes.code == 0) {
      const newData = followUpRes.data.list || []
      setFollowUpList(prev => [...prev, ...newData])
      setHasMore(newData.length === 10)
      setFollowUpCursor(followUpCursor + 1)
    } else {
      Taro.showToast({
        title: '获取失败',
        icon: 'none'
      })
    }
  }
  // 新增跟进后刷新列表事件
  useEffect(() => {
    eventCenter.on(CLUE_EVENT.REFRESH_FOLLOW_LIST, getFollowUpList)
    return () => {
      eventCenter.off(CLUE_EVENT.REFRESH_FOLLOW_LIST, getFollowUpList)
    }
  }, [getFollowUpList])

  // const [selectedItem, setSelectedItem] = useState<any>(null)
  // const [page, setPage] = useState(1)

  // 解析安全HTML
  // const parseSafeHTML = (html: string) => {
  //   if (!html) return ''
  //   return html.replace(/<[^>]*>/g, '')
  // }

  // // 解析日期
  // const parseDate = (dateString: string) => {
  //   if (!dateString) return '跟进时间'
  //   const date = new Date(dateString)
  //   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
  //     date.getDate()
  //   ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
  //     date.getMinutes()
  //   ).padStart(2, '0')}`
  // }

  // 搜索处理
  // const handleSearch = () => {
  //   setPage(1)
  //   setHasMore(true)
  //   getFollowUpList(1, false)
  // }

  // 跳转到跟进详情页面
  // const toFollowPage = (item: any) => {
  //   Taro.navigateTo({
  //     url: `/subpackages/cluePage/follow/index?id=${item.id}`
  //   })
  // }

  // useLoad(() => {
  //   // 获取页面参数
  //   const instance = Taro.getCurrentInstance()
  //   const params = instance.router?.params

  //   if (params) {
  //     const { leadId, leadName } = params
  //     if (leadId) {
  //       setSelectedItem({
  //         id: leadId,
  //         name: leadName ? decodeURIComponent(leadName) : ''
  //       })
  //     }
  //   }
  // })

  // useEffect(() => {
  //   if (selectedItem?.id) {
  //     getFollowUpList(1, false)
  //   }
  // }, [selectedItem])

  return (
    <View className="followList_page">
      {/* 搜索框和写跟进按钮 */}
      {/* <View className="followList_input_box">
        <View className="followList_input_icon">
          <Search color="#AAAAAA" size="36rpx" />
        </View>
        <Input
          className="followList_input"
          placeholder="搜索跟进内容"
          style={{ width: '100%' }}
          value={searchInputValue}
          onChange={e => setSearchInputValue(e)}
          clearable={true}
        />
      </View>
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
        ))} */}
      <View className="followList_search_box">
        <View className="seachinput_box">
          <View className="seach_icon">
            <Search color="#AAAAAA" size="36rpx" />
          </View>
          <Input
            className="seachinput"
            placeholder="搜索跟进内容"
            style={{ width: '100%' }}
            value={searchInputValue}
            onChange={setSearchInputValue}
            onClear={() => {
              console.log('onClear')
              if (filterFollowUpListForm.content) {
                const newFilterFollowUpListForm = { ...filterFollowUpListForm }
                delete newFilterFollowUpListForm.content
                setFilterFollowUpListForm(newFilterFollowUpListForm)
              }
            }}
            clearable={true}
          />
          <Divider direction="vertical" />
          <Text
            className="search_text"
            onClick={() => {
              setFilterFollowUpListForm({
                ...filterFollowUpListForm,
                content: searchInputValue
              })
            }}
          >
            搜索
          </Text>
        </View>
        <Button
          className="followList_search_btn"
          onClick={() => {
            addFollow()
          }}
        >
          写跟进
        </Button>
      </View>

      {/* 跟进记录列表 */}
      {followUpList.length > 0 && (
        <View className="follow_scroll_container">
          <ScrollView scrollY id="followUpScrollList" className="follow_scroll_list">
            <InfiniteLoading
              target="followUpScrollList"
              hasMore={hasMore}
              onLoadMore={loadMore}
              loadingText={
                <>
                  <View className="loadingText">
                    <Image
                      src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise11.png"
                      className="loadingImg"
                    />
                    <Text className="loading-char">l</Text>
                    <Text className="loading-char">o</Text>
                    <Text className="loading-char">a</Text>
                    <Text className="loading-char">d</Text>
                    <Text className="loading-char">i</Text>
                    <Text className="loading-char">n</Text>
                    <Text className="loading-char">g</Text>
                    <Text className="loading-char">.</Text>
                    <Text className="loading-char">.</Text>
                    <Text className="loading-char">.</Text>
                  </View>
                </>
              }
              loadMoreText="没有啦～"
            >
              {followUpList.map((followItem, index) => {
                const contactInfo = followItem.contactInfo
                  ? (JSON.parse(followItem.contactInfo) as ICorpContactInfo)
                  : null
                return (
                  <View key={index} className="followList_item">
                    <View className="timeline_dot"></View>
                    {index < followUpList.length - 1 && <View className="timeline_tail"></View>}
                    <View className="timeline_content">
                      <View className="timeline_content_title">
                        {dayjs(followItem.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </View>
                      <View className="timeline_content_desc">
                        跟进方式:&nbsp;{followItem.method || '-'}
                        {contactInfo &&
                          `，${contactInfo?.name || '-'} (
                        ${contactInfo?.position || '-'}
                        ) ${contactInfo?.phone || '-'}
                        `}
                      </View>
                      <View className="timeline_content_content">{followItem.content}</View>
                    </View>
                  </View>
                )
              })}
            </InfiniteLoading>
          </ScrollView>
        </View>
      )}
      {followUpList.length === 0 && (
        <View className="empty_container">
          <Image
            className="empty_image"
            src="https://find-console.newgalaxyai.com/glks/assets/emptyImg.png"
          />
          <Text className="empty_text">暂无跟进记录</Text>
        </View>
      )}
    </View>
  )
}

export default FollowListPage
