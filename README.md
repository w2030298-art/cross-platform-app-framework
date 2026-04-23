# 跨平台小程序与开放应用 — 全景项目框架

> 不局限于单一方向或赛道的事无巨细的完整项目框架

## 项目定位

构建覆盖**微信小程序、小红书小程序、飞书开放应用**三大平台的统一技术底座和行业模板引擎，通过可配置的行业方案 + 共享业务逻辑 + AI能力，以最低成本服务最多垂直场景。

## 文档结构

```
docs/
├── 01-strategy/          # 战略全景与市场定位
├── 02-platform-analysis/ # 三大平台生态深度拆解
├── 03-user-research/     # 用户画像矩阵
├── 04-pain-points-and-ideas/ # 痛点-机会映射与Idea清单
├── 05-product-architecture/  # 产品架构设计
├── 06-tech-architecture/     # 技术架构设计
├── 07-business-model/    # 商业模式设计
├── 08-operations-growth/ # 运营与增长体系
├── 09-compliance-risk/   # 合规与风控
├── 10-team-resources/    # 团队与资源
└── 11-roadmap/           # 实施路线图
```

## 代码结构

```
src/
├── platform-adapters/    # 平台适配层（微信/小红书/飞书）
├── shared-business-logic/ # 共享业务逻辑层
├── industry-templates/  # 行业模板引擎（餐饮/美业/教培/零售/制造）
├── ai-engine/            # AI引擎（LLM路由/RAG/Prompt管理）
├── data-platform/        # 数据中台
└── admin-backend/        # 管理后台

infrastructure/           # 基础设施配置
```

## 快速导航

| 文档 | 内容 |
|------|------|
| [战略定位](docs/01-strategy/README.md) | 三平台协同战略、选择矩阵、核心原则 |
| [平台分析](docs/02-platform-analysis/README.md) | 微信/小红书/飞书能力矩阵、限制规则、流量入口 |
| [用户研究](docs/03-user-research/README.md) | 15个细分用户画像、行为特征、核心痛点 |
| [痛点与Idea](docs/04-pain-points-and-ideas/README.md) | 30+可落地Idea、排序矩阵 |
| [产品架构](docs/05-product-architecture/README.md) | 统一架构、行业模板引擎、核心模块设计 |
| [技术架构](docs/06-tech-architecture/README.md) | 微服务架构、技术选型、多端适配、AI引擎 |
| [商业模式](docs/07-business-model/README.md) | 收入模型、定价策略、单位经济 |
| [运营增长](docs/08-operations-growth/README.md) | 获客矩阵、生命周期运营、冷启动策略 |
| [合规风控](docs/09-compliance-risk/README.md) | 平台合规、数据安全、风险矩阵 |
| [团队资源](docs/10-team-resources/README.md) | 团队配置、预算估算 |
| [路线图](docs/11-roadmap/README.md) | 详细里程碑、MoSCoW优先级、关键指标 |