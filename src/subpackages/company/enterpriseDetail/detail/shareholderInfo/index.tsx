import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import {
  useLoad,
  navigateTo,
} from '@tarojs/taro'
import './index.scss'
import { ArrowRightSmall } from '@nutui/icons-react-taro'
import { getShareholderInfoAPI } from '@/api/company'
import { IPersonInfo, IShareholderInfo } from '@/api/types'

function Index() {
  // 股东信息
  const [shareholderInfo, setShareholderInfo] = useState<IShareholderInfo[]>([])
  // 初始化获取股东信息
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getShareholderInfoAPI({
      gid: companyInfo.gid
    }, shareholderInfoRes => {
      console.log('shareholderInfoRes', shareholderInfoRes);
      setShareholderInfo(shareholderInfoRes.data?.result || [])
    })
  })
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{shareholderInfo.length}</Text>条股东信息
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {shareholderInfo.map((shareholder, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              <View className={'avatar ' + (shareholder.shareHolderName.length >= 4 ? 'avatar-4' : 'avatar-1')}
              >{shareholder.shareHolderName.length >= 4 ? shareholder.shareHolderName.slice(0, 4) : shareholder.shareHolderName[0]}</View>
              <View className="info">
                <View className="name-row">
                  <Text className="name">{shareholder.shareHolderName}</Text>
                  {/* <View className="relation" onClick={() => Taro.navigateTo({ url: '/subpackages/company/enterpriseDetail/detail/enterpriseManagement/index' })}>
                    <Text>关联6家企业</Text>
                    <ArrowRightSmall color="#1F55FF" size={'30rpx'} />
                  </View> */}
                </View>
                {shareholder.tags.map((tag, index) => (
                  <Text className="tag" key={index}>{tag.profileTagNameOnPage}</Text>
                ))}
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">股东类型</Text>
                  <Text className="value">{shareholder.shareHolderTypeOnPage || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">持股比例</Text>
                  <Text className="value">{shareholder.percent || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">认缴出资额</Text>
                  <Text className="value">{shareholder.totalCapital || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">认缴出资日期</Text>
                  <Text className="value">{shareholder.subscribedDate || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">实缴出资额</Text>
                  <Text className="value">{shareholder.totalActualCapital || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">实缴出资日期</Text>
                  <Text className="value">{shareholder.actualDate || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">任职职务</Text>
                  <Text className="value">{shareholder.currentPosition || '--'}</Text>
                </View>
              </View>
            </View>
            <View className="card-footer">{idx + 1}</View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
