
export type PromptType = 'knowledge_extraction' | 'ontology_modeling' | 'query_analysis' | 'custom';

export interface WorkflowStep {
  id: string;
  logic: string;
  example?: string;
}

export interface PromptStructure {
  type: PromptType;
  
  role: {
    identity: string;
    expertise: string[];
    capabilities: string[];
    example: string;
  };

  logic: {
    principles: string;
    method: string;
    constraints: string[];
    example: string;
  };

  workflow: WorkflowStep[];

  quality: {
    checkpoints: string[];
    avoidance: string[];
  };

  variables: Array<{
    name: string;
    description?: string;
    defaultValue?: string;
  }>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  content?: string; 
  structure?: PromptStructure; 
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  children?: PromptCategory[];
}
