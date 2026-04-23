# 6. 技术架构设计

## 6.1 整体技术架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          客户端层                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │微信小程序 │  │小红书小程序│  │飞书应用  │  │管理后台H5│           │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘           │
└────────┼─────────────┼─────────────┼─────────────┼────────────────┘
         │             │             │             │
┌────────┴─────────────┴─────────────┴─────────────┴────────────────┐
│                       API Gateway / BFF层                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │微信BFF   │  │小红书BFF │  │飞书BIF   │  │管理端BIF │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────────┐
│                       微服务层                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  │用户服务│ │商品服务│ │订单服务│ │内容服务│ │消息服务│            │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│  │营销服务│ │审批服务│ │数据服务│ │AI服务  │ │支付服务│            │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘            │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────────┐
│                       中间件 & 基础设施                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Redis    │ │ RabbitMQ │ │ Elasticsearch│ │ MinIO  │             │
│  │ 缓存     │ │ 消息队列 │ │  搜索引擎   │ │ 对象存储│             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ MySQL    │ │ ClickHouse│ │ Nacos    │ │ Sentinel │             │
│  │ 业务数据 │ │ 分析数据  │ │ 注册中心 │ │ 限流熔断 │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

## 6.2 技术选型详细

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| **微信小程序** | 原生WXML/WXSS + uni-app | 主包优化更好，uni-app做分包跨端 |
| **小红书小程序** | 小红书官方框架 + React | 遵循小红书开发规范 |
| **飞书应用** | Vue3 + 飞书前端组件库 | 飞书设计规范，快速接入 |
| **管理后台** | React + Ant Design Pro | 企业级后台成熟方案 |
| **BFF层** | Node.js (NestJS) | 轻量、灵活、前后端数据聚合 |
| **微服务** | Java (Spring Boot) / Go | 核心业务稳定性，高并发场景 |
| **数据库** | MySQL 8.0 + TiDB | OLTP + 水平扩展 |
| **缓存** | Redis Cluster | 会话、热点数据、分布式锁 |
| **搜索** | Elasticsearch | 全文检索，日志分析 |
| **消息队列** | RabbitMQ | 异步任务、事件驱动、削峰 |
| **分析库** | ClickHouse | 实时OLAP分析 |
| **对象存储** | MinIO / 阿里云OSS | 文件/图片/视频存储 |
| **AI服务** | Python + FastAPI | 接入各家LLM API |
| **部署** | K8s + Helm | 容器化、弹性伸缩 |
| **监控** | Prometheus + Grafana + Skywalking | 全链路追踪、告警 |
| **CI/CD** | GitLab CI + ArgoCD | 自动化构建、灰度发布 |

## 6.3 多端适配架构

```
                    ┌─────────────────┐
                    │  共享业务逻辑层   │
                    │  (TypeScript)    │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                   │
    ┌──────┴──────┐  ┌──────┴──────┐  ┌────────┴──────┐
    │  微信适配层  │  │ 小红书适配层 │  │  飞书适配层    │
    │             │  │             │  │               │
    │ - wx API   │  │ - xhs API  │  │ - feishu API  │
    │ - 支付桥接  │  │ - 内容桥接  │  │ - 审批桥接    │
    │ - 分享桥接  │  │ - 社交桥接  │  │ - 消息桥接    │
    │ - 订阅消息  │  │ - 广告桥接  │  │ - 多维表格    │
    └─────────────┘  └─────────────┘  └───────────────┘
```

### 适配层接口设计

```typescript
interface PlatformAdapter {
  login(): Promise<UserInfo>;
  pay(params: PayParams): Promise<PayResult>;
  share(params: ShareParams): Promise<void>;
  sendMessage(params: MessageParams): Promise<void>;
  getUserInfo(): Promise<UserInfo>;
  getSystemInfo(): Promise<SystemInfo>;
  navigateTo(page: string): void;
  storage: StorageAdapter;
  network: NetworkAdapter;
}
```

## 6.4 AI 引擎架构

```
┌─────────────────────────────────────────────┐
│                 AI 引擎                       │
│                                              │
│  ┌─────────────┐    ┌──────────────┐         │
│  │  Prompt管理  │    │  RAG知识库    │         │
│  │  (模板+变量) │    │ (飞书文档/     │         │
│  │             │    │  行业知识/     │         │
│  │             │    │  商品信息)     │         │
│  └──────┬──────┘    └──────┬───────┘         │
│         │                  │                  │
│  ┌──────┴──────────────────┴───────┐          │
│  │       LLM 路由层                │          │
│  │  简单任务 → Gemini Flash (低成本)│          │
│  │  中等任务 → GPT-4o-mini         │          │
│  │  复杂任务 → Claude/GPT-4o       │          │
│  │  私有部署 → 本地模型             │          │
│  └──────────┬──────────────────────┘          │
│             │                                │
│  ┌──────────┴──────────────────────┐          │
│  │       能力层                      │          │
│  │  - 文案生成（小红书种草文）        │          │
│  │  - 对话客服（智能问答+转人工）    │          │
│  │  - 内容分析（竞品/爆款）          │          │
│  │  - OCR识别（票据/合同）           │          │
│  │  - 摘要总结（会议纪要）            │          │
│  │  - 数据洞察（自然语言查数据）     │          │
│  └─────────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

## 6.5 核心数据模型

```sql
-- 统一用户模型
CREATE TABLE unified_users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100),
  union_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 1,
  INDEX idx_phone (phone),
  INDEX idx_union_id (union_id)
);

-- 平台身份关联
CREATE TABLE platform_identities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  unified_user_id BIGINT,
  platform ENUM('wechat', 'xiaohongshu', 'feishu'),
  platform_user_id VARCHAR(128),
  platform_open_id VARCHAR(128),
  platform_union_id VARCHAR(128),
  nickname VARCHAR(128),
  avatar_url VARCHAR(512),
  extra_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_platform_user (platform, platform_user_id),
  INDEX idx_unified_user (unified_user_id)
);

-- 用户标签
CREATE TABLE user_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  unified_user_id BIGINT,
  tag_key VARCHAR(64),
  tag_value VARCHAR(256),
  tag_source ENUM('auto', 'manual', 'import'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_tag (unified_user_id, tag_key)
);

-- 行为事件
CREATE TABLE user_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  unified_user_id BIGINT,
  event_name VARCHAR(128),
  event_properties JSON,
  platform VARCHAR(32),
  session_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_time (unified_user_id, created_at),
  INDEX idx_event_time (event_name, created_at)
);

-- 会员体系
CREATE TABLE memberships (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  unified_user_id BIGINT,
  merchant_id BIGINT,
  level INT DEFAULT 1,
  points INT DEFAULT 0,
  balance DECIMAL(12,2) DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_merchant (unified_user_id, merchant_id)
);
```

## 6.6 关键性能指标

| 指标 | 目标值 |
|------|--------|
| API平均响应时间 | < 200ms |
| API P99响应时间 | < 1s |
| 小程序首屏加载时间 | < 1.5s |
| 系统可用性 | 99.9% |
| 消息推送送达率 | > 99% |
| 支付成功率 | > 99.5% |
| 数据看板刷新延迟 | < 5min |
| AI接口响应时间 | < 3s |