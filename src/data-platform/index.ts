/**
 * 数据中台 - 事件采集 / 标签计算 / 指标分析
 * Data Platform - Event Collection / Tag Computation / Metric Analysis
 */

export interface EventConfig {
  eventName: string;
  platform: string;
  properties: Record<string, string>;
  description?: string;
}

export interface MetricDefinition {
  id: string;
  name: string;
  formula: string;
  dimensions: string[];
  filters?: Record<string, unknown>;
  timeGrain: 'hour' | 'day' | 'week' | 'month';
}

export interface UserProfile {
  userId: string;
  attributes: Record<string, unknown>;
  tags: UserTag[];
  computedMetrics: Record<string, number>;
  lastUpdated: Date;
}

export interface UserTag {
  tagKey: string;
  tagValue: string;
  computedAt: Date;
  expiresAt?: Date;
}

export interface DashboardMetric {
  metricId: string;
  value: number;
  dimensions: Record<string, string>;
  timestamp: Date;
  timeGrain: string;
}

export class DataPlatform {
  private events: Map<string, EventConfig[]> = new Map();
  private metrics: Map<string, MetricDefinition> = new Map();
  private profiles: Map<string, UserProfile> = new Map();
  
  trackEvent(userId: string, event: EventConfig): void {
    const userEvents = this.events.get(userId) || [];
    userEvents.push(event);
    this.events.set(userId, userEvents);
    
    this.updateProfileOnEvent(userId, event);
  }
  
  trackBatchEvent(events: Array<{ userId: string; event: EventConfig }>): void {
    for (const { userId, event } of events) {
      this.trackEvent(userId, event);
    }
  }
  
  getUserProfile(userId: string): UserProfile | null {
    return this.profiles.get(userId) || null;
  }
  
  computeTag(userId: string, tagRule: {
    key: string;
    conditions: Array<{ event: string; operator: 'count' | 'sum' | 'last'; value?: number }>;
    resultValue: string;
  }): UserTag | null {
    const userEvents = this.events.get(userId) || [];
    
    for (const condition of tagRule.conditions) {
      const matchingEvents = userEvents.filter(e => e.eventName === condition.event);
      
      if (condition.operator === 'count') {
        if (matchingEvents.length < (condition.value || 0)) return null;
      } else if (condition.operator === 'sum') {
        const total = matchingEvents.reduce((sum, e) => {
          return sum + (Number(e.properties['amount']) || 0);
        }, 0);
        if (total < (condition.value || 0)) return null;
      } else if (condition.operator === 'last') {
        const lastEvent = matchingEvents[matchingEvents.length - 1];
        if (!lastEvent) return null;
      }
    }
    
    return {
      tagKey: tagRule.key,
      tagValue: tagRule.resultValue,
      computedAt: new Date(),
    };
  }
  
  batchComputeTags(tagRules: Array<{
    key: string;
    conditions: Array<{ event: string; operator: 'count' | 'sum' | 'last'; value?: number }>;
    resultValue: string;
  }>): Map<string, UserTag[]> {
    const result = new Map<string, UserTag[]>();
    
    for (const userId of this.events.keys()) {
      const userTags: UserTag[] = [];
      for (const rule of tagRules) {
        const tag = this.computeTag(userId, rule);
        if (tag) userTags.push(tag);
      }
      result.set(userId, userTags);
    }
    
    return result;
  }
  
  computeMetric(
    metricDef: MetricDefinition,
    dateRange: { start: Date; end: Date },
    dimensions?: Record<string, string>
  ): DashboardMetric[] {
    const results: DashboardMetric[] = [];
    
    return results;
  }
  
  getFunnel(
    steps: string[],
    dateRange: { start: Date; end: Date }
  ): Array<{ step: string; count: number; conversionRate: number }> {
    const funnelData = steps.map((step, index) => ({
      step,
      count: 0,
      conversionRate: index === 0 ? 1 : 0,
    }));
    
    return funnelData;
  }
  
  private updateProfileOnEvent(userId: string, event: EventConfig): void {
    let profile = this.profiles.get(userId);
    if (!profile) {
      profile = {
        userId,
        attributes: {},
        tags: [],
        computedMetrics: {},
        lastUpdated: new Date(),
      };
      this.profiles.set(userId, profile);
    }
    
    profile.lastUpdated = new Date();
    
    switch (event.eventName) {
      case 'page_view':
        profile.attributes['lastVisitAt'] = new Date().toISOString();
        profile.attributes['visitCount'] = ((profile.attributes['visitCount'] as number) || 0) + 1;
        break;
      case 'purchase':
        profile.attributes['lastPurchaseAt'] = new Date().toISOString();
        profile.attributes['purchaseCount'] = ((profile.attributes['purchaseCount'] as number) || 0) + 1;
        profile.attributes['totalSpent'] = ((profile.attributes['totalSpent'] as number) || 0) + Number(event.properties['amount'] || 0);
        break;
      case 'share':
        profile.attributes['shareCount'] = ((profile.attributes['shareCount'] as number) || 0) + 1;
        break;
    }
  }
}

export const DEFAULT_TAG_RULES = [
  {
    key: 'rfm_high_value',
    conditions: [
      { event: 'purchase', operator: 'count' as const, value: 5 },
    ],
    resultValue: 'high_value',
  },
  {
    key: 'rfm_new_user',
    conditions: [
      { event: 'page_view', operator: 'count' as const, value: 1 },
    ],
    resultValue: 'new',
  },
  {
    key: 'rfm_churned',
    conditions: [
      { event: 'purchase', operator: 'last' as const },
    ],
    resultValue: 'churned',
  },
  {
    key: 'social_sharer',
    conditions: [
      { event: 'share', operator: 'count' as const, value: 3 },
    ],
    resultValue: 'active_sharer',
  },
];