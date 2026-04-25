import { contentService } from '../../services/content.service'
import type { ContentItem } from '../../types/content'
import { complianceService } from '../../services/compliance.service'

const CATEGORIES = ['全部', '家居收纳', '美食菜谱', '健康养生', '实用查询']

type PageData = {
  categories: string[]
  currentCategory: string
  list: ContentItem[]
  loading: boolean
  empty: boolean
  page: number
  hasMore: boolean
  showPrivacy: boolean
}

Page({
  data: {
    categories: CATEGORIES,
    currentCategory: '全部',
    list: [] as ContentItem[],
    loading: true,
    empty: false,
    page: 1,
    hasMore: true,
    showPrivacy: false
  } as PageData,

  onShow() {
    if (!complianceService.hasConsent()) {
      this.setData!({ showPrivacy: true })
    }
  },

  onLoad() {
    this.loadContents(true)
  },

  onPullDownRefresh() {
    this.loadContents(true).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadContents(false)
    }
  },

  async loadContents(reset: boolean) {
    const page = reset ? 1 : (this.data as PageData).page + 1
    this.setData!({ loading: true, empty: false })

    try {
      const res = await contentService.list({
        page,
        pageSize: 10,
        category: (this.data as PageData).currentCategory
      })
      const newList = res.data.list
      const list = reset ? newList : [...(this.data as PageData).list, ...newList]

      this.setData!({
        list,
        page,
        hasMore: newList.length >= 10,
        empty: list.length === 0,
        loading: false
      })
    } catch {
      this.setData!({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const category = e.currentTarget.dataset.category as string
    if (category === (this.data as PageData).currentCategory) return
    this.setData!({ currentCategory: category })
    this.loadContents(true)
  },

  onItemTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onPrivacyAccept() {
    complianceService.acceptPrivacy()
    this.setData!({ showPrivacy: false })
  }
})
