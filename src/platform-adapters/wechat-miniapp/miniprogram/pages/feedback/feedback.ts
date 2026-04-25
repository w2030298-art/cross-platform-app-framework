import { userService } from '../../services/user.service'
import { validator } from '../../utils/validator'

Page({
  data: {
    content: '',
    contact: '',
    submitting: false
  },

  onContentInput(e: WechatMiniprogram.TextareaInput) {
    this.setData!({ content: e.detail.value })
  },

  onContactInput(e: WechatMiniprogram.Input) {
    this.setData!({ contact: e.detail.value })
  },

  async onSubmit() {
    const { content, contact } = this.data
    if (!validator.feedbackLength(content)) {
      wx.showToast({ title: '请输入1-500字的反馈内容', icon: 'none' })
      return
    }
    if (contact && !validator.required(contact)) {
      wx.showToast({ title: '联系方式格式有误', icon: 'none' })
      return
    }

    this.setData!({ submitting: true })
    try {
      await userService.feedback({
        content: content.trim(),
        contact: contact.trim() || undefined
      })
      wx.showToast({ title: '提交成功，感谢反馈', icon: 'success' })
      this.setData!({ content: '', contact: '' })
    } catch {
      wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
    } finally {
      this.setData!({ submitting: false })
    }
  }
})
