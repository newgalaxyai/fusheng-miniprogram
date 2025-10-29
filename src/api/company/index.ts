import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import { getCompanyInfoURL, searchCompaniesURL, getProductSellingPointsURL, generateReportURL, enterpriseDetailURL, companyFeedbackCreateURL, enterpriseGraphURL, getCompanyWebNewsListURL, getCompanyWebNewsDetailURL } from '@/service/config'
import type { IBusinessInfo, ICorpInfoRequest, ICorpInfoResponse, IPersonInfo, IResponse, IShareholderInfo, IAnnualReport, IAnnualReportDetailRequest, IAnnualReportDetail, IBusinessInfoRequest, IOutsideInvestment, IBranchOffice, IActualController, IDirectControl, IBusibessPublicity, ISuspectedRelation, IGenerateCorpReportRequest, IAPIResponse, IGenerateCorpReportResponse } from '../types'
import { getBusinessInfoURL, getPersonInfoURL, getShareholderInfoURL, getAnnualReportURL, getAnnualReportDetailURL, getOutsideInvestmentURL, getBranchOfficeURL, getActualControllerURL, getDirectControlURL, getBusinessSelfPublicationURL, getSuspectedRelationURL } from '../url'

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
  }).catch(() => {})
}

// 获取企业图谱
export const getEnterpriseGraphAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: enterpriseGraphURL,
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
  }).catch(() => {})
}

// 获取企业动态列表
export const getCompanyWebNewsListApi = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: getCompanyWebNewsListURL,
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
  }).catch(() => {})
}

// 获取企业动态详情
export const getCompanyWebNewsDetailApi = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: getCompanyWebNewsDetailURL,
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
}

// 生成报告
export const generateReportAPI = (data: IGenerateCorpReportRequest, callback: (res: IResponse<IGenerateCorpReportResponse>) => void) => {
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
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
  }).catch(() => {})
}

// 获取对外投资
export const getOutsideInvestmentAPI = (data: ICorpInfoRequest, callback: (res: IResponse<IOutsideInvestment[]>) => void) => {
  taroGet({
    url: getOutsideInvestmentURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data.result
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
  }).catch(() => {})
}

// 获取分支机构
export const getBranchOfficeAPI = (data: ICorpInfoRequest, callback: (res: IResponse<IBranchOffice[]>) => void) => {
  taroGet({
    url: getBranchOfficeURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data.result
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
  }).catch(() => {})
}

// 获取受益人
export const getActualControllerAPI = (data: ICorpInfoRequest, callback: (res: IResponse<IActualController>) => void) => {
  taroGet({
    url: getActualControllerURL,
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
  }).catch(() => {})
}

// 获取直接控制企业
export const getDirectControlAPI = (data: ICorpInfoRequest, callback: (res: IResponse<IDirectControl[]>) => void) => {
  taroGet({
    url: getDirectControlURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data.list
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
  }).catch(() => {})
}

// 获取工商自主公示
export const getBusinessSelfPublicationAPI = (data: ICorpInfoRequest, callback: (res: IResponse<IBusibessPublicity[]>) => void) => {
  taroGet({
    url: getBusinessSelfPublicationURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data.result
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
  }).catch(() => {})
}

// 获取疑似关系
export const getSuspectedRelationAPI = (data: ICorpInfoRequest, callback: (res: IResponse<ISuspectedRelation[]>) => void) => {
  taroGet({
    url: getSuspectedRelationURL,
    data,
    success: (res: any) => {
      callback({
        success: true,
        data: res.data.list
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
  }).catch(() => {})
}
