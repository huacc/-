
import { STORAGE_KEYS } from '../constants/storageKeys';
import { MOCK_MODELS } from '../mocks/modelData';
import { MOCK_ONTOLOGIES, MOCK_ONTOLOGY_CATEGORIES } from '../mocks/ontologyData';
import { MOCK_KNOWLEDGE_GRAPH_DATA } from '../mocks/knowledgeGraphData';
import { MOCK_PROMPT_TEMPLATES, MOCK_PROMPT_CATEGORIES } from '../mocks/promptData';
import { MOCK_MODEL_POLICY } from '../mocks/policyData';

/**
 * 检查并初始化应用数据
 * 策略：遍历核心 Key，如果 localStorage 中不存在，则写入默认 Mock 数据。
 * 这样既保证了首次访问有数据，又保证了用户后续的修改不会被覆盖。
 */
export const initializeAppData = () => {
  if (typeof window === 'undefined') return;

  const initMap = [
    { key: STORAGE_KEYS.MODELS, data: MOCK_MODELS },
    { key: STORAGE_KEYS.MODEL_POLICY, data: MOCK_MODEL_POLICY },
    { key: STORAGE_KEYS.PROMPT_TEMPLATES, data: MOCK_PROMPT_TEMPLATES },
    { key: STORAGE_KEYS.PROMPT_CATEGORIES, data: MOCK_PROMPT_CATEGORIES },
    { key: STORAGE_KEYS.ONTOLOGIES, data: MOCK_ONTOLOGIES },
    { key: STORAGE_KEYS.ONTOLOGY_CATEGORIES, data: MOCK_ONTOLOGY_CATEGORIES },
    { key: STORAGE_KEYS.ONTOLOGY_VERSIONS, data: [] }, // 初始版本列表为空
    { key: STORAGE_KEYS.KNOWLEDGE_GRAPH, data: MOCK_KNOWLEDGE_GRAPH_DATA },
    { key: STORAGE_KEYS.GRAPH_LAYOUT, data: {} }, // 初始布局为空
  ];

  let initializedCount = 0;

  initMap.forEach(({ key, data }) => {
    try {
      const existing = localStorage.getItem(key);
      if (existing === null) {
        localStorage.setItem(key, JSON.stringify(data));
        initializedCount++;
      }
    } catch (error) {
      console.error(`Failed to initialize data for key: ${key}`, error);
    }
  });

  if (initializedCount > 0) {
    console.log(`[DataInitializer] Initialized ${initializedCount} storage keys with mock data.`);
  }
};
