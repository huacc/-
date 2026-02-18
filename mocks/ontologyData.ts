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
          { id: 'cat_location', name: '地点空间', type: 'Entity' }
        ]
      },
      {
        id: 'event_root',
        name: '事件 (Event)',
        type: 'Event',
        children: [
          { id: 'cat_life_event', name: '生活事件', type: 'Event' },
          { id: 'cat_interaction', name: '交互行为', type: 'Event' },
          { id: 'cat_intervention', name: '干预措施', type: 'Event' }
        ]
      },
      {
        id: 'state_root',
        name: '状态 (State)',
        type: 'State',
        children: [
          { id: 'cat_emotion', name: '情绪状态', type: 'State' },
          { id: 'cat_cognitive', name: '认知状态', type: 'State' },
          { id: 'cat_physical', name: '生理状态', type: 'State' }
        ]
      },
      {
        id: 'observable_root',
        name: '可观察 (Observable)',
        type: 'Observable',
        children: [
          { id: 'cat_behavior', name: '外显行为', type: 'Observable' },
          { id: 'cat_expression', name: '微表情', type: 'Observable' },
          { id: 'cat_biometric', name: '生理指标', type: 'Observable' }
        ]
      },
      {
        id: 'concept_root',
        name: '模型概念 (ModelConcept)',
        type: 'ModelConcept',
        children: [
          { id: 'cat_trait', name: '心理特质', type: 'ModelConcept' },
          { id: 'cat_diagnosis', name: '诊断标准', type: 'ModelConcept' }
        ]
      },
      {
        id: 'rule_root',
        name: '规则 (Rule)',
        type: 'Rule',
        children: [
          { id: 'cat_inference', name: '推断规则', type: 'Rule' },
          { id: 'cat_risk', name: '风险预警', type: 'Rule' }
        ]
      }
    ]
  }
];

export const MOCK_ONTOLOGIES: Ontology[] = [
  // Entity
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
      { id: 'prop_gender', name: 'gender', label: '性别', type: 'enum', required: true, defaultValue: 'unknown' },
      { id: 'prop_occupation', name: 'occupation', label: '职业', type: 'string', required: false }
    ],
    relations: [
      { id: 'rel_has_state', name: 'EXPERIENCES', targetId: 'ont_anxiety', type: '1:N', description: '处于某种心理状态' },
      { id: 'rel_has_obs1', name: 'HAS', targetId: 'ont_insomnia', type: '1:N', description: '表现出某种行为' },
      { id: 'rel_has_obs2', name: 'HAS', targetId: 'ont_sweating', type: '1:N', description: '具有生理反应' },
      { id: 'rel_has_trait1', name: 'POSSESSES', targetId: 'ont_perfectionism', type: '1:N', description: '拥有人格特质' },
      { id: 'rel_has_trait2', name: 'POSSESSES', targetId: 'ont_neuroticism', type: '1:N', description: '拥有人格特质' }
    ]
  },
  {
    id: 'ont_organization',
    name: 'Organization',
    label: '组织',
    type: 'Entity',
    categoryId: 'cat_org',
    description: '人物所属的社会群体或机构，如公司、学校、家庭。',
    createdAt: '2026-01-02T11:00:00Z',
    updatedAt: '2026-01-02T11:00:00Z'
  },
  
  // Event
  {
    id: 'ont_work_failure',
    name: 'WorkFailure',
    label: '工作失败',
    type: 'Event',
    categoryId: 'cat_life_event',
    description: '职业生涯中的负面挫折事件，可能触发特定的心理反应。',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
    relations: [
        { id: 'rel_triggers', name: 'TRIGGERS', targetId: 'ont_anxiety', type: '1:N', description: '触发焦虑' }
    ]
  },
  
  // State
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
      { id: 'prop_intensity', name: 'intensity', label: '强度', type: 'float', required: true, description: '0-1之间的浮点数' },
      { id: 'prop_duration', name: 'duration', label: '持续时间', type: 'integer', required: false, description: '单位：分钟' }
    ],
    relations: [
        { id: 'rel_leads_to', name: 'LEADS_TO', targetId: 'ont_depression', type: '1:N', description: '导致抑郁' }
    ]
  },
  {
    id: 'ont_depression',
    name: 'Depression',
    label: '抑郁状态',
    type: 'State',
    categoryId: 'cat_emotion',
    description: '显著而持久的心境低落、兴趣减退。',
    createdAt: '2026-01-03T16:25:00Z',
    updatedAt: '2026-01-03T16:25:00Z'
  },

  // Observable
  {
    id: 'ont_insomnia',
    name: 'Insomnia',
    label: '失眠',
    type: 'Observable',
    categoryId: 'cat_behavior',
    description: '入睡困难、睡眠维持障碍或早醒。',
    createdAt: '2026-01-08T20:00:00Z',
    updatedAt: '2026-01-08T20:00:00Z',
    relations: [
        { id: 'rel_indicates1', name: 'INDICATES', targetId: 'ont_anxiety', type: '1:1', description: '指示焦虑' }
    ]
  },
  {
    id: 'ont_sweating',
    name: 'Sweating',
    label: '异常出汗',
    type: 'Observable',
    categoryId: 'cat_biometric',
    description: '在非运动或高温环境下出现的生理性出汗反应。',
    createdAt: '2026-01-08T20:10:00Z',
    updatedAt: '2026-01-08T20:10:00Z',
    relations: [
        { id: 'rel_indicates2', name: 'INDICATES', targetId: 'ont_anxiety', type: '1:1', description: '指示焦虑' }
    ]
  },

  // ModelConcept
  {
    id: 'ont_perfectionism',
    name: 'Perfectionism',
    label: '完美主义',
    type: 'ModelConcept',
    categoryId: 'cat_trait',
    description: '一种人格特质，特征是努力追求完美和设定极高的性能标准，并伴随着对自己的过度批评评估。',
    createdAt: '2026-01-10T13:45:00Z',
    updatedAt: '2026-01-10T13:45:00Z',
    relations: [
        { id: 'rel_moderates', name: 'MODERATES', targetId: 'ont_anxiety', type: '1:1', description: '调节焦虑程度' }
    ]
  },
  {
    id: 'ont_neuroticism',
    name: 'Neuroticism',
    label: '神经质',
    type: 'ModelConcept',
    categoryId: 'cat_trait',
    description: '大五人格特质之一，反映个体体验负面情绪的倾向。',
    createdAt: '2026-01-10T13:50:00Z',
    updatedAt: '2026-01-10T13:50:00Z'
  },

  // Rule
  {
    id: 'ont_gad_criteria',
    name: 'GAD_Criteria',
    label: '广泛性焦虑诊断标准',
    type: 'Rule',
    categoryId: 'cat_diagnosis',
    description: '基于DSM-5的广泛性焦虑障碍诊断逻辑规则。',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    relations: [
        { id: 'rel_evaluates', name: 'EVALUATES', targetId: 'ont_anxiety', type: '1:1', description: '评估焦虑状态' }
    ]
  }
];
