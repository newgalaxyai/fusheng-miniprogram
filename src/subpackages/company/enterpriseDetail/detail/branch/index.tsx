import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Checkbox, Popup, Tabs, TextArea } from '@nutui/nutui-react-taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { Add, ArrowDown, ArrowRightSize6 } from '@nutui/icons-react-taro'
import Taro from '@tarojs/taro'
import './index.scss'
import CustomDialog from '@/components/CustomDialog'
import { companyFeedbackCreateAPI, enterpriseDetailAPI } from '@/api/company'
import { getCompanyWebNewsListApi } from '@/api/company'
import { clueCreateAPI, clueDeleteAPI } from '@/api/clue'
import ContactPopup from '@/components/ContactPopup'
import { useAppSelector } from '@/hooks/useAppStore'

function Index() {
  const {
    login: { userInfo }
  } = useAppSelector(state => state)
  const [company, setCompany] = useState<any>({})
  const [companyDetail, setCompanyDetail] = useState<any>({
    similarCompanies: [],
    enterpriseResponses: [],
    companyHotResultResponse: [],
    newsList: [],
    newsListTotal: 0
  })
  // ==================== 弹窗显示状态 ====================
  const [isShowFeedback, setIsShowFeedback] = useState(false) // 反馈弹窗
  const [isShowInvalid, setIsShowInvalid] = useState(false) // 无效线索原因弹窗
  const [showCustomDialog, setShowCustomDialog] = useState(false) // 自定义确认弹窗
  const [showRestoreDialog, setShowRestoreDialog] = useState(false) // 恢复确认弹窗
  const [checked, setChecked] = useState(['1']) // 地区选择弹窗高度

  // ==================== 线索操作状态 ====================
  const [dialogType, setDialogType] = useState<'add' | 'remove'>('add') // 弹窗类型：添加/移除

  // ==================== 点赞点踩状态 ====================
  const [showHeartbeat, setShowHeartbeat] = useState(false) // 心跳动画状态
  const [showShake, setShowShake] = useState(false) // 抖动动画状态

  // ==================== 内容展开状态 ====================
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
    console.log('useUnload')
    Taro.eventCenter.trigger('enterpriseDetailUnload', company)
    Taro.eventCenter.trigger('enterpriseDetailUnloadAi', company)
  })

  Taro.useDidHide(() => {
    console.log('useDidHide')
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
      clueCreateAPI({
        companyInfos: [
          {
            unifiedSocialCreditCode: company.creditCode,
            name: company.name
          }
        ],
        userId: userInfo?.id!,
        source: '小程序'
      }).then(res => {
        if (res.code === 0) {
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
            title: res.msg || '添加失败',
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

  // 处理取消弹窗
  const handleDialogCancel = () => {
    setShowCustomDialog(false)
    Taro.showToast({
      title: '已取消',
      icon: 'none',
      duration: 500
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
      url: `/subpackages/company/aiResearchReport/index?creditCode=${company.creditCode}&companyParameter=${company.enterpriseAnalysisBack}&name=${company.name}`
    })
  }

  // ==================== 检测文本溢出函数 ====================
  const checkTextOverflow = useCallback(() => {
    // 检测企业规模是否溢出
    if (companyScaleRef.current) {
      const element = companyScaleRef.current as HTMLElement
      const isOverflow =
        element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
      setIsCompanyScaleOverflow(isOverflow)
    }

    // 检测企业简介是否溢出
    if (companyIntroRef.current) {
      const element = companyIntroRef.current as HTMLElement
      const isOverflow =
        element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
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
    console.log(options)

    let res = JSON.parse(options.item || '{}')

    Taro.showLoading({
      title: '正在加载分支机构',
      mask: true
    })
    enterpriseDetailAPI({ gid: res.gid, pageNum: 1, pageSize: 3 }, item => {
      if (item.success) {
        getCompanyWebNewsListApi({ gid: res.gid, pageNum: 1, pageSize: 3 }, val => {
          if (val.success) {
            setCompanyDetail({
              ...item.data,
              newsList: val.data.list || [],
              newsListTotal: val.data.total
            })
          }
        })
        Taro.hideLoading()
      } else {
        Taro.hideLoading()
      }
    })

    setCompany(res)
  })

  return (
    <View className="searchEnterprisePage">
      {/* 自定义弹窗 */}
      <CustomDialog
        visible={showCustomDialog}
        title={dialogType === 'add' ? '您确定要将该线索匹配吗？' : '您确定要将该线索移除线索池吗？'}
        content={
          dialogType === 'add' ? '标记后会自动转入线索池哦～' : '移除后会自动消失线索池，请谨慎操作'
        }
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />

      {/* 恢复弹窗 */}
      <CustomDialog
        visible={showRestoreDialog}
        title="您确定要恢复该线索吗？"
        content="恢复后该线索可以重新选择匹配与不匹配"
        onConfirm={handleRestoreConfirm}
        onCancel={handleRestoreCancel}
      />

      {/* 无效线索原因 */}
      <Popup
        position="bottom"
        style={{ height: '50%' }}
        visible={isShowInvalid}
        onClose={() => setIsShowInvalid(false)}
      >
        <View className="popup_header">
          <View className="popup_header_title">无效线索原因</View>
          <Image
            onClick={() => setIsShowInvalid(false)}
            src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
        </View>
        <View className="invalid_content">{company.commentContent || '与我的业务无关'}</View>
        <View onClick={() => setShowRestoreDialog(true)} className="invalid_content_button">
          恢复
        </View>
      </Popup>

      {/* 反馈 */}
      <Popup
        position="bottom"
        style={{ maxHeight: '95%', minHeight: '95%' }}
        visible={isShowFeedback}
        onClose={() => setIsShowFeedback(false)}
      >
        <View className="popup_header">
          <View
            className="popup_header_title"
            style={{ fontSize: '40rpx', color: '#333333', textAlign: 'left', paddingLeft: '24rpx' }}
          >
            反馈-不匹配/不合适
          </View>
          <Image
            onClick={() => setIsShowFeedback(false)}
            src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
        </View>
        <View className="feedBack_content">
          <Checkbox.Group
            defaultValue={['1']}
            value={checked}
            style={{ width: '100%', padding: '24rpx', boxSizing: 'border-box' }}
            onChange={CheckedChange}
          >
            <Checkbox value="1" label="产品不匹配" />
            <Checkbox value="2" label="公司与信息匹配不上" />
            <Checkbox value="3" label="公司类型错误" />
            <Checkbox value="4" label="贸易公司" />
            <Checkbox value="5" label="公司经营问题" />
          </Checkbox.Group>
          <View className="feedBack_content_footer">
            <View className="feedBack_content_footer_text">其他原因（选填）</View>
            <View className="feedBack_content_footer_input">
              <TextArea
                cursorSpacing={100}
                value={feedBackValue}
                onChange={changeTextArea}
                placeholder="请输入备注"
                autoSize
                maxLength={500}
                showCount={false}
                adjustPosition={true}
              />
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

      <View className="enterpriseContent_item">
        <View className="enterpriseContent_item_top">
          {company.logo ? (
            // 判断是否为图片链接（包含http或https）
            company.logo.includes('http') ? (
              <Image src={company.logo} className="header-company-logo" />
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
                  fontSize: '16rpx',
                  textAlign: 'center',
                  padding: '8rpx',
                  boxSizing: 'border-box'
                }}
                className="header-company-logo"
              >
                {company.logo}
              </Text>
            )
          ) : (
            // 如果为空，显示"暂无"
            <Text
              className="header-company-logo"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1B5BFF',
                color: '#fff',
                borderRadius: '8rpx',
                fontSize: '16rpx'
              }}
            >
              暂无
            </Text>
          )}
          {/* <View className="header-company-logo">
            <Image src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise11.png" className="header-company-logo-img" />
          </View> */}
          <View className="header-company-name">{company.name}</View>
          <ArrowRightSize6 color="#333" size={'24rpx'} />
        </View>
      </View>

      {/* 同行企业 */}
      <View className="enterprise_peer">
        <View className="peer_title">
          同行企业
          <View
            className="peer_title_right"
            onClick={() =>
              Taro.navigateTo({
                url:
                  '/subpackages/company/enterpriseDetail/detail/peerInfo/index?list=' +
                  JSON.stringify(companyDetail.similarCompanies)
              })
            }
          >
            <Text className="peer_title_right_text">查看更多</Text>
            <Image
              src="https://find-console.newgalaxyai.com/glks/assets/corpDetail/corpDetail19.png"
              className="peer_title_right_img"
            />
          </View>
        </View>
        <View className="peer_content">
          {companyDetail?.similarCompanies?.length > 0 &&
            companyDetail?.similarCompanies?.slice(0, 3).map((item: any, simIndex: number) => {
              return (
                <View className="peer_content_item" key={simIndex}>
                  <View className="peer_content_item_top">
                    {item.logo ? (
                      // 判断是否为图片链接（包含http或https）
                      item.logo.includes('http') ? (
                        <Image src={item.logo} className="peer_content_item_img" />
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
                          className="peer_content_item_img"
                        >
                          {item.logo}
                        </Text>
                      )
                    ) : (
                      // 如果为空，显示"暂无"
                      <Text
                        className="peer_content_item_img"
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
      {company.regStatus != 'null' && (
        <View className="enterpriseContent_item_bottom">
          <View className="enterpriseContent_item_bottom_left">
            {(company.hasFeedback === 0 || company.hasFeedback === 1) && (
              <View
                onClick={e => handleLike(e)}
                className={`enterpriseContent_item_bottom_left_good ${
                  company.hasFeedback === 1 ? 'liked' : ''
                } ${showHeartbeat ? 'heartbeat' : ''}`}
              >
                <Image
                  src={
                    company.hasFeedback === 1
                      ? 'https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise6.png'
                      : 'https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise8.png'
                  }
                  className="enterpriseContent_item_bottom_left_good_img"
                />
                <Text className="enterpriseContent_item_bottom_left_good_text">有效</Text>
              </View>
            )}
            {(company.hasFeedback === 0 || company.hasFeedback === 2) && (
              <View
                onClick={e => handleDislike(e)}
                className={`enterpriseContent_item_bottom_left_bad ${
                  company.hasFeedback === 2 ? 'disliked' : ''
                } ${showShake ? 'shake' : ''}`}
              >
                <Image
                  src={
                    company.hasFeedback === 2
                      ? 'https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise7.png'
                      : 'https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise9.png'
                  }
                  className="enterpriseContent_item_bottom_left_bad_img"
                />
                <Text className="enterpriseContent_item_bottom_left_bad_text">无效线索</Text>
                {company.hasFeedback === 2 && (
                  <ArrowDown
                    color="#8E8E8E"
                    style={{ width: '28rpx', height: '28rpx', marginLeft: '6rpx' }}
                  />
                )}
              </View>
            )}
          </View>
          {/* 获取当前线索的状态，默认为 true（显示加入线索按钮） */}
          {!company.isJoinClue ? (
            <View
              onClick={e => handleAddToLeads(e)}
              className="enterpriseContent_item_bottom_right"
            >
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
      )}
    </View>
  )
}

export default Index
