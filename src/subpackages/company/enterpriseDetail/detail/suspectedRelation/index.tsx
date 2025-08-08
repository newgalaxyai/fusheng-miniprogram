import React, { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { Divider } from '@nutui/nutui-react-taro'
import {
  useLoad,
  navigateTo,
} from '@tarojs/taro'
import './index.scss'
import { ArrowRightSmall } from '@nutui/icons-react-taro'
import { getSuspectedRelationAPI } from '@/api/company'
import { ISuspectedRelation } from '@/api/types'

function Index() {
  // 疑似关系
  const [suspectedRelation, setSuspectedRelation] = useState<ISuspectedRelation[]>([])
  // 初始化获取疑似关系
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    getSuspectedRelationAPI({
      gid: companyInfo.gid
      // gid: 47183021
    }, suspectedRelationRes => {
      // console.log('suspectedRelationRes', suspectedRelationRes);
      setSuspectedRelation(suspectedRelationRes.data || [])
    })
  })
  return (
    <View className="detailPage">
      <View className="header">
        <Text className="header-title">
          共<Text style={{ color: '#2156FE' }}>{suspectedRelation.length}</Text>条疑似关系
        </Text>
        {/* <View className="header-link">
          股权结构
          <Image className="relationImg" src="http://36.141.100.123:10013/glks/assets/corpDetail/corpDetail26.png" />
        </View> */}
      </View>

      <View className='card-list'>
        {suspectedRelation.map((suspected, idx) => {
          return (
            <View className='card-item'>
              <View className='item-header'>
                {
                  suspected.logo ? (
                    <Image className="logo" src={suspected.logo} />
                  ) : (
                    <View className={'logo avatar ' + (suspected.alias.length >= 4 ? 'avatar-4' : 'avatar-1')}
                    >{suspected.alias[0]}</View>
                  )
                }
                <View className='name'>
                  <View className='name-top'>
                    <View className='name-text'>{suspected.companyName}</View>
                    <View className='tag'>{suspected.regStatus}</View>
                  </View>
                  <View className='name-bottom'>
                    <Text>{suspected.legalPerson[0].legalRepName}</Text>
                    <Divider direction="vertical" />
                    <Text>{suspected.regCapital}</Text>
                    <Divider direction="vertical" />
                    <Text>{suspected.establishYearsShowText}</Text>
                  </View>
                </View>
              </View>
              <View className='item-content'>
                <View className='content-item'>
                  <View className='content-lable'>疑似关联类型：</View>
                  <View className='content-value'>{suspected.suspectedTypeText}</View>
                </View>
                {
                  suspected.phoneList && suspected.phoneList.length > 0 && (
                    <View className='content-item'>
                      <View className='content-lable'>疑似关联电话：</View>
                      <View className='content-value blue break'>{suspected.phoneList.map(item => item.phone).join('、')}</View>
                    </View>
                  )
                }
                {
                  suspected.emailList && suspected.emailList.length > 0 && (
                    <View className='content-item'>
                      <View className='content-lable'>疑似关联邮箱：</View>
                      <View className='content-value blue break'>{suspected.emailList.map(item => item.email).join('、')}</View>
                    </View>
                  )
                }
                {
                  suspected.addressList && suspected.addressList.length > 0 && (
                    <View className='content-item'>
                      <View className='content-lable'>疑似关联地址：</View>
                      <View className='content-value blue address'>
                        {
                          suspected.addressList.map(item => {
                            return (
                              <View key={item.address} className='address-item'>
                                <Text className='break'>{item.address}</Text>
                              </View>
                            )
                          })
                        }
                      </View>
                    </View>
                  )
                }
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default Index
