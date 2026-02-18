
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

export const MOCK_ONTOLOGY_GRAPH_DATA: OntologyGraphData = {
  nodes: [
    { id: 'person', label: 'Person', type: 'Entity', description: '被分析的个体' },
    { id: 'state_anxiety', label: 'High Anxiety', type: 'State', description: '高焦虑状态' },
  ],
  edges: [
    { source: 'person', target: 'state_anxiety', label: 'EXPERIENCES' },
  ]
};
