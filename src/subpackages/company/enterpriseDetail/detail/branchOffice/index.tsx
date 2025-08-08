import React, { useState } from 'react'
import {
  useLoad
} from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { Tabs } from '@nutui/nutui-react-taro'
import './index.scss'
import {
  IBranchOffice
} from '@/api/types'
import { getBranchOfficeAPI } from '@/api/company'
import dayjs from 'dayjs'

function Index() {
  // 分支机构
  const [branchOffice, setBranchOffice] = useState<IBranchOffice[]>([])
  // 初始化获取工商信息
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getBranchOfficeAPI({
      gid: companyInfo.gid
      // gid: 47183021
    }, branchOfficeRes => {
      console.log('branchOfficeRes', branchOfficeRes);
      setBranchOffice(branchOfficeRes.data || [])
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
          共<Text style={{ color: '#2156FE' }}>{branchOffice.length}</Text>家分支机构
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className="shareholder-list">
        {branchOffice.map((branch, idx) => (
          <View className="shareholder-card" key={idx}>
            <View className="card-header">
              {
                branch.logo ? (
                  <Image className="logo" src={branch.logo} />
                ) : (
                  <View className={'avatar ' + (branch.alias.length >= 4 ? 'avatar-4' : 'avatar-1')}
                  >{branch.alias.length >= 4 ? branch.alias.slice(0, 4) : branch.alias.slice(0, 2)}</View>
                )
              }
              <View className="info">
                <View className="name-row">
                  <Text className="name">{branch.name}</Text>
                </View>
                <Text className="tag">{branch.regStatus}</Text>
              </View>
            </View>
            <View className="card-content">
              <View className="row">
                <View className="item">
                  <Text className="label">负责人</Text>
                  <Text className="value">{branch.legalPersonName || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">注册地</Text>
                  <Text className="value">{branch.area || '--'}</Text>
                </View>
                <View className="item">
                  <Text className="label">成立日期</Text>
                  <Text className="value">{branch.estiblishTime ? dayjs(branch.estiblishTime).format('YYYY-MM-DD') : '--'}</Text>
                </View>
              </View>
            </View>
            {/* <View className="card-footer">{idx + 1}</View> */}
          </View>
        ))}
      </View>
    </View>
  )
}

export default Index
