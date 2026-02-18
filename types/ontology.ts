export type OntologyType = 'Entity' | 'Event' | 'State' | 'Attribute' | 'Observable' | 'Rule' | 'ModelConcept';

export interface OntologyCategory {
  id: string;
  name: string;
  type?: OntologyType; // 关联的元本体类型
  children?: OntologyCategory[];
  description?: string;
}

export interface OntologyProperty {
  id: string;
  name: string;
  label: string;
  type: 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'datetime' | 'enum' | 'array' | 'map';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface OntologyRelation {
  id: string;
  name: string;
  targetId: string;
  type: '1:1' | '1:N' | 'N:1' | 'N:M';
  description?: string;
}

export interface Ontology {
  id: string;
  name: string;        // 英文标识，如 Person
  label: string;       // 显示名称，如 人物
  type: OntologyType;
  categoryId: string;  // 所属分类ID
  description?: string;
  createdAt: string;
  updatedAt: string;
  properties?: OntologyProperty[];
  relations?: OntologyRelation[];
}
