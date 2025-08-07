import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { 
  getCompanyInfoURL, 
  searchCompaniesURL, 
  getProductSellingPointsURL, 
  generateReportURL, 
  enterpriseDetailURL, 
  companyFeedbackCreateURL
 } from '@/service/config'
import type {
  IBusinessInfo,
  ICorpInfoRequest,
  ICorpInfoResponse,
  IPersonInfo,
  IResponse,
  IShareholderInfo,
  IAnnualReport,
  IAnnualReportDetailRequest,
  IAnnualReportDetail,
  IBusinessInfoRequest
} from '../types'
import { 
  getBusinessInfoURL, 
  getPersonInfoURL, 
  getShareholderInfoURL,
  getAnnualReportURL,
  getAnnualReportDetailURL
 } from '../url'

// 获取产品卖点
export const getProductSellingPointsAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: getProductSellingPointsURL,
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

// 获取企业信息
export const companyInfoAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: getCompanyInfoURL,
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

// 搜索企业
export const searchCompaniesAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    // url: searchCompaniesURL + '?name=' + data.name,
    url: searchCompaniesURL,
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

// 生成报告
export const generateReportAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: generateReportURL,
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

// 企业详情
export const enterpriseDetailAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: enterpriseDetailURL,
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

// 企业反馈
export const companyFeedbackCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: companyFeedbackCreateURL,
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

// 获取工商信息
export const getBusinessInfoAPI = (data: IBusinessInfoRequest, callback: (res: IResponse<IBusinessInfo>) => void) => {
  taroGet({
    url: getBusinessInfoURL,
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

// 获取股东信息
export const getShareholderInfoAPI = (data: ICorpInfoRequest, callback: (res: IResponse<ICorpInfoResponse<IShareholderInfo>>) => void) => {
  taroGet({
    url: getShareholderInfoURL,
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

// 获取人员信息
export const getPersonInfoAPI = (data: ICorpInfoRequest, callback: (res: IResponse<ICorpInfoResponse<IPersonInfo>>) => void) => {
  taroGet({
    url: getPersonInfoURL,
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

// 获取企业年报
export const getAnnualReportAPI = (data: ICorpInfoRequest, callback: (res: IResponse<IAnnualReport[]>) => void) => {
  taroGet({
    url: getAnnualReportURL,
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

// 获取企业年报详情
export const getAnnualReportDetailAPI = (data: IAnnualReportDetailRequest, callback: (res: IResponse<IAnnualReportDetail>) => void) => {
  taroGet({
    url: getAnnualReportDetailURL,
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
