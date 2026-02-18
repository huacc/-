
import { Ontology } from '../types/ontology';
import { OntologyGraphData } from '../mocks/ontologyGraphData';

export const transformToGraphData = (ontologies: Ontology[]): OntologyGraphData => {
  const nodes = ontologies.map(o => ({
    id: o.id,
    label: o.label,
    type: o.type,
    description: o.description
  }));

  const edges: { source: string; target: string; label: string }[] = [];
  const ontologyIdSet = new Set(ontologies.map(o => o.id));

  ontologies.forEach(source => {
    if (source.relations) {
      source.relations.forEach(rel => {
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
