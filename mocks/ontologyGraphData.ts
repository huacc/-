export interface OntologyNode {
  id: string;
  label: string;
  type: 'Entity' | 'Event' | 'State' | 'Attribute' | 'Observable' | 'ModelConcept' | 'Rule';
  description?: string;
}

export interface OntologyEdge {
  id?: string;
  source: string;
  target: string;
  label: string;
  properties?: Record<string, any>;
}

export interface OntologyGraphData {
  nodes: OntologyNode[];
  edges: OntologyEdge[];
}

/**
 * 示例本体关系图数据
 * 基于 "心理学本体模型.md" 中的案例：焦虑状态分析
 * 包含核心的四种类型节点和基本关系
 */
export const MOCK_ONTOLOGY_GRAPH_DATA: OntologyGraphData = {
  nodes: [
    // --- 核心实体 ---
    { id: 'person', label: 'Person', type: 'Entity', description: '被分析的个体' },
    
    // --- 事件 (Event) ---
    { id: 'event_failure', label: 'Work Failure', type: 'Event', description: '工作项目失败事件' },
    { id: 'event_conflict', label: 'Family Conflict', type: 'Event', description: '家庭冲突事件' },

    // --- 状态 (State) ---
    { id: 'state_anxiety', label: 'High Anxiety', type: 'State', description: '高焦虑状态 (Intensity: 0.85)' },
    { id: 'state_depression', label: 'Mild Depression', type: 'State', description: '轻度抑郁状态' },

    // --- 可观察表征 (Observable) ---
    { id: 'obs_insomnia', label: 'Insomnia', type: 'Observable', description: '失眠 (入睡困难)' },
    { id: 'obs_sweating', label: 'Sweating', type: 'Observable', description: '生理反应 (手心出汗)' },
    { id: 'obs_avoidance', label: 'Avoidance', type: 'Observable', description: '回避行为 (不回消息)' },

    // --- 心理特质/概念 (ModelConcept/Attribute) ---
    { id: 'trait_perfectionism', label: 'Perfectionism', type: 'ModelConcept', description: '完美主义倾向' },
    { id: 'trait_neuroticism', label: 'Neuroticism', type: 'ModelConcept', description: '神经质 (情绪不稳定性)' },
    
    // --- 规则 (Rule) ---
    { id: 'rule_diagnosis', label: 'GAD Criteria', type: 'Rule', description: '广泛性焦虑障碍诊断标准' }
  ],
  edges: [
    // 事件触发状态
    { source: 'event_failure', target: 'state_anxiety', label: 'TRIGGERS' },
    { source: 'event_conflict', target: 'state_anxiety', label: 'EXACERBATES' },
    
    // 状态之间的关系
    { source: 'state_anxiety', target: 'state_depression', label: 'LEADS_TO' },

    // 实体拥有的特质和状态
    { source: 'person', target: 'state_anxiety', label: 'EXPERIENCES' },
    { source: 'person', target: 'trait_perfectionism', label: 'POSSESSES' },
    { source: 'person', target: 'trait_neuroticism', label: 'POSSESSES' },

    // 特质调节影响
    { source: 'trait_perfectionism', target: 'state_anxiety', label: 'MODERATES' },

    // 实体拥有的可观察表现
    { source: 'person', target: 'obs_insomnia', label: 'HAS' },
    { source: 'person', target: 'obs_sweating', label: 'HAS' },
    { source: 'person', target: 'obs_avoidance', label: 'HAS' },

    // 可观察表现指示状态
    { source: 'obs_insomnia', target: 'state_anxiety', label: 'INDICATES' },
    { source: 'obs_sweating', target: 'state_anxiety', label: 'INDICATES' },
    { source: 'obs_avoidance', target: 'state_depression', label: 'SUGGESTS' },
    
    // 规则推导
    { source: 'rule_diagnosis', target: 'state_anxiety', label: 'EVALUATES' }
  ]
};