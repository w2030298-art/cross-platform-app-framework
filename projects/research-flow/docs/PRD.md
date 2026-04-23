# 研飞 ResearchFlow — MVP 产品需求规格说明书

> 版本: v0.1 | 最后更新: 2026-04-22

## 一、产品概述

### 1.1 产品定位
研飞是一款飞书开放应用，为科研团队（导师+研究生）提供一站式科研协作平台，覆盖实验记录、组会管理、论文进度、设备预约四大场景。

### 1.2 目标用户

| 角色 | 核心诉求 | 使用频率 |
|------|---------|---------|
| 导师/PI | 一眼看所有学生进展、组会效率、论文进度 | 每周2-3次 |
| 博士生 | 实验记录、论文管理、组会准备 | 每天 |
| 硕士生 | 实验记录、进度汇报 | 每天 |
| 博后/研究员 | 项目管理、实验记录、跨组协作 | 每天 |
| 实验室管理员 | 设备管理、财务报销、采购 | 每周 |

### 1.3 核心价值主张

```
导师：不再问"你这周做了什么"，一眼看到全组进展
学生：不再手写实验记录本，不再截图粘PPT做组会
课题组：实验记录、组会纪要、论文进度全部在一个地方
```

---

## 二、MVP功能规格（6周交付）

### 2.1 模块一：实验记录

#### EP-001 创建实验日志

**优先级**: P0  
**描述**: 学生可以创建一条实验日志，记录当天实验内容

**字段定义**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 标题 | text(200) | 是 | 实验标题，如"DQN调参实验-lr=0.001" |
| 日期 | date | 是 | 默认今天 |
| 实验类型 | select | 是 | 预置：算法验证/超参调优/消融实验/复现实验/其他 |
| 状态 | select | 是 | 进行中/已完成/失败/暂停 |
| 目的 | textarea | 否 | 本次实验要验证什么假设 |
| 过程 | richtext | 否 | 实验过程记录，支持插入图片/代码/附件 |
| 结果 | textarea | 否 | 实验结果摘要 |
| 结论 | textarea | 否 | 实验结论和下一步 |
| 关联项目 | ref | 否 | 关联到具体项目/论文 |
| 标签 | multi-select | 否 | 自定义标签，如"baseline"/"ablation" |

**交互流程**:
1. 用户点击「+新建实验」
2. 选择实验模板（预置RL/通信/化学/生物模板）
3. 填写各字段
4. 点击保存
5. 自动通知导师有新实验记录

#### EP-002 实验列表与筛选

**优先级**: P0  
**描述**: 查看所有实验记录，支持筛选和搜索

**筛选维度**:
- 时间范围（本周/本月/自定义）
- 实验类型
- 状态（进行中/已完成/失败/暂停）
- 标签
- 创建人（导师视角：按学生筛选）
- 关键词搜索（全文检索标题+内容）

**列表视图**:
- 卡片视图（默认）：标题+日期+状态+标签
- 表格视图：适合导师快速扫描

#### EP-003 实验详情与批注

**优先级**: P0  
**描述**: 导师可以在学生的实验记录上直接批注

**批注功能**:
- 选中文本 → 弹出批注框
- 批注可以@学生、设置优先级、标记为已解决
- 批注实时通知学生
- 学生回复批注后通知导师

---

### 2.2 模块二：组会管理

#### MT-001 自动生成组会汇报

**优先级**: P0  
**描述**: 一键生成本周实验摘要，用于组会汇报

**生成逻辑**:
```
输入：本周时间范围内该学生的所有实验记录
处理：
  1. 统计实验数量（完成/进行中/失败）
  2. 提取关键结论（从"结论"字段）
  3. 整理问题清单（从状态为"失败"的实验中提取）
  4. 生成待讨论事项
输出：飞书文档格式的周报
```

**周报模板**:
```markdown
# 第X周组会汇报 - [学生姓名]

## 本周实验概览
- 完成实验：3个 ✅
- 进行中：1个 🔄
- 失败/暂停：1个 ❌

## 重要发现
1. [实验标题]: [结论摘要]
2. ...

## 问题与讨论
1. [问题1]: [简要描述]
2. ...

## 下周计划
1. ...
2. ...
```

#### MT-002 组会日程与纪要

**优先级**: P0  
**描述**: 组会日程管理与会议纪要自动生成

**流程**:
1. 导师/组长在飞书日历创建组会日程
2. 组会前：研飞自动推送「本周汇报」给各学生
3. 组会中：飞书会议+妙记自动录制
4. 组会后：妙记生成纪要 → 研飞提取Action Items → 创建飞书任务

---

### 2.3 模块三：论文进度

#### PR-001 论文Gantt图

**优先级**: P1  
**描述**: 论文进度的可视化甘特图

**论文阶段定义**:
```
选题 → 开题 → 实验 → 数据分析 → 写作 → 投稿 → 审稿 → 修改 → 接受 → 发表
```

**界面**:
- 甘特图视图（横轴时间、纵轴论文、颜色标记阶段）
- 导师一眼看到所有学生的进度
- 拖拽调整时间节点
- 超期自动标红提醒

#### PR-002 论文进度周报

**优先级**: P1  
**描述**: 自动汇总各组员论文进度

**输出内容**:
- 各学生本周论文进度变化
- 里程碑达成情况
- 超期预警
- 导师点评框

---

### 2.4 模块四：导师看板

#### DB-001 导师总览看板

**优先级**: P0  
**描述**: 导师一眼看到所有学生的实验和论文进展

**看板内容**:
```
┌──────────────────────────────────────────────────┐
│  本周总览                                        │
│  完成实验: 12 ✅  进行中: 5 🔄  失败: 2 ❌       │
│  论文进展: 3个按时  1个超期 ⚠️                     │
│  待批注实验: 4 篇                                  │
├──────────────────────────────────────────────────┤
│  学生进度                                        │
│  ┌─────────┬────────┬────────┬──────┐          │
│  │ 姓名    │ 本周实验 │ 论文阶段 │ 状态  │          │
│  ├─────────┼────────┼────────┼──────┤          │
│  │ 张三    │ 3完成   │ 审稿中   │ 🟢   │          │
│  │ 李四    │ 1完成2中 │ 数据分析 │ 🟡   │          │
│  │ 王五    │ 1失败   │ 写作     │ 🔴   │          │
│  └─────────┴────────┴────────┴──────┘          │
├──────────────────────────────────────────────────┤
│  待处理                                          │
│  · 李四的实验需要批注 (2小时前)                    │
│  · 王五的实验失败需要讨论 (昨天)                    │
│  · 本周五14:00 组会 (还有2天)                      │
└──────────────────────────────────────────────────┘
```

---

### 2.5 模块五：飞书集成

#### FS-001 机器人通知

**优先级**: P0

| 触发场景 | 通知对象 | 通知内容 |
|---------|---------|---------|
| 新建实验 | 导师 | 「[学生名] 创建了新实验：[标题]」 |
| 实验状态变更 | 导师 | 「[学生名] 的实验 [标题] 标记为失败」 |
| 导师批注 | 学生 | 「[导师名] 在你的实验 [标题] 中添加了批注」 |
| 组会提醒 | 全组 | 「本周组会将于 [时间] 开始，请准备汇报」 |
| 论文里程碑 | 导师 | 「[学生名] 的论文已进入 [阶段] 阶段」 |
| 设备预约冲突 | 预约人 | 「设备 [名称] 在 [时间] 已被占用」 |

#### FS-002 审批流

**优先级**: P1

| 审批类型 | 流程 | 触发 |
|---------|------|------|
| 设备申请 | 学生申请 → 导师审批 | 创建设备预约 |
| 出差审批 | 学生申请 → 导师审批 | 会议/调研出差 |
| 论文投稿审批 | 学生申请 → 导师审批 | 论文标记为"准备投稿" |

#### FS-003 多维表格集成

**优先级**: P1

- 实验数据自动写入飞书多维表格
- 论文进度同步到多维表格
- 多维表格视图嵌入应用

---

## 三、数据模型

### 3.1 核心实体

```prisma
// 用户（飞书身份）
model User {
  id          String   @id @default(cuid())
  feishuId    String   @unique
  name        String
  role        Role     @default(STUDENT)
  labId       String?
  lab         Lab?     @relation(fields: [labId], references: [id])
  avatar      String?
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  ADVISOR    // 导师
  POSTDOC    // 博后
  PHD        // 博士生
  MASTER     // 硕士生
  ADMIN      // 管理员
}

// 课题组/实验室
model Lab {
  id          String   @id @default(cuid())
  name        String
  advisorId   String
  advisor     User     @relation("LabAdvisor", fields: [advisorId], references: [id])
  members     User[]
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 项目
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  labId       String
  lab         Lab     @relation(fields: [labId], references: [id])
  papers      Paper[]
  experiments Experiment[]
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

// 实验记录
model Experiment {
  id            String   @id @default(cuid())
  title         String
  date          DateTime @default(now())
  type          ExperimentType
  status        ExperimentStatus @default(IN_PROGRESS)
  purpose       String?  // 假设/目标
  process       String?  // 过程（富文本）
  result        String?  // 结果摘要
  conclusion    String?  // 结论
  nextStep      String?  // 下一步
  tags          String[] // 标签数组
  images        Json?    // 图片URL数组
  attachments   Json?    // 附件URL数组
  
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  projectId     String?
  project      Project? @relation(fields: [projectId], references: [id])
  labId         String
  lab           Lab     @relation(fields: [labId], references: [id])
  
  comments     Comment[]
  weeklyReport  WeeklyReportLine?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum ExperimentType {
  ALGORITHM_VERIFICATION  // 算法验证
  HYPERPARAM_TUNING      // 超参调优
  ABLATION_STUDY         // 消融实验
  REPRODUCTION           // 复现实验
  DATA_COLLECTION         // 数据采集
  OTHER                  // 其他
}

enum ExperimentStatus {
  IN_PROGRESS  // 进行中
  COMPLETED    // 已完成
  FAILED       // 失败
  PAUSED       // 暂停
}

// 批注
model Comment {
  id            String   @id @default(cuid())
  content       String
  quote         String?  // 引用的原文
  priority      CommentPriority @default(NORMAL)
  resolved      Boolean  @default(false)
  
  experimentId  String
  experiment    Experiment @relation(fields: [experimentId], references: [id])
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  parentId      String?  // 回复批注
  parent        Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[] @relation("CommentReplies")
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum CommentPriority {
  NORMAL
  IMPORTANT
  URGENT
}

// 论文
model Paper {
  id            String   @id @default(cuid())
  title         String
  abstract      String?
  keywords      String[]
  venue         String?  // 投稿期刊/会议
  
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  projectId     String?
  project      Project? @relation(fields: [projectId], references: [id])
  labId         String
  lab           Lab     @relation(fields: [labId], references: [id])
  
  milestones    PaperMilestone[]
  status        PaperStatus @default(IDEA)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum PaperStatus {
  IDEA          // 选题
  PROPOSAL      // 开题
  EXPERIMENT    // 实验中
  DATA_ANALYSIS // 数据分析
  WRITING       // 写作中
  SUBMITTED     // 已投稿
  REVIEW        // 审稿中
  REVISION      // 修改中
  ACCEPTED      // 已接受
  PUBLISHED     // 已发表
}

// 论文里程碑
model PaperMilestone {
  id           String   @id @default(cuid())
  paperId      String
  paper        Paper    @relation(fields: [paperId], references: [id])
  stage        PaperStatus
  plannedDate  DateTime
  actualDate   DateTime?
  status       MilestoneStatus @default(PENDING)
  note         String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum MilestoneStatus {
  PENDING      // 未开始
  IN_PROGRESS  // 进行中
  COMPLETED    // 已完成
  OVERDUE      // 已超期
}

// 组会周报
model WeeklyReport {
  id            String   @id @default(cuid())
  labId         String
  lab           Lab     @relation(fields: [labId], references: [id])
  weekStart     DateTime
  weekEnd      DateTime
  meetingDate   DateTime?
  meetingUrl    String?  // 飞书会议链接
  meetingNotes  String?  // 会议纪要
  
  lines         WeeklyReportLine[]
  
  status       ReportStatus @default(DRAFT)
  feishuDocId  String?  // 关联的飞书文档ID
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum ReportStatus {
  DRAFT       // 草稿
  READY       // 准备就绪
  COMPLETED   // 组会完成
}

// 周报行（每个学生一条）
model WeeklyReportLine {
  id              String   @id @default(cuid())
  reportId        String
  report          WeeklyReport @relation(fields: [reportId], references: [id])
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  
  experimentsCompleted Int   @default(0)
  experimentsInProgress Int @default(0)
  experimentsFailed    Int   @default(0)
  keyFindings     String?
  problems        String?
  nextWeekPlan    String?
  actionItems     String?  // 组会讨论出的行动项
  
  experimentIds   String[] // 关联的实验ID列表
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// 设备
model Equipment {
  id              String   @id @default(cuid())
  name            String
  model           String?
  location        String?
  status          EquipmentStatus @default(AVAILABLE)
  description     String?
  
  labId            String
  lab              Lab     @relation(fields: [labId], references: [id])
  bookings         EquipmentBooking[]
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum EquipmentStatus {
  AVAILABLE     // 可用
  IN_USE        // 使用中
  MAINTENANCE   // 维护中
  RETIRED       // 已报废
}

// 设备预约
model EquipmentBooking {
  id            String   @id @default(cuid())
  equipmentId   String
  equipment     Equipment @relation(fields: [equipmentId], references: [id])
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  startTime    DateTime
  endTime      DateTime
  purpose      String?
  status       BookingStatus @default(PENDING)
  
  approvalId   String?  // 飞书审批实例ID
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum BookingStatus {
  PENDING       // 待审批
  APPROVED      // 已批准
  REJECTED      // 已拒绝
  CANCELLED     // 已取消
}
```

---

## 四、飞书应用配置

### 4.1 应用信息

```json
{
  "app_id": "cli_xxxxxxxxxxxx",
  "app_name": "研飞 ResearchFlow",
  "app_description": "科研团队一站式协作平台 — 实验记录 · 组会管理 · 论文进度",
  "app_type": "web_application",
  "permissions": [
    "contact:user.base:readonly",
    "message:send_as_bot",
    "calendar:calendar",
    "docx:document",
    "bitable:bitable",
    "approval:approval",
    "vc:meeting:readonly"
  ]
}
```

### 4.2 事件订阅

| 事件 | 处理逻辑 |
|------|---------|
| 审批实例状态变更 | 设备预约/出差审批结果通知 |
| 日历日程变更 | 组会时间变更通知 |
| 消息接收 | 机器人命令处理（如：汇总本周实验） |
| 多维表格记录变更 | 实验数据同步 |

---

## 五、非功能性需求

| 维度 | 要求 |
|------|------|
| **性能** | 实验列表加载 < 2s，实验详情 < 1s，周报生成 < 5s |
| **可用性** | 99.5%+（非关键场景可接受短暂中断） |
| **安全** | 飞书SSO免登、数据加密存储、角色权限控制 |
| **并发** | 支持100个课题组同时使用 |
| **数据** | 实验记录永久保留、7天内可恢复删除 |

---

## 六、6周开发计划

| 周 | 目标 | 关键交付 |
|----|------|---------|
| W1 | 项目搭建+飞书应用配置+数据模型 | 飞书应用审批通过、数据库模型 |
| W2 | 实验记录CRUD+列表筛选 | 可创建/编辑/查看实验记录 |
| W3 | 批注功能+导师看板v1 | 导师可批注、可看到板 |
| W4 | 组会管理（周报生成+日程+纪要） | 组会周报自动生成 |
| W5 | 机器人通知+审批流+设备预约 | 飞书通知+设备预约审批 |
| W6 | 论文进度+打磨+测试 | 完整MVP可用 |

---

## 七、成功指标

| 指标 | 目标（MVP后1个月） |
|------|-------------------|
| 注册课题组数 | ≥5 |
| 活跃用户数 | ≥20 |
| 实验记录创建数 | ≥100条 |
| 周报生成次数 | ≥10次 |
| 导师批注次数 | ≥30次 |
| NPS | ≥40 |