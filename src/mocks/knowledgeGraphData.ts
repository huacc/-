
import { OntologyNode, OntologyEdge } from './ontologyGraphData';

export interface KnowledgeNode extends OntologyNode {
  ontologyType?: string; 
  properties?: Record<string, any>;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: OntologyEdge[];
}

export const MOCK_KNOWLEDGE_GRAPH_DATA: KnowledgeGraphData = {
  nodes: [
    { 
      id: 'node_p1', 
      label: '张三', 
      type: 'Entity', 
      ontologyType: 'Person',
      description: '35岁，男性，程序员' 
    },
    { 
      id: 'node_s1', 
      label: '中度焦虑', 
      type: 'State', 
      ontologyType: 'Anxiety',
      description: '强度: 0.6, 持续时间: 2周' 
    }
  ],
  edges: [
    { source: 'node_p1', target: 'node_s1', label: 'EXPERIENCES' }
  ]
};
