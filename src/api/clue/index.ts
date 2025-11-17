import { taroRequest, taroPost, taroGet, taroPut, taroDelete } from '@/service'
import {
  clueListURL,
  clueCreateURL,
  clueDeleteURL,
  clueFollowUpDeleteURL,
  clueFollowUpCreateURL,
  clueFollowUpPageURL,
  clueFollowUpUpdateURL,
  uploadFileURL,
  clueFollowUpHistoryURL,
  clueFollowUpDetailURL,
  clueCreateSelectURL
} from '@/service/config'
import type {
  IAPIResponse,
  IClue,
  ICorpContactInfo,
  ICreateClueRequest,
  IFollowUp,
  IGetAllClueListRequest,
  IGetAllClueListResponse,
  IGetClueListRequest,
  IGetDetailRequest,
  IGetFollowUpListRequest,
  IPaginationResponse,
  IResponse,
  IUpdateClueRequest
} from '../types'
import { clueContactSelectURL, clueUpdateURL, getClueDetailURL } from '../url'

// 获得线索列表
export const clueListAPI = (
  data: IGetClueListRequest,
  callback: (res: IResponse<IPaginationResponse<IClue>>) => void
) => {
  taroGet({
    url: clueListURL,
    data,
    success: (res: IResponse<IPaginationResponse<IClue>>) => {
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

// 获得线索列表（异步）
export const getClueListAsyncApi = async (
  data: IGetClueListRequest
): Promise<IAPIResponse<IPaginationResponse<IClue>>> => {
  const response = await taroRequest.getAsync<IAPIResponse<IPaginationResponse<IClue>>>({
    url: clueListURL,
    data
  })
  return response
}

// 获得线索下拉
export const clueListSelectAPI = (
  data: IGetAllClueListRequest,
  callback: (res: IResponse<IGetAllClueListResponse>) => void
) => {
  taroGet({
    url: clueCreateSelectURL,
    data,
    success: (res: IAPIResponse<IGetAllClueListResponse>) => {
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

// 获取线索关联联系人
export const clueContactSelectAPI = (
  data: { creditCode: string },
  callback: (res: IResponse<ICorpContactInfo[]>) => void
) => {
  taroGet({
    url: clueContactSelectURL,
    data,
    success: (res: IAPIResponse<ICorpContactInfo[]>) => {
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

// 创建线索
// export const clueCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
//   taroPost({
//     url: clueCreateURL,
//     data,
//     success: (res: any) => {
//       callback({
//         success: true,
//         data: res.data
//       })
//     },
//     fail: (err: any) => {
//       if (err instanceof Promise) {
//         err.catch(errMsg => {
//           callback({
//             success: false,
//             data: errMsg
//           })
//         })
//       } else {
//         callback({
//           success: false,
//           data: err
//         })
//       }
//     }
//   }).catch(() => {})
// }

// 创建线索
export const clueCreateAPI = async (
  data: ICreateClueRequest
): Promise<IResponse<boolean>> => {
  const response = await taroRequest.postAsync<IResponse<boolean>>({
    url: clueCreateURL,
    data
  })
  return response
}

// 更新线索
export const clueUpdateAPI = (
  data: IUpdateClueRequest,
  callback: (res: IResponse<boolean>) => void
) => {
  taroPut({
    url: clueUpdateURL,
    data,
    success: (res: IAPIResponse<boolean>) => {
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

// 删除线索
export const clueDeleteAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroDelete({
    url: clueDeleteURL + '?unifiedSocialCreditCode=' + data.unifiedSocialCreditCode,
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

// 创建线索跟进
export const clueFollowUpCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: clueFollowUpCreateURL,
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

// 获得线索跟进分页
export const clueFollowUpPageAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueFollowUpPageURL,
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

// 获取跟进列表异步
export const getFollowUpListAsyncAPI = async (
  data: IGetFollowUpListRequest
): Promise<IAPIResponse<IPaginationResponse<IFollowUp>>> => {
  const response = await taroRequest.getAsync<IAPIResponse<IPaginationResponse<IFollowUp>>>({
    url: clueFollowUpPageURL,
    data
  })
  return response
}

// 更新线索跟进
export const clueFollowUpUpdateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPut({
    url: clueFollowUpUpdateURL,
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

// 删除线索跟进
export const clueFollowUpDeleteAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroDelete({
    url: clueFollowUpDeleteURL + '?id=' + data.id,
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

// 获取线索跟进详情
export const clueFollowUpDetailAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueFollowUpDetailURL,
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

// 获取历史记录
export const clueFollowUpHistoryAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: clueFollowUpHistoryURL,
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

// 上传文件
export const uploadFileAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: uploadFileURL,
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

// 获取线索详情
export const getClueDetailAPI = (data: IGetDetailRequest, callback: (res: IResponse<IClue>) => void) => {
  taroGet({
    url: getClueDetailURL,
    data,
    success: (res: IAPIResponse<IClue>) => {
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
