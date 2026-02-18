
export type OntologyType = 'Entity' | 'Event' | 'State' | 'Attribute' | 'Observable' | 'Rule' | 'ModelConcept';

export interface OntologyCategory {
  id: string;
  name: string;
  type?: OntologyType; 
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
  name: string;        
  label: string;       
  type: OntologyType;
  categoryId: string;  
  description?: string;
  createdAt: string;
  updatedAt: string;
  properties?: OntologyProperty[];
  relations?: OntologyRelation[];
}
