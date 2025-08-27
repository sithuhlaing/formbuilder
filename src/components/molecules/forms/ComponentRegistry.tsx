/**
 * Component Registry - Centralized component mapping
 * Extracted from FormComponentRenderer to improve modularity
 */

import React from 'react';
import type { FormComponentData } from '../../../types';

// Import preview components
import PreviewInput from '../../atoms/preview/PreviewInput';
import PreviewTextarea from '../../atoms/preview/PreviewTextarea';
import PreviewSelect from '../../atoms/preview/PreviewSelect';
import PreviewMultiSelect from '../../atoms/preview/PreviewMultiSelect';
import PreviewRadioGroup from '../../atoms/preview/PreviewRadioGroup';
import PreviewCheckboxGroup from '../../atoms/preview/PreviewCheckboxGroup';
import PreviewFileUpload from '../../atoms/preview/PreviewFileUpload';
import PreviewSignature from '../../atoms/preview/PreviewSignature';
import PreviewSectionDivider from '../../atoms/preview/PreviewSectionDivider';

// Import form field components
import FormField from '../../atoms/form/FormField';
import RichTextEditor from '../../atoms/form/RichTextEditor';

interface ComponentRendererProps {
  component: FormComponentData;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FormComponentData>) => void;
  onDelete: () => void;
  mode: 'preview' | 'builder';
}

export type ComponentRenderer = React.FC<ComponentRendererProps>;

/**
 * Registry of all available component renderers
 */
export const componentRegistry: Record<string, ComponentRenderer> = {
  // Text inputs
  text_input: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewInput component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  email: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewInput component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  password: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewInput component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  number: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewInput component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  number_input: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewInput component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  date_picker: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewInput component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Textarea
  textarea: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewTextarea component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Rich text
  rich_text: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <div>{component.content || 'Rich text content'}</div>;
    }
    return (
      <RichTextEditor
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Select components
  select: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewSelect component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  multi_select: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewMultiSelect component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Choice components
  radio: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewRadioGroup component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  checkbox: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewCheckboxGroup component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  radio_group: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewRadioGroup component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // File upload
  file_upload: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewFileUpload component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Signature
  signature: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewSignature component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Section divider
  section_divider: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      return <PreviewSectionDivider component={component} />;
    }
    return (
      <FormField
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        mode={mode}
      />
    );
  },

  // Layout components
  horizontal_layout: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      // For preview mode, render children horizontally
      return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {component.children?.map((child) => (
            <div key={child.id} style={{ flex: 1, minWidth: '200px' }}>
              {/* This would need recursive rendering - simplified for now */}
              <div>{child.label || child.type}</div>
            </div>
          ))}
        </div>
      );
    }
    
    // For builder mode, this is handled by SimplifiedRowLayout in the canvas
    return (
      <div data-testid="row-layout" style={{
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        color: '#6b7280'
      }}>
        Row Layout ({component.children?.length || 0} items)
      </div>
    );
  },

  vertical_layout: ({ component, isSelected, onSelect, onUpdate, onDelete, mode }) => {
    if (mode === 'preview') {
      // For preview mode, render children vertically
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {component.children?.map((child) => (
            <div key={child.id}>
              {/* This would need recursive rendering - simplified for now */}
              <div>{child.label || child.type}</div>
            </div>
          ))}
        </div>
      );
    }
    
    // For builder mode
    return (
      <div style={{
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        color: '#6b7280'
      }}>
        Vertical Layout ({component.children?.length || 0} items)
      </div>
    );
  }
};

/**
 * Get renderer for a specific component type
 */
export function getComponentRenderer(componentType: string): ComponentRenderer | null {
  return componentRegistry[componentType] || null;
}

/**
 * Check if a component type is supported
 */
export function isComponentTypeSupported(componentType: string): boolean {
  return componentType in componentRegistry;
}

/**
 * Get list of all supported component types
 */
export function getSupportedComponentTypes(): string[] {
  return Object.keys(componentRegistry);
}