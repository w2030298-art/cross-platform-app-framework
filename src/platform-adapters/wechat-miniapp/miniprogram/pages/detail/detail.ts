import { contentService } from '../../services/content.service'
import type { ContentItem } from '../../types/content'

const FAVORITE_KEY = 'favorite_ids'
const FAVORITE_DATA_KEY = 'favorite_data'

function getFavoriteIds(): string[] {
  try { return wx.getStorageSync(FAVORITE_KEY) || [] } catch { return [] }
}

function getFavoriteData(): Record<string, ContentItem> {
  try { return wx.getStorageSync(FAVORITE_DATA_KEY) || {} } catch { return {} }
}

function saveFavorite(ids: string[], data: Record<string, ContentItem>) {
  wx.setStorageSync(FAVORITE_KEY, ids)
  wx.setStorageSync(FAVORITE_DATA_KEY, data)
}

Page({
  data: {
    loading: true,
    item: null as ContentItem & { body: string } | null,
    isFavorite: false
  },

  onLoad(options: Record<string, string>) {
    const id = options.id || ''
    if (id) {
      this.loadDetail(id)
    }
  },

  async loadDetail(id: string) {
    this.setData!({ loading: true })
    try {
      const res = await contentService.detail(id)
      const item = res.data as ContentItem & { body: string }
      const ids = getFavoriteIds()
      this.setData!({
        item,
        loading: false,
        isFavorite: ids.includes(id)
      })
    } catch {
      this.setData!({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onToggleFavorite() {
    const item = this.data.item as (ContentItem & { body: string }) | null
    if (!item) return

    const ids = getFavoriteIds()
    const data = getFavoriteData()
    const isFav = this.data.isFavorite

    if (isFav) {
      const newIds = ids.filter(id => id !== item.id)
      delete data[item.id]
      saveFavorite(newIds, data)
      this.setData!({ isFavorite: false })
      wx.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      ids.push(item.id)
      data[item.id] = item
      saveFavorite(ids, data)
      this.setData!({ isFavorite: true })
      wx.showToast({ title: '已收藏', icon: 'success' })
    }
  },

  onShareAppMessage() {
    const item = this.data.item
    return {
      title: item?.title || '生活百宝箱',
      path: `/pages/detail/detail?id=${item?.id || ''}`
    }
  }
})
