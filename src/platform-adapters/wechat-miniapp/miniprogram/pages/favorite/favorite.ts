import type { ContentItem } from '../../types/content'

const FAVORITE_KEY = 'favorite_ids'
const FAVORITE_DATA_KEY = 'favorite_data'

function getFavoriteData(): Record<string, ContentItem> {
  try { return wx.getStorageSync(FAVORITE_DATA_KEY) || {} } catch { return {} }
}

Page({
  data: {
    list: [] as ContentItem[],
    empty: false
  },

  onShow() {
    this.loadFavorites()
  },

  loadFavorites() {
    const data = getFavoriteData()
    const list = Object.values(data).sort((a, b) => {
      return b.publishedAt.localeCompare(a.publishedAt)
    })
    this.setData!({
      list,
      empty: list.length === 0
    })
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onRemoveTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const ids: string[] = []
    try { const s = wx.getStorageSync('favorite_ids'); if (Array.isArray(s)) ids.push(...s) } catch {}
    const newIds = ids.filter(i => i !== id)
    wx.setStorageSync('favorite_ids', newIds)
    wx.removeStorage({ key: `favorite_data.${id}` })
    const data = getFavoriteData()
    delete data[id]
    wx.setStorageSync('favorite_data', data)
    this.loadFavorites()
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  }
})
