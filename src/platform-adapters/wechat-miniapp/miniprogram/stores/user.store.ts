import type { UserProfile } from '../types/user'

class UserStore {
  profile: UserProfile = {
    privacyAccepted: false
  }

  setProfile(profile: UserProfile) {
    this.profile = profile
  }
}

export const userStore = new UserStore()
