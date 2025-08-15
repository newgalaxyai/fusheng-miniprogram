import React, { useState } from 'react'
import {
  useLoad,
  navigateTo,
  getSystemInfoSync
} from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import {
  Table,
} from '@nutui/nutui-react-taro'
import './index.scss'
import { getAnnualReportAPI } from '@/api/company'
import { IAnnualReport } from '@/api/types'
import { ROUTE } from '@/constants'

function Index() {
  const { windowHeight } = getSystemInfoSync()
  // 企业id
  const [gid, setGid] = useState<number>(47183021)
  // 企业年报
  const [annualReport, setAnnualReport] = useState<IAnnualReport[]>([])
  // 初始化获取企业年报
  useLoad((params) => {
    const { company } = params
    const companyInfo = JSON.parse(company)
    setGid(Number(companyInfo.gid))
    getAnnualReportAPI({
      gid: companyInfo.gid
      // gid: 47183021
    }, annualReportRes => {
      setAnnualReport(annualReportRes.data || [])
    })
  })

  // 表格数据
  const columnsData = [
    {
      title: '发布日期',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      align: 'center',
    },
    {
      title: '年报',
      dataIndex: 'reportYear',
      key: 'reportYear',
      align: 'center',
      render: (record) => {
        return (
          <Text>{record.reportYear}的年度报告</Text>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      align: 'center',
      render: (record) => {
        return (
          <View
            onClick={() => {
              navigateTo({
                url: ROUTE.ANNUAL_DETAIL + '?annual=' + JSON.stringify({
                  reportId: record.id,
                  gid: gid
                })
              })
            }}
          >
            <Text style={{ color: '#1677FF' }}>详情</Text>
          </View>
        )
      }
    },
  ]
  return (
    <View className="detailPage">
      <View className="table">
        <Table
          columns={columnsData}
          data={annualReport}
          style={{ height: windowHeight - 88 }}
          summary={(
            <View className="header">
              <Text className="header-title">
                共<Text style={{ color: '#2156FE' }}>{annualReport.length}</Text>条年报信息
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  )
}

export default Index
