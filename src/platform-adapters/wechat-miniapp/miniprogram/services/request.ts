import { appConfig } from '../config'
import type { ApiResponse } from '../types/api'
import { tryMock } from './mock'

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type RequestOptions = {
  url: string
  method?: RequestMethod
  data?: Record<string, unknown>
  timeout?: number
}

export const request = <T>(options: RequestOptions): Promise<ApiResponse<T>> => {
  const { url, method = 'GET', data, timeout = 8000 } = options

  const mockResult = tryMock(url, method, data)
  if (mockResult !== null) {
    return Promise.resolve(mockResult as ApiResponse<T>)
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${appConfig.apiBaseUrl}${url}`,
      method,
      data,
      timeout,
      success: (res) => {
        const payload = res.data as ApiResponse<T>
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(payload)
          return
        }
        reject(new Error(payload?.message || 'request failed'))
      },
      fail: () => {
        reject(new Error('network error'))
      }
    })
  })
}
