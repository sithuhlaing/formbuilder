// Main ComponentPalette component
export { default } from './ComponentPalette';

// Types and interfaces
export type { 
  ComponentCategory, 
  ComponentDefinition, 
  AccordionItemProps, 
  DraggableComponentItemProps 
} from './types';

// Configuration
export { componentCategories, componentDefinitions } from './config/componentCategories';

// Individual components for external use
export { default as Accordion } from './components/Accordion';
export { default as AccordionItem } from './components/AccordionItem';
export { default as ComponentCategory } from './components/ComponentCategory';
export { default as DraggableComponentItem } from './components/DraggableComponentItem';