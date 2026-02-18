
/**
 * 提示词类型定义
 */
export type PromptType = 'knowledge_extraction' | 'ontology_modeling' | 'query_analysis' | 'custom';

/**
 * 工作流步骤定义
 */
export interface WorkflowStep {
  id: string;
  logic: string;
  example?: string;
}

/**
 * 结构化提示词数据模型
 */
export interface PromptStructure {
  // 元数据
  type: PromptType;
  
  // Tab1: 角色定义
  role: {
    identity: string;
    expertise: string[];
    capabilities: string[];
    example: string;
  };

  // Tab2: 分析逻辑
  logic: {
    principles: string;
    method: string;
    constraints: string[];
    example: string;
  };

  // Tab3: 工作流程
  workflow: WorkflowStep[];

  // Tab4: 质量控制
  quality: {
    checkpoints: string[];
    avoidance: string[];
  };

  // Tab5: 变量定义
  variables: Array<{
    name: string;
    description?: string;
    defaultValue?: string;
  }>;
}

/**
 * 提示词模板完整对象
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  content?: string; // 旧格式兼容
  structure?: PromptStructure; // 新结构化数据
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  children?: PromptCategory[];
}
