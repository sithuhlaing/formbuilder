/**
 * Simplified Form Component Renderer
 * Uses ComponentRegistry for better modularity and maintainability
 */

import React from 'react';
import { getComponentRenderer, isComponentTypeSupported } from './ComponentRegistry';
import type { FormComponentData } from '../../../types';

interface SimplifiedFormComponentRendererProps {
  component: FormComponentData;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<FormComponentData>) => void;
  onDelete?: () => void;
  mode?: 'preview' | 'builder';
}

const SimplifiedFormComponentRenderer: React.FC<SimplifiedFormComponentRendererProps> = ({
  component,
  isSelected = false,
  onSelect = () => {},
  onUpdate = () => {},
  onDelete = () => {},
  mode = 'builder'
}) => {
  // Get the appropriate renderer for this component type
  const ComponentRenderer = getComponentRenderer(component.type);

  // Handle unknown component types
  if (!ComponentRenderer || !isComponentTypeSupported(component.type)) {
    return (
      <div
        style={{
          padding: '12px',
          border: '2px dashed #ef4444',
          borderRadius: '6px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          textAlign: 'center'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Unknown Component Type
        </div>
        <div style={{ fontSize: '14px' }}>
          Type: {component.type}
        </div>
        {mode === 'builder' && (
          <button
            onClick={onDelete}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Remove
          </button>
        )}
      </div>
    );
  }

  // Render the component using the appropriate renderer
  return (
    <ComponentRenderer
      component={component}
      isSelected={isSelected}
      onSelect={onSelect}
      onUpdate={onUpdate}
      onDelete={onDelete}
      mode={mode}
    />
  );
};

export default SimplifiedFormComponentRenderer;