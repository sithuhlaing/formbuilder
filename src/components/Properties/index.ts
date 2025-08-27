/**
 * Modular Properties System - Entry Point
 * Exports the simplified and modular property editing components
 */

export { default as SimplifiedProperties } from './SimplifiedProperties';
export { propertyEditorRegistry, getPropertyEditor } from './PropertyEditorRegistry';
// Note: PropertyEditor type is defined inline in PropertyEditorRegistry