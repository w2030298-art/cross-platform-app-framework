# AGENTS.md

## 项目概览

微信小程序项目（`wx-miniapp-scaffold`），定位生活工具类，脚手架已完成基础功能实现。

- 源码根目录：`miniprogram/`
- 微信开发者工具工程配置：`project.config.json`（`miniprogramRoot: "miniprogram/"`）
- 小程序有独立 appid：`touristappid`（占位），上线前需替换

## 开发者命令

```bash
# 安装依赖（Windows 平台用 npm.cmd，不是 npm）
npm.cmd install

# 类型检查
npm.cmd run typecheck
```

## 关键架构约束

- **tabBar 页面**：首页 `/pages/home/home`、收藏 `/pages/favorite/favorite`、我的 `/pages/profile/profile` 是 tabBar 入口，不能用 `wx.navigateTo`，需用 `wx.switchTab`
- **组件注册**：每个页面/组件的 `.json` 必须声明 `usingComponents`，即使为空也要有 `"usingComponents": {}`
- **全局类型**：所有全局类型定义放在 `miniprogram/global.d.ts`，不要创建与 `.ts` 同名的 `.d.ts` 文件（TypeScript 会将其绑定为模块声明，导致全局类型无法访问）
- **Mock 数据**：开发环境（`envVersion !== 'release'`）自动启用 `services/mock.ts`，生产环境自动关闭；切换到真实后端时只需修改 `config/env.prod.ts` 中的域名
- **收藏存储**：收藏数据存在 `wx.localStorage`，key 为 `favorite_ids` 和 `favorite_data`，不上传服务器
- **隐私弹窗**：由 `components/privacy-consent/` 组件实现，首次 `onShow` 时通过 `complianceService.hasConsent()` 检测是否已同意，未同意则弹出遮罩

## 目录结构

```
miniprogram/
  pages/         7个页面（home/detail/search/favorite/profile/privacy/feedback）
  components/    5个组件（content-card/loading-state/empty-state/privacy-consent/nav-bar）
  services/      request.ts（请求封装）、mock.ts（Mock数据）、content/user/compliance.service.ts
  stores/        app.store.ts、user.store.ts、content.store.ts
  utils/         env.ts、logger.ts、validator.ts、date.ts
  config/        index.ts（自动选环境）、env.dev.ts、env.prod.ts
  types/         api.ts、content.ts、user.ts
  assets/tab/    tabBar 图标（PNG）
```

## 框架/工具链注意事项

- 微信小程序不支持 ES Module `import/export` 默认导出语法在某些构建配置下，需确认 `tsconfig.json` 的 `module` 和 `lib` 设置正确（当前为 `ESNext` + `ES2020`）
- 微信小程序中 `Page`、`Component`、`App` 的泛型参数（如 `Page<Data>`）需与页面 data 类型匹配
- `wx.getAccountInfoSync()` 在开发者工具中可能抛异常，`services/mock.ts` 中有 try-catch 保护
