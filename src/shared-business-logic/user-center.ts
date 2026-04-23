/**
 * 统一用户中心 - 跨平台用户管理
 * Unified User Center - Cross-platform User Management
 */

export interface UnifiedUser {
  id: string;
  phone?: string;
  email?: string;
  unionId?: string;
  status: 'active' | 'inactive' | 'banned';
  tags: UserTag[];
  membership: Membership | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserTag {
  key: string;
  value: string;
  source: 'auto' | 'manual' | 'import';
  createdAt: Date;
}

export interface Membership {
  merchantId: string;
  level: number;
  points: number;
  balance: number;
  totalSpent: number;
  joinedAt: Date;
  expiresAt?: Date;
}

export interface PlatformIdentity {
  platform: 'wechat' | 'xiaohongshu' | 'feishu';
  platformUserId: string;
  platformOpenId: string;
  platformUnionId?: string;
  nickname?: string;
  avatarUrl?: string;
  extraData?: Record<string, unknown>;
  unifiedUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEvent {
  id: string;
  unifiedUserId: string;
  eventName: string;
  eventProperties: Record<string, unknown>;
  platform: string;
  sessionId?: string;
  createdAt: Date;
}

export class UserCenter {
  private users: Map<string, UnifiedUser> = new Map();
  private identities: Map<string, PlatformIdentity> = new Map();
  private events: UserEvent[] = [];
  
  async findByPhone(phone: string): Promise<UnifiedUser | null> {
    for (const user of this.users.values()) {
      if (user.phone === phone) return user;
    }
    return null;
  }
  
  async findByIdentity(
    platform: string,
    platformUserId: string
  ): Promise<UnifiedUser | null> {
    const key = `${platform}:${platformUserId}`;
    const identity = this.identities.get(key);
    if (!identity) return null;
    return this.users.get(identity.unifiedUserId) || null;
  }
  
  async registerOrMerge(params: {
    phone?: string;
    platform: 'wechat' | 'xiaohongshu' | 'feishu';
    platformUserId: string;
    platformOpenId: string;
    nickname?: string;
    avatarUrl?: string;
  }): Promise<UnifiedUser> {
    let user: UnifiedUser;
    
    if (params.phone) {
      const existing = await this.findByPhone(params.phone);
      if (existing) {
        user = existing;
      } else {
        user = this.createUser(params.phone);
      }
    } else {
      const existingByIdentity = await this.findByIdentity(
        params.platform,
        params.platformUserId
      );
      if (existingByIdentity) {
        user = existingByIdentity;
      } else {
        user = this.createUser();
      }
    }
    
    this.addIdentity(user.id, {
      platform: params.platform,
      platformUserId: params.platformUserId,
      platformOpenId: params.platformOpenId,
      nickname: params.nickname,
      avatarUrl: params.avatarUrl,
      unifiedUserId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return user;
  }
  
  async tagUser(userId: string, tags: UserTag[]): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    for (const tag of tags) {
      const existingIdx = user.tags.findIndex(t => t.key === tag.key);
      if (existingIdx >= 0) {
        user.tags[existingIdx] = tag;
      } else {
        user.tags.push(tag);
      }
    }
    user.updatedAt = new Date();
  }
  
  async trackEvent(event: Omit<UserEvent, 'id' | 'createdAt'>): Promise<void> {
    this.events.push({
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }
  
  async getUserEvents(
    userId: string,
    options?: {
      eventName?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<UserEvent[]> {
    let filtered = this.events.filter(e => e.unifiedUserId === userId);
    if (options?.eventName) {
      filtered = filtered.filter(e => e.eventName === options.eventName);
    }
    if (options?.startDate) {
      filtered = filtered.filter(e => e.createdAt >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(e => e.createdAt <= options.endDate!);
    }
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return filtered.slice(0, options?.limit || 100);
  }
  
  private createUser(phone?: string): UnifiedUser {
    const id = crypto.randomUUID();
    const user: UnifiedUser = {
      id,
      phone,
      status: 'active',
      tags: [],
      membership: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }
  
  private addIdentity(userId: string, identity: PlatformIdentity): void {
    const key = `${identity.platform}:${identity.platformUserId}`;
    this.identities.set(key, identity);
  }
}