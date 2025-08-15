import React, { useState, useCallback } from 'react'
import { useLoad } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {} from '@nutui/nutui-react-taro'
import './index.scss'
import { getAnnualReportDetailAPI } from '@/api/company'
import { IAnnualReportDetail, ISocialSecurityInfo } from '@/api/types'

function Index() {
  // 年报详情
  const [annualDetail, setAnnualDetail] = useState<IAnnualReportDetail | null>(null)
  // 初始化获取年报详情
  useLoad(params => {
    const { annual } = params
    const annualInfo = JSON.parse(annual)
    getAnnualReportDetailAPI(
      {
        gid: annualInfo.gid,
        reportId: annualInfo.reportId
        // gid: 47183021,
        // reportId: 4706205343
      },
      annualDetailRes => {
        if (typeof annualDetailRes.data?.reportSocialSecurityInfo === 'string') {
          annualDetailRes.data.reportSocialSecurityInfo = JSON.parse(annualDetailRes.data.reportSocialSecurityInfo) as ISocialSecurityInfo
        }
        setAnnualDetail(annualDetailRes.data || null)
      }
    )
  })

  return (
    <View className="detailPage">
      <View className="header">
        <View className="header-title">基本信息</View>
      </View>
      <View className="content">
        <View className="content-item-row">
          <View className="row-title">企业名称</View>
          <View className="row-value" style={{ fontSize: '32rpx', color: '#426EFF' }}>
            {annualDetail?.baseInfo.companyName}
          </View>
        </View>
        <View className="content-item-row">
          <View className="row-title">统一社会信用代码</View>
          <View className="row-value">{annualDetail?.baseInfo.creditCode}</View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">企业经营状态</View>
            <View className="row-left-value">{annualDetail?.baseInfo.manageState}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">从业人数</View>
            <View className="row-right-value">{annualDetail?.baseInfo.employeeNum}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">企业联系电话</View>
            <View className="row-left-value">{annualDetail?.baseInfo.phoneNumber}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">企业通信地址</View>
            <View className="row-right-value">{annualDetail?.baseInfo.postalAddress}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">企业电子邮箱</View>
            <View className="row-left-value">{annualDetail?.baseInfo.email}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">邮政编码</View>
            <View className="row-right-value">{annualDetail?.baseInfo.postcode}</View>
          </View>
        </View>
      </View>

      <View className="header">
        <View className="header-title">股东及出资信息</View>
      </View>
      <View className="shareholder-list">
        {annualDetail?.shareholderList.map((shareholder, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              <View className={'avatar ' + (shareholder.investorName.length >= 4 ? 'avatar-4' : 'avatar-1')}>{shareholder.investorName.length >= 4 ? shareholder.investorName.slice(0, 4) : shareholder.investorName[0]}</View>
              <View className="info">
                <View className="name-row">
                  <Text className="name">{shareholder.investorName}</Text>
                  {/* <View className="relation" onClick={() => Taro.navigateTo({ url: '/subpackages/company/enterpriseDetail/detail/enterpriseManagement/index' })}>
                    <Text>关联6家企业</Text>
                    <ArrowRightSmall color="#1F55FF" size={'30rpx'} />
                  </View> */}
                </View>
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">认缴出资额</Text>
                  <Text className="value">{shareholder.subscribeAmount || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">认缴出资日期</Text>
                  <Text className="value">{shareholder.subscribeTime || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">实缴出资额</Text>
                  <Text className="value">{shareholder.paidAmount || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">实缴出资日期</Text>
                  <Text className="value">{shareholder.paidTime || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">实缴出资方式</Text>
                  <Text className="value">{shareholder.paidType || '--'}</Text>
                </View>
              </View>
            </View>
            <View className="card-footer">{idx + 1}</View>
          </View>
        ))}
      </View>

      <View className="header">
        <View className="header-title">企业资产状况信息</View>
      </View>
      <View className="content">
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">资产总额</View>
            <View className="row-left-value">{annualDetail?.baseInfo.totalAssets}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">所有者权益合计</View>
            <View className="row-right-value">{annualDetail?.baseInfo.totalEquity}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">销售总额</View>
            <View className="row-left-value">{annualDetail?.baseInfo.totalSales}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">利润总额</View>
            <View className="row-right-value">{annualDetail?.baseInfo.totalProfit}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">纳税总额</View>
            <View className="row-left-value">{annualDetail?.baseInfo.totalTax}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">负债总额</View>
            <View className="row-right-value">{annualDetail?.baseInfo.totalLiability}</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row-title">净利润</View>
          <View className="row-value">{annualDetail?.baseInfo.retainedProfit}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">营业总收入中主营业务收入</View>
          <View className="row-value">{annualDetail?.baseInfo.primeBusProfit}</View>
        </View>
      </View>

      <View className="header">
        <View className="header-title">社保信息</View>
      </View>
      <View className="content">
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">城镇职工基本养老保险</View>
            <View className="row-left-value">{annualDetail?.reportSocialSecurityInfo?.endowmentInsurance}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">职工基本医疗保险</View>
            <View className="row-right-value">{annualDetail?.reportSocialSecurityInfo?.medicalInsurance}</View>
          </View>
        </View>
        <View className="content-item-two-row">
          <View className="row-left">
            <View className="row-left-title">生育保险</View>
            <View className="row-left-value">{annualDetail?.reportSocialSecurityInfo?.maternityInsurance}</View>
          </View>
          <View className="row-right">
            <View className="row-right-title">失业保险</View>
            <View className="row-right-value">{annualDetail?.reportSocialSecurityInfo?.unemploymentInsurance}</View>
          </View>
        </View>
        <View className="content-item-row">
          <View className="row-title">工伤保险</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.employmentInjuryInsurance}</View>
        </View>
      </View>

      <View className="header">
        <View className="header-title">单位缴费基数</View>
      </View>
      <View className="content">
        <View className="content-item-row">
          <View className="row-title">单位参加城镇职工基本养老保险缴费基数</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.endowmentInsuranceBase}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加失业保险缴费基数</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.unemploymentInsuranceBase}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加职工基本医疗保险缴费基数</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.medicalInsuranceBase}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加生育保险缴费基数</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.maternityInsuranceBase}</View>
        </View>
      </View>

      <View className="header">
        <View className="header-title">本期实际缴费金额</View>
      </View>
      <View className="content">
        <View className="content-item-row">
          <View className="row-title">参加城镇职工基本养老保险本期实际缴费金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.endowmentInsurancePayAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">参加失业保险本期实际缴费金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.unemploymentInsurancePayAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">参加职工基本医疗保险本期实际缴费金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.medicalInsurancePayAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">参加工伤保险本期实际缴费金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.employmentInjuryInsurancePayAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">参加生育保险本期实际缴费金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.maternityInsurancePayAmount}</View>
        </View>
      </View>

      <View className="header">
        <View className="header-title">单位累计欠缴金额</View>
      </View>
      <View className="content">
        <View className="content-item-row">
          <View className="row-title">单位参加城镇职工基本养老保险累计欠缴金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.endowmentInsuranceOweAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加失业保险累计欠缴金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.unemploymentInsuranceOweAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加职工基本医疗保险累计欠缴金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.medicalInsuranceOweAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加工伤保险累计欠缴金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.employmentInjuryInsuranceOweAmount}</View>
        </View>
        <View className="content-item-row">
          <View className="row-title">单位参加生育保险累计欠缴金额</View>
          <View className="row-value">{annualDetail?.reportSocialSecurityInfo?.maternityInsuranceOweAmount}</View>
        </View>
      </View>
    </View>
  )
}

export default Index
