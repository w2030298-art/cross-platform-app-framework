import { complianceService } from './services/compliance.service'
import { appStore } from './stores/app.store'

App<IAppOption>({
  globalData: {
    privacyAccepted: false
  },
  onLaunch() {
    complianceService.restoreConsent()
    this.globalData.privacyAccepted = appStore.state.privacyAccepted
  }
})
