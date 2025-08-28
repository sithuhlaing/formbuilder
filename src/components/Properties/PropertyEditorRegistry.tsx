/**
 * Property Editor Registry - Maps component types to their property editors
 */

import React from 'react';
import type { FormComponentData } from '../../types';
import { 
  TextInputPropertyEditor, 
  SelectPropertyEditor, 
  GenericPropertyEditor 
} from './editors';

export interface PropertyEditorProps {
  component: FormComponentData;
  onUpdate: (updates: Partial<FormComponentData>) => void;
}

export type PropertyEditor = React.FC<PropertyEditorProps>;

// Registry mapping component types to their property editors
export const propertyEditorRegistry: Record<string, PropertyEditor> = {
  text_input: TextInputPropertyEditor,
  email_input: TextInputPropertyEditor,
  password_input: TextInputPropertyEditor,
  number: TextInputPropertyEditor,
  textarea: TextInputPropertyEditor,
  select: SelectPropertyEditor,
  multi_select: SelectPropertyEditor,
  radio: SelectPropertyEditor,
  checkbox: SelectPropertyEditor,
};

/**
 * Get property editor for a specific component type
 */
export function getPropertyEditor(componentType: string): PropertyEditor {
  return propertyEditorRegistry[componentType] || GenericPropertyEditor;
}