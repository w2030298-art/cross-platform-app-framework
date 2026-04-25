# 微信小程序完整项目架构方案

## Summary
基于调研文件，首版按“工具/资讯类 + 微信原生 TypeScript + 架构文档优先”规划，目标是降低上架审核风险，兼容个人主体和企业主体。

首版默认不接入微信支付、不做社交社区、不涉及教育/医疗/金融/游戏/虚拟物品等特殊资质类目；重点满足微信审核里的类目匹配、隐私弹窗、最小化数据收集、HTTPS/备案域名、内容合规和可维护工程结构。

## Key Architecture
推荐工程结构如下：

```text
wx-miniapp/
  miniprogram/
    app.ts
    app.json
    app.wxss
    sitemap.json
    pages/
      home/
      detail/
      search/
      favorite/
      profile/
      privacy/
      feedback/
    components/
      nav-bar/
      empty-state/
      content-card/
      privacy-consent/
      loading-state/
    services/
      request.ts
      content.service.ts
      user.service.ts
      compliance.service.ts
    stores/
      app.store.ts
      user.store.ts
      content.store.ts
    utils/
      env.ts
      logger.ts
      validator.ts
      date.ts
    config/
      index.ts
      env.dev.ts
      env.prod.ts
    types/
      api.ts
      content.ts
      user.ts
    assets/
  docs/
    product-scope.md
    review-checklist.md
    privacy-policy.md
    release-process.md
  project.config.json
  tsconfig.json
  package.json
  README.md
```

核心分层：

- `pages/` 只负责页面展示、用户交互和生命周期。
- `components/` 放可复用 UI，避免页面重复实现。
- `services/` 统一封装接口请求、内容读取、用户能力和合规逻辑。
- `stores/` 管理全局状态，如用户授权状态、隐私同意状态、内容缓存。
- `config/` 区分开发/生产接口域名，生产域名必须 HTTPS 且已备案。
- `docs/` 固化审核材料、隐私政策、发布流程和上架检查清单。

## Public Interfaces / Types
首版建议只定义最小接口面，避免过度收集用户信息：

```ts
type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

type ContentItem = {
  id: string
  title: string
  summary: string
  coverUrl?: string
  category: string
  publishedAt: string
}

type UserProfile = {
  openid?: string
  nickname?: string
  avatarUrl?: string
  privacyAccepted: boolean
}
```

接口规划：

- `GET /contents`：内容列表，支持分页、分类、关键词。
- `GET /contents/:id`：内容详情。
- `POST /feedback`：用户反馈，仅收集必要文本和联系方式可选项。
- `POST /privacy/accept`：记录隐私政策同意状态。
- 暂不设计订单、支付、社区发布、私信、虚拟商品等高审核风险能力。

## Compliance Design
必须内置这些上架能力：

- 首次进入展示隐私政策弹窗，用户同意后再调用可能涉及用户信息的 API。
- 不主动获取手机号、精确位置、通讯录、相册等敏感权限。
- 所有接口域名使用 HTTPS，并在微信公众平台配置合法域名。
- 小程序内容、名称、图标、简介和服务类目保持一致。
- 默认选择工具/资讯/信息查询方向类目，最终提交时按实际内容选择不超过 3 个微信类目。
- `sitemap.json` 配置搜索收录策略，避免未准备好的页面被索引。
- `docs/review-checklist.md` 记录发布前检查项：隐私、类目、域名、权限、内容、资质。

## Test Plan
验证重点：

- 微信开发者工具可正常编译 TypeScript。
- 首页、详情、搜索、收藏、我的、隐私政策、反馈页可正常访问。
- 未同意隐私政策前，不触发用户信息、登录态或敏感权限请求。
- 网络请求统一经过 `services/request.ts`，错误、超时、空状态有统一处理。
- 生产构建不包含开发域名、调试日志和 mock 数据。
- 发布前按 `docs/review-checklist.md` 完成一轮人工审核。

## Assumptions
- 首版定位为工具/资讯类微信小程序。
- 技术栈使用微信原生小程序 + TypeScript。
- 当前阶段只输出架构文档，不创建或修改本地文件。
- 默认兼容个人主体；如果后续明确为企业主体，可再扩展微信支付、附近小程序、广告投放等能力。
- 后端不强绑定具体技术栈，只要求提供 HTTPS、备案域名和上述最小 API。
