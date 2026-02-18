import { Ontology } from '../types/ontology';
import { OntologyGraphData } from '../mocks/ontologyGraphData';

/**
 * 将本体定义列表转换为 G6 图谱数据格式
 * @param ontologies 本体定义列表
 * @returns GraphData 包含节点和边
 */
export const transformToGraphData = (ontologies: Ontology[]): OntologyGraphData => {
  const nodes = ontologies.map(o => ({
    id: o.id,
    label: o.label, // 显示 Label (中文)
    type: o.type,   // 用于颜色映射
    description: o.description
  }));

  const edges: { source: string; target: string; label: string }[] = [];
  
  // 创建 ID 查找表以快速验证目标节点是否存在
  const ontologyIdSet = new Set(ontologies.map(o => o.id));

  ontologies.forEach(source => {
    if (source.relations) {
      source.relations.forEach(rel => {
        // 仅当目标节点存在时才创建边，防止悬空边
        if (ontologyIdSet.has(rel.targetId)) {
            edges.push({
              source: source.id,
              target: rel.targetId,
              label: rel.name
            });
        }
      });
    }
  });

  return { nodes, edges };
};
