Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    }
  },
  methods: {
    onBack() {
      wx.navigateBack({ delta: 1 })
    }
  }
})
