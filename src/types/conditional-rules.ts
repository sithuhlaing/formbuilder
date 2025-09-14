
/**
 * ALIGNED WITH DOCUMENTATION - Conditional Rules Types
 * Supports all documented conditional logic operators
 */

export interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  operator: ConditionalOperator;
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
  description?: string;
}

export type ConditionalOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with'
  | 'matches_regex';

export interface ConditionalLogicConfig {
  enabled: boolean;
  rules: ConditionalRule[];
  logicType: 'AND' | 'OR';
}

export interface DependencyGraph {
  nodes: Array<{
    id: string;
    label: string;
    type: 'component' | 'rule';
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: 'depends_on' | 'affects';
  }>;
}
