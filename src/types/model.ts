
export type ModelStatus = 'normal' | 'error' | 'maintenance';
export type ModelType = 'LLM' | 'VLM';

export interface Model {
  id: string;
  name: string;
  provider: string;
  version: string;
  type: ModelType;
  status: ModelStatus;
  successRate: number;
  avgLatency: number;
  
  apiEndpoint?: string;
  apiKey?: string;
  organizationId?: string;
  
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  
  rpmLimit?: number;
  dailyRequestLimit?: number;
  costBudget?: number;
  
  createdAt?: string;
  updatedAt?: string;
}
