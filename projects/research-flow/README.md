# 研飞 ResearchFlow

科研团队一站式协作平台 — 实验记录 · 组会管理 · 论文进度 · 设备预约

## 快速开始

### 1. 安装依赖

```bash
npm run setup
```

### 2. 启动 PostgreSQL

```bash
docker-compose up -d postgres
```

### 3. 初始化数据库

```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001
- 数据库管理: http://localhost:5555 (运行 `npm run db:studio`)

### 5. 登录

- **开发模式**: 点击「快速登录 (Mock)」
- **飞书SSO**: 需要配置飞书应用

## 飞书应用配置

### 1. 创建应用

1. 访问 [飞书开发者后台](https://open.feishu.cn/app/)
2. 创建「企业自建应用」
3. 获取 App ID 和 App Secret

### 2. 配置权限

在「权限管理」中添加：

- `contact:user.base:readonly` - 读取用户信息
- `message:send_as_bot` - 机器人发消息
- `calendar:calendar` - 日历读写
- `docx:document` - 文档读写
- `bitable:bitable` - 多维表格
- `approval:approval` - 审批

### 3. 配置应用功能

1. 启用「机器人」
2. 启用「网页应用」
3. 配置「事件订阅」

### 4. 更新配置

编辑 `backend/.env`：

```env
FEISHU_APP_ID=你的App ID
FEISHU_APP_SECRET=你的App Secret
```

### 5. 配置重定向URI

在飞书开发者后台 → 安全设置 → 重定向URL：

```
http://localhost:5173/auth/callback
```

## 项目结构

```
research-flow/
├── backend/                    # 后端 API
│   ├── prisma/
│   │   ├── schema.prisma      # 数据库模型
│   │   └── seed.ts            # 示例数据
│   └── src/
│       ├── routes/            # API 路由
│       ├── services/          # 业务逻辑
│       └── feishu/            # 飞书集成
├── feishu-app/                # 前端应用
│   └── src/
│       ├── pages/             # 页面组件
│       ├── services/          # API 服务
│       └── stores/            # 状态管理
├── docker-compose.yml         # 开发环境
└── docs/                      # 文档
```

## 核心功能

- **实验记录**: 创建、编辑、查看实验，支持批注系统
- **组会管理**: 自动生成周报，Markdown 导出
- **论文进度**: 甘特图可视化，里程碑管理
- **导师看板**: 本周统计、学生进度、论文进展
- **设备预约**: 冲突检测，审批流

## 技术栈

- **后端**: Express + TypeScript + Prisma + PostgreSQL
- **前端**: Vue 3 + Pinia + Vue Router + Axios
- **飞书**: SSO 认证 + 机器人 + 审批 + 多维表格

## 开发命令

```bash
# 启动所有服务
npm run dev

# 仅启动后端
npm run dev:backend

# 仅启动前端
npm run dev:feishu

# 数据库迁移
npm run db:migrate

# 填充示例数据
npm run db:seed

# 打开数据库管理界面
npm run db:studio
```

## 部署

### Docker 部署

```bash
docker-compose up -d
```

### 手动部署

1. 构建后端: `npm run build:backend`
2. 构建前端: `npm run build:feishu`
3. 配置环境变量
4. 运行迁移: `npx prisma migrate deploy`
5. 启动服务: `node backend/dist/index.js`

## 相关文档

- [飞书开放平台文档](https://open.feishu.cn/document/)
- [Prisma 文档](https://www.prisma.io/docs)
- [Vue 3 文档](https://vuejs.org/)