
import { PromptTemplate, PromptCategory, PromptStructure } from '../types/prompt';

export const MOCK_PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: 'cat_ontology',
    name: '本体构建',
    children: [
      { id: 'cat_entity_def', name: '实体定义' },
      { id: 'cat_relation_def', name: '关系提取' }
    ]
  },
  {
    id: 'cat_knowledge',
    name: '知识提取',
    children: [
      { id: 'cat_doc_extract', name: '文档解析' },
      { id: 'cat_qa_gen', name: '问答生成' }
    ]
  },
  {
    id: 'cat_analysis',
    name: '分析场景',
    children: [
      { id: 'cat_psy_eval', name: '心理评估' }
    ]
  }
];

const DEFAULT_STRUCTURE: PromptStructure = {
  type: 'ontology_modeling',
  role: {
    identity: '心理学本体建模专家',
    expertise: ['认知心理学', '知识图谱构建'],
    capabilities: ['概念抽象', '属性提取', '关系定义'],
    example: ''
  },
  logic: {
    principles: '准确性、完整性、一致性',
    method: '自顶向下的本体构建方法',
    constraints: ['遵循Level 2定义', '属性名使用驼峰命名'],
    example: ''
  },
  workflow: [],
  quality: { checkpoints: [], avoidance: [] },
  variables: []
};

export const MOCK_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl_entity_gen',
    name: '实体定义生成器',
    description: '根据输入描述自动生成符合 Schema 的实体定义 JSON',
    categoryId: 'cat_entity_def',
    content: '',
    structure: DEFAULT_STRUCTURE,
    tags: ['本体', '生成'],
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z'
  }
];
