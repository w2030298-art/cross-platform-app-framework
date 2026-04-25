Page({
  data: {
    version: '0.1.0',
    menus: [
      { label: '隐私政策', url: '/pages/privacy/privacy' },
      { label: '意见反馈', url: '/pages/feedback/feedback' }
    ]
  },

  onMenuTap(e: WechatMiniprogram.TouchEvent) {
    const url = e.currentTarget.dataset.url as string
    wx.navigateTo({ url })
  }
})
