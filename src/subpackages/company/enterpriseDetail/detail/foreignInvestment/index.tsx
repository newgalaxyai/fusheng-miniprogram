import React, { useState } from 'react'
import {
  useLoad
} from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Tabs } from '@nutui/nutui-react-taro'
import './index.scss'
import {
  IOutsideInvestment
} from '@/api/types'
import { getOutsideInvestmentAPI } from '@/api/company'
import dayjs from 'dayjs'

function Index() {
  // 对外投资
  const [foreignInvestment, setForeignInvestment] = useState<IOutsideInvestment[]>([])
  // const [foreignInvestmentHistory, setForeignInvestmentHistory] = useState<IOutsideInvestment | null>(null)
  // 初始化获取工商信息
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getOutsideInvestmentAPI({
      gid: companyInfo.gid
      // gid: 47183021
    }, foreignInvestmentRes => {
      // console.log('foreignInvestmentRes', foreignInvestmentRes);
      setForeignInvestment(foreignInvestmentRes.data || [])
    })
  })
  // -tabs 切换
  // const [tabvalue, setTabvalue] = useState<string | number>('out')
  return (
    <View className="detailPage">
      {/* <Tabs
        value={tabvalue}
        onChange={(value) => {
          setTabvalue(value)
        }}
        style={{
          '--nutui-tabs-titles-background-color': '#FFF',
          '--nutui-tabs-titles-item-active-color': '#426EFF',
          '--nutui-tabs-tab-line-color': '#426EFF',
        } as any}
      >
        <Tabs.TabPane title="对外投资" value='out' />
        <Tabs.TabPane title="历史对外投资" value='history' />
      </Tabs> */}
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{foreignInvestment.length}</Text>条对外投资信息
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {foreignInvestment.map((foreign, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              {
                foreign.logo ? (
                  <Image className="logo" src={foreign.logo} />
                ) : (
                  <View className={'avatar ' + (foreign.alias.length >= 4 ? 'avatar-4' : 'avatar-1')}
                  >{foreign.alias.length >= 4 ? foreign.alias.slice(0, 4) : foreign.alias.slice(0, 2)}</View>
                )
              }
              <View className="info">
                <View className="name-row">
                  <Text className="name">{foreign.name}</Text>
                </View>
                {foreign.tags.map((tag, index) => (
                  <Text className="tag" key={index}>{tag.name}</Text>
                ))}
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">法定代表人</Text>
                  <Text className="value">{foreign.legalPersonName || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">注册资本</Text>
                  <Text className="value">{'--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">认缴出资额</Text>
                  <Text className="value">{foreign.amount || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">持股比例</Text>
                  <Text className="value">{foreign.percent || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">成立日期</Text>
                  <Text className="value">{foreign.estiblishTime ? dayjs(foreign.estiblishTime).format('YYYY-MM-DD') : '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">经营状态</Text>
                  <Text className="value">{foreign.regStatus || '--'}</Text>
                </View>
              </View>
              <View className="row">
                <View className="item">
                  <Text className="label">所属省份</Text>
                  <Text className="value">{foreign.province || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">所属行业</Text>
                  <Text className="value">{foreign.category || '--'}</Text>
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
