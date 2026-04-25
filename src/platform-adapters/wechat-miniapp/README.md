# 微信小程序最小脚手架

本项目按 `PLAN.md` 搭建最小可运行结构，定位为**生活工具类**小程序，目标是快速起步并保留后续扩展空间。

## 目录

- `miniprogram/`：小程序源码
  - `pages/`：7 个页面（首页、详情、搜索、收藏、我的、隐私政策、反馈）
  - `components/`：5 个组件（content-card、loading-state、empty-state、privacy-consent、nav-bar）
  - `services/`：服务层（request、content、user、compliance、mock）
  - `stores/`：状态管理（app、user、content）
  - `utils/`：工具函数（env、logger、validator、date）
  - `config/`：环境配置（开发/生产）
  - `types/`：TypeScript 类型定义
  - `assets/`：静态资源（tabBar 图标）
- `docs/`：产品范围、审核清单、隐私政策、发布流程
- `project.config.json`：微信开发者工具工程配置
- `tsconfig.json`：TypeScript 配置

## 核心功能

- **首页**：内容列表 + 分类筛选 + 下拉刷新/上拉加载
- **详情页**：内容详情 + 收藏/取消收藏 + 分享
- **搜索页**：关键词搜索内容
- **收藏页**：本地存储收藏列表，支持取消收藏
- **我的**：个人信息 + 隐私政策/反馈入口
- **隐私政策**：完整的隐私政策文本展示
- **意见反馈**：表单提交反馈内容
- **隐私弹窗**：首次进入展示隐私政策，同意后方可使用

## Mock 数据

开发环境下自动启用 Mock 数据，无需后端即可预览全部功能。Mock 数据包含 12 条生活工具类示例内容（家居收纳、美食菜谱、健康养生、实用查询）。

生产环境下 Mock 自动关闭，请求将发送到 `config/env.prod.ts` 配置的真实 API 地址。

## 本地使用

1. 使用微信开发者工具打开项目根目录。
2. 执行 `npm install` 安装类型依赖。
3. 执行 `npm run typecheck` 做基础类型检查。
4. 在微信开发者工具中点击"编译"预览。

## 说明

当前为 MVP 版本，后端 API 接入时替换 `config/env.prod.ts` 中的域名即可切换为真实数据。
