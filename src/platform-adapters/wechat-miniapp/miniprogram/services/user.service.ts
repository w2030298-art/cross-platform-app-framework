import { request } from './request'
import type { UserProfile } from '../types/user'

export const userService = {
  profile() {
    return request<UserProfile>({
      url: '/user/profile',
      method: 'GET'
    })
  },
  feedback(payload: { content: string; contact?: string }) {
    return request<null>({
      url: '/feedback',
      method: 'POST',
      data: payload as Record<string, unknown>
    })
  }
}
