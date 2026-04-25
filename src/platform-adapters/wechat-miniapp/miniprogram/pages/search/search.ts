import { contentService } from '../../services/content.service'
import type { ContentItem } from '../../types/content'

Page({
  data: {
    keyword: '',
    list: [] as ContentItem[],
    loading: false,
    searched: false,
    empty: false
  },

  onInputChange(e: WechatMiniprogram.Input) {
    this.setData!({ keyword: e.detail.value })
  },

  onClear() {
    this.setData!({ keyword: '', list: [], searched: false, empty: false })
  },

  async onSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) {
      wx.showToast({ title: '请输入搜索内容', icon: 'none' })
      return
    }
    this.doSearch(keyword)
  },

  async doSearch(keyword: string) {
    this.setData!({ loading: true, searched: true, empty: false })
    try {
      const res = await contentService.list({ keyword, pageSize: 50 })
      const list = res.data.list
      this.setData!({
        list,
        empty: list.length === 0,
        loading: false
      })
    } catch {
      this.setData!({ loading: false })
      wx.showToast({ title: '搜索失败', icon: 'none' })
    }
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})
