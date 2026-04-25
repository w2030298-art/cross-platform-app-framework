Component({
  methods: {
    onAccept() {
      this.triggerEvent('accept')
    },
    onViewPrivacy() {
      wx.navigateTo({ url: '/pages/privacy/privacy' })
    }
  }
})
