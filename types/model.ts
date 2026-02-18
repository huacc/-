/**
 * 模型状态类型
 * normal: 正常
 * error: 异常
 * maintenance: 维护/限流中
 */
export type ModelStatus = 'normal' | 'error' | 'maintenance';

/**
 * 模型类型
 * LLM: 大语言模型
 * VLM: 视觉语言模型
 */
export type ModelType = 'LLM' | 'VLM';

/**
 * 模型数据接口定义
 */
export interface Model {
  /** 唯一标识 */
  id: string;
  /** 模型名称 (如: OpenAI GPT-4o) */
  name: string;
  /** 提供商 (如: OpenAI) */
  provider: string;
  /** 模型版本标识 (如: gpt-4o-2024-05-13) */
  version: string;
  /** 模型类型 */
  type: ModelType;
  /** 当前状态 */
  status: ModelStatus;
  /** 成功率 (百分比数值, 如 99.2) */
  successRate: number;
  /** 平均响应时间 (秒) */
  avgLatency: number;
  
  // --- 详细配置信息 (新增) ---
  apiEndpoint?: string;
  apiKey?: string;
  organizationId?: string;
  
  // 默认参数
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  
  // 使用限制
  rpmLimit?: number;
  dailyRequestLimit?: number;
  costBudget?: number;
  
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
