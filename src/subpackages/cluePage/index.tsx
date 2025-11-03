import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import {
  Cell,
  Popup,
  Tabs,
  Input,
  Calendar,
  Drag,
  Empty,
  Button,
  InfiniteLoading,
  Divider
} from '@nutui/nutui-react-taro'
import './index.scss'
import { SearchBar } from '@nutui/nutui-react-taro'
import { ArrowRight, Checked, Loading, Search } from '@nutui/icons-react-taro'
import Taro, { useDidShow, useLoad, showToast, hideToast } from '@tarojs/taro' // 添加useDidShow导入
import {
  clueListAPI,
  clueDeleteAPI,
  clueFollowUpPageAPI,
  clueFollowUpHistoryAPI,
  getClueListAsyncApi,
  clueUpdateAPI
} from '@/api/clue'
import { useDebounceValue } from '@/hooks/useDebounce'
import { aiSessionListAPI } from '@/api/chatMsg'
// import ContactPopup from '@/components/ContactPopup'
import CorpContactComponent from '@/components/corp-contact'
import { IClue, IGetClueListRequest } from '@/api/types'
import { filterHTMLString } from '@/utils/filterString'
import { useAppSelector } from '@/hooks/useAppStore'
import { ROUTE, ROUTE_PARAMS_NAME } from '@/constants'
import { CLUE_EVENT } from '@/constants/event'

type IFilterClueForm = Omit<IGetClueListRequest, 'pageNo' | 'pageSize' | 'userId'>

const CluePage = forwardRef<
  { getClueList: (page?: number, append?: boolean) => void },
  { height: number }
>(({ height }, ref) => {
  const {
    login: { userInfo }
  } = useAppSelector(state => state)
  // 顶部线索tab
  // 线索列表数据
  const [clueList, setClueList] = useState<IClue[]>([])
  // ==================== 下滑加载更多 ====================
  // 线索列表是否还有更多数据
  const [clueHasMore, setClueHasMore] = useState<boolean>(false)
  // 加载更多cursor
  const [loadMoreCluePageListCursor, setLoadMoreCluePageListCursor] = useState<number>(1)
  // 加载更多线索列表
  async function loadMoreCluePageList() {
    const res = await getClueListAsyncApi({
      ...clueFilterForm,
      pageNo: loadMoreCluePageListCursor + 1,
      pageSize: 10,
      userId: userInfo?.id!
    })
    if (res.code === 0) {
      setClueList(val => [...val, ...res.data.list])
      setClueHasMore(res.data.list.length === 10) // 判断是否还有更多数据
      setLoadMoreCluePageListCursor(loadMoreCluePageListCursor + 1)
    }
  }
  // ==================== 线索列表搜索输入框 ====================
  // 线索列表搜索输入框值
  const [searchInputValue, setSearchInputValue] = useState<string>('')
  // ==================== 筛选查询线索列表 ====================
  // 线索列表筛选表单初始值
  const initialClueFilterForm: IFilterClueForm = {
    isImportantClue: false
  }
  // 线索列表筛选表单
  const [clueFilterForm, setClueFilterForm] = useState<IFilterClueForm>(initialClueFilterForm) // 筛选表单数据
  // 查询线索列表
  const filterClueList = useCallback(async () => {
    // console.log('filterClueList', clueFilterForm)
    showToast({
      title: '加载中...',
      icon: 'loading',
      mask: true,
      duration: 9900000
    })
    setLoadMoreCluePageListCursor(1)
    const res = await getClueListAsyncApi({
      ...clueFilterForm,
      pageNo: 1,
      pageSize: 10,
      userId: userInfo?.id!
    })
    // console.log('res', res)
    if (res.code === 0) {
      setClueList(res.data.list)
      setClueHasMore(res.data.list.length === 10) // 判断是否还有更多数据
      hideToast()
    } else {
      hideToast()
    }
  }, [clueFilterForm])
  useEffect(() => {
    if (userInfo?.id) {
      filterClueList()
    }
  }, [filterClueList, userInfo])
  // ==================== 线索操作 ====================
  // 添加跟进
  function addFollow(e: any, item: IClue) {
    e.stopPropagation()
    Taro.navigateTo({
      url: `${ROUTE.FOLLOW_RECORD}?&${ROUTE_PARAMS_NAME.CLUE_ID}=${item.id}`
    })
  }
  // 移除线索
  const handleRemove = (clueItem: IClue) => {
    Taro.showModal({
      title: '提示',
      content: '确定删除吗？',
      success: res => {
        if (res.confirm) {
          clueDeleteAPI({ unifiedSocialCreditCode: clueItem.unifiedSocialCreditCode }, res => {
            if (res.success) {
              setClueList(prevList =>
                prevList.filter(
                  item => item.unifiedSocialCreditCode !== clueItem.unifiedSocialCreditCode
                )
              )
              Taro.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 1000
              })
            }
          })
        }
      }
    })
  }
  // 分析报告
  const handleAiResearchReport = (company: IClue) => {
    Taro.navigateTo({
      url: `${ROUTE.AI_RESEARCH_REPORT}?${ROUTE_PARAMS_NAME.CREDIT_CODE}=${company.unifiedSocialCreditCode}&${ROUTE_PARAMS_NAME.COMPANY_NAME}=${company.customerCompanyName}`
    })
  }
  // 转为重要线索
  const handleToImportantClue = (clueItem: IClue, clueIndex: number) => {
    Taro.showModal({
      title: '提示',
      content: `确定将${filterHTMLString(clueItem.customerCompanyName)}转为重要线索吗？`,
      success: res => {
        if (res.confirm) {
          clueUpdateAPI({ id: clueItem.id, isImportantClue: true }, res => {
            if (res.success) {
              setClueList(prevList => prevList.splice(clueIndex, 1))
              Taro.showToast({
                title: '转为重要线索成功',
                icon: 'none',
                duration: 1000
              })
            }
          })
        }
      }
    })
  }
  // 联系方式弹窗
  // 打开状态
  const [isShowPhone, setIsShowPhone] = useState(false)
  // 当前企业的creditCode
  const [currentCreditCode, setCurrentCreditCode] = useState('')
  const openPhone = (item: IClue) => {
    setIsShowPhone(true)
    setCurrentCreditCode(item.unifiedSocialCreditCode)
  }

  // ==================== 分界线 ====================

  const [isShowAddress, setIsShowAddress] = useState(false)
  const [isShowFilter, setIsShowFilter] = useState(false)
  const [tabFilterValue, setTabFilterValue] = useState(0)
  const [tabValue, setTabValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isShowFollowUp, setIsShowFollowUp] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>({})
  const [historySession, setHistorySession] = useState<any[]>([])
  const [followUpList, setFollowUpList] = useState<any[]>([])
  const [followUpListPopup, setFollowUpListPopup] = useState<any[]>([])

  // ==================== 筛选相关状态 ====================
  const [sortType, setSortType] = useState('asc') // 排序类型：asc-正序，desc-倒序
  const [selectedSortField, setSelectedSortField] = useState('followTime') // 选中的排序字段
  const [selectedFilterFields, setSelectedFilterFields] = useState<string[]>([]) // 选中的筛选字段
  const [phoneInfo, setPhoneInfo] = useState<any[]>([]) // 手机号
  const [fixedLines, setFixedLines] = useState<any[]>([]) // 固话
  const [emails, setEmails] = useState<any[]>([]) // 邮箱
  const [address, setAddress] = useState<any[]>([]) // 地址
  const [others, setOthers] = useState<any[]>([]) // 其他

  // 筛选页面状态
  const [selectedModule, setSelectedModule] = useState('all') // 选中的模块：all-全部，clue-线索
  const [selectedVisitMethods, setSelectedVisitMethods] = useState<string[]>([]) // 选中的到访方式
  const [filterKeyword, setFilterKeyword] = useState('') // 筛选关键词
  const [filterTimeRange, setFilterTimeRange] = useState('') // 筛选时间范围

  // ==================== 搜索相关状态 ====================
  const [searchValueClueList, setSearchValueClueList] = useState('') // 搜索关键词
  const [searchValueFollowRecord, setSearchValueFollowRecord] = useState('') // 搜索关键词

  // ==================== 内容展开状态 ====================
  const [expandedProducts, setExpandedProducts] = useState<{ [key: number]: boolean }>({}) // 产品信息展开状态

  // ==================== 工具函数 ====================
  // 使用 useCallback 优化高亮关键词函数
  const highlightKeyword = useCallback((text: string, keyword: string) => {
    if (!keyword) return text
    const regex = new RegExp(`(${keyword})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={{ color: '#426EFF', fontWeight: 'bold' }}>
          {part}
        </Text>
      ) : (
        part
      )
    )
  }, [])

  // ==================== 事件处理函数 ====================
  // 处理头部筛选按钮点击
  const handleActiveIndex = (index: number) => {
    if (index === 0) {
      setIsShowFilter(true)
      setTabFilterValue(0)
    }
    if (index === 1) {
      setIsShowFilter(true)
      setTabFilterValue(1)
    }
    if (index === 3) {
    }
    if (index === 4) {
      setIsShowPhone(true)
    }
    if (index === 5) {
      setIsShowAddress(true)
    }
  }

  // function getFollowUpListPopup(e: any, item: any) {
  //   e.stopPropagation()
  //   // 跳转到新的跟进记录列表页面
  //   Taro.navigateTo({
  //     url: `/subpackages/cluePage/followList/index?leadId=${item.id}&leadName=${encodeURIComponent(
  //       item.name || ''
  //     )}`
  //   })
  // }

  // 新增分页状态
  const [cluePageNum, setCluePageNum] = useState(1)
  const [clueLoading, setClueLoading] = useState(false)

  const [followUpPageNum, setFollowUpPageNum] = useState(1)
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpHasMore, setFollowUpHasMore] = useState(true)

  const [historyPageNum, setHistoryPageNum] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyHasMore, setHistoryHasMore] = useState(true)

  // 修改getClueList支持分页加载
  const getClueList = (page = 1, append = false) => {
    if (clueLoading) return
    Taro.showLoading({
      title: '获取中',
      mask: true
    })
    setClueLoading(true)
    clueListAPI(
      { pageNo: page, pageSize: 10, userId: userInfo?.id!, isImportantClue: false },
      res => {
        if (res.success && res.data) {
          res.data.list.forEach((item: any) => {
            if (item.tags && item.tags.length > 0 && typeof item.tags === 'string') {
              item.tags = item.tags
                .split(',')
                .map((tag: string) => tag.trim())
                .filter((tag: string) => tag.length > 0)
            }
          })
          if (append) {
            setClueList(prev => [...prev, ...res.data!.list])
          } else {
            setClueList(res.data.list)
          }
          setClueHasMore(res.data.list.length === 10) // 判断是否还有更多
          setCluePageNum(page)
          Taro.hideLoading()
        } else {
          Taro.showToast({
            title: '获取失败',
            icon: 'none'
          })
          Taro.hideLoading()
        }
        setClueLoading(false)
      }
    )
  }

  // 修改getFollowUpList支持分页加载
  const getFollowUpList = (page = 1, append = false) => {
    if (followUpLoading) return
    Taro.showLoading({
      title: '获取中',
      mask: true
    })
    setFollowUpLoading(true)
    clueFollowUpPageAPI(
      { pageNum: page, pageSize: 20, userId: userInfo?.id, keywords: searchValueFollowRecord },
      res => {
        if (res.success && res.data) {
          if (append) {
            setFollowUpList(prev => [...prev, ...res.data.list])
          } else {
            setFollowUpList(res.data.list)
          }
          setFollowUpHasMore(res.data.list.length === 20)
          setFollowUpPageNum(page)
          Taro.hideLoading()
        } else {
          Taro.showToast({
            title: '获取失败',
            icon: 'none'
          })
          Taro.hideLoading()
        }
        setFollowUpLoading(false)
      }
    )
  }

  // 修改getSession支持分页加载
  const getSession = (page = 1, append = false) => {
    if (historyLoading) return
    Taro.showLoading({
      title: '获取中',
      mask: true
    })
    setHistoryLoading(true)
    clueFollowUpHistoryAPI({ pageNum: page, pageSize: 20 }, res => {
      if (res.success && res.data) {
        res.data.list = res.data.list.map(item => {
          try {
            if (item.enterpriseInfo && typeof item.enterpriseInfo === 'string') {
              const parsedInfo = JSON.parse(item.enterpriseInfo)
              item.enterpriseInfo = parsedInfo
              if (parsedInfo && parsedInfo.companyList && parsedInfo.companyList.length > 0) {
                let locationStr = parsedInfo.companyList[0].location || '未知省份'

                if (locationStr.includes('省')) {
                  parsedInfo.companyList[0].handleLocation = locationStr.split('省')[0] + '省'
                } else if (locationStr.includes('市')) {
                  const directMunicipalities = ['北京', '上海', '天津', '重庆']
                  const found = directMunicipalities.find(city => locationStr.includes(city))
                  parsedInfo.companyList[0].handleLocation = found
                    ? found + '市'
                    : locationStr.split('市')[0] + '市'
                } else if (locationStr.includes('自治区')) {
                  parsedInfo.companyList[0].handleLocation =
                    locationStr.split('自治区')[0] + '自治区'
                } else {
                  parsedInfo.companyList[0].handleLocation = '未知省份'
                }

                if (
                  parsedInfo.companyList[0].tags &&
                  Array.isArray(parsedInfo.companyList[0].tags)
                ) {
                  parsedInfo.companyList[0].tags = parsedInfo.companyList[0].tags.filter(
                    (tag: string) => {
                      return (
                        !tag.includes('曾用名') && !tag.includes('原名') && !tag.includes('更名')
                      )
                    }
                  )
                }

                item['companyInfo'] = parsedInfo.companyList[0]
              } else {
                item['companyInfo'] = null
              }
            } else {
              item['companyInfo'] = null
            }
          } catch (error) {
            item['companyInfo'] = null
          }
          return item
        })

        const filteredList = res.data.list.filter(item => item.companyInfo !== null)

        if (append) {
          setHistorySession(prev => [...prev, ...filteredList])
        } else {
          setHistorySession(filteredList)
        }
        setHistoryHasMore(filteredList.length === 20)
        setHistoryPageNum(page)
        Taro.hideLoading()
      } else {
        Taro.showToast({
          title: '获取失败',
          icon: 'none'
        })
        Taro.hideLoading()
      }
      setHistoryLoading(false)
    })
  }

  // 处理排序类型选择
  const handleSortTypeChange = (type: string) => {
    setSortType(type)
  }

  // 处理排序字段选择
  const handleSortFieldChange = (field: string) => {
    setSelectedSortField(field)
  }

  // 处理模块选择
  const handleModuleChange = (module: string) => {
    setSelectedModule(module)
  }

  // 处理到访方式选择
  const handleVisitMethodChange = (method: string) => {
    setSelectedVisitMethods(prev => {
      if (prev.includes(method)) {
        return prev.filter(item => item !== method)
      } else {
        return [...prev, method]
      }
    })
  }

  // 检查到访方式是否被选中
  const isVisitMethodSelected = (method: string) => {
    return selectedVisitMethods.includes(method)
  }

  const toFollowPage = (item: any) => {
    Taro.navigateTo({
      url: `/subpackages/cluePage/follow/index?item=${item.id}`
    })
  }

  // 处理筛选确认
  const handleCalendarConfirm = (value: any) => {
    let date = `${value[0][3]} - ${value[1][3]}`
    setFilterTimeRange(date)
    setIsVisible(false)
  }

  const handleFilterConfirm = () => {
    setIsShowFilter(false)
  }

  // 处理筛选重置
  const handleFilterReset = () => {
    setSelectedModule('all')
    setSelectedVisitMethods([])
    setFilterKeyword('')
    setFilterTimeRange('')
    setSortType('asc')
    setSelectedSortField('followTime')
    setSelectedFilterFields([])
  }

  const navigateToCompanyDetail = (company: any) => {
    const companyInfo = { ...company.companyInfo, clueId: company.id }
    Taro.navigateTo({
      url: `/subpackages/company/enterpriseDetail/index?company=${JSON.stringify(companyInfo)}`
    })
  }

  // 企业列表
  const handleEnterpriseList = (item: any) => {
    const enterpriseInfo = item.enterpriseInfo
    Taro.navigateTo({
      url: `/subpackages/company/enterpriseSearch/index?messageId=${enterpriseInfo.messageId}`
    }).then(() => {
      // 页面跳转成功后，延迟触发事件
      setTimeout(() => {
        Taro.eventCenter.trigger('enterpriseSearchData', {
          companyList: enterpriseInfo.companyList,
          total: enterpriseInfo.total,
          messageId: enterpriseInfo.messageId,
          clueId: item.id
        })
      }, 100) // 延迟100ms确保目标页面已经加载
    })
  }

  // 监听企业详情页面卸载事件
  useEffect(() => {
    const handleEnterpriseDetailUnload = (res: any) => {
      setHistorySession((prevList: any[]) => {
        return prevList.map((item: any) => {
          if (item.id == res.clueId) {
            const companyList = item.enterpriseInfo?.companyList || []
            const safeCompanyList = Array.isArray(companyList) ? companyList : []
            return {
              ...item,
              companyInfo: {
                ...item.companyInfo,
                hasFeedback: res.hasFeedback,
                isJoinClue: res.isJoinClue,
                commentContent: res.commentContent
              },
              enterpriseInfo: {
                ...item.enterpriseInfo,
                // 只在确定是数组时才展开
                companyList: [
                  ...safeCompanyList.slice(0, 1).map(company => ({
                    ...company,
                    hasFeedback: res.hasFeedback,
                    isJoinClue: res.isJoinClue,
                    commentContent: res.commentContent
                  })),
                  ...safeCompanyList.slice(1) // 保留其他元素
                ]
              }
            }
          }
          return item
        })
      })
    }
    Taro.eventCenter.on('enterpriseDetailUnload', handleEnterpriseDetailUnload)

    return () => {
      Taro.eventCenter.off('enterpriseDetailUnload', handleEnterpriseDetailUnload)
    }
  }, [])

  useEffect(() => {
    const handleEnterpriseSearchDataEdit = (data: any) => {
      setHistorySession((prevList: any[]) => {
        return prevList.map((item: any) => {
          if (item.id == data.clueId) {
            return {
              ...item,
              companyInfo: {
                ...item.companyInfo,
                hasFeedback: data.companyList[0].hasFeedback,
                isJoinClue: data.companyList[0].isJoinClue,
                commentContent: data.companyList[0].commentContent
              },
              enterpriseInfo: {
                ...item.enterpriseInfo,
                companyList: data.companyList
              }
            }
          }
          return item
        })
      })
    }
    Taro.eventCenter.on('enterpriseSearchDataEdit', handleEnterpriseSearchDataEdit)

    return () => {
      Taro.eventCenter.off('enterpriseSearchDataEdit', handleEnterpriseSearchDataEdit)
    }
  }, [])

  const handleSearchClueList = () => {
    getClueList()
  }

  const handleSearchFollowRecord = () => {
    getFollowUpList()
  }

  function parseDate(createTime: any): React.ReactNode {
    let time = new Date(createTime)
    // 转为2025-01-01 12:00:00
    let year = time.getFullYear()
    let month = (time.getMonth() + 1).toString().padStart(2, '0')
    let day = time.getDate().toString().padStart(2, '0')
    let hour = time.getHours().toString().padStart(2, '0')
    let minute = time.getMinutes().toString().padStart(2, '0')
    let second = time.getSeconds().toString().padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
  }
  // 触底加载函数
  const loadMoreClueList = () => {
    if (clueLoading || !clueHasMore) return
    getClueList(cluePageNum + 1, true)
  }

  function openAddress(item: any) {
    if (item.regLocation) {
      setAddress([item.regLocation])
      setIsShowAddress(true)
    } else {
      Taro.showToast({
        title: '暂无地址',
        icon: 'none'
      })
    }
  }

  const loadMoreFollowUpList = () => {
    if (followUpLoading || !followUpHasMore) return
    getFollowUpList(followUpPageNum + 1, true)
  }

  const loadMoreHistorySession = () => {
    if (historyLoading || !historyHasMore) return
    getSession(historyPageNum + 1, true)
  }

  useImperativeHandle(ref, () => ({
    getClueList
  }))

  return (
    <View className="cluePage" style={{ height: `calc(100vh - ${height}px)` }}>
      {/* 自定义关闭吐司 */}
      {/* 联系人 */}
      {/* <ContactPopup
        visible={isShowPhone}
        onClose={() => setIsShowPhone(false)}
        contactData={{
          phoneInfo,
          fixedLines,
          emails,
          address,
          others
        }}
        tabValue={tabValue}
        onTabChange={(value: number) => setTabValue(value)}
      /> */}
      <CorpContactComponent
        visible={isShowPhone}
        setVisible={setIsShowPhone}
        creditCode={currentCreditCode}
      />
      {/* 工厂地址 */}
      <Popup
        position="bottom"
        style={{ maxHeight: '85%', minHeight: '85%' }}
        visible={isShowAddress}
        onClose={() => setIsShowAddress(false)}
      >
        <View className="popup_header" style={{ height: '100rpx' }}>
          <View className="popup_header_title">工厂地址</View>
          <Image
            onClick={() => setIsShowAddress(false)}
            src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
        </View>
        <View className="address_content">
          <Cell.Group>
            {address.map((item, index) => (
              <Cell
                key={index}
                align="center"
                title={`公司地址${index + 1}`}
                description={filterHTMLString(item)}
              />
            ))}
          </Cell.Group>
        </View>
      </Popup>

      {/* 排序 */}
      <Popup
        position="bottom"
        style={{ maxHeight: '85%', minHeight: '85%' }}
        visible={isShowFilter}
        onClose={() => setIsShowFilter(false)}
      >
        <View className="popup_header">
          <Image
            onClick={() => setIsShowFilter(false)}
            src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
          <Tabs
            value={tabFilterValue}
            onChange={(value: number) => {
              setTabFilterValue(value)
            }}
          >
            <Tabs.TabPane title="排序"></Tabs.TabPane>
            <Tabs.TabPane title="筛选"></Tabs.TabPane>
          </Tabs>
          {tabFilterValue === 0 && (
            <View className="popup_filter">
              <View className="filterItem_top">
                <View className="filterItem" onClick={() => handleSortTypeChange('asc')}>
                  <View>正序排序</View>
                  {sortType === 'asc' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View className="filterItem" onClick={() => handleSortTypeChange('desc')}>
                  <View>倒序排序</View>
                  {sortType === 'desc' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
              </View>
              <View className="filterItem_bottom">
                <View
                  className="filterItemAction"
                  onClick={() => handleSortFieldChange('followPerson')}
                >
                  <View>跟进人员</View>
                  {selectedSortField === 'followPerson' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View
                  className="filterItemAction"
                  onClick={() => handleSortFieldChange('createTime')}
                >
                  <View>创建时间</View>
                  {selectedSortField === 'createTime' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View className="filterItemAction" onClick={() => handleSortFieldChange('module')}>
                  <View>所属模块</View>
                  {selectedSortField === 'module' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
                <View
                  className="filterItemAction"
                  onClick={() => handleSortFieldChange('followType')}
                >
                  <View>跟进类型</View>
                  {selectedSortField === 'followType' && <Checked color="#1B5BFF" size="30rpx" />}
                </View>
              </View>
              <View className="filter_actions">
                <View className="action_button reset" onClick={handleFilterReset}>
                  重置
                </View>
                <View className="action_button confirm" onClick={handleFilterConfirm}>
                  确定
                </View>
              </View>
            </View>
          )}
          {tabFilterValue === 1 && (
            <View className="popup_sort">
              {/* 所属模块 */}
              <View className="filter_section">
                <View className="section_title">所属模块</View>
                <View className="module_buttons">
                  <View
                    className={`module_button ${selectedModule === 'all' ? 'selected' : ''}`}
                    onClick={() => handleModuleChange('all')}
                  >
                    <View>全部</View>
                  </View>
                  <View
                    className={`module_button ${selectedModule === 'clue' ? 'selected' : ''}`}
                    onClick={() => handleModuleChange('clue')}
                  >
                    <View>线索</View>
                  </View>
                </View>
              </View>

              {/* 到访方式 */}
              <View className="filter_section">
                <View className="section_title">到访</View>
                <View className="visit_buttons">
                  <View
                    className={`visit_button ${isVisitMethodSelected('visit') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('visit')}
                  >
                    <View>到访</View>
                  </View>
                  <View
                    className={`visit_button ${isVisitMethodSelected('phone') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('phone')}
                  >
                    <View>电话</View>
                  </View>
                  <View
                    className={`visit_button ${isVisitMethodSelected('wechat') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('wechat')}
                  >
                    <View>微信</View>
                  </View>
                  <View
                    className={`visit_button ${isVisitMethodSelected('sms') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('sms')}
                  >
                    <View>短信</View>
                  </View>
                  <View
                    className={`visit_button ${isVisitMethodSelected('email') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('email')}
                  >
                    <View>邮件</View>
                  </View>
                  <View
                    className={`visit_button ${isVisitMethodSelected('qq') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('qq')}
                  >
                    <View>QQ</View>
                  </View>
                  <View
                    className={`visit_button ${isVisitMethodSelected('other') ? 'selected' : ''}`}
                    onClick={() => handleVisitMethodChange('other')}
                  >
                    <View>其他</View>
                  </View>
                </View>
              </View>

              {/* 关键词查询 */}
              <View className="filter_section">
                <View className="section_title">关键词查询</View>
                <Input
                  placeholder="输入搜索的关键词"
                  style={{ width: '100%' }}
                  value={filterKeyword}
                  onChange={setFilterKeyword}
                />
              </View>

              {/* 创建时间 */}
              <View className="filter_section" onClick={() => setIsVisible(true)}>
                <View className="section_title">创建时间</View>
                <Input
                  placeholder="选择时间范围"
                  disabled
                  style={{ width: '100%' }}
                  value={filterTimeRange}
                  onChange={setFilterTimeRange}
                />
              </View>

              {/* 操作按钮 */}
              <View className="filter_actions">
                <View className="action_button reset" onClick={handleFilterReset}>
                  重置
                </View>
                <View className="action_button confirm" onClick={handleFilterConfirm}>
                  确定
                </View>
              </View>
            </View>
          )}
        </View>
      </Popup>

      <Calendar
        visible={isVisible}
        type="range"
        onClose={() => setIsVisible(false)}
        onConfirm={handleCalendarConfirm}
      />

      {/* <View className="floating-add-btn" onClick={() => addFollow()}>
        <View className="add-icon-row"></View>
        <View className="add-icon-col"></View>
      </View> */}

      <Tabs
        value={clueFilterForm.isImportantClue ? '1' : '0'}
        onChange={val => {
          setClueFilterForm({ isImportantClue: val === '1' })
        }}
      >
        {Array.from({ length: 2 }, (_, index) => (
          <Tabs.TabPane
            key={index}
            title={index === 0 ? '线索列表' : '重要线索'}
            value={index.toString()}
          >
            <View className="cluePage_list">
              {/* <View className="cluePage_input_box">
              <View className="cluePage_input_icon">
                <Search color="#AAAAAA" size="36rpx" />
              </View>
              <Input
                className="cluePage_input"
                placeholder="搜索内容"
                style={{ width: '70%' }}
                value={searchInputValue}
                onChange={e => setSearchInputValue(e)}
                clearable={true}
                disabled={isSearchInputDisabled}
              />
              <Button className="cluePage_search_btn" onClick={e => addFollow(e)}>
                写跟进
              </Button>
            </View> */}
              <View className="seachinput_box">
                <View className="seach_icon">
                  <Search color="#AAAAAA" size="36rpx" />
                </View>
                <Input
                  className="seachinput"
                  placeholder="搜索内容"
                  style={{ width: '100%' }}
                  value={searchInputValue}
                  onChange={setSearchInputValue}
                  onClear={() => {
                    console.log('onClear')
                    if (clueFilterForm.name) {
                      const newClueFilterForm = { ...clueFilterForm }
                      delete newClueFilterForm.name
                      setClueFilterForm(newClueFilterForm)
                    }
                  }}
                  clearable={true}
                />
                <Divider direction="vertical" />
                <Text
                  className="search_text"
                  onClick={() => {
                    setClueFilterForm({
                      ...clueFilterForm,
                      name: searchInputValue
                    })
                  }}
                >
                  搜索
                </Text>
              </View>
              <ScrollView
                scrollY
                style={{
                  height: `calc(100vh - 220rpx - ${height}px)`,
                  flex: 1,
                  paddingTop: '20rpx'
                }}
                lowerThreshold={50}
                id="cluePage_scrollList"
              >
                {clueList.length > 0 ? (
                  <InfiniteLoading
                    target="cluePage_scrollList"
                    hasMore={clueHasMore}
                    onLoadMore={loadMoreCluePageList}
                    // onScroll={() => {
                    //   console.log('onScroll')
                    // }}
                    // onScrollToUpper={() => {
                    //   console.log('onScrollToUpper')
                    // }}
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
                    {clueList.map((item, index) => (
                      <View
                        className="cluePage_item"
                        // onClick={e => getFollowUpListPopup(e, item)}
                        key={index}
                      >
                        <View className="cluePage_item_top">
                          {item.logo ? (
                            // 判断是否为图片链接（包含http或https）
                            item.logo.includes('http') ? (
                              <Image src={item.logo} className="cluePage_item_Img" />
                            ) : (
                              // 如果是文字，显示文字
                              <Text
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#1B5BFF',
                                  color: '#fff',
                                  borderRadius: '8rpx',
                                  fontSize: '32rpx',
                                  textAlign: 'center',
                                  padding: '8rpx',
                                  boxSizing: 'border-box'
                                }}
                                className="cluePage_item_Img"
                              >
                                {item.logo}
                              </Text>
                            )
                          ) : (
                            // 如果为空，显示"暂无"
                            <Text
                              className="cluePage_item_Img"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#1B5BFF',
                                color: '#fff',
                                borderRadius: '8rpx',
                                fontSize: '32rpx'
                              }}
                            >
                              {filterHTMLString(item.customerCompanyName || '').slice(0, 2) ||
                                '暂无'}
                            </Text>
                          )}
                          <View className="cluePage_item_Text">
                            <View className="item_title">
                              <View
                                dangerouslySetInnerHTML={{
                                  __html: filterHTMLString(item.customerCompanyName || '')
                                }}
                              ></View>
                              <View
                                className="item_title_text"
                                onClick={e => {
                                  e.stopPropagation()
                                  handleRemove(item)
                                }}
                              >
                                移除
                                <View
                                  style={{
                                    width: '24rpx',
                                    height: '24rpx',
                                    marginLeft: '4rpx',
                                    border: '1.5rpx solid currentColor',
                                    borderRadius: '50%',
                                    position: 'relative',
                                    display: 'inline-block'
                                  }}
                                >
                                  <View
                                    style={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '4rpx',
                                      right: '4rpx',
                                      height: '1.5rpx',
                                      backgroundColor: 'currentColor',
                                      transform: 'translateY(-50%)'
                                    }}
                                  />
                                </View>
                              </View>
                            </View>
                            <View className="item_description">
                              已跟进：
                              <Text style={{ color: '#EA6835' }}>{item.followUpDays || 0}天</Text>
                            </View>
                          </View>
                        </View>
                        {/* {item.tags && item.tags.length > 0 && (
                    <View className="cluePage_item_tag">
                      {item.tags.map((tag: any, index: number) => (
                        <View className="cluePage_item_tag_item" key={index}>
                          {tag}
                        </View>
                      ))}
                    </View>
                  )} */}
                        {/* <View className="cluePage_item_product">
                      <View className={`cluePage_item_product_left${expandedProducts[index] ? ' expanded' : ''}`}>{item.businessScope ? highlightKeyword(item.businessScope, searchValueClueList || '') : '- -'}</View>
                      <View className="cluePage_item_product_right" onClick={() => setExpandedProducts(prev => ({ ...prev, [index]: !prev[index] }))}>
                        {expandedProducts[index] ? '收起' : '展开'}
                      </View>
                    </View> */}
                        <View className="cluePage_item_contact">
                          <View className="cluePage_item_contact_item">
                            <Image
                              onClick={e => {
                                e.stopPropagation()
                                handleAiResearchReport(item)
                              }}
                              src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise5.png"
                              className="cluePage_item_contact_item_img"
                            />
                          </View>
                          <View
                            className="cluePage_item_contact_item"
                            onClick={e => {
                              e.stopPropagation()
                              handleToImportantClue(item, index)
                            }}
                          >
                            转为重要线索
                          </View>
                          <View
                            onClick={e => {
                              e.stopPropagation()
                              openPhone(item)
                            }}
                            className="cluePage_item_contact_item"
                          >
                            联系方式
                          </View>
                          <View
                            onClick={e => {
                              e.stopPropagation()
                              addFollow(e, item)
                            }}
                            className="cluePage_item_contact_item_"
                          >
                            跟进
                          </View>
                        </View>
                      </View>
                    ))}
                  </InfiniteLoading>
                ) : (
                  <Empty
                    description="暂无线索"
                    image={
                      <Image
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        src="https://find-console.newgalaxyai.com/glks/assets/emptyImg.png"
                      />
                    }
                  />
                )}
              </ScrollView>
            </View>
          </Tabs.TabPane>
        ))}

        {/* <Tabs.TabPane title="历史匹配线索">
          <ScrollView
            scrollY
            style={{
              height: `calc(100vh - 120rpx - ${height}px)`,
              flex: 1
            }}
            onScrollToLower={loadMoreHistorySession}
            lowerThreshold={50}
          >
            <View className="cluePage_list">
              {historySession.map((item: any, index) => (
                <View className="history_item" key={index}>
                  <View className="history_top">
                    <View className="dot"></View>
                    <View className="time">{parseDate(item.createTime)}</View>
                  </View>
                  <View className="history_content" onClick={() => navigateToCompanyDetail(item)}>
                    <View className="history_msg">问答问题：{item.userMessage}</View>
                    <View className="history_company">
                      <View className="history_img">
                        {item.companyInfo.logo ? (
                          // 判断是否为图片链接（包含http或https）
                          item.companyInfo.logo.includes('http') ? (
                            <Image src={item.companyInfo.logo} className="history_img_img" />
                          ) : (
                            // 如果是文字，显示文字
                            <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="history_img_img">
                              {item.companyInfo.logo}
                            </Text>
                          )
                        ) : (
                          // 如果为空，显示"暂无"
                          <Text className="history_img_img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx' }}>
                            暂无
                          </Text>
                        )}
                      </View>
                      <View className="history_info">
                        <View className="info_top">
                          <View className="info_top_title">{item.companyInfo?.name || '- -'}</View>
                          <ArrowRight color="#2B2B2B" size="30rpx" />
                        </View>
                        <View className="info_msgs">
                          <View className="msgs_item">{item.companyInfo?.handleLocation || '- -'}</View>
                          <View className="msgs_tag">
                            <Image src="https://find-console.newgalaxyai.com/glks/assets/corpDetail/corpDetail21.png" className="msgs_tag_img" />
                            <View className="msgs_tag_text">官网</View>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="history_tag">
                      <View className="tag_item">{item.companyInfo?.regStatus || '未知状态'}</View>
                      {(item.companyInfo?.tags || []).map((tagItem: any, tagIndex: number) => {
                        return (
                          <View className="tag_item" key={tagIndex}>
                            {tagItem}
                          </View>
                        )
                      })}
                    </View>
                    <View className="history_tags">
                      <View className="tags_item">最匹配</View>
                      <View className="tags_item">最新</View>
                    </View>
                  </View>
                  <View className="company_total" onClick={() => handleEnterpriseList(item)}>
                    <View style={{ marginRight: '16rpx' }}>查看{item.enterpriseInfo?.total || 0}企业信息</View>
                    <ArrowRight color="#1B5BFF" size="24rpx" />
                  </View>
                </View>
              ))}
              {(!historySession || historySession.length === 0) && (
                <Empty
                  description="暂无历史记录"
                  image={
                    <Image
                      style={{
                        width: '100%',
                        height: '100%'
                      }}
                      src="https://find-console.newgalaxyai.com/glks/assets/emptyImg.png"
                    />
                  }
                />
              )}
            </View>
          </ScrollView>
        </Tabs.TabPane> */}
      </Tabs>
    </View>
  )
})

export default CluePage
