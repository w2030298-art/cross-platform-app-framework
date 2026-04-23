/**
 * AI 引擎 - LLM路由 / Prompt管理 / RAG知识库
 * AI Engine - LLM Routing / Prompt Management / RAG Knowledge Base
 */

export type LLMProvider = 'openai' | 'claude' | 'gemini' | 'local';
export type AITask = 
  | 'copywriting' 
  | 'chat' 
  | 'analysis' 
  | 'ocr' 
  | 'summary' 
  | 'insight';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  task: AITask;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  platform?: string;
  version: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  embedding?: number[];
  metadata: Record<string, string>;
  createdAt: Date;
}

export interface AIRequest {
  task: AITask;
  prompt?: string;
  variables?: Record<string, string>;
  context?: string[];
  platform?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  cached: boolean;
}

export class AIEngine {
  private llmConfigs: Map<AITask, LLMConfig[]> = new Map();
  private prompts: Map<string, PromptTemplate> = new Map();
  private knowledgeBase: Map<string, RAGDocument> = new Map();
  private cache: Map<string, { content: string; expiresAt: number }> = new Map();
  
  constructor(config: {
    llmConfigs: Record<AITask, LLMConfig[]>;
    prompts?: PromptTemplate[];
  }) {
    for (const [task, providers] of Object.entries(config.llmConfigs)) {
      this.llmConfigs.set(task as AITask, providers);
    }
    if (config.prompts) {
      for (const prompt of config.prompts) {
        this.prompts.set(prompt.id, prompt);
      }
    }
  }
  
  async generate(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        content: cached.content,
        provider: 'local',
        model: 'cache',
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
        cached: true,
      };
    }
    
    const prompt = this.resolvePrompt(request);
    const llmConfig = this.selectLLM(request.task, request);
    
    const context = await this.retrieveContext(request);
    const fullPrompt = this.buildPrompt(prompt, request, context);
    
    const response = await this.callLLM(llmConfig, fullPrompt);
    
    this.cache.set(cacheKey, {
      content: response.content,
      expiresAt: Date.now() + 3600000,
    });
    
    return {
      ...response,
      latencyMs: Date.now() - startTime,
      cached: false,
    };
  }
  
  private selectLLM(task: AITask, request: AIRequest): LLMConfig {
    const configs = this.llmConfigs.get(task) || [];
    
    const preferred = configs.find(c => {
      if (request.maxTokens && request.maxTokens > 4000) return c.model.includes('4o') || c.model.includes('opus');
      if (request.temperature && request.temperature < 0.3) return c.provider === 'openai' || c.provider === 'claude';
      return true;
    });
    
    return preferred || configs[0] || {
      provider: 'gemini',
      model: 'gemini-flash',
      apiKey: '',
    };
  }
  
  private resolvePrompt(request: AIRequest): PromptTemplate {
    if (request.prompt) {
      return {
        id: 'custom',
        name: 'Custom',
        task: request.task,
        systemPrompt: 'You are a helpful assistant.',
        userPromptTemplate: request.prompt,
        variables: [],
        version: '1.0',
      };
    }
    
    const taskPrompts = Array.from(this.prompts.values())
      .filter(p => p.task === request.task && (!request.platform || !p.platform || p.platform === request.platform));
    
    return taskPrompts[0] || {
      id: 'default',
      name: 'Default',
      task: request.task,
      systemPrompt: 'You are a helpful assistant.',
      userPromptTemplate: '{input}',
      variables: ['input'],
      version: '1.0',
    };
  }
  
  private async retrieveContext(request: AIRequest): Promise<string[]> {
    if (!request.context || request.context.length === 0) return [];
    
    const relevant: string[] = [];
    for (const query of request.context) {
      for (const doc of this.knowledgeBase.values()) {
        if (doc.content.toLowerCase().includes(query.toLowerCase())) {
          relevant.push(doc.content);
        }
      }
    }
    
    return relevant.slice(0, 5);
  }
  
  private buildPrompt(
    template: PromptTemplate,
    request: AIRequest,
    context: string[]
  ): string {
    let userPrompt = template.userPromptTemplate;
    
    if (request.variables) {
      for (const [key, value] of Object.entries(request.variables)) {
        userPrompt = userPrompt.replace(`{${key}}`, value);
      }
    }
    
    if (context.length > 0) {
      const contextBlock = context
        .map((c, i) => `[Reference ${i + 1}]: ${c}`)
        .join('\n\n');
      userPrompt = `Context:\n${contextBlock}\n\n${userPrompt}`;
    }
    
    return userPrompt;
  }
  
  private async callLLM(config: LLMConfig, prompt: string): Promise<AIResponse> {
    return {
      content: `[AI Response via ${config.provider}/${config.model}]`,
      provider: config.provider,
      model: config.model,
      tokensUsed: 0,
      latencyMs: 0,
      cached: false,
    };
  }
  
  private getCacheKey(request: AIRequest): string {
    return `${request.task}:${request.prompt || ''}:${JSON.stringify(request.variables || {})}:${JSON.stringify(request.context || [])}`;
  }
  
  addDocument(doc: Omit<RAGDocument, 'id' | 'createdAt'>): string {
    const id = crypto.randomUUID();
    this.knowledgeBase.set(id, {
      ...doc,
      id,
      createdAt: new Date(),
    });
    return id;
  }
  
  removeDocument(id: string): boolean {
    return this.knowledgeBase.delete(id);
  }
}

export const DEFAULT_LLM_CONFIG: Record<AITask, LLMConfig[]> = {
  copywriting: [
    { provider: 'openai', model: 'gpt-4o-mini', apiKey: '', temperature: 0.8 },
    { provider: 'claude', model: 'claude-3-haiku', apiKey: '', temperature: 0.8 },
  ],
  chat: [
    { provider: 'gemini', model: 'gemini-flash', apiKey: '', temperature: 0.7 },
    { provider: 'openai', model: 'gpt-4o-mini', apiKey: '', temperature: 0.7 },
  ],
  analysis: [
    { provider: 'claude', model: 'claude-sonnet', apiKey: '', temperature: 0.3 },
    { provider: 'openai', model: 'gpt-4o', apiKey: '', temperature: 0.3 },
  ],
  ocr: [
    { provider: 'openai', model: 'gpt-4o', apiKey: '', temperature: 0.1 },
  ],
  summary: [
    { provider: 'gemini', model: 'gemini-flash', apiKey: '', temperature: 0.3 },
    { provider: 'openai', model: 'gpt-4o-mini', apiKey: '', temperature: 0.3 },
  ],
  insight: [
    { provider: 'claude', model: 'claude-sonnet', apiKey: '', temperature: 0.5 },
    { provider: 'openai', model: 'gpt-4o', apiKey: '', temperature: 0.5 },
  ],
};