export type AppState = {
  privacyAccepted: boolean
}

class AppStore {
  state: AppState = {
    privacyAccepted: false
  }

  setPrivacyAccepted(accepted: boolean) {
    this.state.privacyAccepted = accepted
  }
}

export const appStore = new AppStore()
