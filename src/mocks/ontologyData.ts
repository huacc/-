
import { Ontology, OntologyCategory } from '../types/ontology';

export const MOCK_ONTOLOGY_CATEGORIES: OntologyCategory[] = [
  {
    id: 'all',
    name: '全部',
    children: [
      {
        id: 'entity_root',
        name: '实体 (Entity)',
        type: 'Entity',
        children: [
          { id: 'cat_person', name: '人物主体', type: 'Entity' },
          { id: 'cat_org', name: '组织机构', type: 'Entity' },
        ]
      },
      {
        id: 'event_root',
        name: '事件 (Event)',
        type: 'Event',
        children: [
          { id: 'cat_life_event', name: '生活事件', type: 'Event' },
        ]
      },
      {
        id: 'state_root',
        name: '状态 (State)',
        type: 'State',
        children: [
          { id: 'cat_emotion', name: '情绪状态', type: 'State' },
        ]
      }
    ]
  }
];

export const MOCK_ONTOLOGIES: Ontology[] = [
  {
    id: 'ont_person',
    name: 'Person',
    label: '人物',
    type: 'Entity',
    categoryId: 'cat_person',
    description: '心理分析的核心主体，包含基本人口学特征。',
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z',
    properties: [
      { id: 'prop_age', name: 'age', label: '年龄', type: 'integer', required: true },
      { id: 'prop_gender', name: 'gender', label: '性别', type: 'enum', required: true, defaultValue: 'unknown' }
    ],
    relations: [
      { id: 'rel_has_state', name: 'EXPERIENCES', targetId: 'ont_anxiety', type: '1:N', description: '处于某种心理状态' }
    ]
  },
  {
    id: 'ont_anxiety',
    name: 'Anxiety',
    label: '焦虑状态',
    type: 'State',
    categoryId: 'cat_emotion',
    description: '个体对即将来临的、可能会造成的危险或威胁所产生的紧张、不安、忧虑、烦恼等不愉快的复杂情绪状态。',
    createdAt: '2026-01-03T16:20:00Z',
    updatedAt: '2026-02-10T09:15:00Z',
    properties: [
      { id: 'prop_intensity', name: 'intensity', label: '强度', type: 'float', required: true, description: '0-1之间的浮点数' }
    ],
    relations: []
  }
];
