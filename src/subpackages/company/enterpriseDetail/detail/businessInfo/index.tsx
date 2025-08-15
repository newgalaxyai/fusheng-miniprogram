import React, { useState, useCallback } from 'react'
import {
  IBeaconInfo,
  useLoad,
} from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Ellipsis } from '@nutui/nutui-react-taro'
import './index.scss'
import { getBusinessInfoAPI } from '@/api/company'
import { IBusinessInfo } from '@/api/types'

function Index() {
  // 工商信息
  const [businessInfo, setBusinessInfo] = useState<IBusinessInfo | null>(null)
  // 经营范围是否展开
  const [expandedBusinessScope, setExpandedBusinessScope] = useState(false)
  // 初始化获取工商信息
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getBusinessInfoAPI({
      keyword: companyInfo.name
    }, businessInfoRes => {
      setBusinessInfo(businessInfoRes.data || null)
    })
  })

  return (
    <View className="detailPage">
      <View className="header">
        <View className="header-title">登记信息</View>
      </View>

      <View className="content">
        <View className="content-item-row">
          <View className="row-title">法定代表人</View>
          <View className="row-value" style={{ fontSize: '32rpx', color: '#426EFF' }}>
            {businessInfo?.legalPerson}
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">成立日期</View>
            <View className="row-left-value">{businessInfo?.establishTime}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">企业经营状态</View>
            <View className="row-right-value">{businessInfo?.regStatus}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">注册资本</View>
            <View className="row-left-value">{businessInfo?.regCapital}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">实缴资本</View>
            <View className="row-right-value">{businessInfo?.regCapitalForList}</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">所属行业</View>
            <View className="row-value">{businessInfo?.categoryNameLv1}</View>
          </View>
        </View>
      </View>

      <View className="content">
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">统一社会信用代码</View>
            <View className="row-left-value">{businessInfo?.creditCode}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">工商注册号</View>
            <View className="row-right-value">{businessInfo?.regNumber}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">企业类型</View>
            <View className="row-left-value">{businessInfo?.orgType}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">组织机构代码</View>
            <View className="row-right-value">{businessInfo?.orgNumber}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">参保人数</View>
            <View className="row-left-value">{businessInfo?.socialSecurityStaffNum}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">员工人数</View>
            <View className="row-right-value">{businessInfo?.socialSecurityStaffNum}</View>
          </View>
        </View>
        {/* <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">纳税人识别号</View>
            <View className="row-left-value">91440101100006899U</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">纳税人资质</View>
            <View className="row-right-value">增值税一般纳税人</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">进出口企业代码</View>
            <View className="row-left-value">12412412</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">海关注册编码</View>
            <View className="row-right-value">10000032</View>
          </View>
        </View> */}
      </View>

      <View className="content">
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">经营期限</View>
            <View className="row-value">{businessInfo?.businessTerm}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">核准日期</View>
            <View className="row-left-value">{businessInfo?.approveDate}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">登记机关</View>
            <View className="row-right-value">{businessInfo?.registerInstitute}</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">曾用名</View>
            <View className="row-value">{businessInfo?.historyNames}</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">英文名</View>
            <View className="row-value">{businessInfo?.englishName}</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">经营范围</View>
            <View className="row-value">
              <View className="expand-container">
                <View className={`expanded_left${expandedBusinessScope ? ' expanded' : ''}`}>
                  {businessInfo?.businessScope}
                </View>
                <View className="expanded_right" onClick={() => setExpandedBusinessScope(!expandedBusinessScope)}>
                  {expandedBusinessScope ? '收起' : '展开'}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* <View className="header">
        <View className="header-title">联系方式</View>
      </View>

      <View className="content">
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">联系电话</View>
            <View className="row-value" style={{ color: '#426EFF' }}>
              21312314
              <Text style={{ marginLeft: '8rpx' }}>全部5个</Text>
            </View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">联系电话</View>
            <View className="row-value" style={{ color: '#426EFF' }}>
              21312314
              <Text style={{ marginLeft: '8rpx' }}>全部5个</Text>
            </View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row">
            <View className="row-title">联系电话</View>
            <View className="row-value" style={{ color: '#426EFF' }}>
              21312314
              <Text style={{ marginLeft: '8rpx' }}>全部5个</Text>
            </View>
          </View>
        </View>
      </View> */}
    </View>
  )
}

export default Index
