export type RuntimeEnv = 'develop' | 'trial' | 'release'

export const getRuntimeEnv = (): RuntimeEnv => {
  try {
    const info = wx.getAccountInfoSync()
    return (info.miniProgram.envVersion as RuntimeEnv) || 'develop'
  } catch (_error) {
    return 'develop'
  }
}
