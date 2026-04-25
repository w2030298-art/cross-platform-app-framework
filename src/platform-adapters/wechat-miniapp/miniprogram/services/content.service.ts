import { request } from './request'
import type { ApiListResponse } from '../types/api'
import type { ContentItem } from '../types/content'

export const contentService = {
  list(params?: {
    page?: number
    pageSize?: number
    keyword?: string
    category?: string
  }) {
    return request<ApiListResponse<ContentItem>>({
      url: '/contents',
      method: 'GET',
      data: (params || {}) as Record<string, unknown>
    })
  },
  detail(id: string) {
    return request<ContentItem>({
      url: `/contents/${id}`,
      method: 'GET'
    })
  }
}
