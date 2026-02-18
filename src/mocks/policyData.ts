
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

export const MOCK_MODEL_POLICY: ModelPolicy = {
  defaultStrategy: 'balance',
  taskMappings: [
    {
      taskType: '本体构建',
      primaryModel: '1',
      fallbackModels: ['2']
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
