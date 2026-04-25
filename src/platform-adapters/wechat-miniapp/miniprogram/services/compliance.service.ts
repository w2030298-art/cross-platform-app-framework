import { appStore } from '../stores/app.store'
import { request } from './request'

const PRIVACY_KEY = 'privacy_accepted'

export const complianceService = {
  restoreConsent() {
    const accepted = wx.getStorageSync(PRIVACY_KEY) === true
    appStore.setPrivacyAccepted(accepted)
  },
  hasConsent() {
    return appStore.state.privacyAccepted
  },
  acceptPrivacy() {
    appStore.setPrivacyAccepted(true)
    wx.setStorageSync(PRIVACY_KEY, true)
    return request<null>({
      url: '/privacy/accept',
      method: 'POST',
      data: { accepted: true }
    }).catch(() => undefined)
  }
}
