# 小红书小程序适配层

## 概述

小红书适配层将统一业务逻辑接口转换为小红书小程序API调用，重点处理内容生产、社交互动、电商交易等能力。

## 核心职责

- 小红书登录与用户信息
- 内容发布（笔记嵌入小程序卡片）
- 电商能力（小红书店铺/商品/订单）
- 社交互动（评论/私信/收藏）
- 搜索流量（关键词布局/搜索联想）
- 直播集成（直播带货/预约/回放）

## 目录结构

```
xiaohongshu/
├── adapters/
│   ├── XhsAdapter.ts          # 主适配器实现
│   ├── ContentAdapter.ts      # 内容适配（笔记/搜索）
│   ├── CommerceAdapter.ts     # 电商适配（店铺/商品/订单）
│   ├── SocialAdapter.ts       # 社交适配（评论/私信/收藏）
│   └── AnalyticsAdapter.ts    # 数据分析适配
├── pages/
│   ├── home/                   # 首页（内容发现）
│   ├── product/                # 商品详情
│   ├── order/                  # 下单购买
│   ├── content/                # 内容管理（创作者）
│   └── profile/                # 个人中心
├── components/
│   ├── note-card/              # 笔记卡片
│   ├── product-swiper/         # 商品轮播
│   ├── live-player/            # 直播播放器
│   └── comment-list/           # 评论列表
├── utils/
│   ├── content-analyzer.ts     # 内容分析工具
│   ├── keyword-research.ts      # 关键词研究
│   └── violation-checker.ts     # 违规词检测
└── app.json
```

## 关键实现

### 内容与搜索适配

```typescript
export class XhsAdapter implements PlatformAdapter {
  // 内容相关
  async createNoteWithCard(params: {
    noteId: string;
    miniProgramPath: string;
    title: string;
  }): Promise<void> {
    // 在笔记中嵌入小程序卡片
  }

  async searchKeywords(keyword: string): Promise<{
    suggestions: string[];
    hotWords: string[];
    relatedTopics: string[];
  }> {
    // 搜索关键词联想和热搜词
    return { suggestions: [], hotWords: [], relatedTopics: [] };
  }

  async checkViolation(content: string): Promise<{
    isViolation: boolean;
    violationWords: string[];
    suggestions: string[];
  }> {
    // 违规词检测
    return { isViolation: false, violationWords: [], suggestions: [] };
  }
}
```

### 电商交易适配

```typescript
export class CommerceAdapter {
  async createOrder(params: {
    productId: string;
    skuId: string;
    quantity: number;
    addressId: string;
  }): Promise<string> {
    // 创建小红书订单
    return '';
  }

  async getProductDetail(productId: string): Promise<{
    title: string;
    price: number;
    images: string[];
    specs: Record<string, string[]>;
    stock: number;
  }> {
    // 获取商品详情
    return { title: '', price: 0, images: [], specs: {}, stock: 0 };
  }

  async getLiveProducts(liveId: string): Promise<string[]> {
    // 获取直播间商品列表
    return [];
  }
}
```