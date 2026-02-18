
import { STORAGE_KEYS } from '../constants/storageKeys';
import { MOCK_MODELS } from '../mocks/modelData';
import { MOCK_ONTOLOGIES, MOCK_ONTOLOGY_CATEGORIES } from '../mocks/ontologyData';
import { MOCK_KNOWLEDGE_GRAPH_DATA } from '../mocks/knowledgeGraphData';
import { MOCK_PROMPT_TEMPLATES, MOCK_PROMPT_CATEGORIES } from '../mocks/promptData';
import { MOCK_MODEL_POLICY } from '../mocks/policyData';

export const initializeAppData = () => {
  if (typeof window === 'undefined') return;

  const initMap = [
    { key: STORAGE_KEYS.MODELS, data: MOCK_MODELS },
    { key: STORAGE_KEYS.MODEL_POLICY, data: MOCK_MODEL_POLICY },
    { key: STORAGE_KEYS.PROMPT_TEMPLATES, data: MOCK_PROMPT_TEMPLATES },
    { key: STORAGE_KEYS.PROMPT_CATEGORIES, data: MOCK_PROMPT_CATEGORIES },
    { key: STORAGE_KEYS.ONTOLOGIES, data: MOCK_ONTOLOGIES },
    { key: STORAGE_KEYS.ONTOLOGY_CATEGORIES, data: MOCK_ONTOLOGY_CATEGORIES },
    { key: STORAGE_KEYS.ONTOLOGY_VERSIONS, data: [] },
    { key: STORAGE_KEYS.KNOWLEDGE_GRAPH, data: MOCK_KNOWLEDGE_GRAPH_DATA },
    { key: STORAGE_KEYS.GRAPH_LAYOUT, data: {} },
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
