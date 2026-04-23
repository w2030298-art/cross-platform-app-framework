/**
 * 餐饮行业模板
 * Restaurant Industry Template
 */

import { IndustryTemplate, Industry, Platform } from '../../shared-business-logic/template-engine';

export const RestaurantTemplate: IndustryTemplate = {
  id: 'restaurant',
  name: '餐饮行业解决方案',
  industry: Industry.RESTAURANT,
  version: '1.0.0',
  description: '覆盖扫码点餐、外卖配送、会员营销、库存管理等餐饮全场景',
  
  features: [
    'scan_order',       // 扫码点餐
    'delivery',         // 外卖配送
    'membership',       // 会员体系
    'coupon',           // 优惠券
    'queue',            // 排队叫号
    'inventory',        // 库存管理
    'marketing',        // 营销工具
    'data_dashboard',   // 数据看板
  ],
  
  pageModules: [
    { id: 'home', name: '首页', route: '/pages/home/index', component: 'HomePage', platforms: [Platform.WECHAT], required: true, config: {} },
    { id: 'scan_order', name: '扫码点餐', route: '/pages/order/index', component: 'ScanOrderPage', platforms: [Platform.WECHAT], required: true, config: {} },
    { id: 'delivery', name: '外卖配送', route: '/pages/delivery/index', component: 'DeliveryPage', platforms: [Platform.WECHAT], required: false, config: {} },
    { id: 'membership', name: '会员中心', route: '/pages/member/index', component: 'MemberCenter', platforms: [Platform.WECHAT, Platform.XIAOHONGSHU], required: true, config: {} },
    { id: 'coupon', name: '优惠券', route: '/pages/coupon/index', component: 'CouponPage', platforms: [Platform.WECHAT, Platform.XIAOHONGSHU], required: false, config: {} },
    { id: 'queue', name: '排队叫号', route: '/pages/queue/index', component: 'QueuePage', platforms: [Platform.WECHAT], required: false, config: {} },
    { id: 'admin_order', name: '订单管理', route: '/admin/orders', component: 'OrderManagePage', platforms: [Platform.FEISHU], required: true, config: {} },
    { id: 'admin_menu', name: '菜品管理', route: '/admin/menu', component: 'MenuManagePage', platforms: [Platform.FEISHU], required: true, config: {} },
    { id: 'admin_dashboard', name: '经营看板', route: '/admin/dashboard', component: 'DashboardPage', platforms: [Platform.FEISHU], required: true, config: {} },
  ],
  
  workflows: [
    {
      id: 'new_order',
      name: '新订单通知',
      trigger: { type: 'event', event: 'order.created' },
      steps: [
        { id: 'notify_kitchen', type: 'action', action: 'send_message', params: { target: 'kitchen_group', template: 'new_order' } },
        { id: 'notify_customer', type: 'action', action: 'send_message', params: { target: 'customer', template: 'order_confirmed' } },
        { id: 'update_inventory', type: 'action', action: 'call_api', params: { url: '/api/inventory/deduct' } },
      ],
      platforms: [Platform.WECHAT, Platform.FEISHU],
    },
    {
      id: 'low_stock_alert',
      name: '库存预警',
      trigger: { type: 'event', event: 'inventory.below_threshold' },
      steps: [
        { id: 'notify_manager', type: 'action', action: 'send_message', params: { target: 'manager', template: 'low_stock_card' } },
        { id: 'auto_order', type: 'condition', condition: 'data.autoReorder === true', params: {} },
        { id: 'create_reorder', type: 'action', action: 'call_api', params: { url: '/api/purchase/create' } },
      ],
      platforms: [Platform.FEISHU],
    },
    {
      id: 'customer_birthday',
      name: '会员生日关怀',
      trigger: { type: 'schedule', cron: '0 9 * * *' },
      steps: [
        { id: 'check_birthdays', type: 'action', action: 'call_api', params: { url: '/api/members/birthday_today' } },
        { id: 'send_coupon', type: 'action', action: 'send_message', params: { template: 'birthday_coupon' } },
        { id: 'create_bitable_record', type: 'action', action: 'create_bitable_record', params: { table: 'marketing_log' } },
      ],
      platforms: [Platform.WECHAT, Platform.FEISHU],
    },
  ],
  
  dataModels: [
    {
      name: 'Order',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'tableNo', type: 'string', required: false },
        { name: 'items', type: 'json', required: true },
        { name: 'totalAmount', type: 'number', required: true },
        { name: 'status', type: 'enum', required: true, enumValues: ['pending', 'confirmed', 'cooking', 'delivering', 'completed', 'cancelled'] },
        { name: 'memberId', type: 'string', required: false },
        { name: 'createdAt', type: 'date', required: true },
      ],
      indexes: ['status', 'memberId', 'createdAt'],
      relations: [
        { target: 'Member', type: 'belongsTo' },
        { target: 'OrderItem', type: 'hasMany' },
      ],
    },
    {
      name: 'MenuItem',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'string', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'image', type: 'string', required: false },
        { name: 'description', type: 'string', required: false },
        { name: 'stock', type: 'number', required: true },
        { name: 'status', type: 'enum', required: true, enumValues: ['available', 'sold_out', 'hidden'] },
        { name: 'sortOrder', type: 'number', required: false, default: 0 },
      ],
      indexes: ['category', 'status', 'sortOrder'],
      relations: [],
    },
    {
      name: 'Member',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'phone', type: 'string', required: true },
        { name: 'name', type: 'string', required: false },
        { name: 'level', type: 'number', required: true, default: 1 },
        { name: 'points', type: 'number', required: true, default: 0 },
        { name: 'balance', type: 'number', required: true, default: 0 },
        { name: 'totalSpent', type: 'number', required: true, default: 0 },
        { name: 'birthday', type: 'date', required: false },
        { name: 'createdAt', type: 'date', required: true },
      ],
      indexes: ['phone', 'level', 'birthday'],
      relations: [
        { target: 'Order', type: 'hasMany' },
      ],
    },
  ],
  
  permissionRules: [
    { role: 'customer', resource: 'order', actions: ['create', 'read'] },
    { role: 'customer', resource: 'member', actions: ['read', 'update'] },
    { role: 'staff', resource: 'order', actions: ['read', 'update'] },
    { role: 'staff', resource: 'menu_item', actions: ['read', 'update'] },
    { role: 'manager', resource: 'order', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'manager', resource: 'menu_item', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'manager', resource: 'member', actions: ['create', 'read', 'update', 'delete'] },
    { role: 'manager', resource: 'marketing', actions: ['create', 'read', 'update', 'delete', 'manage'] },
  ],
  
  messageTemplates: [
    { id: 'order_confirmed', name: '订单确认', platform: Platform.WECHAT, type: 'subscription', content: '您的订单已确认，预计{{estimated_time}}送达', variables: ['estimated_time'] },
    { id: 'order_ready', name: '餐品就绪', platform: Platform.WECHAT, type: 'subscription', content: '您的订单已制作完成，请到{{table_no}}号桌取餐', variables: ['table_no'] },
    { id: 'birthday_coupon', name: '生日关怀', platform: Platform.WECHAT, type: 'subscription', content: '生日快乐！赠送您{{coupon_amount}}元优惠券', variables: ['coupon_amount'] },
    { id: 'low_stock_card', name: '库存预警', platform: Platform.FEISHU, type: 'card', content: '菜品{{item_name}}库存不足，当前库存{{current_stock}}', variables: ['item_name', 'current_stock'] },
    { id: 'new_order', name: '新订单通知', platform: Platform.FEISHU, type: 'card', content: '新订单 #{{order_id}}，金额{{amount}}元，{{order_type}}', variables: ['order_id', 'amount', 'order_type'] },
  ],
  
  dashboards: [
    {
      id: 'daily_operations',
      name: '每日经营看板',
      widgets: [
        { id: 'revenue', type: 'number', title: '今日营业额', metric: 'revenue', dimensions: [], dataSource: 'orders' },
        { id: 'order_count', type: 'number', title: '今日订单数', metric: 'order_count', dimensions: [], dataSource: 'orders' },
        { id: 'avg_price', type: 'number', title: '平均客单价', metric: 'avg_order_price', dimensions: [], dataSource: 'orders' },
        { id: 'revenue_trend', type: 'line_chart', title: '营业额趋势', metric: 'revenue', dimensions: ['date'], dataSource: 'orders' },
        { id: 'top_items', type: 'bar_chart', title: '热门菜品TOP10', metric: 'order_count', dimensions: ['item_name'], dataSource: 'order_items' },
        { id: 'hourly_orders', type: 'line_chart', title: '每时段订单量', metric: 'order_count', dimensions: ['hour'], dataSource: 'orders' },
      ],
      filters: [
        { field: 'date', type: 'date_range' },
        { field: 'store', type: 'multi_select' },
      ],
    },
  ],
  
  branding: {
    logo: '',
    primaryColor: '#FF6B35',
    secondaryColor: '#FFF5EB',
    appName: '智慧餐厅',
    appDescription: '扫码点餐·会员管理·营销工具',
  },
};