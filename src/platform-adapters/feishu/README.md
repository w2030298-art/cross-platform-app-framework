# 飞书开放应用适配层

## 概述

飞书适配层将统一业务逻辑接口转换为飞书开放平台API调用，重点处理审批流程、消息通知、多维表格、自动化工作流等企业级能力。

## 核心职责

- 飞书免登与用户身份（SSO）
- 审批流程创建与管理
- 消息与卡片消息推送
- 多维表格数据读写
- 日历与会议操作
- 自动化工作流触发
- AI能力集成（飞书Aily）
- 低代码应用搭建

## 目录结构

```
feishu/
├── adapters/
│   ├── FeishuAdapter.ts          # 主适配器实现
│   ├── ApprovalAdapter.ts        # 审批流适配
│   ├── MessageAdapter.ts        # 消息与卡片适配
│   ├── BitableAdapter.ts        # 多维表格适配
│   ├── CalendarAdapter.ts       # 日历适配
│   ├── MeetingAdapter.ts        # 会议适配
│   ├── DriveAdapter.ts          # 云文档适配
│   └── BotAdapter.ts            # 机器人适配
├── apps/
│   ├── inspection/               # 门店巡检应用
│   ├── approval-flow/            # 智能审批应用
│   ├── knowledge-qa/             # 知识问答应用
│   ├── supplier-dashboard/       # 供应商看板
│   └── customer-service/         # 客户服务群自动化
├── workflows/
│   ├── order-notification.ts     # 订单状态通知
│   ├── inventory-alert.ts        # 库存预警
│   ├── employee-onboarding.ts    # 新员工入职
│   ├── complaint-escalation.ts   # 客诉升级
│   └── daily-report.ts          # 日报自动生成
├── templates/
│   ├── approval-templates.json   # 审批流模板
│   ├── card-templates.json       # 卡片消息模板
│   └── bitable-templates.json    # 多维表格模板
└── feishu-app.json               # 飞书应用配置
```

## 关键实现

### 审批流适配器

```typescript
export class ApprovalAdapter {
  async createApprovalDefinition(params: {
    name: string;
    steps: ApprovalStep[];
    formFields: FormField[];
  }): Promise<string> {
    // 调用飞书审批API创建审批定义
    const response = await this.client.post(
      '/open-apis/approval/v2/flow/create',
      {
        flow_name: params.name,
        form: params.formFields,
        node_list: params.steps.map((step, index) => ({
          id: `node_${index}`,
          type: step.type, // APPROVER, CC, CONDITION
          name: step.name,
          approver_list: step.approvers?.map(a => ({ user_id: a })),
        })),
      }
    );
    return response.data.flow_id;
  }

  async submitApproval(params: {
    approvalCode: string;
    userId: string;
    formData: Record<string, unknown>;
  }): Promise<string> {
    // 提交审批实例
    const response = await this.client.post(
      '/open-apis/approval/v2/instance/create',
      {
        approval_code: params.approvalCode,
        user_id: params.userId,
        form: params.formData,
      }
    );
    return response.data.instance_code;
  }

  async onApprovalCallback(callback: {
    instanceCode: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    operateTime: number;
  }): Promise<void> {
    // 审批状态变更回调
    if (callback.status === 'APPROVED') {
      // 自动建群、分配任务、通知相关人员
    }
  }
}
```

### 自动化工作流引擎

```typescript
export class WorkflowEngine {
  async triggerWorkflow(workflowId: string, data: Record<string, unknown>): Promise<void> {
    const workflow = await this.getWorkflow(workflowId);
    
    for (const step of workflow.steps) {
      switch (step.type) {
        case 'send_message':
          await this.sendMessage(step.params, data);
          break;
        case 'create_bitable_record':
          await this.createBitableRecord(step.params, data);
          break;
        case 'start_approval':
          await this.startApproval(step.params, data);
          break;
        case 'call_api':
          await this.callExternalApi(step.params, data);
          break;
        case 'condition':
          const result = this.evaluateCondition(step.params.condition, data);
          if (!result) continue;
          break;
        case 'delay':
          await this.delay(step.params.duration);
          break;
      }
    }
  }

  private async sendMessage(params: any, data: any): Promise<void> {
    // 发送飞书消息（文本/卡片/富文本）
  }

  private async createBitableRecord(params: any, data: any): Promise<void> {
    // 写入多维表格记录
  }

  private async startApproval(params: any, data: any): Promise<void> {
    // 发起审批流程
  }

  private async callExternalApi(params: any, data: any): Promise<void> {
    // 调用外部API
  }
}
```

### 常用机器人模板

```typescript
// 订单状态变更通知
export const orderNotificationWorkflow = {
  id: 'order_notification',
  name: '订单状态变更通知',
  trigger: {
    type: 'event',
    event: 'order.status_changed',
  },
  steps: [
    {
      type: 'send_message',
      params: {
        template: 'order_status_card',
        target: 'customer_group', // 客户专属群
      },
    },
    {
      type: 'condition',
      params: {
        condition: 'data.status === "shipped"',
      },
    },
    {
      type: 'create_bitable_record',
      params: {
        table: 'orders',
        fields: { status: '{{data.status}}', tracking_no: '{{data.tracking_no}}' },
      },
    },
  ],
};

// 库存预警
export const inventoryAlertWorkflow = {
  id: 'inventory_alert',
  name: '库存低于阈值预警',
  trigger: {
    type: 'schedule',
    cron: '0 9 * * *', // 每天早上9点
  },
  steps: [
    {
      type: 'call_api',
      params: { url: '/api/inventory/check-threshold' },
    },
    {
      type: 'condition',
      params: { condition: 'data.lowStockItems.length > 0' },
    },
    {
      type: 'send_message',
      params: {
        template: 'inventory_alert_card',
        target: 'procurement_group',
      },
    },
  ],
};