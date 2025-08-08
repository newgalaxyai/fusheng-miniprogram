import { BASE_URL, TIME_OUT } from './config'
import TaroRequest from './request'
import { appURL } from './url'
import Taro from '@tarojs/taro'
import { refreshTokenAPI } from '@/api/login'

// 刷新token的API调用
export const refreshToken = async () => {
  const token = Taro.getStorageSync('token')
  const refreshToken = token?.refreshToken
  if (!refreshToken) {
    throw new Error('没有刷新令牌')
  }

  try {
    const result = await refreshTokenAPI(refreshToken)
    if (result.success) {
      // 保存新的token
      Taro.setStorageSync('token', result.data)
      Taro.setStorageSync('loginTime', Date.now())
      return result.data.accessToken
    } else {
      throw new Error(result.errMsg || '刷新令牌失败')
    }
  } catch (error) {
    console.log('刷新token失败:', error)
    throw error
  }
}

// 是否正在刷新token
let isRefreshToken = false

// 等待队列 - 存储待重试的请求
interface PendingRequest {
  config: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  requestInstance: TaroRequest; // 保存请求实例以便重试时使用相同的拦截器
}
const waitQueue: PendingRequest[] = []

// 处理token刷新逻辑
const handleTokenRefresh = async (originalRequest: any, requestInstance: TaroRequest) => {
  return new Promise((resolve, reject) => {
    // 将请求加入等待队列
    waitQueue.push({
      config: originalRequest,
      resolve,
      reject,
      requestInstance
    })

    // 如果已经在刷新token，直接返回
    if (isRefreshToken) {
      return
    }

    // 开始刷新token
    isRefreshToken = true

    refreshToken()
      .then((newToken) => {
        // 刷新成功，处理等待队列中的所有请求
        // console.log('Token刷新成功，重试等待队列中的请求')

        // 为所有等待的请求更新token并重试
        waitQueue.forEach(({ config, resolve, reject, requestInstance }) => {
          config.headers = config.headers || {}
          config.headers['Authorization'] = `Bearer ${newToken}`

          // 使用原始的请求实例重新发起请求，确保经过相同的拦截器处理
          requestInstance.request(config).then(resolve).catch(reject)
        })

        // 清空等待队列
        waitQueue.length = 0
      })
      .catch((error) => {
        console.log('Token刷新失败:', error)

        // 刷新失败，拒绝所有等待的请求
        waitQueue.forEach(({ reject }) => {
          reject(error)
        })

        // 清空等待队列
        waitQueue.length = 0

        // 清除token
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('loginTime')
        Taro.showToast({
          title: '登录过期，请重新登录',
          icon: 'none',
          duration: 2000
        })
        // 跳转登录页
        Taro.reLaunch({ url: '/pages/login/index' })
      })
      .finally(() => {
        // 重置刷新状态
        isRefreshToken = false
      })
  })
}

// 先创建taroRequest实例
const createTaroRequest = (baseURL: string) => {
  const requestInstance = new TaroRequest({
    baseURL,
    timeout: TIME_OUT,
    header: {
      'tenant-id': '1'
    },
    interceptors: {
      requestSuccessFn: config => {
        // 添加token到请求头
        const token = Taro.getStorageSync('token')
        if (token && token.accessToken) {
          config.header = config.header || {}
          config.header.Authorization = `Bearer ${token.accessToken}`
        }
        return config
      },
      requestFailureFn: error => {
        return error
      },
      responseSuccessFn: res => {
        // 统一处理响应数据
        if (res.statusCode === 200) {
          if (res.data.code == 0) {
            return res.data
          } else if (res.data.code == 401) {
            // 处理token失效
            return handleTokenRefresh(res.config, requestInstance)
          } else {
            throw res.data
          }
        } else {
          throw res
        }
      },
      responseFailureFn: error => {
        console.error('Request failed:', error)
        return error
      }
    }
  })

  return requestInstance
}

// 创建不同的请求实例
export const taroRequest = createTaroRequest(BASE_URL + appURL)

// 简化的请求方法，可以直接替换原生Taro.request
export const taroHttpRequest = taroRequest.request.bind(taroRequest)
export const taroGet = taroRequest.get.bind(taroRequest)
export const taroPost = taroRequest.post.bind(taroRequest)
export const taroPut = taroRequest.put.bind(taroRequest)
export const taroDelete = taroRequest.delete.bind(taroRequest)
