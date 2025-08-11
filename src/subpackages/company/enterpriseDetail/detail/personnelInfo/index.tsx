import React, { useState } from 'react'
import {
  useLoad,
  navigateTo,
} from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { getPersonInfoAPI } from '@/api/company'
import { IPersonInfo } from '@/api/types'

function Index() {
  // 人员信息
  const [personInfo, setPersonInfo] = useState<IPersonInfo[]>([])
  // 初始化获取人员信息
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getPersonInfoAPI({
      gid: companyInfo.gid
    }, personInfoRes => {
      // console.log('personInfoRes', personInfoRes);
      setPersonInfo(personInfoRes.data?.result || [])
    })
  })
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{personInfo.length}</Text>条人员信息
        </Text>
      </View>

      <View className="enterprise-card-list">
        {personInfo.map((person, idx) => (
          <View className="enterprise-card" key={idx}>
            <View className="enterprise-card-top">
              <View className="avatar">{person.name[0]}</View>
              <Text className="name">{person.name}</Text>
              <View className="info">
                {
                  person.typeJoin.map((item, index) => (
                    <Text key={index} className="relation">{item}</Text>
                  ))
                }
              </View>
            </View>
            {/* <View
              className="enterprise-card-bottom"
              onClick={() => {
                navigateTo({
                  url: '/subpackages/company/enterpriseDetail/detail/enterpriseManagement/index'
                })
              }}
            >
              关联6家企业
            </View> */}
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
