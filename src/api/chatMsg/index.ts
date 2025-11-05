import { taroPost, taroGet, taroPut, taroDelete } from '@/service'
import {
  textStageURL,
  companyStageURL,
  guessYouWantURL,
  aiSessionCreateURL,
  aiMessageCreateURL,
  aiSessionGetURL,
  aiSessionGetHistorySessionURL,
  aiSessionListURL,
  aiSessionPageURL,
  aiSessionUpdateURL,
  aiMessageEvaluationCreateURL,
  aiMessageEvaluationDeleteURL,
  userFavoriteCreateURL,
  userFavoriteListURL,
  userFavoriteDeleteURL,
  aiSessionDeleteURL,
  configPreprocessingURL
} from '@/service/config'
import type { IResponse } from '../types'
import Taro from '@tarojs/taro'
import { IStreamAIAnswerRequest, IStreamEvent, IStreamName } from '../types'

export const textStageAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: textStageURL,
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

export const companyStageAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: companyStageURL,
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

export const guessYouWantAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: guessYouWantURL,
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

export const aiSessionCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: aiSessionCreateURL,
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

export const aiMessageCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: aiMessageCreateURL,
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

export const aiSessionGetAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: aiSessionGetURL,
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

export const aiSessionGetHistorySessionAPI = (
  data: any,
  callback: (res: IResponse<any>) => void
) => {
  taroGet({
    url: aiSessionGetHistorySessionURL,
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

export const aiSessionListAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: aiSessionListURL,
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

export const aiSessionPageAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: aiSessionPageURL,
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

export const aiSessionUpdateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPut({
    url: aiSessionUpdateURL,
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

export const aiMessageEvaluationCreateAPI = (
  data: any,
  callback: (res: IResponse<any>) => void
) => {
  taroPost({
    url: aiMessageEvaluationCreateURL,
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

export const aiMessageEvaluationDeleteAPI = (
  data: any,
  callback: (res: IResponse<any>) => void
) => {
  taroDelete({
    url: aiMessageEvaluationDeleteURL + '?id=' + data.id,
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

export const aiSessionDeleteAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroDelete({
    url: aiSessionDeleteURL + '?id=' + data.id,
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

export const userFavoriteCreateAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: userFavoriteCreateURL,
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

export const userFavoriteDeleteAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroDelete({
    url: userFavoriteDeleteURL + '?id=' + data.id,
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

export const userFavoriteListAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroGet({
    url: userFavoriteListURL,
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

export const preprocessingAPI = (data: any, callback: (res: IResponse<any>) => void) => {
  taroPost({
    url: configPreprocessingURL,
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

// 流式AI回答（SSE，通过 Taro.request 原生能力）
export const streamAIAnswerAPI = (
  data: IStreamAIAnswerRequest,
  handlers: {
    onMessage?: (event: IStreamEvent) => void
    onError?: (err: any) => void
    onComplete?: () => void
  }
) => {
  const url = 'https://find-console.newgalaxyai.com/ai/ask'
  const token = Taro.getStorageSync('token')

  let lastText = ''

  const requestTask = Taro.request({
    url,
    method: 'POST',
    header: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    data,
    enableChunked: true,
    responseType: 'text',
    success: () => {
      // 完整接收由 onChunkReceived 驱动，无需处理
    },
    fail: (error) => {
      handlers.onError?.(error)
    },
    complete: () => {
      handlers.onComplete?.()
    }
  })

  const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null

  requestTask.onChunkReceived((res) => {
    try {
      let chunkStr = ''
      if (typeof res.data === 'string') {
        chunkStr = res.data as string
      } else {
        const uint8Array = new Uint8Array(res.data as ArrayBuffer)
        chunkStr = decoder ? decoder.decode(uint8Array) : String.fromCharCode.apply(null, Array.from(uint8Array))
      }
      let text = lastText + chunkStr
      lastText = ''
      let arr = text.split(/\r?\n\r?\n/).filter(Boolean)
      let lastIndex = arr.length - 1

      // 如果最后一块无法解析，暂存到 lastText 等待下次
      try {
        const allParsable = arr.every(item => {
          const cleaned = item.replace(/^data:\s*/i, '').trim()
          JSON.parse(cleaned)
          return true
        })
        if (!allParsable && arr.length) {
          throw new Error('chunk not fully parsable')
        }
      } catch (_) {
        lastText = arr[lastIndex]
        arr = arr.filter((_, i) => i !== lastIndex)
      }

      if (arr.length) {
        arr.forEach(msg => {
          try {
            const cleaned = msg.replace(/^data:\s*/i, '').trim()
            const parsed: any = JSON.parse(cleaned)

            // 兼容 event/name 字段
            let name: IStreamName | undefined
            let payload: any

            if (parsed.event) {
              const eventMap: Record<string, IStreamName> = {
                message: 'text',
                message_end: 'end_text'
              }
              name = eventMap[parsed.event] || parsed.event
              payload = parsed.answer ?? parsed.data ?? parsed.conversation_id ?? parsed
            } else if (parsed.name) {
              name = parsed.name as IStreamName
              payload = parsed.data
            } else if (parsed.conversation_id) {
              name = 'conversation_id'
              payload = parsed.conversation_id
            } else {
              name = 'text'
              payload = parsed.answer ?? cleaned
            }

            handlers.onMessage?.({ name: name as IStreamName, data: payload })
          } catch (err) {
            // 单条解析失败，累积到 lastText
            lastText += msg
          }
        })
      }
    } catch (error) {
      handlers.onError?.(error)
    }
  })

  return requestTask
}
