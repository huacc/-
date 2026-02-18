
/**
 * 调度策略类型定义
 */
export interface ModelPolicy {
  defaultStrategy: 'quality' | 'balance' | 'speed' | 'cost';
  taskMappings: Array<{
    taskType: string;
    primaryModel: string;
    fallbackModels: string[];
  }>;
  loadBalancing: {
    enabled: boolean;
    threshold: number;
  };
}

/**
 * Mock 调度策略
 */
export const MOCK_MODEL_POLICY: ModelPolicy = {
  defaultStrategy: 'balance',
  taskMappings: [
    {
      taskType: '本体构建',
      primaryModel: '1', // 对应 GPT-4o
      fallbackModels: ['2'] // 对应 Claude 3.5
    },
    {
      taskType: '知识提取',
      primaryModel: '2',
      fallbackModels: ['1']
    }
  ],
  loadBalancing: {
    enabled: true,
    threshold: 80
  }
};
