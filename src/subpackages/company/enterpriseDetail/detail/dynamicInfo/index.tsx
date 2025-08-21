import React, { useEffect, useState } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import './index.scss'
import { ArrowRightSize6 } from '@nutui/icons-react-taro'
import { Dialog, Tabs } from '@nutui/nutui-react-taro'
import Taro, { useLoad } from '@tarojs/taro'
import { getCompanyWebNewsListApi, getCompanyWebNewsDetailApi } from '@/api/company'
function Index() {
  const [tabvalue, setTabvalue] = useState(0)
  const [list, setList] = useState([])
  const [botHeight, setBotHeight] = useState([])
  const [tabHeight, setTabHeight] = useState(0)
  const [company, setCompany] = useState({ name: '', logo: '', gid: '' })
  const [newsList, setNewsList] = useState<any>([])
  const [readNewsShow, setReadNewsShow] = useState(false)
  const [newsInfo, setNewsInfo] = useState<any>({})

  // 添加分页相关状态变量
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  // 在useEffect中添加对newsList的依赖，当数据更新时重新计算botHeight
  useEffect(() => {
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery()
      query.select('.content-box').boundingClientRect()
      query.selectAll('.tagone').boundingClientRect()
      query.select('.nut-tabs-titles').boundingClientRect()
      query.select('.header-company').boundingClientRect()
      query.exec(res => {
        setTabHeight(res[3].height + res[2].height)
        const contentRect = res[0]
        const tagRects = res[1]
        if (contentRect && tagRects && tagRects.length) {
          const distances = tagRects.map((rect: { top: number }) => rect.top - contentRect.top)
          setBotHeight(distances)
        }
      })
    })
  }, [newsList]) // 添加newsList作为依赖项

  const openDetail = (item: any) => {
    getCompanyWebNewsDetailApi({ gid: company.gid, docid: item.docid }, res => {
      if (res.success) {
        setNewsInfo({ ...res.data, title: item.title, uri: item.uri })
        setReadNewsShow(true)
      }
    })
  }

  const viewMore = () => {
    if (!newsInfo.uri) {
      Taro.showToast({
        title: '网址不存在',
        icon: 'none',
        duration: 2000
      })
      return
    }
    Taro.setClipboardData({
      data: newsInfo.uri,
      success: () => {
        Taro.showToast({
          title: '网址以复制，请去浏览器打开',
          icon: 'none',
          duration: 2000
        })
      }
    })
    setReadNewsShow(false)
  }

  useLoad(options => {
    let item = JSON.parse(options.item)
    if (item.name) {
      item.name = item.name.replace(/<[^>]+>/g, '')
    }
    setCompany({ name: item.name, logo: item.logo, gid: item.gid })
  })

  function getNewsList(isRefresh = false) {
    if (loading) return
    setLoading(true)
    const currentPage = isRefresh ? 1 : pageNum
    getCompanyWebNewsListApi(
      {
        gid: company.gid,
        pageNum: currentPage,
        pageSize: pageSize
      },
      res => {
        if (res.success) {
          const newsData = res.data.list || []

          // 如果是刷新，直接替换数据
          if (isRefresh) {
            setNewsList(newsData)
            setPageNum(2) // 重置为第2页，因为第1页已加载
          } else {
            // 否则追加数据
            setNewsList((prev: any) => [...prev, ...newsData])
            setPageNum(currentPage + 1)
          }

          // 判断是否还有更多数据
          setHasMore(newsData.length === pageSize)
        }
        setLoading(false)
      }
    )
  }

  // 处理触底加载更多
  const handleScrollToLower = () => {
    if (hasMore && !loading) {
      getNewsList()
      // 添加延时，等待DOM更新后再计算高度
      setTimeout(() => {
        const query = Taro.createSelectorQuery()
        query.select('.content-box').boundingClientRect()
        query.selectAll('.tagone').boundingClientRect()
        query.exec(res => {
          const contentRect = res[0]
          const tagRects = res[1]
          if (contentRect && tagRects && tagRects.length) {
            const distances = tagRects.map((rect: { top: number }) => rect.top - contentRect.top)
            setBotHeight(distances)
          }
        })
      }, 300) // 300ms延时，可根据实际情况调整
    }
  }

  useEffect(() => {
    if (company.gid) {
      // 重置分页状态并加载第一页
      setPageNum(1)
      setHasMore(true)
      getNewsList(true)
    }
  }, [company.gid])

  // 更安全的时间戳转换函数，包含错误处理
  const formatTimestamp = (timestamp: number | string) => {
    try {
      if (!timestamp) return '--'
      const date = new Date(Number(timestamp))
      if (isNaN(date.getTime())) return '--'

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    } catch (error) {
      console.error('时间戳转换错误:', error)
      return '--'
    }
  }

  const getTagClass = (index: string) => {
    if (index === '积极') return 'tag-active'
    if (index === '中立') return 'tag-neutral'
    if (index === '消极') return 'tag-negative'
    return 'tag-active'
  }

  const getTab = (value: number) => {
    setTabvalue(value as number)
    Taro.nextTick(() => {
      const query = Taro.createSelectorQuery()
      query.select('.content-box').boundingClientRect()
      query.selectAll(value == 0 ? '.tagone' : value == 1 ? '.tagtwo' : '.tagthree').boundingClientRect()
      query.exec(res => {
        const contentRect = res[0]
        const tagRects = res[1]
        if (contentRect && tagRects && tagRects.length) {
          const distances = tagRects.map((rect: { top: number }) => rect.top - contentRect.top)
          setBotHeight(distances)
        }
      })
    })
  }

  return (
    <View className="detailPage">
      <Dialog title="阅读新闻" hideConfirmButton visible={readNewsShow} onConfirm={() => viewMore()} onCancel={() => setReadNewsShow(false)}>
        <View className="dialog-content">
          {newsInfo.title && <View className="titleDia">{newsInfo.title}</View>}
          {newsInfo.news_text && (
            <View className="contentDia">
              {newsInfo.news_text}
              <Text onClick={() => viewMore()} className="viewMore">
                查看更多
              </Text>
            </View>
          )}
          {newsInfo.statement_text && <View className="tipsDia">{newsInfo.statement_text}</View>}
        </View>
      </Dialog>
      <View className="header">
        <View className="header-company">
          {company.logo ? (
            // 判断是否为图片链接（包含http或https）
            company.logo.includes('http') ? (
              <Image src={company.logo} className="header-company-logo" />
            ) : (
              // 如果是文字，显示文字
              <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '16rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="header-company-logo">
                {company.logo}
              </Text>
            )
          ) : (
            // 如果为空，显示"暂无"
            <Text className="header-company-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '16rpx' }}>
              暂无
            </Text>
          )}
          {/* <View className="header-company-logo">
            <Image src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise11.png" className="header-company-logo-img" />
          </View> */}
          <View className="header-company-name">{company.name}</View>
          <ArrowRightSize6 color="#333" size={'24rpx'} />
        </View>
        <View className="header-tabs">
          <Tabs
            value={tabvalue}
            onChange={value => {
              getTab(value as number)
            }}
            align="left"
          >
            <Tabs.TabPane title="新闻舆情">
              <ScrollView className="content" style={{ height: `calc(100vh - ${tabHeight}px)` }} scrollY onScrollToLower={handleScrollToLower}>
                <View className="content-box">
                  <View className="content-item-left">
                    {botHeight.map((item, index) => (
                      <React.Fragment key={index}>
                        {/* 线（不是第一个点时才渲染） */}
                        {index > 0 && (
                          <View
                            className="content-item__line"
                            style={{
                              top: `calc(${botHeight[index - 1]}px + 41rpx)`,
                              height: `calc(${item}px - ${botHeight[index - 1]}px - 30rpx)`
                            }}
                          />
                        )}
                        {/* 点 */}
                        <View className="content-item__dot" style={{ top: `calc(${item}px + 18rpx)`, background: index != 0 ? '#DBDBDB' : '#1B5BFF' }} />
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="content-list">
                    {newsList.map((item: any, index: any) => {
                      return (
                        <View className="content-item" key={index} onClick={() => openDetail(item)}>
                          <View className="content-item__header">
                            <View className="content-item__dot"></View>
                            <View className={`tag ${getTagClass(item.sentiment)} tagone`}>{item.sentiment}</View>
                            <View className="tag-news">新闻</View>
                            <View className="date">{formatTimestamp(item.rtm)}</View>
                          </View>
                          <View className="content-item__card">
                            <View className="title">{item.title}</View>
                            <View className="source">来源{item.website}</View>
                            <View className="arrow"></View>
                          </View>
                        </View>
                      )
                    })}

                    {/* 加载状态提示 */}
                    {loading && <View className="loading-tip">加载中...</View>}

                    {/* 没有更多数据提示 */}
                    {!hasMore && newsList.length > 0 && <View className="no-more-tip">没有更多数据了</View>}

                    {/* 无数据提示 */}
                    {!loading && newsList.length === 0 && <View className="empty-tip">暂无数据</View>}
                  </View>
                </View>
              </ScrollView>
            </Tabs.TabPane>
            {/* <Tabs.TabPane title="工商变更">
              <View className="content" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                <View className="content-box">
                  <View className="content-item-left">
                    {botHeight.map((item, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <View
                            className="content-item__line"
                            style={{
                              top: `calc(${botHeight[index - 1]}px + 41rpx)`,
                              height: `calc(${item}px - ${botHeight[index - 1]}px - 30rpx)`
                            }}
                          />
                        )}
                        <View className="content-item__dot" style={{ top: `calc(${item}px + 18rpx)`, background: index != 0 ? '#DBDBDB' : '#1B5BFF' }} />
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="content-list">
                    {list.map((item, index) => {
                      return (
                        <View className="content-item" key={index}>
                          <View className="content-item__header">
                            <View className="content-item__dot"></View>
                            <View className={`tag tag-yellow tagtwo`}>提示</View>
                            <View className="tag-news">其他事项备案</View>
                            <View className="date">2024-09-09</View>
                          </View>
                          <View className="content-item__cardt">
                            <View className="title">变更前</View>
                            <View className="text">区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案</View>
                            <View className="title">变更后</View>
                            <View className="text">区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案，区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案区局--公章刻制备案</View>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            </Tabs.TabPane>
            <Tabs.TabPane title="经营动态">
              <View className="content" style={{ height: `calc(100vh - ${tabHeight}px)` }}>
                <View className="content-box">
                  <View className="content-item-left">
                    {botHeight.map((item, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <View
                            className="content-item__line"
                            style={{
                              top: `calc(${botHeight[index - 1]}px + 41rpx)`,
                              height: `calc(${item}px - ${botHeight[index - 1]}px - 30rpx)`
                            }}
                          />
                        )}
                        <View className="content-item__dot" style={{ top: `calc(${item}px + 18rpx)`, background: index != 0 ? '#DBDBDB' : '#1B5BFF' }} />
                      </React.Fragment>
                    ))}
                  </View>
                  <View className="content-list">
                    {list.map((item, index) => {
                      return (
                        <View className="content-item" key={index}>
                          <View className="content-item__header">
                            <View className="content-item__dot"></View>
                            <View className={`tag tag-yellow tagthree`}>提示</View>
                            <View className="tag-news">招标结果</View>
                            <View className="date">2024-09-09</View>
                          </View>
                          <View className="content-item__cardth">
                            <View className="title">西安经发城市服务有限公司有人驾驶移动充电车采购项目（二次）中标候选人公示</View>
                            <View className="text">
                              类型：<Text>招标结果</Text>
                            </View>
                            <View className="text">
                              招采方：<Text style={{ color: '#1B5BFF' }}>西安经发城市服务有限公司</Text>
                            </View>
                            <View className="text">
                              中标方：<Text style={{ color: '#1B5BFF' }}>柳州五萎汽车工业有限公司</Text>
                            </View>
                            <View className="text">
                              地区：<Text>陕西省</Text>
                            </View>
                            <View className="text">
                              发布日期：<Text>2024-09-09</Text>
                            </View>
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            </Tabs.TabPane> */}
          </Tabs>
        </View>
      </View>
    </View>
  )
}

export default Index
