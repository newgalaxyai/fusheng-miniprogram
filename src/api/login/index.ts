import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { loginByPhoneURL, loginByCodeURL, loginInfoURL, loginSocialURL, refreshTokenURL, sendSmsCodeURL, validateSmsCodeURL, logoutURL, BASE_URL } from '@/service/config'
import type { IResponse } from '../types'
import { request } from '@tarojs/taro'
import { appURL } from '@/service/url'

// 手机号登录
export const loginByPhoneAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: loginByPhoneURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}

// 获取登录信息
export const loginByInfoAPI = (callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: loginInfoURL,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}

// 社交登录
export const loginSocialAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: loginSocialURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}

// 验证码登录
export const loginByCodeAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: loginByCodeURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}

// 验证短信验证码
export const validateSmsCodeAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: validateSmsCodeURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}

// 发送短信验证码
export const sendSmsCodeAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: sendSmsCodeURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}

// 刷新token
export const refreshTokenAPI = async (refreshToken: string): Promise<any> => {
  const response: any = await request(
    {
      url: `${BASE_URL}${appURL}${refreshTokenURL}`,
      method: 'POST',
      data: { refreshToken },
      header: {
        'Authorization': `Bearer test1`,
        'tenant-id': '1',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  // console.log('刷新token', response);

  if (response.statusCode !== 200) {
    throw new Error('刷新令牌失败')
  }

  if (response.data.code !== 0) {
    return {
      success: false,
      errMsg: response.data.msg || '刷新令牌失败',
      data: response.data.data
    }
  }

  return {
    success: true,
    data: response.data.data
  }
}

// 退出登录
export const logoutAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: logoutURL,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data
      })
    },
    fail: (err: any) => {
      if (err instanceof Promise) {
        err.catch(errMsg => {
          callback({
            success: false,
            data: errMsg
          })
        })
      } else {
        callback({
          success: false,
          data: err
        })
      }
    }
  }).catch(() => { })
}
