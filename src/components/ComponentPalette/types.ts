import type { ComponentType } from '../../types';

export interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  components: ComponentDefinition[];
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: string;
  description: string;
  category: string;
}

export interface AccordionItemProps {
  id: string;
  title: string;
  icon: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

export interface DraggableComponentItemProps {
  component: ComponentDefinition;
  onAddComponent: (type: ComponentType) => void;
}