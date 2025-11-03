import React, { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView, Input, Textarea, Button } from '@tarojs/components'
import {
  ArrowDownSize6,
  Close,
  Checked,
  Search,
  Success,
  CheckClose
} from '@nutui/icons-react-taro'
import { searchCompaniesAPI } from '@/api/company'
import { clueContactSelectAPI, clueFollowUpCreateAPI, getClueDetailAPI } from '@/api/clue' // 移除uploadFileAPI
import { Calendar, CalendarCard, Popup, Picker, DatePicker } from '@nutui/nutui-react-taro'
import type { CalendarCardValue, PickerOption } from '@nutui/nutui-react-taro'
import { Check } from '@nutui/icons-react-taro'
import Taro, { useLoad, useRouter, showModal, eventCenter } from '@tarojs/taro'
import './index.scss'
import { useSelector } from 'react-redux'
import { clueListSelectAPI } from '@/api/clue'
import { BASE_URL } from '@/service/config' // 新增导入
import {
  IAddFollowUpRequest,
  IClue,
  ICorpContactInfo,
  IFile,
  IGetAllClueListResponse
} from '@/api/types'
import { filterHTMLString } from '@/utils/filterString'
import { CLUE_EVENT } from '@/constants/event'
import { ROUTE_PARAMS_NAME } from '@/constants'
import dayjs from 'dayjs'

// 文件类型定义
interface FileItem {
  fileId: number
  name: string
  size: string
  sizeInBytes: number
  progress: number
  status: 'uploading' | 'completed' | 'failed'
  filePath?: string
  tempFilePath?: string
  errorMessage?: string
  url?: string // 新增：服务器返回的文件URL
}

function AddFollowPage() {
  // 线索详情
  const [clueDetail, setClueDetail] = useState<IClue>()
  // // 线索在线索列表中的索引
  // const [clueIndex, setClueIndex] = useState<number | null>(null)
  // 接收路由参数
  useLoad(loadOptions => {
    console.log('loadOptions', loadOptions)
    // if (loadOptions[ROUTE_PARAMS_NAME.CLUE_INDEX]) {
    //   const index = Number(loadOptions[ROUTE_PARAMS_NAME.CLUE_INDEX])
    //   setClueIndex(index)
    // }
    if (loadOptions[ROUTE_PARAMS_NAME.CLUE_ID]) {
      const clueId = Number(loadOptions[ROUTE_PARAMS_NAME.CLUE_ID])
      getClueDetailAPI({ id: clueId }, res => {
        if (res.success) {
          setClueDetail(res.data)
        }
      })
    }
  })
  // 初始化表单数据
  const initialFormData = {
    userId: Taro.getStorageSync('token').userId,
    // leadId: null,
    // associateLead: '',
    // associateLeadContact: '',
    // contactId: '',
    contactInfo: '',
    type: '',
    method: '',
    followUpTime: '',
    content: '',
    followUpFileList: [] as FileItem[]
  }
  // 表单数据
  const [formData, setFormData] = useState(initialFormData)
  // ==================== 关联线索联系人 ====================
  // 选项列表
  const [contactInfoOptions, setContactInfoOptions] = useState<ICorpContactInfo[]>([])
  useEffect(() => {
    if (clueDetail?.unifiedSocialCreditCode) {
      clueContactSelectAPI(
        {
          creditCode: clueDetail?.unifiedSocialCreditCode
        },
        res => {
          if (res.success) {
            setContactInfoOptions(res.data || [])
            if (res.data.length > 0) {
              setFormData(prev => ({
                ...prev,
                contactInfo: JSON.stringify(res.data?.[0])
              }))
            }
          }
        }
      )
    }
  }, [clueDetail?.unifiedSocialCreditCode])
  // 选择器
  // 打开状态
  const [showContactPicker, setShowContactPicker] = useState(false)
  // ==================== 跟进类型 ====================
  // 选择器
  // 选项列表
  // 跟进类型选项
  // [
  //   { id: 1, name: '线索', selected: false },
  //   { id: 2, name: '客户', selected: false },
  //   { id: 3, name: '联系人', selected: false },
  //   { id: 4, name: '商机', selected: false }
  // ]
  const [followUpTypeOptions, setFollowUpTypeOptions] = useState<PickerOption[]>([
    {
      text: '线索',
      value: '线索'
    },
    {
      text: '客户',
      value: '客户'
    },
    {
      text: '联系人',
      value: '联系人'
    },
    {
      text: '商机',
      value: '商机'
    }
  ])
  // 打开状态
  const [showFollowUpTypePicker, setShowFollowUpTypePicker] = useState(false)
  // ==================== 跟进方式 ====================
  // 选择器
  // 跟进方式选项
  // [
  //   { id: 1, name: '电话', selected: false },
  //   { id: 2, name: '邮件', selected: false },
  //   { id: 3, name: '微信', selected: false },
  //   { id: 4, name: '拜访', selected: false },
  //   { id: 5, name: '其他', selected: false }
  // ]
  const [followUpMethodOptions, setFollowUpMethodOptions] = useState<PickerOption[]>([
    {
      text: '电话',
      value: '电话'
    },
    {
      text: '邮件',
      value: '邮件'
    },
    {
      text: '微信',
      value: '微信'
    },
    {
      text: '拜访',
      value: '拜访'
    },
    {
      text: '其他',
      value: '其他'
    }
  ])
  // 打开状态
  const [showFollowUpMethodPicker, setShowFollowUpMethodPicker] = useState(false)
  // ==================== 跟进时间 ====================
  // 选择器
  // 打开状态
  const [showFollowUpTimePicker, setShowFollowUpTimePicker] = useState(false)

  // ==================== 分界线 ====================
  const [changeFollowUpTime, setChangeFollowUpTime] = useState(new Date() as CalendarCardValue)
  const userInfo = useSelector((state: any) => state.login.userInfo)
  const [showFollowUpType, setShowFollowUpType] = useState(false)
  const [showFollowUpMethod, setShowFollowUpMethod] = useState(false)
  const [showFollowUpTime, setShowFollowUpTime] = useState(false)

  // 下拉框显示状态
  const [dropdownVisible, setDropdownVisible] = useState({
    associateLead: false,
    associateLeadContact: false
  })

  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState({
    associateLead: '',
    associateLeadContact: ''
  })

  const [followUpFileList, setFollowUpFileList] = useState<FileItem[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理搜索输入
  // const handleSearchInput = (field: string, value: string) => {
  //   if (isImportantClue == null) {
  //     return
  //   }
  //   clueListSelectAPI({ isImportantClue }, res => {
  //     if (res.success && res.data) {
  //       // 将 API 返回的数据转换为正确的数组格式
  //       const newOptions = res.data.map((item: any) => ({
  //         id: item.id,
  //         name: item.name
  //       }))

  //       setDropdownData(prev => ({
  //         ...prev,
  //         [field]: newOptions // 设置为数组而不是单个字符串
  //       }))
  //     }
  //   })
  //   setSearchKeyword(prev => ({
  //     ...prev,
  //     [field]: value
  //   }))

  //   // 同时更新formData，这样用户手动输入时也能保存
  //   setFormData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }))

  //   setDropdownVisible(prev => {
  //     // 如果是打开下拉框，先关闭所有其他下拉框
  //     if (!prev[field]) {
  //       return {
  //         associateLead: false,
  //         associateLeadContact: false,
  //         [field]: true
  //       }
  //     }
  //     // 如果是关闭下拉框，只关闭当前字段
  //     return {
  //       ...prev,
  //       [field]: !prev[field]
  //     }
  //   })
  // }

  // 切换下拉框显示状态
  const toggleDropdown = (field: string) => {
    setDropdownVisible(prev => {
      // 如果是打开下拉框，先关闭所有其他下拉框
      if (!prev[field]) {
        return {
          associateLead: false,
          associateLeadContact: false,
          [field]: true
        }
      }
      // 如果是关闭下拉框，只关闭当前字段
      return {
        ...prev,
        [field]: !prev[field]
      }
    })
  }

  // 选择下拉选项
  // 添加一个辅助函数来移除HTML标签
  const stripHtmlTags = (html: string): string => {
    html = filterHTMLString(html)
    return html.replace(/<[^>]*>/g, '')
  }

  const selectOption = (field: string, option: any) => {
    const optionName =
      typeof option === 'string'
        ? option
        : option.phone
        ? `${option.name}(${option.phone})`
        : option.name
    // 移除HTML标签后再存储
    const cleanOptionName = stripHtmlTags(optionName)
    console.log('cleanOptionName', cleanOptionName)

    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: cleanOptionName // 使用清理后的值
      }

      // 根据字段类型设置对应的ID
      // if (field === 'associateLead') {
      //   newData.leadId = option.id
      // } else if (field === 'associateLeadContact') {
      //   // console.log('associateLeadContact', option)
      //   newData.contactId = JSON.stringify(option)
      // }

      return newData
    })

    // 关闭所有下拉框
    setDropdownVisible({
      associateLead: false,
      associateLeadContact: false
    })

    // 清空搜索关键词
    setSearchKeyword(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  // 过滤搜索结果
  // const getFilteredOptions = (field: string) => {
  //   const keyword = searchKeyword[field].toLowerCase()
  //   const options = dropdownData[field]

  //   if (!keyword) return options

  //   return options.filter((option: any) => {
  //     // 处理字符串格式的数据
  //     if (typeof option === 'string') {
  //       return option.toLowerCase().includes(keyword)
  //     }

  //     // 处理对象格式的数据
  //     if (field === 'associateLead') {
  //       return (
  //         (option.name && option.name.toLowerCase().includes(keyword)) ||
  //         (option.contact && option.contact.toLowerCase().includes(keyword))
  //       )
  //     } else if (field === 'associateLeadContact') {
  //       return (
  //         (option.name && option.name.toLowerCase().includes(keyword)) ||
  //         (option.company && option.company.toLowerCase().includes(keyword))
  //       )
  //     }
  //     return false
  //   })
  // }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 生成唯一ID
  const generateId = (): number => {
    return Date.now() + Math.random()
  }

  // 文件上传处理
  const handleFileUpload = async () => {
    try {
      // 选择文件
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera']
      })

      if (res.tempFiles && res.tempFiles.length > 0) {
        const file = res.tempFiles[0]

        // 检查文件大小限制 (50MB)
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
          Taro.showToast({
            title: '文件大小不能超过50MB',
            icon: 'none'
          })
          return
        }

        // 创建文件项
        const newFile: FileItem = {
          fileId: generateId(),
          name: `文件_${Date.now()}`,
          size: formatFileSize(file.size),
          sizeInBytes: file.size,
          progress: 0,
          status: 'uploading',
          tempFilePath: file.path
        }

        // 添加到文件列表
        setFollowUpFileList(prev => [...prev, newFile])

        // 开始上传
        await uploadFile(newFile)
      }
    } catch (error) {
      console.error('选择文件失败:', error)
      Taro.showToast({
        title: '已取消选择图片',
        icon: 'none'
      })
    }
  }

  // 上传文件到服务器
  const uploadFile = async (fileItem: FileItem) => {
    try {
      let progressInterval: NodeJS.Timeout | null = null

      // 模拟上传进度
      const simulateProgress = () => {
        let progress = 0
        progressInterval = setInterval(() => {
          progress += Math.random() * 10 + 5
          if (progress >= 95) {
            progress = 95
            if (progressInterval) {
              clearInterval(progressInterval)
            }
          }
          setFollowUpFileList(prev =>
            prev.map(file =>
              file.fileId === fileItem.fileId ? { ...file, progress: Math.round(progress) } : file
            )
          )
        }, 200)
      }

      simulateProgress()

      // 获取token
      const tokenData = Taro.getStorageSync('token')
      const token = tokenData?.accessToken

      // 使用Taro.uploadFile，它会自动处理FormData格式
      const uploadRes = await Taro.uploadFile({
        url: `${BASE_URL}/app-api/infra/file/upload`,
        filePath: fileItem.tempFilePath!,
        name: 'file', // 这是FormData中的字段名
        header: {
          Authorization: `Bearer ${token}`,
          'tenant-id': '1'
        },
        formData: {
          // 这里的数据会自动转换为FormData格式
          fileName: fileItem.name
        },
        success: res => {
          if (progressInterval) {
            clearInterval(progressInterval)
          }

          // 解析服务器返回的数据
          let responseData
          try {
            responseData = JSON.parse(res.data)
          } catch (error) {
            console.error('解析响应数据失败:', error)
            responseData = res.data
          }

          // 获取服务器返回的文件URL
          const fileUrl = responseData?.data

          // 更新文件状态，添加URL
          setFollowUpFileList(prev =>
            prev.map(file =>
              file.fileId === fileItem.fileId
                ? {
                    ...file,
                    progress: 100,
                    status: 'completed',
                    url: fileUrl // 添加服务器返回的URL
                  }
                : file
            )
          )
        },
        fail: error => {
          console.error('上传失败:', error)
          if (progressInterval) {
            clearInterval(progressInterval)
          }
          setFollowUpFileList(prev =>
            prev.map(file =>
              file.fileId === fileItem.fileId
                ? { ...file, status: 'failed', errorMessage: '上传失败' }
                : file
            )
          )
        }
      })
    } catch (error) {
      console.error('上传文件失败:', error)
      setFollowUpFileList(prev =>
        prev.map(file =>
          file.fileId === fileItem.fileId
            ? { ...file, status: 'failed' as const, errorMessage: '上传失败' }
            : file
        )
      )
    }
  }

  // 删除文件
  const removeFile = (fileId: number) => {
    setFollowUpFileList(prev => prev.filter(file => file.fileId !== fileId))
  }

  function Timing() {
    setFormData(prev => ({
      ...prev,
      followUpTime: conversionTime(changeFollowUpTime, true)
    }))
    setShowFollowUpTime(false)
  }

  const conversionTime = (time, type) => {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    if (type == true) {
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } else {
      return `${year}-${month}-${day}`
    }
  }

  const closeSelect = (e: any) => {
    e.stopPropagation()
    if (dropdownVisible.associateLead || dropdownVisible.associateLeadContact) {
      setDropdownVisible({
        associateLead: false,
        associateLeadContact: false
      })
    }
  }

  const onInputClick = (field: any) => {
    // 先关闭所有下拉选项
    setDropdownVisible({
      associateLead: false,
      associateLeadContact: false
    })
    if (field === 'type') {
      // setShowFollowUpType(true)
      setShowFollowUpTypePicker(true)
    } else if (field === 'method') {
      // setShowFollowUpMethod(true)
      setShowFollowUpMethodPicker(true)
    } else if (field === 'followUpTime') {
      // setShowFollowUpTime(true)
      setShowFollowUpTimePicker(true)
    }
  }

  const onChangeFollowUpTime = (value: any) => {
    setChangeFollowUpTime(value)
  }

  const closePopup = (field: string) => {
    // 关闭所有下拉选项
    setDropdownVisible({
      associateLead: false,
      associateLeadContact: false
    })

    if (field === 'type') {
      setShowFollowUpType(false)
    } else if (field === 'method') {
      setShowFollowUpMethod(false)
    } else if (field === 'followUpTime') {
      setShowFollowUpTime(false)
    }
  }

  // 选择跟进类型
  // const selectFollowUpType = (optionId: number) => {
  //   const updatedOptions = followUpTypeOptions.map(option => ({
  //     ...option,
  //     selected: option.id === optionId
  //   }))
  //   setFollowUpTypeOptions(updatedOptions)
  //   const selectedOption = updatedOptions.find(option => option.selected)
  //   if (selectedOption) {
  //     setFormData(prev => ({
  //       ...prev,
  //       type: selectedOption.name
  //     }))
  //   }
  //   setShowFollowUpType(false)
  // }

  // // 选择跟进方式
  // const selectFollowUpMethod = (optionId: number) => {
  //   const updatedOptions = followUpMethodOptions.map(option => ({
  //     ...option,
  //     selected: option.id === optionId
  //   }))
  //   setFollowUpMethodOptions(updatedOptions)
  //   const selectedOption = updatedOptions.find(option => option.selected)
  //   if (selectedOption) {
  //     setFormData(prev => ({
  //       ...prev,
  //       method: selectedOption.name
  //     }))
  //   }
  //   setShowFollowUpMethod(false)
  // }

  const renderFormField = (
    label: string,
    field: string,
    placeholder: string,
    required: boolean = false,
    hasSearch: boolean = false,
    hasDropdown: boolean = true,
    hasRightIcon: boolean = false,
    isShowDropdownIcon: boolean = true,
    layoutType: 'vertical' | 'horizontal' = 'vertical'
  ) => {
    const isDropdownField = field === 'associateLead' || field === 'associateLeadContact'
    // const filteredOptions = isDropdownField ? getFilteredOptions(field) : []
    const filteredOptions = []
    let contactData: ICorpContactInfo | null = null
    if (field === 'associateLeadContact') {
      contactData = formData.contactInfo
        ? (JSON.parse(formData.contactInfo) as ICorpContactInfo)
        : null
    }

    return (
      <View className={`form-field ${layoutType}`}>
        <View className="field-label">
          {required && <Text className="required-mark">*</Text>}
          <Text className="label-text">{label}</Text>
        </View>
        <View className="field-input-container">
          <View className="input-wrapper">
            {hasSearch && (
              <View className="search-icon">
                <Search size="32rpx" color="#AAAAAA" />
              </View>
            )}
            {isShowDropdownIcon ? (
              <View onClick={() => onInputClick(field)} className="field-input-disabled">
                {formData[field] || placeholder}
              </View>
            ) : (
              <View
                onClick={e => {
                  e.stopPropagation()
                  setShowContactPicker(true)
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                {contactData ? (
                  <Text
                    style={{
                      height: '100%',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {contactData.name + ' ' + '(' + contactData.phone + ')'}
                  </Text>
                ) : (
                  <Text
                    style={{
                      height: '100%',
                      flex: 1,
                      color: '#AAAAAA',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {placeholder}
                  </Text>
                )}
                <ArrowDownSize6 size="28rpx" color="#333333" />
              </View>
              // <Input
              //   className="field-input"
              //   placeholder={placeholder}
              //   value={isDropdownField ? formData[field] || searchKeyword[field] : formData[field]}
              //   onInput={e =>
              //     isDropdownField
              //       ? handleSearchInput(field, e.detail.value)
              //       : handleInputChange(field, e.detail.value)
              //   }
              //   onClick={e => {
              //     e.stopPropagation()
              //     isDropdownField && toggleDropdown(field)
              //   }}
              // />
            )}
            {hasDropdown && (
              <View
                className="dropdown-icon-wrapper"
                onClick={e => {
                  e.stopPropagation()
                  isDropdownField && toggleDropdown(field)
                }}
              >
                <View
                  className={`dropdown-icon ${
                    isDropdownField && dropdownVisible[field] ? 'active' : ''
                  }`}
                >
                  <ArrowDownSize6
                    size="28rpx"
                    color="#333333"
                    className={
                      isDropdownField && dropdownVisible[field]
                        ? 'nut-icon-am-blink nut-icon-am-infinite'
                        : ''
                    }
                  />
                </View>
              </View>
            )}
            {hasRightIcon && (
              <View className="right-icon">
                <ArrowDownSize6 size="28rpx" color="#333333" />
              </View>
            )}
          </View>

          {/* 下拉选项 */}
          {isDropdownField && dropdownVisible[field] && (
            <ScrollView scrollY className="dropdown-options" onClick={e => e.stopPropagation()}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option: any, index: number) => (
                  <View
                    key={typeof option === 'string' ? index : option.id}
                    className="dropdown-option"
                    onClick={() => selectOption(field, option)}
                  >
                    {field === 'associateLead' ? (
                      <View className="option-content">
                        <Text
                          className="option-name"
                          dangerouslySetInnerHTML={{ __html: option.name }}
                        ></Text>
                      </View>
                    ) : (
                      <View className="option-content">
                        <Text className="option-name">{option.name}</Text>
                        <Text className="option-company">{option.phone}</Text>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View className="dropdown-option no-data">
                  <Text className="no-data-text">暂无数据</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    )
  }

  function handleSubmit(): void {
    // if (!formData.associateLead) {
    //   Taro.showToast({
    //     title: '请选择关联线索',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (!formData.contactInfo) {
      Taro.showToast({
        title: '请选择关联线索联系人',
        icon: 'none'
      })
      return
    }
    // if (!formData.type) {
    //   Taro.showToast({
    //     title: '请选择跟进类型',
    //     icon: 'none'
    //   })
    //   return
    // }
    // if (!formData.followUpTime) {
    //   Taro.showToast({
    //     title: '请选择跟进时间',
    //     icon: 'none'
    //   })
    //   return
    // }
    if (!formData.content) {
      Taro.showToast({
        title: '请输入跟进内容',
        icon: 'none'
      })
      return
    }
    showModal({
      title: '请确认',
      content: '是否确认所有信息准确无误？小程序暂不支持编辑跟进记录，请谨慎提交',
      success: res => {
        if (res.confirm) {
          let queryData: IAddFollowUpRequest = {
            leadId: clueDetail?.id!,
            contactInfo: formData.contactInfo,
            content: formData.content
          }
          if (formData.type && formData.type !== '') {
            queryData.type = formData.type
          }
          if (formData.method && formData.method !== '') {
            queryData.method = formData.method
          }
          if (formData.followUpTime && formData.followUpTime !== '') {
            queryData.followUpTime = formData.followUpTime
          }
          if (formData.followUpFileList && formData.followUpFileList.length > 0) {
            queryData.followUpFileList = formData.followUpFileList.map(
              item =>
                ({
                  name: item.name,
                  size: Number(item.sizeInBytes),
                  url: item.url || ''
                } as IFile)
            )
          }
          clueFollowUpCreateAPI(queryData, res => {
            if (res.success) {
              Taro.showToast({
                title: '添加成功',
                icon: 'none',
                duration: 1500
              })
              setTimeout(() => {
                Taro.navigateBack()
                // 刷新跟进列表
                eventCenter.trigger(CLUE_EVENT.REFRESH_FOLLOW_LIST)
              }, 1700)
            } else {
              Taro.showToast({
                title: res.data.msg || '添加失败, 请稍后重试',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
  }

  return (
    <View className="addFollowPage">
      <ScrollView
        enhanced
        showScrollbar={false}
        className="form-container"
        scrollY
        onClick={e => closeSelect(e)}
      >
        {/* 关联线索 - 垂直布局 */}
        {/* {renderFormField(
          '关联线索',
          'associateLead',
          '下拉选择企业名称,或者关键词搜索',
          true,
          true,
          true,
          false,
          false,
          'vertical'
        )} */}
        <View className="clue_name">
          <View className="field-label">
            <Text className="required-mark">*</Text>
            <Text className="label-text">关联线索</Text>
          </View>
          <Text>{filterHTMLString(clueDetail?.customerCompanyName || '')}</Text>
        </View>

        {/* 关联线索联系人 - 水平布局 */}
        {renderFormField(
          '关联线索联系人',
          'associateLeadContact',
          '请选择',
          true,
          false,
          false,
          false,
          false,
          'vertical'
        )}

        {/* 跟进类型 - 垂直布局 */}
        {renderFormField(
          '跟进类型',
          'type',
          '请选择',
          false,
          false,
          false,
          true,
          true,
          'horizontal'
        )}

        {/* 跟进方式 - 水平布局 */}
        {renderFormField(
          '跟进方式',
          'method',
          '请选择',
          false,
          false,
          false,
          true,
          true,
          'horizontal'
        )}

        {/* 跟进时间 - 垂直布局 */}
        {renderFormField(
          '跟进时间',
          'followUpTime',
          '请选择',
          false,
          false,
          false,
          true,
          true,
          'horizontal'
        )}

        {/* 跟进内容 - 水平布局 */}
        <View className="form-field vertical" style={{ marginTop: '40rpx' }}>
          <View className="field-label">
            <Text className="required-mark">*</Text>
            <Text className="label-text">跟进内容</Text>
          </View>
          <View className="field-input-container">
            <Textarea
              className="content-textarea"
              placeholder="请输入内容"
              value={formData.content}
              onInput={e => handleInputChange('content', e.detail.value)}
            />
          </View>
        </View>

        {/* 上传附件 */}
        <View className="upload-section">
          <View className="upload-title">上传附件</View>
          <View className="upload-area" onClick={handleFileUpload}>
            <View className="upload-icon">
              <Image
                src="https://find-console.newgalaxyai.com/glks/assets/chat/chat4.png"
                className="upload-icon-image"
              />
            </View>
            <Text className="upload-text">点击上传文件</Text>
            <Text className="upload-tips">支持.png .jpg .jpeg .gif .svg .dsg</Text>
          </View>

          {/* 已上传文件列表 */}
          <View className="uploaded-files">
            {followUpFileList &&
              followUpFileList.length > 0 &&
              followUpFileList.map(file => (
                <View key={file.fileId} className="file-item">
                  <View className="file-info">
                    <View className="file-name">{file.name}</View>
                    <View className="file-size">{file.size}</View>
                  </View>
                  <View className="file-progress">
                    <View className="progress-bar">
                      <View className="progress-fill" style={{ width: `${file.progress}%` }} />
                    </View>
                    <Text className="progress-text">{file.progress}%</Text>
                  </View>
                  <View className="file-action" onClick={() => removeFile(file.fileId)}>
                    {file.status === 'completed' ? (
                      <Success size="30rpx" color="#2156FE" />
                    ) : (
                      <CheckClose size="30rpx" color="#333" />
                    )}
                  </View>
                </View>
              ))}
          </View>

          <View className="submit-btn" onClick={handleSubmit}>
            提交
          </View>
        </View>
      </ScrollView>

      {/* <Popup
        zIndex={99999}
        closeIcon={<Close size="32rpx" color="#333333" />}
        onClose={() => closePopup('type')}
        closeable
        style={{ height: '90%' }}
        visible={showFollowUpType}
        title="选择跟进类型"
        position="bottom"
      >
        <View className="followUpType">
          <View className="followUpTypeHeader">
            <View className="link" />
            <Text>跟进类型</Text>
          </View>
          {followUpTypeOptions &&
            followUpTypeOptions.length > 0 &&
            followUpTypeOptions.map(option => (
              <View
                key={option.id}
                className={`followUpTypeItem ${option.selected ? 'active' : ''}`}
                onClick={() => selectFollowUpType(option.id)}
              >
                <View className="name">{option.name}</View>
                {option.selected && <Checked color="#2F5AF1" size="30rpx" />}
              </View>
            ))}
        </View>
      </Popup>
      <Popup
        zIndex={99999}
        closeIcon={<Close size="32rpx" color="#333333" />}
        onClose={() => closePopup('method')}
        closeable
        style={{ height: '90%' }}
        visible={showFollowUpMethod}
        title="选择跟进方式"
        position="bottom"
      >
        <View className="followUpType">
          <View className="followUpTypeHeader">
            <View className="link" />
            <Text>跟进方式</Text>
          </View>
          {followUpMethodOptions &&
            followUpMethodOptions.length > 0 &&
            followUpMethodOptions.map(option => (
              <View
                key={option.id}
                className={`followUpTypeItem ${option.selected ? 'active' : ''}`}
                onClick={() => selectFollowUpMethod(option.id)}
              >
                <View className="name">{option.name}</View>
                {option.selected && <Checked color="#2F5AF1" size="30rpx" />}
              </View>
            ))}
        </View>
      </Popup> */}
      {/* <Popup
        zIndex={99999}
        closeIcon={<Close size="32rpx" color="#333333" />}
        onClose={() => closePopup('followUpTime')}
        closeable
        style={{ height: '70%' }}
        visible={showFollowUpTime}
        title="选择跟进时间"
        position="bottom"
      >
        <CalendarCard defaultValue={changeFollowUpTime} onChange={onChangeFollowUpTime} />
        <View className="buttonTime" onClick={() => Timing()}>
          选择时间
        </View>
      </Popup> */}

      <Picker
        title="请选择联系人"
        visible={showContactPicker}
        options={contactInfoOptions.map(item => ({
          text: item.name + '(' + item.phone + ')',
          value: JSON.stringify(item)
        }))}
        defaultValue={[formData.contactInfo]}
        onConfirm={(_, value: string[]) => {
          setFormData({
            ...formData,
            contactInfo: value[0]
          })
          setShowContactPicker(false)
        }}
        onClose={() => setShowContactPicker(false)}
      />
      <Picker
        title="请选择类型"
        visible={showFollowUpTypePicker}
        options={followUpTypeOptions}
        onConfirm={(_, value: string[]) => {
          setFormData({
            ...formData,
            type: value[0]
          })
          setShowFollowUpTypePicker(false)
        }}
        onClose={() => setShowFollowUpTypePicker(false)}
      />
      <Picker
        title="请选择方式"
        visible={showFollowUpMethodPicker}
        options={followUpMethodOptions}
        onConfirm={(_, value: string[]) => {
          setFormData({
            ...formData,
            method: value[0]
          })
          setShowFollowUpMethodPicker(false)
        }}
        onClose={() => setShowFollowUpMethodPicker(false)}
      />
      <DatePicker
        title="选择跟进时间"
        startDate={new Date(1970, 0, 1)}
        endDate={new Date(dayjs().format('YY99-12-31 23:59:59'))}
        defaultValue={new Date()}
        showChinese
        type="datetime"
        visible={showFollowUpTimePicker}
        onClose={() => setShowFollowUpTimePicker(false)}
        onConfirm={(_, values) => {
          const date = values.slice(0, 3).join('-')
          const time = values.slice(-2).join(':')
          setFormData({
            ...formData,
            followUpTime: date + ' ' + time + ':00'
          })
        }}
      />
    </View>
  )
}

export default AddFollowPage
