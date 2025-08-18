import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Checkbox, Popup, Tabs, TextArea } from '@nutui/nutui-react-taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { Add, ArrowDown } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'
import { companyFeedbackCreateAPI, enterpriseDetailAPI } from '@/api/company'
import { clueCreateAPI, clueDeleteAPI } from '@/api/clue'
import ContactPopup from '@/components/ContactPopup'
import { IMG, ROUTE_NAME, ROUTE } from '@/constants'

function Index() {
  // 企业信息数据，提取自图片（无children）
  const [enterpriseInfo, setEnterpriseInfo] = useState([
    {
      title: ROUTE_NAME.BUSINESS_INFO,
      value: 67,
      router: ROUTE.BUSINESS_INFO,
      img: IMG.BUSINESS_INFO
    },
    {
      title: ROUTE_NAME.SHAREHOLDER_INFO,
      value: 1,
      router: ROUTE.SHAREHOLDER_INFO,
      img: IMG.SHAREHOLDER_INFO
    },
    {
      title: ROUTE_NAME.PERSONNEL_INFO,
      value: 1,
      router: ROUTE.PERSONNEL_INFO,
      img: IMG.PERSONNEL_INFO
    },
    // {
    //   title: ROUTE_NAME.CORE_PERSONNEL,
    //   value: 67,
    //   router: ROUTE.CORE_PERSONNEL,
    //   img: IMG.CORE_PERSONNEL
    // },
    // {
    //   title: ROUTE_NAME.BUSINESS_CHANGE,
    //   value: 1,
    //   router: ROUTE.BUSINESS_CHANGE,
    //   img: IMG.BUSINESS_CHANGE
    // },
    {
      title: ROUTE_NAME.ENTERPRISE_REPORT,
      value: 1,
      router: ROUTE.ENTERPRISE_REPORT,
      img: IMG.ENTERPRISE_REPORT
    },
    {
      title: ROUTE_NAME.OUTSIDE_INVESTMENT,
      value: 67,
      router: ROUTE.OUTSIDE_INVESTMENT,
      img: IMG.OUTSIDE_INVESTMENT
    },
    {
      title: ROUTE_NAME.BRANCH_OFFICE,
      value: 1,
      router: ROUTE.BRANCH_OFFICE,
      img: IMG.BRANCH_OFFICE
    },
    {
      title: ROUTE_NAME.ACTUAL_CONTROLLER,
      value: 1,
      router: ROUTE.ACTUAL_CONTROLLER,
      img: IMG.ACTUAL_CONTROLLER
    },
    // {
    //   title: ROUTE_NAME.ACTUAL_CONTROL,
    //   value: 67,
    //   router: ROUTE.ACTUAL_CONTROL,
    //   img: IMG.ACTUAL_CONTROL
    // },
    {
      title: ROUTE_NAME.DIRECT_CONTROL,
      value: 1,
      router: ROUTE.DIRECT_CONTROL,
      img: IMG.DIRECT_CONTROL
    },
    {
      title: ROUTE_NAME.BUSINESS_PUBLICITY,
      value: 1,
      router: ROUTE.BUSINESS_PUBLICITY,
      img: IMG.BUSINESS_PUBLICITY
    },
    // {
    //   title: ROUTE_NAME.COOPERATIVE_SHAREHOLDER,
    //   value: 67,
    //   router: ROUTE.COOPERATIVE_SHAREHOLDER,
    //   img: IMG.COOPERATIVE_SHAREHOLDER
    // },
    // {
    //   title: ROUTE_NAME.INDIRECT_HOLDING,
    //   value: 1,
    //   router: ROUTE.INDIRECT_HOLDING,
    //   img: IMG.INDIRECT_HOLDING
    // },
    {
      title: ROUTE_NAME.SUSPECTED_RELATION,
      value: 1,
      router: ROUTE.SUSPECTED_RELATION,
      img: IMG.SUSPECTED_RELATION
    }
    // {
    //   title: ROUTE_NAME.ENTERPRISE_PRODUCT,
    //   value: 67,
    //   router: ROUTE.ENTERPRISE_PRODUCT,
    //   img: IMG.ENTERPRISE_PRODUCT
    // },
    // {
    //   title: ROUTE_NAME.PEER_ANALYSIS,
    //   value: 1,
    //   router: ROUTE.PEER_ANALYSIS,
    //   img: IMG.PEER_ANALYSIS
    // }
  ])

  const [company, setCompany] = useState<any>({})
  const [companyDetail, setCompanyDetail] = useState<any>({
    similarCompanies: [],
    enterpriseResponses: [],
    companyHotResultResponse: []
  })
  // ==================== 弹窗显示状态 ====================
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗
  const [showBusinessIntelligence, setShowBusinessIntelligence] = useState(false) // 商机情报弹窗
  const [isShowPhone, setIsShowPhone] = useState(false) // 联系人弹窗
  const [showPopup, setShowPopup] = useState(false) // 商机情报弹窗
  const [phoneInfo, setPhoneInfo] = useState<any[]>([]) // 手机号
  const [fixedLines, setFixedLines] = useState<any[]>([]) // 固话
  const [emails, setEmails] = useState<any[]>([]) // 邮箱
  const [address, setAddress] = useState<any[]>([]) // 地址
  const [others, setOthers] = useState<any[]>([]) // 其他
  const [notDisplaying, setNotDisplaying] = useState(true) // 不显示
  const [checked, setChecked] = useState(['1']) // 地区选择弹窗高度

  const [tabValue, setTabValue] = useState(0) // 当前选中的标签页
  const [allContactInformation, setAllContactInformation] = useState(0) // 全部联系数量

  // ==================== 线索操作状态 ====================
  const [isShowAdd, setIsShowAdd] = useState(true) // 是否显示加入线索按钮
  const [dialogType, setDialogType] = useState<'add' | 'remove'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [isLiked, setIsLiked] = useState(false) // 是否已点赞
  const [isDisliked, setIsDisliked] = useState(false) // 是否已点踩
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

  // ==================== 内容展开状态 ====================
  const [expandedCompanyScale, setExpandedCompanyScale] = useState(false) // 企业规模展开状态
  const [expandedCompanyIntro, setExpandedCompanyIntro] = useState(false) // 企业简介展开状态
  const [isCompanyScaleOverflow, setIsCompanyScaleOverflow] = useState(false) // 企业规模是否超出
  const [isCompanyIntroOverflow, setIsCompanyIntroOverflow] = useState(false) // 企业简介是否超出

  // 文本元素引用
  const companyScaleRef = useRef(null)
  const companyIntroRef = useRef(null)

  // ==================== 反馈相关状态 ====================
  const [feedBackValue, setFeedBackValue] = useState('') // 反馈内容

  // 处理反馈选项变化
  const CheckedChange = (e: any) => {
    const value = e?.detail?.value || e
    setChecked(value)
  }

  // ==================== 点赞点踩处理函数 ====================
  // 处理点赞点击
  const handleLike = (e: any) => {
    e.stopPropagation()

    const newFeedbackStatus = company.hasFeedback === 0 ? 1 : 0

    companyFeedbackCreateAPI(
      {
        creditCode: company.creditCode,
        isLiked: newFeedbackStatus,
        commentContent: '有效'
      },
      res => {
        if (res.success) {
          Taro.showToast({
            title: newFeedbackStatus === 1 ? '点赞成功' : '取消点赞',
            icon: 'success',
            duration: 500
          })

          setCompany((prevCompany: any) => ({
            ...prevCompany,
            hasFeedback: newFeedbackStatus
          }))

          // 触发心跳动画（仅在点赞时）
          if (newFeedbackStatus === 1) {
            setShowHeartbeat(true)
            setTimeout(() => {
              setShowHeartbeat(false)
            }, 600)
          }
        } else {
          Taro.showToast({
            title: res.data.msg || '操作失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    )
  }

  Taro.useUnload(() => {
    Taro.eventCenter.trigger('enterpriseDetailUnload', company)
  })

  // 处理点踩点击
  const handleDislike = (e: any) => {
    e.stopPropagation()

    // 触发抖动动画
    setShowShake(true)
    setTimeout(() => {
      setShowShake(false)
    }, 500)

    // 如果已经是点踩状态，显示无效原因
    if (company.hasFeedback === 2) {
      setIsShowInvalid(true)
    } else {
      // 否则显示反馈弹窗
      setIsShowFeedback(true)
    }
  }

  // 处理提交反馈
  const handleSubmitFeedback = () => {
    if (!company?.creditCode) {
      Taro.showToast({
        title: '企业信息错误',
        icon: 'none',
        duration: 1000
      })
      return
    }

    companyFeedbackCreateAPI(
      {
        creditCode: company.creditCode,
        isLiked: 2,
        feedbackType: parseInt(checked[0]),
        commentContent: feedBackValue || '不符合我的业务'
      },
      res => {
        if (res.success) {
          Taro.showToast({
            title: '提交成功',
            icon: 'none',
            duration: 500
          })

          setCompany(prevList => ({
            ...prevList,
            hasFeedback: 2,
            commentContent: feedBackValue || '不符合我的业务'
          }))

          // 重置状态
          setFeedBackValue('')
          setIsShowFeedback(false)
        } else {
          Taro.showToast({
            title: res.data.msg || '提交失败',
            icon: 'none',
            duration: 1000
          })
        }
      }
    )
  }

  // 打开企业图谱
  const openTheEnterpriseMap = () => {
    Taro.showToast({
      title: '企业图谱暂未开放',
      icon: 'none',
      duration: 1000
    })
    // if (!company?.gid) {
    //   Taro.showToast({
    //     title: '企业信息错误',
    //     icon: 'none',
    //     duration: 1000
    //   })
    //   return
    // }
    // Taro.navigateTo({
    //   url: '/subpackages/company/enterpriseDetail/detail/mindMap/index?gid=' + company.gid
    // })
  }

  // ==================== 线索操作处理函数 ====================
  // 处理加入线索点击
  const handleAddToLeads = (e: any) => {
    e.stopPropagation()
    setDialogType('add')
    setShowCustomDialog(true)
  }

  // 处理移除线索点击
  const handleRemoveFromLeads = (e: any) => {
    e.stopPropagation()
    setDialogType('remove')
    setShowCustomDialog(true)
    // 保存当前操作的线索ID
  }

  // 处理确认弹窗
  const handleDialogConfirm = () => {
    setShowCustomDialog(false)
    if (dialogType === 'add') {
      clueCreateAPI({ unifiedSocialCreditCodes: company.creditCode }, res => {
        if (res.success) {
          setCompany((prevCompany: any) => ({
            ...prevCompany,
            isJoinClue: true
          }))

          Taro.showToast({
            title: '已添加线索',
            icon: 'none',
            duration: 500
          })
        } else {
          Taro.showToast({
            title: res.data.msg || '添加失败',
            icon: 'none',
            duration: 1000
          })
        }
      })
    } else if (dialogType === 'remove') {
      // 移除线索
      clueDeleteAPI({ unifiedSocialCreditCode: company.creditCode }, res => {
        if (res.success) {
          setCompany((prevCompany: any) => ({
            ...prevCompany,
            isJoinClue: false
          }))

          Taro.showToast({
            title: '已移除线索',
            icon: 'none',
            duration: 500
          })
        } else {
          // 失败时恢复状态
          Taro.showToast({
            title: res.data.msg || '移除失败',
            icon: 'none',
            duration: 1000
          })
        }
      })
    }
  }

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

  // 处理查看全部动态点击
  const toAllDynamic = () => {
    // Taro.showToast({ title: '企业动态暂未开放', icon: 'none' })
    console.log(companyDetail?.companyHotResultResponse)
    console.log(company.name)

    let res = { companyHotResultResponse: companyDetail?.companyHotResultResponse, name: company.name }
    Taro.navigateTo({
      url: `/subpackages/company/enterpriseDetail/detail/dynamicInfo/index?item=${JSON.stringify(res)}`
    })
  }

  // 处理查看全部风险点击
  const toAllRisk = () => {
    Taro.showToast({ title: '企业风险暂未开放', icon: 'none' })

    // let res = { enterpriseResponses: companyDetail?.enterpriseResponses, name: company.name }
    // Taro.navigateTo({
    //   url: `/subpackages/company/enterpriseDetail/detail/scanInfo/index?item=${JSON.stringify(res)}`
    // })
  }

  // 处理取消弹窗
  const handleDialogCancel = () => {
    setShowCustomDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
    })
  }

  function openWebsite(val) {
    Taro.setClipboardData({
      data: val,
      success: () => {
        Taro.showToast({
          title: '已将公司地址复制到剪贴板',
          icon: 'none',
          duration: 500
        })
      }
    })
  }

  // ==================== 恢复操作处理函数 ====================
  // 处理恢复确认
  const handleRestoreConfirm = () => {
    companyFeedbackCreateAPI(
      {
        creditCode: company?.creditCode || '',
        isLiked: 0,
        commentContent: ''
      },
      res => {
        if (res.success) {
          setShowRestoreDialog(false)
          setIsShowInvalid(false)
          Taro.showToast({
            title: '恢复成功',
            icon: 'none',
            duration: 500
          })
          setCompany(prevList => ({
            ...prevList,
            hasFeedback: 0,
            commentContent: ''
          }))
        }
      }
    )
  }
  // 处理恢复取消
  const handleRestoreCancel = () => {
    setShowRestoreDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
    })
  }

  // ==================== 反馈处理函数 ====================
  // 处理反馈内容变化
  const changeTextArea = useCallback((value: string) => {
    setFeedBackValue(value)
  }, [])

  function toAiResearchReport(): void {
    Taro.navigateTo({
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}&companyParameter=${company.enterpriseAnalysisBack}`
    })
  }

  // ==================== 检测文本溢出函数 ====================
  const checkTextOverflow = useCallback(() => {
    // 检测企业规模是否溢出
    if (companyScaleRef.current) {
      const element = companyScaleRef.current as HTMLElement
      const isOverflow = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
      setIsCompanyScaleOverflow(isOverflow)
    }

    // 检测企业简介是否溢出
    if (companyIntroRef.current) {
      const element = companyIntroRef.current as HTMLElement
      const isOverflow = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
      setIsCompanyIntroOverflow(true)
    }
  }, [])

  // 监听公司数据变化，重新检测溢出
  useEffect(() => {
    if (company && (company.scale || company.businessScope)) {
      // 延迟检测，确保DOM已渲染
      setTimeout(() => {
        checkTextOverflow()
      }, 100)
    }
  }, [company, checkTextOverflow])

  Taro.useLoad(options => {
    setNotDisplaying(options && options.notDisplaying ? Boolean(options.notDisplaying) : false)
    let res = JSON.parse(options.company)
    console.log(res)

    // 统计联系方式总数
    const totalCount = Object.values(res.contactInfo || {}).reduce<number>((sum, arr: any) => {
      return sum + (Array.isArray(arr) ? arr.length : 0)
    }, 0)
    setPhoneInfo(res.contactInfo?.phones || [])
    setEmails(res.contactInfo?.emails || [])
    setFixedLines(res.contactInfo?.fixedLines || [])
    setAddress(res.contactInfo?.address || [])
    setOthers(res.contactInfo?.others || [])
    setAllContactInformation(totalCount)
    Taro.showLoading({
      title: '正在加载企业详情',
      mask: true
    })
    enterpriseDetailAPI({ gid: res.gid, pageNum: 1, pageSize: 3 }, res => {
      if (res.success) {
        setCompanyDetail(res.data)
        Taro.hideLoading()
      } else {
        Taro.hideLoading()
      }
    })
    setCompany(res)
  })

  return (
    <View className="searchEnterprisePage" style={showPopup ? { position: 'fixed', width: '100%', top: 0, left: 0 } : {}}>
      {/* 自定义弹窗 */}
      <CustomDialog visible={showCustomDialog} title={dialogType === 'add' ? '您确定要将该线索匹配吗？' : '您确定要将该线索移除线索池吗？'} content={dialogType === 'add' ? '标记后会自动转入线索池哦～' : '移除后会自动消失线索池，请谨慎操作'} onConfirm={handleDialogConfirm} onCancel={handleDialogCancel} />

      {/* 恢复弹窗 */}
      <CustomDialog visible={showRestoreDialog} title="您确定要恢复该线索吗？" content="恢复后该线索可以重新选择匹配与不匹配" onConfirm={handleRestoreConfirm} onCancel={handleRestoreCancel} />

      {/* 无效线索原因 */}
      <Popup position="bottom" style={{ height: '50%' }} visible={isShowInvalid} onClose={() => setIsShowInvalid(false)}>
        <View className="popup_header">
          <View className="popup_header_title">无效线索原因</View>
          <Image onClick={() => setIsShowInvalid(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="invalid_content">{company.commentContent || '与我的业务无关'}</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
        </View>
      </Popup>

      {/* 反馈 */}
      <Popup position="bottom" style={{ maxHeight: '95%', minHeight: '95%' }} visible={isShowFeedback} onClose={() => setIsShowFeedback(false)}>
        <View className="popup_header">
          <View className="popup_header_title" style={{ fontSize: '40rpx', color: '#333333', textAlign: 'left', paddingLeft: '24rpx' }}>
            反馈-不匹配/不合适
          </View>
          <Image onClick={() => setIsShowFeedback(false)} src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png" className="popup_header_img" />
        </View>
        <View className="feedBack_content">
          <Checkbox.Group defaultValue={['1']} value={checked} style={{ width: '100%', padding: '24rpx', boxSizing: 'border-box' }} onChange={CheckedChange}>
            <Checkbox value="1" label="产品不匹配" />
            <Checkbox value="2" label="公司与信息匹配不上" />
            <Checkbox value="3" label="公司类型错误" />
            <Checkbox value="4" label="贸易公司" />
            <Checkbox value="5" label="公司经营问题" />
          </Checkbox.Group>
          <View className="feedBack_content_footer">
            <View className="feedBack_content_footer_text">其他原因（选填）</View>
            <View className="feedBack_content_footer_input">
              <TextArea cursorSpacing={100} value={feedBackValue} onChange={changeTextArea} placeholder="请输入备注" autoSize maxLength={500} showCount={false} adjustPosition={true} />
            </View>
          </View>
          <View className="feedBack_content_footer_text">您的反馈有助于我们改进数据更精准</View>
          <View className="feedBack_content_footer_bottom">
            <View className="feedBack_cancel" onClick={() => setIsShowFeedback(false)}>
              取消
            </View>
            <View className="feedBack_submit" onClick={() => handleSubmitFeedback()}>
              提交反馈
            </View>
          </View>
        </View>
      </Popup>

      {/* 联系人 */}
      <ContactPopup
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
      />

      <View className="enterpriseContent_item">
        <View className="enterpriseContent_item_top">
          {company.logo ? (
            // 判断是否为图片链接（包含http或https）
            company.logo.includes('http') ? (
              <Image src={company.logo} className="enterpriseContent_item_Img" />
            ) : (
              // 如果是文字，显示文字
              <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="enterpriseContent_item_Img">
                {company.logo}
              </Text>
            )
          ) : (
            // 如果为空，显示"暂无"
            <Text className="enterpriseContent_item_Img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx' }}>
              暂无
            </Text>
          )}
          <View className="enterpriseContent_item_Text">
            <View className="title">{company.name}</View>
            <View className="enterpriseContent_item_tag">
              <View className="enterpriseContent_item_tag_item">{company.regStatus}</View>
              {company.tags?.map((item: any, index: number) => {
                // 过滤掉"曾用名"标签
                if (item === '曾用名') return null
                return (
                  <View key={index} className="enterpriseContent_item_tag_item">
                    {item}
                  </View>
                )
              })}
            </View>
          </View>
        </View>
        <View className="enterpriseContent_item_info">
          <View className="enterpriseContent_item_info_item">
            <View style={{ justifyContent: 'flex-start' }} className="enterpriseContent_item_info_item_title">
              法定代表人
            </View>
            <View style={{ color: '#3094FF', justifyContent: 'flex-start' }} className="enterpriseContent_item_info_item_value">
              {company.legalPerson}
            </View>
          </View>
          <View className="enterpriseContent_item_info_item">
            <View className="enterpriseContent_item_info_item_title">注册资本</View>
            <View className="enterpriseContent_item_info_item_value">{company.regCapital}</View>
          </View>
          <View className="enterpriseContent_item_info_item">
            <View style={{ justifyContent: 'flex-end' }} className="enterpriseContent_item_info_item_title">
              成立日期
            </View>
            <View style={{ justifyContent: 'flex-end' }} className="enterpriseContent_item_info_item_value">
              {company.establishTime}
            </View>
          </View>
        </View>

        {/* <View className="enterpriseContent_item_product">
          <View ref={companyScaleRef} className={`enterpriseContent_item_product_left${expandedCompanyScale ? ' expanded' : ''}`}>
            企业规模：<Text style={{ color: '#7B7B7B' }}>{company.companyScaleInfo}</Text>
          </View>
          {isCompanyScaleOverflow && (
            <View className="enterpriseContent_item_product_right" onClick={() => setExpandedCompanyScale(!expandedCompanyScale)}>
              {expandedCompanyScale ? '收起' : '展开'}
            </View>
          )}
        </View> */}

        <View className="enterpriseContent_item_product">
          <View ref={companyIntroRef} className={`enterpriseContent_item_product_left${expandedCompanyIntro ? ' expanded' : ''}`}>
            企业简介：<Text style={{ color: '#7B7B7B' }}>{company.businessScope}</Text>
          </View>
          {isCompanyIntroOverflow && (
            <View className="enterpriseContent_item_product_right" onClick={() => setExpandedCompanyIntro(!expandedCompanyIntro)}>
              {expandedCompanyIntro ? '收起' : '展开'}
            </View>
          )}
        </View>

        <View className="enterpriseContent_item_product_phone">
          <View className="phone_left">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail20.png" className="phone_left_img" />
            <View className="phone_text" onClick={() => Taro.makePhoneCall({ phoneNumber: phoneInfo[0] })}>
              {phoneInfo[0]}
            </View>
            <View className="phone_more" onClick={() => setIsShowPhone(true)}>
              全部{allContactInformation}
            </View>
          </View>
          <View className="phone_right">
            <View className="phone_right_item" onClick={() => openWebsite(company.websites)}>
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail21.png" className="phone_right_img" />
              <View className="phone_right_text">官网</View>
            </View>
            <View className="phone_right_item">
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail22.png" className="phone_right_img" />
              <View className="phone_right_text">邮箱</View>
            </View>
            <View className="phone_right_item">
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail23.png" className="phone_right_img" />
              <View className="phone_right_text">产品应用</View>
            </View>
          </View>
        </View>

        <View className="enterpriseContent_item_product_phone">
          <View className="phone_left">
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail24.png" className="phone_left_img" />
            <View className="phone_more">{company.location}</View>
          </View>
        </View>

        <Image onClick={() => toAiResearchReport()} src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail18.png" className="enterpriseContent_Img" />
      </View>

      {/* 智能分析结果 */}
      {company.score && (
        <View className="analysis">
          <View className="analysis_content">
            <View className="analysis_top">
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail25.png" className="analysis_top_Img" />
              <View className="analysis_top_left">
                匹配度：<Text className="analysis_top_left_text">{Math.floor(company.score)}%</Text>
              </View>
              <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail19.png" className="analysis_top_leftImg" />
            </View>
            <View className="analysis_bottom">
              <View className="analysis_bottom_item">
                产品匹配度：<Text style={{ color: '#629EE7' }}>{company.productMatch}%</Text>
              </View>
              <View className="analysis_bottom_item">
                合作风险：<Text style={{ color: '#629EE7' }}>{company.riskLevel}%</Text>
              </View>
              <View className="analysis_bottom_item">
                市场潜力：<Text style={{ color: '#629EE7' }}>{company.marketPotential}%</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 商机情报 */}
      {/* <View
        className="business_intelligence"
        onClick={() => {
          setShowBusinessIntelligence(true)
          setShowPopup(true)
        }}
      >
        <View className="business_intelligence_title">商机情报</View>
        <View className="business_intelligence_content">
          <View className="businessItem">
            主营产品：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            涉足企业：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            关键词分析：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            招标/中标：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <View className="businessItem">
            企业商品：<Text style={{ color: '#DD9A43' }}>29</Text>
          </View>
          <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail19.png" className="business_intelligence_content_img" />
        </View>
      </View> */}

      {/* 商机情报弹窗 */}
      <Popup
        position="bottom"
        style={{ maxHeight: '95%', minHeight: '60%' }}
        visible={showBusinessIntelligence}
        onClose={() => {
          setShowBusinessIntelligence(false)
          setShowPopup(false)
        }}
      >
        <View className="popup_header">
          <View className="popup_header_title">商机情报</View>
          <Image
            onClick={() => {
              setShowBusinessIntelligence(false)
              setShowPopup(false)
            }}
            src="http://36.141.100.123:10013/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
        </View>
        <View className="business_intelligence_popup_content">
          <View className="businessItem">主营产品 32</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <View className="tag">扇线电机</View>
              <View className="tag">风力发电电机</View>
              <View className="tag">汽车发动机</View>
              <View className="tag">汽车发电机</View>
              <View className="tag">扇线电机</View>
              <View className="tag">风力发电电机</View>
              <View className="tag">汽车发动机</View>
              <View className="tag">汽车发电机</View>
            </View>
          </ScrollView>
          <View className="businessItem">涉足产业 32</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <View className="enterprise_graph_content_item">
                <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
                <View className="enterprise_graph_content_item_text">企业图谱</View>
              </View>
              <View className="enterprise_graph_content_item">
                <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
                <View className="enterprise_graph_content_item_text">企业图谱</View>
              </View>
              <View className="enterprise_graph_content_item">
                <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
                <View className="enterprise_graph_content_item_text">企业图谱</View>
              </View>
            </View>
          </ScrollView>
          <View className="businessItem">招标/中标 32</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <Text className="tag_blue">中标方 872</Text>
              <Text className="tag_blue">招标方 876</Text>
              <Text className="tag_blue">代理方 0</Text>
              <Text className="tag_blue">候选人 0</Text>
            </View>
          </ScrollView>
          <View className="businessItem">企业商品 0</View>
          <ScrollView scrollX>
            <View className="businessItem-tags">
              <Text className="tag_blue">中标方 872</Text>
              <Text className="tag_blue">招标方 876</Text>
              <Text className="tag_blue">代理方 0</Text>
              <Text className="tag_blue">候选人 0</Text>
            </View>
          </ScrollView>
        </View>
      </Popup>

      {/* 风险扫描 */}
      <View className="risk_scan">
        <View className="risk_scan_title">风险扫描</View>
        <View className="risk_scan_content">
          {companyDetail?.enterpriseResponses?.map((item: any, index: any) => (
            <View className="risk_scan_content_item" onClick={toAllRisk} key={index}>
              <View className="risk_scan_content_item_title">
                {item?.name} <Text className="texts">{item?.count}</Text>
              </View>
              <View className="risk_scan_content_item_content">{item?.details?.[0]?.title}</View>
            </View>
          ))}
        </View>
      </View>

      {/* 企业动态 */}
      <View className="enterprise_dynamic">
        <View className="enterprise_dynamic_title">企业动态</View>
        <View className="enterprise_dynamic_content">
          <View className="enterprise_dynamic_content_one">{companyDetail.companyHotResultResponse?.companyHotRequestList?.[0]?.rtm ? formatTimestamp(companyDetail.companyHotResultResponse.companyHotRequestList[0].rtm) : '--'}</View>
          <View className="enterprise_dynamic_content_two">{companyDetail.companyHotResultResponse?.companyHotRequestList?.[0]?.title || '--'}</View>
          <View className="enterprise_dynamic_content_three">
            该企业存在 <Text style={{ color: '#629EE7' }}>{companyDetail.companyHotResultResponse?.realTotal || 0}条</Text> 相关动态{' '}
            <Text style={{ color: '#1B5BFF' }} onClick={toAllDynamic}>
              查看全部
            </Text>
          </View>
        </View>
      </View>

      {/* 企业图谱 */}
      <View className="enterprise_graph">
        <View className="enterprise_graph_title">企业图谱</View>
        <View className="enterprise_graph_content">
          <View className="enterprise_graph_content_item" onClick={openTheEnterpriseMap}>
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail17.png" className="enterprise_graph_content_item_img" />
            <View className="enterprise_graph_content_item_text">企业图谱</View>
          </View>
        </View>
      </View>

      {/* 基本信息 */}
      <View className="enterprise_info">
        <View className="enterprise_info_title">基本信息</View>
        <View className="enterprise_info_content">
          {enterpriseInfo.map((item, index) => (
            <View className="enterprise_info_content_item" onClick={() => Taro.navigateTo({ url: item.router + `?company=${JSON.stringify({ ...company })}` })} key={index}>
              <View className="enterprise_info_content_item_title">{item.title}</View>
              <View className="enterprise_info_content_item_value">点击查看</View>
              <Image src={item.img} className="info_Img" />
            </View>
          ))}
        </View>
      </View>

      {/* 同行企业 */}
      <View className="enterprise_peer">
        <View className="peer_title">
          同行企业
          <View className="peer_title_right" onClick={() => Taro.navigateTo({ url: '/subpackages/company/enterpriseDetail/detail/peerInfo/index?list=' + JSON.stringify(companyDetail.similarCompanies) })}>
            <Text className="peer_title_right_text">查看更多</Text>
            <Image src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail19.png" className="peer_title_right_img" />
          </View>
        </View>
        <View className="peer_content">
          {companyDetail.similarCompanies.slice(0, 3).map((item: any, simIndex: number) => {
            return (
              <View className="peer_content_item" key={simIndex}>
                <View className="peer_content_item_top">
                  {item.logo ? (
                    // 判断是否为图片链接（包含http或https）
                    item.logo.includes('http') ? (
                      <Image src={item.logo} className="peer_content_item_img" />
                    ) : (
                      // 如果是文字，显示文字
                      <Text style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx', textAlign: 'center', padding: '8rpx', boxSizing: 'border-box' }} className="peer_content_item_img">
                        {item.logo}
                      </Text>
                    )
                  ) : (
                    // 如果为空，显示"暂无"
                    <Text className="peer_content_item_img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1B5BFF', color: '#fff', borderRadius: '8rpx', fontSize: '32rpx' }}>
                      暂无
                    </Text>
                  )}
                  <View className="peer_content_item_text">{item.name}</View>
                </View>
                <View className="peer_content_item_bottom">主营：{item.alias}</View>
              </View>
            )
          })}
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View className="enterpriseContent_item_bottom">
        <View className="enterpriseContent_item_bottom_left">
          {(company.hasFeedback === 0 || company.hasFeedback === 1) && (
            <View onClick={e => handleLike(e)} className={`enterpriseContent_item_bottom_left_good ${company.hasFeedback === 1 ? 'liked' : ''} ${showHeartbeat ? 'heartbeat' : ''}`}>
              <Image src={company.hasFeedback === 1 ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise6.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise8.png'} className="enterpriseContent_item_bottom_left_good_img" />
              <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
            </View>
          )}
          {(company.hasFeedback === 0 || company.hasFeedback === 2) && (
            <View onClick={e => handleDislike(e)} className={`enterpriseContent_item_bottom_left_bad ${company.hasFeedback === 2 ? 'disliked' : ''} ${showShake ? 'shake' : ''}`}>
              <Image src={company.hasFeedback === 2 ? 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise7.png' : 'http://36.141.100.123:10013/glks/assets/enterprise/enterprise9.png'} className="enterpriseContent_item_bottom_left_bad_img" />
              <Text className="enterpriseContent_item_bottom_left_bad_text">无效线索</Text>
              {company.hasFeedback === 2 && <ArrowDown color="#8E8E8E" style={{ width: '28rpx', height: '28rpx', marginLeft: '6rpx' }} />}
            </View>
          )}
        </View>
        {/* 获取当前线索的状态，默认为 true（显示加入线索按钮） */}
        {!company.isJoinClue ? (
          <View onClick={e => handleAddToLeads(e)} className="enterpriseContent_item_bottom_right">
            <Add color="#fff" style={{ marginRight: '12rpx', width: '32rpx', height: '32rpx' }} />
            <Text className="enterpriseContent_item_bottom_right_add_text">加入线索</Text>
          </View>
        ) : (
          <View onClick={e => handleRemoveFromLeads(e)} className="remove">
            <Text className="remove_text">移除</Text>
            <View className="remove_icon"></View>
          </View>
        )}
      </View>
    </View>
  )
}

export default Index
