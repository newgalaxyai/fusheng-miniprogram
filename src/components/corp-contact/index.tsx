import React, { memo, useEffect, useState } from 'react'
import { Popup, Tabs } from '@nutui/nutui-react-taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'
import equal from 'fast-deep-equal'
import { ICorpContactInfo, IGetCorpContactInfoResponse } from '@/api/types'
import { getCorpContactInfoAPI } from '@/api/company'

interface IProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  creditCode: string
}

const CorpContactComponente: React.FC<IProps> = ({ visible, setVisible, creditCode }) => {
  // 关闭弹窗时，清空联系人信息
  const onClose = () => {
    setVisible(false)
    setActiveTab(1)
    setCorpContactInfo(undefined)
  }

  // 企业联系方式
  const [corpContactInfo, setCorpContactInfo] = useState<IGetCorpContactInfoResponse>()
  useEffect(() => {
    if (creditCode) {
      getCorpContactInfoAPI({ creditCode }, contactRes => {
        if (contactRes.success) {
          setCorpContactInfo(contactRes.data)
        }
      })
    }
  }, [creditCode])

  // tabs
  const [activeTab, setActiveTab] = useState<string | number>(1)
  const tabList = [
    { id: 1, name: `业务人员 ${corpContactInfo?.businessPeople?.length || 0}` },
    { id: 2, name: `固话 ${corpContactInfo?.fixedPhones?.length || 0}` }
    // { id: 3, name: `邮箱 ${emails?.length || 0}` },
    // { id: 4, name: `其他 ${others?.length || 0}` }
  ]

  // 渲染联系人项目
  const renderContactItem = (
    item: ICorpContactInfo
    // index: number,
    // type: 'phone' | 'email' | 'other'
  ) => {
    const handleClick = () => {
      Taro.makePhoneCall({ phoneNumber: item.phone })
      // if (type === 'phone') {
      //   Taro.makePhoneCall({ phoneNumber: item.phone })
      // } else if (type === 'email') {
      //   Taro.setClipboardData({ data: item.email })
      // }
    }

    return (
      <View className="tab_content_item" key={item.phone} onClick={handleClick}>
        <View className="tab_content_item_one">
          <View className="modile">{item.phone}</View>
          {/* {type === 'phone' && index < 3 ? <View className="recommend">推荐</View> : null}
          {type === 'email' ? <View className="recommend">推荐</View> : null} */}
          {item.recommend && <View className="recommend">推荐</View>}
        </View>
        <View className="tab_content_item_two">
          <View className="name">{item.name}</View>
          <View className="position">{item.position}</View>
        </View>
        {/* {(type === 'phone' && index < 3) || type === 'email' ? (
          <View className="tab_content_item_four">
            <Image src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
            <Image src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
            <Image src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise13.png" className="tab_content_item_four_img" />
          </View>
        ) : null} */}
      </View>
    )
  }

  return (
    <Popup position="bottom" style={{ height: '75%' }} visible={visible} onClose={onClose}>
      <View style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <View className="popup_header">
          <View className="popup_header_title">联系人</View>
          <Image
            onClick={onClose}
            src="https://find-console.newgalaxyai.com/glks/assets/enterprise/enterprise14.png"
            className="popup_header_img"
          />
        </View>
        <View
          style={{
            width: '100%',
            height: '100rpx'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            style={{
              height: 'max-content'
            }}
          >
            {tabList.map(item => (
              <Tabs.TabPane key={item.id} title={item.name} value={item.id}></Tabs.TabPane>
            ))}
          </Tabs>
        </View>
        <View style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* 手机号 */}
          {activeTab === 1 && (
            <ScrollView scrollY className="tab_content" style={{ height: '100%' }}>
              {corpContactInfo?.businessPeople.map(item => renderContactItem(item))}
            </ScrollView>
          )}

          {/* 固话 */}
          {activeTab === 2 && (
            <ScrollView scrollY className="tab_content" style={{ height: '100%' }}>
              {corpContactInfo?.fixedPhones.map(item => renderContactItem(item))}
            </ScrollView>
          )}
        </View>

        {/* 邮箱 */}
        {/* {tabValue === 3 && (
        <ScrollView scrollY className="tab_content">
          {emails.map((item, index) => renderContactItem(item, index, 'email'))}
        </ScrollView>
      )} */}

        {/* 其他 */}
        {/* {tabValue === 4 && (
        <ScrollView scrollY className="tab_content">
          {others.map((item, index) => renderContactItem(item, index, 'other'))}
        </ScrollView>
      )} */}
      </View>
    </Popup>
  )
}

export default memo(CorpContactComponente, (prevProps, nextProps) => {
  return equal(prevProps, nextProps)
})
