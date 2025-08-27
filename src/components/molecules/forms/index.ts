/**
 * Modular Form Component System - Entry Point
 * Exports the simplified and modular form rendering components
 */

export { default as SimplifiedFormComponentRenderer } from './SimplifiedFormComponentRenderer';
export { 
  componentRegistry, 
  getComponentRenderer, 
  isComponentTypeSupported, 
  getSupportedComponentTypes 
} from './ComponentRegistry';
export type { ComponentRenderer } from './ComponentRegistry';