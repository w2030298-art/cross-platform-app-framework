import type { ContentItem } from '../types/content'
import type { ApiListResponse } from '../types/api'

const MOCK_CONTENTS: ContentItem[] = [
  {
    id: '1',
    title: '厨房去油污小妙招',
    summary: '用小苏打加白醋喷雾，轻松去除厨房台面和灶具上的顽固油污，安全环保又省钱。',
    coverUrl: '',
    category: '家居收纳',
    publishedAt: '2026-04-20'
  },
  {
    id: '2',
    title: '衣服顽固污渍清洗技巧',
    summary: '不同材质衣物的污渍处理方法不同，掌握这些技巧让你的衣物焕然一新。',
    coverUrl: '',
    category: '家居收纳',
    publishedAt: '2026-04-19'
  },
  {
    id: '3',
    title: '三款快手早餐推荐',
    summary: '忙碌的早晨也能吃到营养美味的早餐，15分钟搞定，全家都爱吃的三款快手早餐。',
    coverUrl: '',
    category: '美食菜谱',
    publishedAt: '2026-04-18'
  },
  {
    id: '4',
    title: '红烧肉的懒人做法',
    summary: '不用炒糖色也能做出色泽红亮、入口即化的红烧肉，新手也能一次成功。',
    coverUrl: '',
    category: '美食菜谱',
    publishedAt: '2026-04-17'
  },
  {
    id: '5',
    title: '春季养生汤品推荐',
    summary: '春季适合喝什么汤？五款时令养生汤品，帮你调理脾胃、增强免疫力。',
    coverUrl: '',
    category: '健康养生',
    publishedAt: '2026-04-16'
  },
  {
    id: '6',
    title: '办公室肩颈拉伸指南',
    summary: '久坐办公肩颈酸痛？六个简单拉伸动作，每天5分钟缓解肩颈不适。',
    coverUrl: '',
    category: '健康养生',
    publishedAt: '2026-04-15'
  },
  {
    id: '7',
    title: '居家收纳的十个黄金法则',
    summary: '告别杂乱无章，十个实用收纳法则让你的家井井有条，生活更舒心。',
    coverUrl: '',
    category: '家居收纳',
    publishedAt: '2026-04-14'
  },
  {
    id: '8',
    title: '手机省电小技巧',
    summary: '手机电量总是不够用？这些设置和习惯帮你大幅延长手机续航时间。',
    coverUrl: '',
    category: '实用查询',
    publishedAt: '2026-04-13'
  },
  {
    id: '9',
    title: '快递包装盒的二次利用',
    summary: '别再扔快递盒了！这些创意改造让快递盒变成收纳神器，环保又实用。',
    coverUrl: '',
    category: '家居收纳',
    publishedAt: '2026-04-12'
  },
  {
    id: '10',
    title: '常见食物搭配禁忌',
    summary: '有些食物搭配食用可能影响营养吸收甚至对身体不利，这些常见搭配你中招了吗？',
    coverUrl: '',
    category: '健康养生',
    publishedAt: '2026-04-11'
  },
  {
    id: '11',
    title: '一周快手晚餐计划',
    summary: '不知道每天做什么菜？这份一周晚餐计划帮你解决选择困难，省时又营养。',
    coverUrl: '',
    category: '美食菜谱',
    publishedAt: '2026-04-10'
  },
  {
    id: '12',
    title: '租房改造低成本技巧',
    summary: '租房也能住出品质感，这些低成本改造技巧让你拥有温馨小窝。',
    coverUrl: '',
    category: '家居收纳',
    publishedAt: '2026-04-09'
  }
]

const MOCK_DETAIL: Record<string, ContentItem & { body: string }> = {
  '1': {
    ...MOCK_CONTENTS[0],
    body: '厨房油污一直是家庭清洁的一大难题。今天分享一个简单高效的方法：\n\n1. 准备材料：小苏打粉、白醋、喷壶、抹布\n2. 将两勺小苏打粉加入喷壶，倒入适量白醋，加水稀释摇匀\n3. 将混合液喷洒在油污表面，静置10-15分钟\n4. 用抹布擦拭，顽固油污可用旧牙刷辅助刷洗\n5. 最后用温水冲洗干净即可\n\n小贴士：定期清洁比积攒后大扫除更省力，建议每周用此方法清洁一次灶台和台面。'
  },
  '2': {
    ...MOCK_CONTENTS[1],
    body: '不同类型的污渍需要不同的处理方式：\n\n油渍：在污渍处撒上爽身粉或玉米淀粉，静置30分钟吸油后刷掉，再用洗洁精搓洗。\n\n墨水渍：将牛奶加热后浸泡污渍处30分钟，再用肥皂清洗。\n\n血渍：务必用冷水清洗，热水会使蛋白质凝固更难去除。先用冷水冲洗，再涂抹肥皂搓洗。\n\n果汁渍：立即用盐撒在污渍上吸附液体，然后用白醋和水1:1混合液清洗。\n\n茶渍/咖啡渍：用甘油和蛋黄混合涂抹，静置后用温水清洗。'
  }
}

function getDetail(id: string): ContentItem & { body: string } | undefined {
  if (MOCK_DETAIL[id]) return MOCK_DETAIL[id]
  const item = MOCK_CONTENTS.find(c => c.id === id)
  if (!item) return undefined
  return { ...item, body: '这是该文章的详细内容，更多生活小技巧持续更新中，敬请期待！' }
}

type MockHandler = (params?: Record<string, unknown>) => unknown

const mockRoutes: Record<string, MockHandler> = {
  '/contents': (params) => {
    const p = params || {}
    const page = Number(p.page) || 1
    const pageSize = Number(p.pageSize) || 10
    const keyword = (p.keyword as string) || ''
    const category = (p.category as string) || ''

    let filtered = [...MOCK_CONTENTS]
    if (category && category !== '全部') {
      filtered = filtered.filter(c => c.category === category)
    }
    if (keyword) {
      const kw = keyword.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(kw) || c.summary.toLowerCase().includes(kw)
      )
    }

    const start = (page - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)

    const result: ApiListResponse<ContentItem> = {
      list,
      total: filtered.length,
      page,
      pageSize
    }
    return { code: 0, message: 'ok', data: result }
  },
  '/contents/detail': (params) => {
    const id = (params as Record<string, string>)?.id || ''
    const item = getDetail(id)
    if (!item) return { code: 404, message: 'not found', data: null }
    return { code: 0, message: 'ok', data: item }
  },
  '/feedback': () => {
    return { code: 0, message: 'ok', data: null }
  },
  '/privacy/accept': () => {
    return { code: 0, message: 'ok', data: null }
  }
}

function matchRoute(url: string): string | null {
  if (mockRoutes[url]) return url
  if (url.startsWith('/contents/') && url !== '/contents') return '/contents/detail'
  return null
}

export const isMockEnabled = (): boolean => {
  try {
    const info = wx.getAccountInfoSync()
    return info.miniProgram.envVersion !== 'release'
  } catch {
    return true
  }
}

export const tryMock = (url: string, method: string, data?: Record<string, unknown>): unknown | null => {
  if (!isMockEnabled()) return null

  const matched = matchRoute(url)
  if (!matched) return null

  const handler = mockRoutes[matched]
  if (matched === '/contents/detail') {
    const id = url.replace('/contents/', '')
    return handler({ id })
  }

  if (method === 'GET') {
    return handler(data)
  }
  if (method === 'POST') {
    return handler(data)
  }

  return null
}
