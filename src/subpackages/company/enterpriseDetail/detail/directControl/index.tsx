import React, { useState } from 'react'
import { useLoad } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Tabs } from '@nutui/nutui-react-taro'
import './index.scss'
import { IDirectControl } from '@/api/types'
import { getDirectControlAPI } from '@/api/company'
import dayjs from 'dayjs'

function Index() {
  // 直接控制企业
  const [directControl, setDirectControl] = useState<IDirectControl[]>([])
  // 初始化获取工商信息
  useLoad(params => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getDirectControlAPI(
      {
        gid: companyInfo.gid
        // gid: 47183021
      },
      directControlRes => {
        setDirectControl(directControlRes.data || [])
      }
    )
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
          共<Text style={{ color: '#2156FE' }}>{directControl.length}</Text>家直接控制企业
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="https://find-console.newgalaxyai.com/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {directControl.map((branch, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              {branch.companyLogo ? <Image className="logo" src={branch.companyLogo} /> : <View className={'avatar ' + (branch.companyAlias.length >= 4 ? 'avatar-4' : 'avatar-1')}>{branch.companyAlias.length >= 4 ? branch.companyAlias.slice(0, 4) : branch.companyAlias.slice(0, 2)}</View>}
              <View className="info">
                <View className="name-row">
                  <Text className="name">{branch.companyName}</Text>
                </View>
                <Text className="tag">{branch.registerStatus}</Text>
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">法定代表人</Text>
                  <Text className="value">{branch.legalPersonName || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">注册资本</Text>
                  <Text className="value">{branch.registerCapital || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">成立日期</Text>
                  <Text className="value">{branch.establishDate || '--'}</Text>
                </View>
              </View>
            </View>
            {/* <View className="card-footer">{idx + 1}</View> */}
            <View className="footer">
              <View className="left">
                <Text className="line-label">投资比例：</Text>
                <Text className="line-value">{branch.investRatio || '--'}</Text>
              </View>
              <View></View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
