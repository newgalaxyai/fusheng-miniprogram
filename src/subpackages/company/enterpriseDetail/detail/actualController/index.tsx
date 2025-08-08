import React, { useState } from 'react'
import {
  useLoad
} from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Tabs } from '@nutui/nutui-react-taro'
import './index.scss'
import {
  IBeneficialList
} from '@/api/types'
import { getActualControllerAPI } from '@/api/company'
import dayjs from 'dayjs'

function Index() {
  // 受益所有人
  const [beneficialOwner, setBeneficialOwner] = useState<IBeneficialList[]>([])
  // 受益自然人
  const [beneficialHuman, setBeneficialHuman] = useState<IBeneficialList[]>([])
  // 初始化获取受益人
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getActualControllerAPI({
      gid: companyInfo.gid
      // gid: 47183021
    }, actualControllerRes => {
      // console.log('actualControllerRes', actualControllerRes);
      setBeneficialOwner(actualControllerRes.data?.beneficialOwnerList || [])
      setBeneficialHuman(actualControllerRes.data?.beneficialHumanList || [])
    })
  })
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{beneficialOwner.length}</Text>条受益所有人信息
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {beneficialOwner.map((owner, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              {
                owner.humanLogo ? (
                  <Image className="logo" src={owner.humanLogo} />
                ) : (
                  <View className={'avatar ' + (owner.humanName.length >= 4 ? 'avatar-4' : 'avatar-1')}
                  >{owner.humanName[0]}</View>
                )
              }
              <View className="info">
                <View className="name-row">
                  <Text className="name">{owner.humanName}</Text>
                </View>
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">最终受益股份</Text>
                  <Text className="value">{owner.finalBenefitShare || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">职位类型</Text>
                  <Text className="value">{owner.positionType || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">受益类型</Text>
                  <Text className="value">{owner.benefitType || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">判定理由</Text>
                  <Text className="value">{owner.decisionReason || '--'}</Text>
                </View>
              </View>
            </View>
            <View className="card-footer">{idx + 1}</View>
          </View>
        ))}
      </View>
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{beneficialHuman.length}</Text>条受益自然人信息
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {beneficialHuman.map((owner, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              {
                owner.humanLogo ? (
                  <Image className="logo" src={owner.humanLogo} />
                ) : (
                  <View className={'avatar ' + (owner.humanName.length >= 4 ? 'avatar-4' : 'avatar-1')}
                  >{owner.humanName[0]}</View>
                )
              }
              <View className="info">
                <View className="name-row">
                  <Text className="name">{owner.humanName}</Text>
                </View>
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">最终受益股份</Text>
                  <Text className="value">{owner.finalBenefitShare || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">职位类型</Text>
                  <Text className="value">{owner.positionType || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">受益类型</Text>
                  <Text className="value">{owner.benefitType || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item full">
                  <Text className="label">判定理由</Text>
                  <Text className="value">{owner.decisionReason || '--'}</Text>
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
