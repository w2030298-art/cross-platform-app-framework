# 基础设施配置

## 目录结构

```
infrastructure/
├── k8s/                    # Kubernetes 部署配置
│   ├── namespace.yaml      # 命名空间
│   ├── mysql.yaml          # MySQL StatefulSet
│   ├── redis.yaml           # Redis StatefulSet
│   ├── rabbitmq.yaml        # RabbitMQ StatefulSet
│   ├── elasticsearch.yaml  # ES StatefulSet
│   ├── api-gateway.yaml    # API网关 Deployment
│   ├── user-service.yaml   # 用户服务 Deployment
│   ├── order-service.yaml  # 订单服务 Deployment
│   ├── content-service.yaml # 内容服务 Deployment
│   ├── ai-service.yaml     # AI服务 Deployment
│   └── ingress.yaml         # Ingress配置
├── monitoring/             # 监控告警
│   ├── prometheus/         # Prometheus配置
│   ├── grafana/            # Grafana仪表盘
│   └── alertmanager/       # 告警规则
└── README.md               # 本文件
```

## 环境规划

| 环境 | 用途 | 规格 | 数据库 |
|------|------|------|--------|
| dev | 开发 | 2C4G x 3 | MySQL单机 + Redis单机 |
| staging | 预发 | 4C8G x 3 | MySQL主从 + Redis集群 |
| prod | 生产 | 8C16G x 5+ | MySQL主从 + Redis集群 + ES集群 |

## 核心服务端口规划

| 服务 | 端口 | 说明 |
|------|------|------|
| API Gateway | 8080 | 统一入口，路由分发 |
| User Service | 8081 | 用户中心 |
| Order Service | 8082 | 订单服务 |
| Content Service | 8083 | 内容服务 |
| Marketing Service | 8084 | 营销服务 |
| Approval Service | 8085 | 审批服务 |
| Data Service | 8086 | 数据服务 |
| AI Service | 8087 | AI服务 |
| Payment Service | 8088 | 支付服务 |
| Message Service | 8089 | 消息服务 |

## CI/CD 流水线

```
代码提交 → 单元测试 → 代码扫描 → 构建 → 镜像推送 → 部署staging → E2E测试 → 部署prod(灰度) → 全量发布
```

### 关键配置

- 分支策略：GitFlow（main/develop/feature/release/hotfix）
- 构建工具：GitLab CI + ArgoCD
- 镜像仓库：Harbor
- 灰度策略：金丝雀发布（10% → 30% → 100%）
- 回滚：一键回滚到上一个稳定版本