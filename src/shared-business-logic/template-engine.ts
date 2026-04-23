/**
 * 行业模板引擎核心抽象
 * Industry Template Engine - Core Abstraction
 */

export enum Platform {
  WECHAT = 'wechat',
  XIAOHONGSHU = 'xiaohongshu',
  FEISHU = 'feishu',
}

export enum Industry {
  RESTAURANT = 'restaurant',
  BEAUTY = 'beauty',
  EDUCATION = 'education',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  MEDICAL = 'medical',
  LOGISTICS = 'logistics',
}

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: Industry;
  version: string;
  description: string;
  
  pageModules: PageModule[];
  workflows: WorkflowConfig[];
  dataModels: DataModel[];
  permissionRules: PermissionRule[];
  messageTemplates: MessageTemplate[];
  dashboards: DashboardConfig[];
  
  platformAdapters: Record<Platform, PlatformAdapter>;
  features: string[];
  branding: BrandingConfig;
}

export interface PageModule {
  id: string;
  name: string;
  route: string;
  component: string;
  platforms: Platform[];
  required: boolean;
  config: Record<string, unknown>;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  platforms: Platform[];
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual';
  event?: string;
  cron?: string;
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay';
  action?: string;
  condition?: string;
  params: Record<string, unknown>;
}

export interface DataModel {
  name: string;
  fields: DataField[];
  indexes: string[];
  relations: DataRelation[];
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'enum';
  required: boolean;
  default?: unknown;
  enumValues?: string[];
}

export interface DataRelation {
  target: string;
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'manyToMany';
}

export interface PermissionRule {
  role: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  condition?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  platform: Platform;
  type: 'subscription' | 'template' | 'card' | 'sms';
  content: string;
  variables: string[];
}

export interface DashboardConfig {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
}

export interface DashboardWidget {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'number' | 'table' | 'funnel';
  title: string;
  metric: string;
  dimensions: string[];
  dataSource: string;
}

export interface DashboardFilter {
  field: string;
  type: 'date_range' | 'select' | 'multi_select';
  default?: unknown;
}

export interface PlatformAdapter {
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

export interface BrandingConfig {
  logo: string;
  primaryColor: string;
  secondaryColor?: string;
  fontFamily?: string;
  appName: string;
  appDescription: string;
}

export interface UserInfo {
  openId: string;
  unionId?: string;
  nickname?: string;
  avatarUrl?: string;
  phone?: string;
  gender?: number;
}

export interface PayParams {
  amount: number;
  orderId: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PayResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMsg?: string;
}

export interface ShareParams {
  title: string;
  description: string;
  imageUrl: string;
  path: string;
}

export interface MessageParams {
  templateId: string;
  data: Record<string, string>;
  toUser: string;
}

export interface SystemInfo {
  platform: Platform;
  version: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface NetworkAdapter {
  request(options: RequestOptions): Promise<Response>;
  upload(options: UploadOptions): Promise<UploadResult>;
}

export interface RequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
  header?: Record<string, string>;
}

export interface UploadOptions {
  url: string;
  filePath: string;
  name: string;
  formData?: Record<string, string>;
}

export interface UploadResult {
  url: string;
  size: number;
}

export interface Response {
  statusCode: number;
  data: unknown;
}

export class TemplateEngine {
  private templates: Map<string, IndustryTemplate> = new Map();
  
  register(template: IndustryTemplate): void {
    this.templates.set(template.id, template);
  }
  
  create(config: {
    industry: Industry;
    features: string[];
    platforms: Platform[];
    branding: BrandingConfig;
  }): IndustryTemplate {
    const baseTemplate = this.templates.get(config.industry);
    if (!baseTemplate) {
      throw new Error(`Template for industry "${config.industry}" not found`);
    }
    
    return {
      ...baseTemplate,
      pageModules: baseTemplate.pageModules.filter(
        m => config.features.includes(m.id) && config.platforms.includes(m.platforms[0])
      ),
      platformAdapters: Object.fromEntries(
        Object.entries(baseTemplate.platformAdapters).filter(
          ([platform]) => config.platforms.includes(platform as Platform)
        )
      ) as Record<Platform, PlatformAdapter>,
      branding: config.branding,
    };
  }
  
  listIndustries(): Industry[] {
    return Array.from(this.templates.keys()) as Industry[];
  }
}