import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import {
  useLoad,
  navigateTo,
} from '@tarojs/taro'
import './index.scss'
import { ArrowRightSmall } from '@nutui/icons-react-taro'
import { getBusinessSelfPublicationAPI } from '@/api/company'
import { IBusibessPublicity } from '@/api/types'

function Index() {
  // 工商自主公示
  const [businessPublicity, setBusinessPublicity] = useState<IBusibessPublicity[]>([])
  // 初始化获取工商自主公示
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getBusinessSelfPublicationAPI({
      gid: companyInfo.gid
      // gid: 47183021
    }, businessPublicityRes => {
      setBusinessPublicity(businessPublicityRes.data || [])
    })
  })
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{businessPublicity.length}</Text>条股东及出资信息
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {businessPublicity.map((business, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              {
                business.logo ? (
                  <Image className="logo" src={business.logo} />
                ) : (
                  <View className={'avatar ' + (business.alias.length >= 4 ? 'avatar-4' : 'avatar-1')}
                  >{business.alias.length >= 4 ? business.alias.slice(0, 4) : business.alias.slice(0, 2)}</View>
                )
              }
              <View className="info">
                <View className="name-row">
                  <Text className="name">{business.name}</Text>
                </View>
                {/* {business.tags.map((tag, index) => (
                  <Text className="tag" key={index}>{tag.name}</Text>
                ))} */}
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item full">
                  <Text className="label">认缴公示日期</Text>
                  <Text className="value">{business.capital[0].publicDate || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">认缴出资额</Text>
                  <Text className="value">{business.capital[0].amomon || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">认缴出资日期</Text>
                  <Text className="value">{business.capital[0].time || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">实缴出资额</Text>
                  <Text className="value">{business.capitalActl[0].amomon || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">实缴出资日期</Text>
                  <Text className="value">{business.capitalActl[0].time || '--'}</Text>
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
