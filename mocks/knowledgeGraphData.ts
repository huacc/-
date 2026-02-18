import { OntologyNode, OntologyEdge } from './ontologyGraphData';

// 复用基础接口，但知识图谱节点可能包含更多实例属性
export interface KnowledgeNode extends OntologyNode {
  ontologyType?: string; // 具体本体类型，如 'Person'
  properties?: Record<string, any>;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: OntologyEdge[];
}

/**
 * 示例知识图谱数据
 * 场景：张三的焦虑状态分析
 */
export const MOCK_KNOWLEDGE_GRAPH_DATA: KnowledgeGraphData = {
  nodes: [
    // --- 人物 ---
    { 
      id: 'node_p1', 
      label: '张三', 
      type: 'Entity', 
      ontologyType: 'Person',
      description: '35岁，男性，程序员' 
    },
    { 
      id: 'node_org1', 
      label: '科技公司', 
      type: 'Entity', 
      ontologyType: 'Organization',
      description: '张三的工作单位' 
    },

    // --- 状态 ---
    { 
      id: 'node_s1', 
      label: '中度焦虑', 
      type: 'State', 
      ontologyType: 'Anxiety',
      description: '强度: 0.6, 持续时间: 2周' 
    },
    { 
      id: 'node_s2', 
      label: '失眠困扰', 
      type: 'State', 
      ontologyType: 'PhysicalState',
      description: '入睡困难' 
    },

    // --- 事件 ---
    { 
      id: 'node_e1', 
      label: '项目延期', 
      type: 'Event', 
      ontologyType: 'WorkEvent',
      description: '导致工作压力增大' 
    },

    // --- 行为/可观察 ---
    { 
      id: 'node_b1', 
      label: '频繁加班', 
      type: 'Observable', 
      ontologyType: 'Behavior',
      description: '最近一周每天工作12小时' 
    },
    { 
      id: 'node_b2', 
      label: '回避社交', 
      type: 'Observable', 
      ontologyType: 'Behavior',
      description: '拒绝周末聚会' 
    },

    // --- 特质 ---
    { 
      id: 'node_t1', 
      label: '责任心强', 
      type: 'ModelConcept', 
      ontologyType: 'PersonalityTrait',
      description: '大五人格：尽责性高' 
    }
  ],
  edges: [
    { source: 'node_p1', target: 'node_org1', label: 'WORKS_AT' },
    { source: 'node_p1', target: 'node_s1', label: 'EXPERIENCES' },
    { source: 'node_p1', target: 'node_b1', label: 'PERFORMS' },
    { source: 'node_p1', target: 'node_t1', label: 'POSSESSES' },
    { source: 'node_e1', target: 'node_s1', label: 'TRIGGERS' },
    { source: 'node_b1', target: 'node_s2', label: 'CAUSES' },
    { source: 'node_s1', target: 'node_b2', label: 'LEADS_TO' },
    { source: 'node_t1', target: 'node_s1', label: 'MODERATES' } // 责任心强加剧了因项目延期导致的焦虑
  ]
};