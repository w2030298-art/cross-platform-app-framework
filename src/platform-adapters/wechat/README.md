# 微信小程序适配层

## 概述

微信适配层将统一业务逻辑接口转换为微信小程序API调用，处理微信特有的支付、分享、消息、登录等能力。

## 核心职责

- 微信登录（wx.login + 手机号快速验证）
- 微信支付（小程序支付/分账/退款）
- 订阅消息（模板消息推送）
- 分享传播（朋友圈/群聊分享）
- 扫码点餐（扫一扫/二维码生成）
- 直播组件集成
- 云开发对接

## 目录结构

```
wechat/
├── adapters/
│   ├── WechatAdapter.ts      # 主适配器实现
│   ├── PaymentAdapter.ts     # 支付适配
│   ├── LoginAdapter.ts       # 登录适配
│   ├── ShareAdapter.ts       # 分享适配
│   └── MessageAdapter.ts     # 消息适配
├── pages/                     # 小程序页面
│   ├── home/                  # 首页
│   ├── order/                 # 点餐/下单
│   ├── member/                # 会员中心
│   ├── marketing/             # 营销活动
│   └── profile/               # 个人中心
├── components/                 # 公共组件
│   ├── product-card/
│   ├── order-item/
│   ├── coupon-list/
│   └── member-card/
├── cloud/                     # 云开发函数
│   ├── getOpenId/
│   ├── createOrder/
│   ├── handlePayment/
│   └── sendMessage/
└── app.json                   # 小程序配置
```

## 关键实现

### 登录适配

```typescript
// WechatAdapter.ts
import { PlatformAdapter, UserInfo, PayParams, PayResult } from '../../shared-business-logic/template-engine';

export class WechatAdapter implements PlatformAdapter {
  async login(): Promise<UserInfo> {
    const { code } = await wx.login();
    const { data } = await wx.request({
      url: '/api/wechat/session',
      method: 'POST',
      data: { code }
    });
    return {
      openId: data.openid,
      unionId: data.unionid,
      nickname: data.nickname,
      avatarUrl: data.avatarUrl,
      phone: data.phone,
    };
  }

  async pay(params: PayParams): Promise<PayResult> {
    const paymentData = await this.requestPayment(params);
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: paymentData.signType,
        paySign: paymentData.paySign,
        success: () => resolve({ success: true, transactionId: paymentData.orderId }),
        fail: (err) => reject(new Error(err.errMsg)),
      });
    });
  }

  async share(params: ShareParams): Promise<void> {
    // onShareAppMessage and onShareTimeline handlers
  }

  async sendMessage(params: MessageParams): Promise<void> {
    // Subscribe message sending
    await wx.requestSubscribeMessage({
      tmplIds: [params.templateId],
      success: (res) => {
        if (res[params.templateId] === 'accept') {
          wx.cloud.callFunction({
            name: 'sendMessage',
            data: params
          });
        }
      }
    });
  }
}
```

### 包体优化策略

```typescript
// 分包加载配置 - app.json
{
  "pages": [
    "pages/home/index",
    "pages/order/index"
  ],
  "subpackages": [
    {
      "root": "package-member",
      "name": "member",
      "pages": [
        "pages/center/index",
        "pages/coupon/index",
        "pages/points/index"
      ]
    },
    {
      "root": "package-marketing",
      "name": "marketing", 
      "pages": [
        "pages/seckill/index",
        "pages/group/index",
        "pages/invite/index"
      ]
    }
  ],
  "preloadRule": {
    "pages/home/index": {
      "network": "all",
      "packages": ["member"]
    }
  }
}
```